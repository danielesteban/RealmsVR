const { vec3 } = require('gl-matrix');
const HSV2RGB = require('hsv-rgb');
const { Noise } = require('noisejs');

module.exports = ({ size }) => {
  /* M.C. Escher's Cubic Space Division */
  const radius = size * 0.5;
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
  const noise = new Noise();
  noise.seed(Math.random());
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
      /* Paint it with a random hue using perlin noise */
      const [r, g, b] = HSV2RGB(
        Math.min(Math.floor(Math.abs(noise.perlin3(z / 16, x / 16, y / 16)) * 359), 359),
        Math.min(Math.floor(
          Math.abs(0.75) * 100
        ), 100),
        Math.min(Math.floor(
          Math.abs(noise.perlin3(z / radius, x / radius, y / size) + 0.5) * 100
        ), 100)
      );
      return (0x01 << 24) | (r << 16) | (g << 8) | b;
    }
    return 0;
  };
};
