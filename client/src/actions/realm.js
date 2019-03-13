import * as types from './types';
import API from '@/services/api';

export function create({
  name,
}) {
  return {
    type: types.REALM_CREATE,
    payload: API.fetch({
      body: {
        name,
      },
      endpoint: 'realm',
      method: 'PUT',
    }),
  };
}

export function fetch(slug) {
  return {
    type: types.REALM_FETCH,
    payload: API.fetch({
      endpoint: `realm/${slug}`,
    })
      .then(realm => (
        API.fetch({
          endpoint: `realm/${realm._id}/voxels`,
        })
          .then(voxels => ({
            ...realm,
            voxels: new Uint32Array(voxels),
          }))
      )),
  };
}

export function reset() {
  return {
    type: types.REALM_RESET,
  };
}

export function updateGeometry(geometry) {
  return {
    type: types.REALM_UPDATE_GEOMETRY,
    payload: { geometry },
  };
}
