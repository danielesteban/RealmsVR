import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { TiEject, TiSocialGooglePlus } from 'react-icons/ti';
import { connect } from 'react-redux';
import { Translate } from 'react-redux-i18n';
import styled from 'styled-components';
import { refreshSession, signout } from '@/actions/user';
import API from '@/services/api';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  > button {
    display: flex;
    align-items: center;
    outline: 0;
    font-family: inherit;
    font-size: 1.2rem;
    font-weight: 700;
    width: 150px;
    padding: 0.5rem 1rem;
    > svg {
      margin-right: 0.5rem;
    }
  }
`;

class Session extends PureComponent {
  constructor(props) {
    super(props);
    this.loginWithGoogle = this.loginWithGoogle.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  componentWillUnmount() {
    const { popupWatcher } = this;
    if (popupWatcher) {
      window.removeEventListener('message', this.onMessage);
      clearInterval(popupWatcher);
      delete this.popupWatcher;
    }
  }

  onMessage({ origin, data: { session } }) {
    const { popupWatcher } = this;
    const { refreshSession } = this.props;
    if (API.baseURL.indexOf(origin) === 0) {
      window.removeEventListener('message', this.onMessage);
      clearInterval(popupWatcher);
      delete this.popupWatcher;
      if (session) {
        refreshSession(session);
      }
    }
  }

  loginWithGoogle({ screenX, screenY }) {
    const w = 512;
    const h = 512;
    const left = (screenX || (window.screen.width / 2)) - w;
    const top = (screenY || (window.screen.height / 2));
    const win = window.open(
      `${API.baseURL}user/google`,
      'loginWithGoogle',
      `width=${w},height=${h},top=${top},left=${left}`
    );
    if (this.popupWatcher) {
      window.removeEventListener('message', this.onMessage);
      clearInterval(this.popupWatcher);
    }
    this.popupWatcher = setInterval(() => {
      if (!win.window) {
        clearInterval(this.popupWatcher);
        delete this.popupWatcher;
        return;
      }
      win.postMessage(true, API.baseURL);
    }, 100);
    window.addEventListener('message', this.onMessage, false);
  }

  render() {
    const { isAuth, signout } = this.props;
    return (
      <Wrapper>
        {isAuth ? (
          <button
            type="button"
            onClick={signout}
          >
            <TiEject />
            <Translate value="User.signOut" />
          </button>
        ) : (
          <button
            type="button"
            onClick={this.loginWithGoogle}
          >
            <TiSocialGooglePlus />
            <Translate value="User.signIn" />
          </button>
        )}
      </Wrapper>
    );
  }
}

Session.propTypes = {
  isAuth: PropTypes.bool.isRequired,
  refreshSession: PropTypes.func.isRequired,
  signout: PropTypes.func.isRequired,
};

export default connect(
  ({
    user: { isAuth },
  }) => ({
    isAuth,
  }),
  {
    refreshSession,
    signout,
  }
)(Session);
