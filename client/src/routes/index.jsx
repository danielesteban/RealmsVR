import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { hot } from 'react-hot-loader';
import { Route, Redirect, Switch } from 'react-router-dom';
import Renderer from '@/components/renderer';
import Layout from '@/layout';
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

class Root extends Component {
  constructor(props) {
    super(props);
    this.renderer = React.createRef();
  }

  render() {
    const { renderer } = this;
    return (
      <Layout>
        <Renderer ref={renderer} />
        <Switch>
          <Scene exact path="/" component={Lobby} renderer={renderer} />
          <Scene exact path="/:slug" component={Realm} renderer={renderer} />
          <Redirect to="/" />
        </Switch>
      </Layout>
    );
  }
}

export default hot(module)(Root);
