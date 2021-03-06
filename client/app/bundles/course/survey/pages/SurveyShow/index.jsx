/* eslint-disable new-cap */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape } from 'react-intl';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Subheader from 'material-ui/Subheader';
import { showDeleteConfirmation } from 'course/survey/actions';
import surveyTranslations from 'course/survey/translations';
import * as surveyActions from 'course/survey/actions/surveys';
import LoadingIndicator from 'course/survey/components/LoadingIndicator';
import SurveyDetails from './SurveyDetails';
import Section from './Section';

const translations = defineMessages({
  editSurvey: {
    id: 'course.surveys.SurveyShow.editSurvey',
    defaultMessage: 'Edit Survey',
  },
  deleteSurvey: {
    id: 'course.surveys.SurveyShow.deleteSurvey',
    defaultMessage: 'Delete Survey',
  },
  empty: {
    id: 'course.surveys.SurveyShow.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
});

class SurveyShow extends React.Component {

  componentDidMount() {
    const {
      dispatch,
      params: { surveyId },
    } = this.props;
    dispatch(surveyActions.fetchSurvey(surveyId));
  }

  updateSurveyHandler = (data) => {
    const { dispatch, intl, params: { surveyId } } = this.props;
    const { updateSurvey } = surveyActions;

    const payload = { survey: data };
    const successMessage = intl.formatMessage(surveyTranslations.updateSuccess, data);
    const failureMessage = intl.formatMessage(surveyTranslations.updateFailure);
    return dispatch(updateSurvey(surveyId, payload, successMessage, failureMessage));
  }

  showEditSurveyForm = (survey) => {
    const { dispatch, intl } = this.props;
    const { showSurveyForm } = surveyActions;
    const { start_at, end_at, title, description, base_exp } = survey;

    return () => dispatch(showSurveyForm({
      onSubmit: this.updateSurveyHandler,
      formTitle: intl.formatMessage(translations.editSurvey),
      initialValues: {
        start_at: new Date(start_at),
        end_at: new Date(end_at),
        title,
        description,
        base_exp,
      },
    }));
  }

  deleteSurveyHandler(survey) {
    const { dispatch, intl, params: { surveyId } } = this.props;
    const { deleteSurvey } = surveyActions;

    const successMessage = intl.formatMessage(surveyTranslations.deleteSuccess, survey);
    const failureMessage = intl.formatMessage(surveyTranslations.deleteFailure);
    const handleDelete = () => (
      dispatch(deleteSurvey(surveyId, successMessage, failureMessage))
    );
    return () => dispatch(showDeleteConfirmation(handleDelete));
  }

  adminFunctions(survey) {
    const { intl } = this.props;
    const functions = [];

    if (survey.canUpdate) {
      functions.push({
        label: intl.formatMessage(translations.editSurvey),
        handler: this.showEditSurveyForm(survey),
      });
    }

    if (survey.canDelete) {
      functions.push({
        label: intl.formatMessage(translations.deleteSurvey),
        handler: this.deleteSurveyHandler(survey),
      });
    }

    return functions;
  }

  renderBody(survey) {
    const { intl, isLoading } = this.props;
    const { sections, canUpdate } = survey;
    if (isLoading) { return <LoadingIndicator />; }
    if (!canUpdate) { return null; }
    if (!sections || sections.length < 1) {
      return <Subheader>{ intl.formatMessage(translations.empty) }</Subheader>;
    }
    return (
      <div>
        <Subheader>{ intl.formatMessage(surveyTranslations.questions) }</Subheader>
        {
          sections.map((section, index) =>
            <Section key={section.id} {...{ section, index, survey }} />
          )
        }
      </div>
    );
  }

  render() {
    const { surveys, params: { courseId, surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return (
      <div>
        <SurveyDetails
          {...{ survey, courseId, surveyId }}
          adminFunctions={this.adminFunctions(survey)}
        />
        { this.renderBody(survey) }
      </div>
    );
  }
}

SurveyShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    courseId: PropTypes.string.isRequired,
    surveyId: PropTypes.string.isRequired,
  }).isRequired,
  surveys: PropTypes.arrayOf(PropTypes.object).isRequired,
  intl: intlShape.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  surveys: state.surveys,
  isLoading: state.surveysFlags.isLoadingSurvey,
});
export const ConnectedSurveyShow = connect(mapStateToProps)(injectIntl(SurveyShow));
export default DragDropContext(HTML5Backend)(ConnectedSurveyShow);
