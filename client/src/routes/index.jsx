import React from 'react';
import { hot } from 'react-hot-loader';
import { connect } from 'react-redux';
import { Route as RouteComponent, Redirect, Switch } from 'react-router-dom';
import Layout from '@/layout';
import Lobby from './lobby';
import Realm from './realm';
import NotFound from './404';

const Route = connect(
  ({ user: { isAuth } }) => ({ isAuth })
)(({
  component: Component,
  isAuth,
  requiresAuth,
  requiresNoAuth,
  ...rest
}) => {
  const isForbidden = (
    (requiresAuth && !isAuth)
    || (requiresNoAuth && isAuth)
  );
  return (
    <RouteComponent
      {...rest}
      render={props => (
        (isForbidden) ? (
          <Redirect to="/" />
        ) : (
          <Component {...props} />
        )
      )}
    />
  );
});

const Root = () => (
  <Layout>
    <Switch>
      <Route exact path="/" component={Lobby} />
      <Route exact path="/404" component={NotFound} />
      <Route exact path="/:slug" component={Realm} />
      <Route path="*" component={NotFound} />
    </Switch>
  </Layout>
);

export default hot(module)(Root);
