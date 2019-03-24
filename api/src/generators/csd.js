const { vec3 } = require('gl-matrix');
const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  // M.C. Escher's Cubic Space Division
  const noise = getNoise();
  const cube = size * 0.2;
  const corners = [
    vec3.fromValues(0, 0, 0),
    vec3.fromValues(size - 1, 0, 0),
    vec3.fromValues(0, 0, size - 1),
    vec3.fromValues(size - 1, 0, size - 1),
    vec3.fromValues(0, size - 1, 0),
    vec3.fromValues(size - 1, size - 1, 0),
    vec3.fromValues(0, size - 1, size - 1),
    vec3.fromValues(size - 1, size - 1, size - 1),
  ];
  return ({ x, y, z }) => {
    const p = vec3.fromValues(x, y, z);
    const d = corners.reduce((d, c) => (
      Math.min(d, vec3.distance(c, p))
    ), size);
    if (
      d < cube
      || (z === 0 && x === 0)
      || (z === size - 1 && x === 0)
      || (z === size - 1 && x === size - 1)
      || (z === 0 && x === size - 1)
      || (
        (y === 0 || y === size - 1)
        && (
          x === 0 || x === size - 1
          || z === 0 || z === size - 1
        )
      )
    ) {
      return sampleColorFromNoise({
        noise,
        x,
        y,
        z,
      });
    }
    return 0;
  };
};
