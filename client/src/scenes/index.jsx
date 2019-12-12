import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Renderer from '@/components/renderer';
import Lobby from './lobby';
import Realm from './realm';

const Scenes = ({ renderer }) => (
  <Switch>
    {[
      { path: '/', Component: Lobby },
      { path: '/:slug', Component: Realm },
    ].map(({ path, Component }) => (
      <Route
        exact
        key={path}
        path={path}
        render={(props) => (
          <Component {...props} renderer={renderer} />
        )}
      />
    ))}
    <Redirect to="/" />
  </Switch>
);

Scenes.propTypes = {
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
};

export default Scenes;
