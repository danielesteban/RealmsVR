import { combineReducers } from 'redux';
import * as types from '@/actions/types';

const geometry = (
  state = {},
  action
) => {
  switch (action.type) {
    case types.REALM_UPDATE_GEOMETRY_FULFILLED:
      return action.payload;
    case types.REALM_RESET:
      return {};
    default:
      return state;
  }
};

const fog = (
  state = 0x020214,
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
    case types.REALM_UPDATE_FOG:
      return action.payload.fog;
    case types.REALM_RESET:
      return 0x020214;
    default:
      return state;
  }
};

const id = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
      return action.payload._id;
    case types.REALM_RESET:
      return '';
    default:
      return state;
  }
};

const isCreator = (
  state = false,
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
      return !!action.payload.isCreator;
    case types.REALM_RESET:
      return false;
    default:
      return state;
  }
};

const name = (
  state = '',
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
      return action.payload.name;
    case types.REALM_RESET:
      return '';
    default:
      return state;
  }
};

const size = (
  state = 0,
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
      return action.payload.size;
    case types.REALM_RESET:
      return 0;
    default:
      return state;
  }
};

const voxels = (
  state = new Uint32Array(),
  action
) => {
  switch (action.type) {
    case types.REALM_FETCH_FULFILLED:
    case types.REALM_UPDATE_VOXELS:
      return action.payload.voxels;
    case types.REALM_RESET:
      return new Uint32Array();
    default:
      return state;
  }
};

const realmReducer = combineReducers({
  geometry,
  fog,
  id,
  isCreator,
  name,
  size,
  voxels,
});

export default realmReducer;
