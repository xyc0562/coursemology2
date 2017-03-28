import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import { showSectionForm, createSurveySection } from 'course/survey/actions/sections';

const translations = defineMessages({
  newSection: {
    id: 'course.surveys.NewSectionButton.newSection',
    defaultMessage: 'New Section',
  },
  success: {
    id: 'course.surveys.NewSectionButton.success',
    defaultMessage: 'Section created.',
  },
  failure: {
    id: 'course.surveys.NewSectionButton.failure',
    defaultMessage: 'Failed to create question.',
  },
});

const styles = {
  button: {
    marginRight: 15,
  },
};

class NewSectionButton extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  }

  createSectionHandler = (data) => {
    const { dispatch } = this.props;
    const payload = { section: data };
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(createSurveySection(payload, successMessage, failureMessage));
  }

  showNewSectionForm = () => {
    const { dispatch, intl } = this.props;
    return dispatch(showSectionForm({
      onSubmit: this.createSectionHandler,
      formTitle: intl.formatMessage(translations.newSection),
    }));
  }

  render() {
    return (
      <RaisedButton
        primary
        style={styles.button}
        label={<FormattedMessage {...translations.newSection} />}
        onTouchTap={this.showNewSectionForm}
      />
    );
  }
}

export default connect()(injectIntl(NewSectionButton));
