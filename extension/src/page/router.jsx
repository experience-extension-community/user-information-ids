// SPDX-License-Identifier: Apache-2.0
import PropTypes from 'prop-types';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from 'react-router-dom';
import Home from './Home';

// react-router v5: https://v5.reactrouter.com/web/guides/quick-start

const RouterPage = (props) => {
    return (
        <Router basename={props.pageInfo.basePath}>
            <Switch>
                <Route path="/">
                    <Home {...props} />
                </Route>
            </Switch>
        </Router>
    );
};

RouterPage.propTypes = {
    pageInfo: PropTypes.shape({
        basePath: PropTypes.string.isRequired
    }).isRequired
};

export default RouterPage;
