import * as types from './types';
import API from '@/services/api';

// eslint-disable-next-line import/prefer-default-export
export function fetchRealms({
  page = 0,
}) {
  return {
    type: types.LOBBY_FETCH_REALMS,
    payload: API.fetch({
      endpoint: `realms/${page}`,
    }),
  };
}
