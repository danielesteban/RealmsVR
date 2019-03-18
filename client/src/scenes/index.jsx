import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Renderer from '@/components/renderer';
import Lobby from './lobby';
import Realm from './realm';

const Scene = ({
  component: Component,
  path,
  renderer,
}) => (
  <Route
    exact
    path={path}
    render={props => (
      <Component {...props} renderer={renderer} />
    )}
  />
);

Scene.propTypes = {
  component: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
};

const Scenes = ({ renderer }) => (
  <Switch>
    <Scene path="/" component={Lobby} renderer={renderer} />
    <Scene path="/:slug" component={Realm} renderer={renderer} />
    <Redirect to="/" />
  </Switch>
);

Scenes.propTypes = {
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
};

export default Scenes;
