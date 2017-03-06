# frozen_string_literal: true
class Course::Assessment::Answer::Programming < ActiveRecord::Base
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :answer, class_name: Course::Assessment::Answer.name

  has_many :files, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                   foreign_key: :answer_id, dependent: :destroy, inverse_of: :answer

  accepts_nested_attributes_for :files, allow_destroy: true

  def to_partial_path
    'course/assessment/answer/programming/programming'.freeze
  end

  # Specific implementation of Course::Assessment::Answer#reset_answer
  def reset_answer
    self.class.transaction do
      files.clear
      question.specific.copy_template_files_to(self)
      raise ActiveRecord::Rollback unless save
    end
    acting_as
  end

  MAX_ATTEMPTING_TIMES = 1000
  # Returns the attempting times left for current answer.
  # The max attempting times will be returned if question don't have the limit.
  #
  # @return [Integer]
  def attempting_times_left
    @times_left ||= begin
      return MAX_ATTEMPTING_TIMES unless question.actable.attempt_limit

      times = question.actable.attempt_limit - submission.evaluated_or_graded_answers(question).size
      times = 0 if times < 0
      times
    end
  end
end
