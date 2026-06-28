/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { lazy } from 'solid-js';

import './index.css';
import App from './App';

const root = document.getElementById('root');

render(
    () => (
        <Router>
            <App />
        </Router>
    ),
    root!
);
