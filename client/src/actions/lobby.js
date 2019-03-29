import * as types from './types';
import API from '@/services/api';

export function fetchRealms() {
  return (dispatch, getState) => {
    const { lobby: { filter, pagination: { page } } } = getState();
    return dispatch({
      type: types.LOBBY_FETCH_REALMS,
      payload: API.fetch({
        endpoint: `realms/${filter === 'user' ? 'user/' : ''}${page}`,
      }),
    });
  };
}

export function setFilter(value) {
  return {
    type: types.LOBBY_SET_FILTER,
    payload: { value },
  };
}

export function setPage(value) {
  return {
    type: types.LOBBY_SET_PAGE,
    payload: { value },
  };
}
