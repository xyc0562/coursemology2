import { submit, change, SubmissionError } from 'redux-form';
import { browserHistory } from 'react-router';
import CourseAPI from 'api/course';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showSurveyForm(formParams) {
  return { type: actionTypes.SURVEY_FORM_SHOW, formParams };
}

export function hideSurveyForm() {
  return { type: actionTypes.SURVEY_FORM_HIDE };
}

export function submitSurveyForm() {
  return (dispatch) => {
    dispatch(submit(formNames.SURVEY));
  };
}

export function shiftEndDate(formName, newStartAt, oldValues, startAtField = 'start_at', endAtField = 'end_at') {
  return (dispatch) => {
    const { [startAtField]: oldStartAt, [endAtField]: oldEndAt } = oldValues;
    const oldStartTime = oldStartAt.getTime();
    const newStartTime = newStartAt.getTime();
    const oldEndTime = oldEndAt && oldEndAt.getTime();

    // if start time is before end time, allow user to clear the error
    if (oldEndAt && oldStartTime <= oldEndTime) {
      const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
      dispatch(change(formName, endAtField, newEndAt));
    }
  };
}

export function createSurvey(
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_REQUEST });
    return CourseAPI.survey.surveys.create(surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_SURVEY_SUCCESS,
          survey: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
        const courseId = CourseAPI.survey.surveys.getCourseId();
        browserHistory.push(`/courses/${courseId}/surveys/${response.data.id}`);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function fetchSurvey(surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.fetch(surveyId)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEY_SUCCESS,
          survey: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_FAILURE, surveyId });
      });
  };
}

export function fetchSurveys() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEYS_REQUEST });

    return CourseAPI.survey.surveys.index()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEYS_SUCCESS,
          surveys: response.data.surveys,
          canCreate: response.data.canCreate,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEYS_FAILURE });
      });
  };
}

export function updateSurvey(
  surveyId,
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.update(surveyId, surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_SURVEY_SUCCESS,
          survey: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SURVEY_FAILURE, surveyId });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteSurvey(surveyId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.delete(surveyId)
      .then(() => {
        browserHistory.push(`/courses/${CourseAPI.survey.surveys.getCourseId()}/surveys/`);
        dispatch({
          surveyId,
          type: actionTypes.DELETE_SURVEY_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SURVEY_FAILURE, surveyId });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function fetchResults(surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_RESULTS_REQUEST, surveyId });
    return CourseAPI.survey.surveys.results(surveyId)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEY_RESULTS_SUCCESS,
          survey: response.data.survey,
          questions: response.data.questions,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_RESULTS_FAILURE, surveyId });
      });
  };
}
