import { combineReducers } from 'redux';
import * as types from '@/actions/types';

const filter = (
  state = 'all',
  action
) => {
  switch (action.type) {
    case types.LOBBY_SET_FILTER:
      return action.payload.value;
    default:
      return state;
  }
};

const hasLoaded = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.LOBBY_FETCH_REALMS_FULFILLED:
      return true;
    case types.REALM_CREATE_FULFILLED:
      return false;
    default:
      return state;
  }
};

const pagination = (
  state = {
    page: 0,
    pages: 0,
  },
  action
) => {
  switch (action.type) {
    case types.LOBBY_FETCH_REALMS_FULFILLED:
      return {
        ...state,
        pages: action.payload.pages,
      };
    case types.LOBBY_SET_FILTER:
      return {
        ...state,
        page: 0,
      };
    case types.LOBBY_SET_PAGE:
      return {
        ...state,
        page: action.payload.value,
      };
    default:
      return state;
  }
};

const realms = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.LOBBY_FETCH_REALMS_FULFILLED:
      return action.payload.realms;
    default:
      return state;
  }
};

const lobbyReducer = combineReducers({
  filter,
  hasLoaded,
  pagination,
  realms,
});

export default lobbyReducer;
