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

export function updateVoxels({
  color,
  normal,
  point,
  remove,
}) {
  return (dispatch, getState) => {
    const { realm: { size, voxels: current } } = getState();
    point.x += 0.5;
    point.z += 0.5;
    const [x, y, z] = ['x', 'y', 'z'].map((axis) => {
      let position = Math.floor(point[axis] + (normal[axis] * 0.5 * (remove ? -1 : 1)));
      while (position < 0) position += size;
      while (position >= size) position -= size;
      return position;
    });
    const randomized = {
      r: Math.min(Math.max(Math.round(color.r + (Math.random() * 8) - 4), 0), 255),
      g: Math.min(Math.max(Math.round(color.g + (Math.random() * 8) - 4), 0), 255),
      b: Math.min(Math.max(Math.round(color.b + (Math.random() * 8) - 4), 0), 255),
    };
    const value = remove ? (
      0x00
    ) : (
      (0x01 << 24) | (randomized.r << 16) | (randomized.g << 8) | randomized.b
    );
    const voxels = new Uint32Array(current);
    voxels[z * size * size + y * size + x] = value;
    return dispatch({
      type: types.REALM_UPDATE_VOXELS,
      payload: { voxels },
    });
  };
}

export function updateGeometry(geometry) {
  return {
    type: types.REALM_UPDATE_GEOMETRY,
    payload: { geometry },
  };
}
