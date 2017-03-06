import React, { PropTypes } from 'react';
import { Card, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { sorts } from '../../utils';
import { questionTypes } from '../../constants';
import { questionShape } from '../../propTypes';
import OptionsListItem from '../../components/OptionsListItem';

const styles = {
  optionWidget: {
    width: 'auto',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  gridOptionWidget: {
    marginTop: 5,
    width: 'auto',
  },
  gridOptionWidgetIcon: {
    margin: 0,
  },
  adminMenu: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardText: {
    position: 'relative',
  },
  card: {
    marginBottom: 15,
  },
};

class QuestionCard extends React.Component {
  static renderOptionsList(question, Widget) {
    const { byWeight } = sorts;
    return (
      <div>
        {question.options.sort(byWeight).map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = <Widget disabled style={styles.optionWidget} />;
          return <OptionsListItem key={option.id} {...{ optionText, imageUrl, widget }} />;
        })}
      </div>
    );
  }

  static renderOptionsGrid(question, Widget) {
    const { byWeight } = sorts;
    return (
      <div style={styles.grid}>
        { question.options.sort(byWeight).map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = (
            <Widget
              disabled
              style={styles.gridOptionWidget}
              iconStyle={styles.gridOptionWidgetIcon}
            />
          );
          return <OptionsListItem grid key={option.id} {...{ optionText, imageUrl, widget }} />;
        })}
      </div>
    );
  }

  static renderSpecificFields(question) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const widget = {
      [MULTIPLE_CHOICE]: RadioButton,
      [MULTIPLE_RESPONSE]: Checkbox,
    }[question.question_type];
    if (!widget) { return null; }
    return question.grid_view ?
      QuestionCard.renderOptionsGrid(question, widget) :
      QuestionCard.renderOptionsList(question, widget);
  }

  renderAdminMenu() {
    const { adminFunctions } = this.props;

    if (!adminFunctions || adminFunctions.length < 1) {
      return null;
    }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        style={styles.adminMenu}
      >
        {adminFunctions.map(({ label, handler }) =>
          <MenuItem key={label} primaryText={label} onTouchTap={handler} />
        )}
      </IconMenu>
    );
  }

  render() {
    const { question } = this.props;
    return (
      <Card style={styles.card}>
        <CardText style={styles.cardText}>
          {this.renderAdminMenu()}
          <p>{question.description}</p>
          {QuestionCard.renderSpecificFields(question)}
        </CardText>
      </Card>
    );
  }
}

QuestionCard.propTypes = {
  question: questionShape,
  adminFunctions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    handler: PropTypes.func,
  })),
};

export default QuestionCard;
