import PropTypes from 'prop-types';
import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import Renderer from '@/components/renderer';
import Lobby from './lobby';
import Realm from './realm';

const Scene = ({
  component: Component,
  renderer,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => (
      <Component {...props} renderer={renderer} />
    )}
  />
);

Scene.propTypes = {
  component: PropTypes.func.isRequired,
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
};

const Scenes = ({ renderer }) => (
  <Switch>
    <Scene exact path="/" component={Lobby} renderer={renderer} />
    <Scene exact path="/:slug" component={Realm} renderer={renderer} />
    <Redirect to="/" />
  </Switch>
);

Scenes.propTypes = {
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
};

export default Scenes;
