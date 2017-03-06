import BaseSurveyAPI from './Base';

export default class SurveysAPI extends BaseSurveyAPI {
  /**
  * survey_with_questions = {
  *   id:number, title:string, description:string, start_at:datetime, ...etc
  *      - Survey attributes
  *   questions: Array.<{description:string, options:Array, question_type:string, ...etc}>,
  *      - Array of questions belonging to the survey
  *      - question_type is one of ['text', 'multiple_choice', 'multiple_response']
  * }
  */

  /**
  * Fetches a Survey
  *
  * @param {number} surveyId
  * @return {Promise}
  * success response: survey_with_questions
  */
  fetch(surveyId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${surveyId}`);
  }

  /**
  * Fetches all surveys for the course accessible by the current user.
  *
  * @return {Promise}
  * success response: {
  *   canCreate:bool,
  *     - true if user can create a survey
  *   surveys:Array.<{id:number, title:string, ...etc}>
  *     - Array of surveys without full questions details
  * }
  */
  index() {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
  * Creates a Survey
  *
  * @param {object} surveyFields - params in the format of { survey: { :title, :description, etc } }
  * @return {Promise}
  * success response: survey_with_questions
  * error response: { errors: [{ attribute:string }] }
  */
  create(surveyFields) {
    return this.getClient().post(this._getUrlPrefix(), surveyFields);
  }

  /**
  * Updates a Survey
  *
  * @param {number} surveyId
  * @param {object} surveyFields - params in the format of { survey: { :title, :description, etc } }
  * @return {Promise}
  * success response: survey_with_questions
  * error response: { errors: [{ attribute:string }] }
  */
  update(surveyId, surveyFields) {
    return this.getClient().patch(`${this._getUrlPrefix()}/${surveyId}`, surveyFields);
  }

  /**
  * Deletes a Survey
  *
  * @param {number} surveyId
  * @return {Promise}
  * success response: {}
  * error response: {}
  */
  delete(surveyId) {
    return this.getClient().delete(`${this._getUrlPrefix()}/${surveyId}`);
  }

  /**
  * Shows a Survey's results
  *
  * @param {number} surveyId
  * @return {Promise}
  * success response: {
  *   questions: Array.<
  *     ...survey_question,
  *       - Question fields. See ./Questions.js.
  *     answers: Array.<
  *       id:number, course_user_name:string, course_user_role:string,
  *       text_response:string
  *         - included only if it is a text response question
  *       selected_options:Array.<number>
  *         - included only if it is a multiple choice or multiple response question
  *     >
  *   >,
  *  survey: { id:number, title:string, description:string, start_at:datetime, ...etc }
  *      - Survey attributes
  * }
  * error response: {}
  */
  results(surveyId) {
    return this.getClient().get(`${this._getUrlPrefix()}/${surveyId}/results`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/surveys`;
  }
}
