# frozen_string_literal: true
class Course::Lecture < ActiveRecord::Base
  include ActionView::Helpers

  acts_as_readable on: :updated_at
  has_many_attachments on: :content

  belongs_to :course, inverse_of: :lectures

  scope :sorted_by_date, -> { order(start_at: :desc) }
  scope :sorted_by_sticky, -> { order(sticky: :desc) }

  def to_partial_path
    'course/announcements/announcement'
  end

  # TODO: Move constants to where they belong
  TIME_BRAINCERT = '%I:%M%p'
  DATE_ISO = '%Y-%m-%d'
  BRAINCERT_API_BASE_URL = 'https://api.braincert.com'

  def handle_access_link(user, is_instructor)
    validates_classroom_joinable
    create_classroom unless classroom_id
    generate_classroom_link user, is_instructor
  end

  def currently_joinable?
    currently_active?
  end

  private

  def generate_classroom_link(user, is_instructor)
    lesson_name = title
    params = {
      class_id: classroom_id,
      userId: user.id,
      userName: user.name,
      isTeacher: is_instructor ? '1' : '0',
      lessonName: lesson_name,
      courseName: lesson_name
    }
    res = call_braincert_api '/v2/getclasslaunch', params
    h = JSON.parse(res.body)
    result = nil
    if (error = h['error'])
      msg = "Error generate access link for lesson #{id}.\nError is: \n#{error}\n" \
              "Request params are:\n#{params}"
      Rails.logger.error msg
    else
      result = h['encryptedlaunchurl']
      update! instructor_classroom_link: result
    end
    result
  end

  def validates_classroom_joinable
    diff = start_at - Time.zone.now
    unless currently_joinable?
      if diff >0
        err = I18n.t(:'course.lectures.lesson_live_in',
                     desc: distance_of_time_in_words(diff))
      else
        err = I18n.t(:'course.lectures.lesson_already_conducted')
      end
      raise IllegalStateError.new(err)
    end
  end

  def post(url, params)
    Net::HTTP.post_form URI.parse(url), params
  end

  def call_braincert_api(action, params)
    action = '/' + action unless action[0] == '/'
    post "#{BRAINCERT_API_BASE_URL}#{action}",
         params.merge(apikey: ENV['VIRTUAL_CLASSROOM_API_KEY'])
  end

  def create_classroom
    start_time = start_at.in_time_zone(0).strftime TIME_BRAINCERT
    end_time = end_at.in_time_zone(0).strftime TIME_BRAINCERT
    params = {
      title: title,
      timezone: 28, # 28 means time zone 0
      start_time: start_time,
      end_time: end_time,
      date: start_at.in_time_zone(0).to_date.strftime(DATE_ISO),
      ispaid: 0,
      is_recurring: 0,
      seat_attendees: 25,
      record: 1,
      isRegion: 7
    }
    res = call_braincert_api '/v2/schedule', params
    h = JSON.parse(res.body)
    result = nil
    if (error = h['error'])
      msg = "Error scheduling for lesson #{id}.\nError is: \n#{error}\nRequest " \
              "params are:\n#{params}"
      Rails.logger.error msg
    else
      result = h['class_id']
      update! classroom_id: result
    end
    result
  end

  def remove_classroom
    return true unless classroom_id
    params = { cid: classroom_id }
    res = call_braincert_api '/v2/removeclass', params
    if (error = JSON.parse(res.body)['error'])
      Rails.logger.error "Error removing classroom for lesson #{id}.\nError is: \n#{error}\n" \
                           "Request params are :\n#{params}"
      false
    else
      true
    end
  end
end
