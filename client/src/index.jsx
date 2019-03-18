import { createBrowserHistory } from 'history';
import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore, compose as productionCompose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import { Provider } from 'react-redux';
import { loadingBarMiddleware } from 'react-redux-loading-bar';
import { Router } from 'react-router-dom';
import thunkMiddleware from 'redux-thunk';
import { refreshSession } from '@/actions/user';
import syncTranslationWithStore, { load as reloadLocales } from '@/locales';
import rootReducer from '@/reducers';
import Layout from '@/layout';

// Create Redux Store
const devCompose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
const compose = !__PRODUCTION__ && devCompose ? devCompose : productionCompose;
const store = createStore(
  rootReducer,
  {},
  compose(
    applyMiddleware(thunkMiddleware, promiseMiddleware, loadingBarMiddleware())
  )
);
syncTranslationWithStore(store);

// Revive session from localStorage
if (store.getState().user.isAuth) {
  store.dispatch(refreshSession());
}

// Create router history
const history = createBrowserHistory({
  basename: __BASENAME__,
});

// Support initial hash route from the ghpages-spa-webpack-plugin
if (window.location.hash) {
  history.replace(`/${window.location.hash.substr(2)}`);
}

// Disable contextual menus
window.addEventListener('contextmenu', e => (
  e.preventDefault()
), false);

// Render the page
const mount = document.getElementById('mount');
render(
  <Provider store={store}>
    <Router history={history}>
      <Layout />
    </Router>
  </Provider>,
  mount
);

// Hot reload locales & reducers
if (!__PRODUCTION__ && module.hot) {
  module.hot.accept('@/locales', () => reloadLocales(store));
  module.hot.accept('@/reducers', () => store.replaceReducer(rootReducer));
}
