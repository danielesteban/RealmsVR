import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
  TiKey,
  TiSocialGooglePlusCircular,
  TiTimes,
} from 'react-icons/ti';
import { connect } from 'react-redux';
import { Translate } from 'react-redux-i18n';
import styled from 'styled-components';
import {
  hideSessionPopup as hide,
  login,
  loginWithGoogle,
  register,
} from '@/actions/user';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, .5);
`;

const Popup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 512px;
  background: #444;
  box-shadow: 0 0 32px rgba(0, 0, 0, .5);
`;

const Heading = styled.div`
  background: #111;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  .tabs {
    display: flex;
    height: 100%;
    > a {
      display: flex;
      align-items: center;
      background: #222;
      padding: 0 1rem;
      border-left: 1px solid #333;
      cursor: pointer;
      &:first-child {
        border-left: none;
      }
      &.active {
        background: #444;
        cursor: default;
      }
    }
  }
  > a {
    padding: 1rem;
    > svg {
      font-size: 1.5em;
    }
  }
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  button {
    display: flex;
    align-items: center;
    border: 1px solid #555;
    background: #222;
    padding: 0.5rem 1rem;
    margin: 0;
    font-family: inherit;
    font-weight: 700;
    font-size: 1.2rem;
    color: inherit;
    cursor: pointer;
    outline: 0;
    > svg {
      font-size: 1.5em;
      margin-right: 0.5rem;
    }
  }
  .or {
    position: relative;
    width: 100%;
    border-top: 1px solid #222;
    margin: 2rem 0;
    > span {
      position: absolute;
      display: block;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .google {
    display: flex;
    justify-content: center;
  }
`;

const Form = styled.form`
  display: none;
  flex-direction: column;
  align-items: center;
  width: 80%;
  &.active {
    display: flex;
  }
  > label {
    width: 100%;
    padding: 0;
  }
  > input {
    box-sizing: border-box;
    border: 1px solid #333;
    width: 100%;
    background: #222;
    color: inherit;
    font-family: inherit;
    font-weight: 400;
    font-size: 2em;
    padding: 0.5rem;
    margin: 0 0 1rem;
  }
`;

class Session extends PureComponent {
  constructor(props) {
    super(props);
    this.onLoginSubmit = this.onLoginSubmit.bind(this);
    this.onRegisterSubmit = this.onRegisterSubmit.bind(this);
    this.state = { tab: 'login' };
  }

  onLoginSubmit(e) {
    e.preventDefault();
    const { target: form } = e;
    const { login } = this.props;
    login({
      email: form.email.value,
      password: form.password.value,
    });
  }

  onRegisterSubmit(e) {
    e.preventDefault();
    const { target: form } = e;
    const { register } = this.props;
    if (form.password.value !== form.confirmPassword.value) {
      return;
    }
    register({
      email: form.email.value,
      name: form.name.value,
      password: form.password.value,
    });
  }

  render() {
    const {
      isSigningIn,
      hide,
      loginWithGoogle,
    } = this.props;
    const { tab } = this.state;
    if (!isSigningIn) {
      return null;
    }
    return (
      <Wrapper>
        <Popup>
          <Heading>
            <div className="tabs">
              <a
                className={tab === 'login' ? 'active' : null}
                onClick={() => this.setState({ tab: 'login' })}
              >
                <Translate value="User.signIn" />
              </a>
              <a
                className={tab === 'register' ? 'active' : null}
                onClick={() => this.setState({ tab: 'register' })}
              >
                <Translate value="User.register" />
              </a>
            </div>
            <a
              onClick={hide}
            >
              <TiTimes />
            </a>
          </Heading>
          <Content>
            <Form
              className={tab === 'login' ? 'active' : null}
              onSubmit={this.onLoginSubmit}
            >
              <label><Translate value="User.email" /></label>
              <input type="email" name="email" required />
              <label><Translate value="User.password" /></label>
              <input type="password" name="password" required />
              <button
                type="submit"
              >
                <TiKey />
                <Translate value="User.signIn" />
              </button>
            </Form>
            <Form
              className={tab === 'register' ? 'active' : null}
              onSubmit={this.onRegisterSubmit}
            >
              <label><Translate value="User.name" /></label>
              <input type="text" name="name" required />
              <label><Translate value="User.email" /></label>
              <input type="email" name="email" required />
              <label><Translate value="User.password" /></label>
              <input type="password" name="password" required />
              <label><Translate value="User.confirmPassword" /></label>
              <input type="password" name="confirmPassword" required />
              <button
                type="submit"
              >
                <TiKey />
                <Translate value="User.register" />
              </button>
            </Form>
            <div className="or">
              <Translate value="User.or" />
            </div>
            <div className="google">
              <button
                onClick={loginWithGoogle}
                type="button"
              >
                <TiSocialGooglePlusCircular />
                <Translate value="User.signInWithGoogle" />
              </button>
            </div>
          </Content>
        </Popup>
      </Wrapper>
    );
  }
}

Session.propTypes = {
  isSigningIn: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  loginWithGoogle: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
};

export default connect(
  ({
    user: {
      isSigningIn,
    },
  }) => ({
    isSigningIn,
  }),
  {
    hide,
    login,
    loginWithGoogle,
    register,
  }
)(Session);
