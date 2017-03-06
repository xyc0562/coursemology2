import React from 'react';
import { Route, IndexRoute } from 'react-router';
import SurveyLayout from './containers/SurveyLayout';
import SurveyIndex from './pages/SurveyIndex';
import SurveyShow from './pages/SurveyShow';
import SurveyResults from './pages/SurveyResults';
import ResponseShow from './pages/ResponseShow';

export default (
  <Route path="courses/:courseId/surveys" component={SurveyLayout}>
    <IndexRoute component={SurveyIndex} />
    <Route path=":surveyId">
      <IndexRoute component={SurveyShow} />
      <Route path="results" component={SurveyResults} />
      <Route path="responses/:responseId" component={ResponseShow} />
    </Route>
  </Route>
);
