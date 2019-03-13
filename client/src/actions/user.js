import { setLocale as reduxSetLocale } from 'react-redux-i18n';
import * as types from './types';
import API from '@/services/api';

export function refreshSession(session) {
  if (session) {
    return {
      type: types.USER_REFRESH_SESSION_FULFILLED,
      payload: session,
    };
  }
  return dispatch => dispatch({
    type: types.USER_REFRESH_SESSION,
    payload: API.fetch({
      endpoint: 'user',
    }),
  }).catch(() => {});
}

export function setLocale(locale) {
  return (dispatch) => {
    localStorage.setItem('REALMSVR::LOCALE', locale);
    dispatch(reduxSetLocale(locale));
  };
}

export function signout() {
  return {
    type: types.USER_SIGNOUT,
  };
}
