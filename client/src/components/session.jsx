import PropTypes from 'prop-types';
import React from 'react';
import {
  TiSocialGooglePlusCircular,
  TiTimes,
} from 'react-icons/ti';
import { connect } from 'react-redux';
import { Translate } from 'react-redux-i18n';

import styled from 'styled-components';
import {
  hideSessionPopup as hide,
  loginWithGoogle,
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
  height: 512px;
  background: #444;
  display: flex;
  flex-direction: column;
`;

const Heading = styled.div`
  background: #111;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  > a > svg {
    font-size: 1.5em;
  }
`;

const Content = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .google {
    display: flex;
    justify-content: center;
    padding: 1rem 0;
    > button {
      display: flex;
      align-items: center;
      border: 1px solid #555;
      background: #222;
      padding: 1rem;
      font-family: inherit;
      font-weight: 700;
      font-size: 1.5rem;
      color: inherit;
      cursor: pointer;
      outline: 0;
      > svg {
        font-size: 1.5em;
        margin-right: 0.5rem;
      }
    }
  }
`;

const Session = ({
  isSigningIn,
  hide,
  loginWithGoogle,
}) => {
  if (!isSigningIn) {
    return null;
  }
  return (
    <Wrapper>
      <Popup>
        <Heading>
          <Translate value="User.signIn" />
          <a
            onClick={hide}
          >
            <TiTimes />
          </a>
        </Heading>
        <Content>
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
};

Session.propTypes = {
  isSigningIn: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  loginWithGoogle: PropTypes.func.isRequired,
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
    loginWithGoogle,
  }
)(Session);
