import { combineReducers } from 'redux';
import * as types from '@/actions/types';

const realms = (
  state = [],
  action
) => {
  switch (action.type) {
    case types.LOBBY_FETCH_REALMS_FULFILLED:
      return action.payload;
    default:
      return state;
  }
};

const lobbyReducer = combineReducers({
  realms,
});

export default lobbyReducer;
