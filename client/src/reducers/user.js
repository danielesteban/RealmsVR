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
      return true;
    case types.USER_REFRESH_SESSION_REJECTED:
    case types.USER_SIGNOUT:
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
      return action.payload.profile;
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
  profile,
  token,
});

export default userReducer;
