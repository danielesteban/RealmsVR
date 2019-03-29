import { setLocale as reduxSetLocale } from 'react-redux-i18n';
import * as types from './types';
import API from '@/services/api';

export function hideSessionPopup() {
  return {
    type: types.USER_HIDE_SESSION_POPUP,
  };
}

export function register({ email, name, password }) {
  return dispatch => dispatch({
    type: types.USER_REGISTER,
    payload: API.fetch({
      body: {
        email,
        name,
        password,
      },
      endpoint: 'user',
      method: 'PUT',
    }),
  }).catch(() => {});
}

export function refreshSession() {
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

export function showSessionPopup() {
  return {
    type: types.USER_SHOW_SESSION_POPUP,
  };
}

export function login({ email, password }) {
  return dispatch => dispatch({
    type: types.USER_LOGIN,
    payload: API.fetch({
      body: {
        email,
        password,
      },
      endpoint: 'user',
      method: 'POST',
    }),
  }).catch(() => {});
}

export function loginWithGoogle() {
  return (dispatch) => {
    const w = 512;
    const h = 512;
    const left = (window.screen.width / 2) - w / 2;
    const top = (window.screen.height / 2) - h / 2;
    const win = window.open(
      `${API.baseURL}user/google`,
      'loginWithGoogle',
      `width=${w},height=${h},top=${top},left=${left}`
    );
    const watcher = setInterval(() => {
      if (!win.window) {
        clearInterval(watcher);
        return;
      }
      win.postMessage(true, API.baseURL);
    }, 100);
    const onMessage = ({ origin, data: { session } }) => {
      if (API.baseURL.indexOf(origin) === 0) {
        window.removeEventListener('message', onMessage);
        clearInterval(watcher);
        if (!session) {
          return;
        }
        dispatch({
          type: types.USER_LOGIN_FULFILLED,
          payload: session,
        });
      }
    };
    window.addEventListener('message', onMessage, false);
  };
}

export function signout() {
  return {
    type: types.USER_SIGNOUT,
  };
}
