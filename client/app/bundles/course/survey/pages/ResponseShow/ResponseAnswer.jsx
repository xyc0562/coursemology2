import React, { PropTypes } from 'react';
import { Field, FieldArray } from 'redux-form';
import { RadioButton } from 'material-ui/RadioButton';
import { Card, CardText } from 'material-ui/Card';
import { red500 } from 'material-ui/styles/colors';
import TextField from 'lib/components/redux-form/TextField';
import Checkbox from 'lib/components/redux-form/Checkbox';
import { questionTypes } from '../../constants';
import { questionShape } from '../../propTypes';
import OptionsListItem from '../../components/OptionsListItem';

const styles = {
  textResponse: {
    width: '100%',
  },
  errorText: {
    color: red500,
  },
  answerCard: {
    marginBottom: 15,
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  tiledImage: {
    maxHeight: 150,
    maxWidth: 150,
  },
  listOptionWidget: {
    width: 'auto',
  },
  gridOptionWidget: {
    marginTop: 5,
    width: 'auto',
  },
  gridOptionWidgetIcon: {
    margin: 0,
  },
};

class ResponseAnswer extends React.Component {
  static propTypes = {
    question: questionShape,
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  };

  static renderTextResponseField(question, member) {
    return (
      <Field
        name={`${member}[text_response]`}
        component={TextField}
        style={styles.textResponse}
        multiLine
      />
    );
  }

  static renderMultipleResponseOptions(props) {
    const { fields, question, meta: { dirty, error } } = props;
    const { grid_view: grid, options } = question;

    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          {
            fields.map((member, index) => {
              const answerOption = fields.get(index);
              const option = options.find(opt =>
                opt.id.toString() === answerOption.question_option_id.toString()
              );
              const widget = (
                <Field
                  name={`${member}[selected]`}
                  component={Checkbox}
                  style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                  iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                />
              );
              const { option: optionText, image_url: imageUrl } = option;
              return (
                <OptionsListItem
                  key={option.id}
                  {...{ optionText, imageUrl, widget, grid }}
                />
              );
            })
          }
        </div>
      </div>
    );
  }

  static renderMultipleResponseField(question, member) {
    return (
      <FieldArray
        name={`${member}[options]`}
        component={ResponseAnswer.renderMultipleResponseOptions}
        {...{ question }}
      />
    );
  }

  static renderMultipleChoiceOptions({ question, ...props }) {
    const { input: { onChange, value }, meta: { dirty, error } } = props;
    const { grid_view: grid, options } = question;

    return (
      <div>
        { dirty && error ? <p style={styles.errorText}>{error}</p> : null }
        <div style={grid ? styles.grid : {}}>
          { options.map((option) => {
            const { option: optionText, image_url: imageUrl } = option;
            const id = option.id.toString();
            const widget = (
              <RadioButton
                value={id}
                style={grid ? styles.gridOptionWidget : styles.listOptionWidget}
                iconStyle={grid ? styles.gridOptionWidgetIcon : {}}
                onCheck={(event, buttonValue) => onChange(buttonValue)}
                checked={id === value}
              />
            );
            return (
              <OptionsListItem
                key={option.id}
                {...{ optionText, imageUrl, widget, grid }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  static renderMultipleChoiceField(question, member) {
    return (
      <Field
        name={`${member}[selected_option]`}
        component={ResponseAnswer.renderMultipleChoiceOptions}
        {...{ question }}
      />
    );
  }

  render() {
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { question, member, index } = this.props;
    if (!question) { return <div />; }

    const renderer = {
      [TEXT]: ResponseAnswer.renderTextResponseField,
      [MULTIPLE_CHOICE]: ResponseAnswer.renderMultipleChoiceField,
      [MULTIPLE_RESPONSE]: ResponseAnswer.renderMultipleResponseField,
    }[question.question_type];
    if (!renderer) { return <div />; }

    return (
      <Card style={styles.answerCard}>
        <CardText>
          <p>{`${index + 1}. ${question.description}`}</p>
          <Field
            name={`${member}[${index}][id]`}
            component="hidden"
          />
          { renderer(question, member) }
        </CardText>
      </Card>
    );
  }
}

export default ResponseAnswer;
