# frozen_string_literal: true

# This concern related to staff performance calculation.
module CourseUser::StaffConcern
  extend ActiveSupport::Concern

  included do
    # Sort the staff by their average marking time.
    # Note that nil time will be considered as the largest, which will come to the bottom of the
    #   list.
    scope :ordered_by_average_marking_time, (lambda do
      all.sort do |x, y|
        if x.average_marking_time && y.average_marking_time
          x.average_marking_time <=> y.average_marking_time
        else
          x.average_marking_time ? -1 : 1
        end
      end
    end)
  end

  def published_submissions # rubocop:disable Metrics/AbcSize
    @published_submissions ||=
      Course::Assessment::Submission.
      joins { experience_points_record.course_user }.
      where { experience_points_record.course_user.course_id == my { course_id } }.
      where { publisher_id == my { user_id } }
  end

  # Returns the average marking time of the staff.
  #
  # @return [Float] Time in seconds.
  def average_marking_time
    @average_marking_time ||=
      if valid_submissions.empty?
        nil
      else
        valid_submissions.sum { |s| s.published_at - s.submitted_at } / valid_submissions.size
      end
  end

  # Returns the standard deviation of the marking time of the staff.
  #
  # @return [Float]
  def marking_time_stddev
    # An array of time in seconds.
    time_diff = valid_submissions.map { |s| s.published_at - s.submitted_at }
    standard_deviation(time_diff)
  end

  private

  def valid_submissions
    @valid_submissions ||=
      published_submissions.
      select { |s| s.submitted_at && s.published_at && s.published_at > s.submitted_at }
  end

  # Calculate the standard deviation of an array of time.
  def standard_deviation(array)
    return nil if array.empty?

    Math.sqrt(sample_variance(array))
  end

  def mean(array)
    array.sum / array.length.to_f
  end

  def sample_variance(array)
    m = mean(array)
    sum = array.reduce(0) { |a, e| a + (e - m)**2 }
    sum / array.length.to_f
  end
end
