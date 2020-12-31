import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import axios from 'axios';
import {App} from "./components/App";

import 'semantic-ui-less/semantic.less';
import './stylesheets/app.less';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

ReactDOM.render((
    <Router><App/></Router>
), document.getElementById('app'));