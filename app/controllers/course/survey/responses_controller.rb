# frozen_string_literal: true
class Course::Survey::ResponsesController < Course::Survey::SurveysController
  load_and_authorize_resource :response, through: :survey, class: Course::Survey::Response.name

  def create
    if current_course_user
      build_response
      @response.save!
    else
      render json: { error: t('course.survey.responses.no_course_user') }, status: :bad_request
    end
  rescue ActiveRecord::RecordInvalid => error
    handle_create_error(error)
  end

  def show
    render 'course/survey/surveys/index'
  end

  def edit
    @response.build_missing_answers_and_options
    head :internal_server_error unless @response.save
    @answers = @response.answers.includes(:question, options: :question_option).to_a
  end

  def update
    @response.submit if params[:response][:submit]
    render json: { errors: @response.errors }, status: :bad_request \
      unless @response.update_attributes(response_update_params)
  end

  private

  def handle_create_error(error)
    @response = @survey.responses.accessible_by(current_ability).
                find_by(course_user_id: current_course_user.id)
    if @response
      render json: { responseId: @response.id }, status: :bad_request
    else
      render json: { error: error.message }, status: :bad_request
    end
  end

  def build_response
    @response.experience_points_record.course_user = current_course_user
    @response.build_missing_answers_and_options
  end

  def response_update_params
    params.
      require(:response).
      permit(answers_attributes: [:id, :text_response, options_attributes: [:id, :selected]])
  end
end
