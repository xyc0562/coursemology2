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

  private

  def generate_classroom_link(user, is_instructor)
    res = call_braincert_api '/v2/getclasslaunch',
                             generate_classroom_link_params(user, is_instructor)
    h = JSON.parse res.body
    if (error = h['error'])
      Rails.logger.error "Error generate access link for lesson #{id}.\nError is: \n#{error}\n" \
                           "Request params are:\n#{params}"
      nil
    else
      update!(instructor_classroom_link: h['encryptedlaunchurl']) && h['encryptedlaunchurl']
    end
  end

  def generate_classroom_link_params(user, is_instructor)
    lesson_name = title
    {
      class_id: classroom_id,
      userId: user.id,
      userName: user.name,
      isTeacher: is_instructor ? '1' : '0',
      lessonName: lesson_name,
      courseName: lesson_name
    }
  end

  def validates_classroom_joinable
    return if currently_active?
    diff = start_at - Time.zone.now
    if diff > 0
      err = I18n.t(:'course.lectures.lesson_live_in',
                   desc: distance_of_time_in_words(diff))
    else
      err = I18n.t(:'course.lectures.lesson_already_conducted')
    end
    raise IllegalStateError, err
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
    res = call_braincert_api '/v2/schedule', create_classroom_params
    h = JSON.parse(res.body)
    if (error = h['error'])
      msg = "Error scheduling for lesson #{id}.\nError is: \n#{error}\nRequest " \
              "params are:\n#{params}"
      Rails.logger.error msg
      nil
    else
      update!(classroom_id: h['class_id']) && h['class_id']
    end
  end

  def create_classroom_params
    {
      title: title,
      timezone: 28, # 28 means time zone 0
      start_time: start_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      end_time: end_at.in_time_zone(0).strftime(TIME_BRAINCERT),
      date: start_at.in_time_zone(0).to_date.strftime(DATE_ISO),
      ispaid: 0,
      is_recurring: 0,
      seat_attendees: 25, record: 1, isRegion: 7
    }
  end

  def remove_classroom
    return true unless classroom_id
    res = call_braincert_api '/v2/removeclass', cid: classroom_id
    if (error = JSON.parse(res.body)['error'])
      Rails.logger.error "Error removing classroom for lesson #{id}.\nError is: \n#{error}\n" \
                           "Request params are :\n#{params}"
      false
    else
      true
    end
  end
end
