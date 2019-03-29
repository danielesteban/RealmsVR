import { combineReducers } from 'redux';
import * as types from '@/actions/types';
import API from '@/services/api';

const sessionKey = 'REALMSVR::SESSION';
const storedSession = JSON.parse(
  localStorage.getItem(sessionKey) || 'false'
);
if (storedSession) {
  API.setAuthorization(storedSession.token);
}

const isAuth = (
  state = !!storedSession,
  action
) => {
  switch (action.type) {
    case types.USER_REFRESH_SESSION_FULFILLED:
    case types.USER_LOGIN_FULFILLED:
    case types.USER_REGISTER_FULFILLED:
      return true;
    case types.USER_REFRESH_SESSION_REJECTED:
    case types.USER_SIGNOUT:
      return false;
    default:
      return state;
  }
};

const isSigningIn = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.USER_SHOW_SESSION_POPUP:
      return true;
    case types.USER_LOGIN_FULFILLED:
    case types.USER_HIDE_SESSION_POPUP:
    case types.USER_REGISTER_FULFILLED:
      return false;
    default:
      return state;
  }
};

const profile = (
  state = storedSession ? storedSession.profile : {},
  action
) => {
  switch (action.type) {
    case types.USER_REFRESH_SESSION_FULFILLED:
    case types.USER_LOGIN_FULFILLED:
    case types.USER_REGISTER_FULFILLED: {
      const { profile } = action.payload;
      const { name } = profile;
      return {
        ...profile,
        firstName: name.split(' ')[0],
      };
    }
    case types.USER_REFRESH_SESSION_REJECTED:
    case types.USER_SIGNOUT:
      return {};
    default:
      return state;
  }
};

const token = (
  state = storedSession ? storedSession.token : {},
  action
) => {
  switch (action.type) {
    case types.USER_REFRESH_SESSION_FULFILLED:
    case types.USER_LOGIN_FULFILLED:
    case types.USER_REGISTER_FULFILLED:
      API.setAuthorization(action.payload.token);
      localStorage.setItem(sessionKey, JSON.stringify(action.payload));
      return action.payload.token;
    case types.USER_REFRESH_SESSION_REJECTED:
    case types.USER_SIGNOUT:
      API.setAuthorization(false);
      localStorage.removeItem(sessionKey);
      return '';
    default:
      return state;
  }
};

const userReducer = combineReducers({
  isAuth,
  isSigningIn,
  profile,
  token,
});

export default userReducer;
