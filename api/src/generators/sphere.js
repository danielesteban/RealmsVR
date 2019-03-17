const { vec3 } = require('gl-matrix');
const HSV2RGB = require('hsv-rgb');
const { Noise } = require('noisejs');

module.exports = ({ size }) => {
  const radius = size * 0.5;
  const noise = new Noise();
  noise.seed(Math.random());
  const entropyX = Math.random() * 0.15;
  const entropyY = Math.random() * 0.3;
  const entropyZ = Math.random() * 0.15;
  const c = vec3.fromValues(radius, radius, radius);
  const v = vec3.create();
  return ({ x, y, z }) => {
    /* Draw a sphere at the middle of the dimension */
    v[0] = x * (1 + (Math.random() * entropyX));
    v[1] = y * (1 + (Math.random() * entropyY));
    v[2] = z * (1 + (Math.random() * entropyZ));
    const d = vec3.distance(v, c);
    const n = Math.floor(
      Math.abs(noise.perlin3(x / 16, y / 16, z / 16) * 20)
    );
    if (
      (d > size * 0.4 && d < size * 0.6)
      && n < 10
      && !(
        (
          (z === radius || z === radius - 1)
          && (x === radius || x === radius - 1)
        )
        || (y <= radius + 1 && y >= radius - 2)
      )
    ) {
      /* Paint it with a random hue using perlin noise */
      const [r, g, b] = HSV2RGB(
        Math.min(Math.floor(Math.abs(noise.perlin3(z / 16, x / 16, y / 16)) * 359), 359),
        75,
        Math.min(Math.floor(
          Math.abs(noise.perlin3(z / radius, x / radius, y / size) + 0.5) * 100
        ), 100)
      );
      return (0x01 << 24) | (r << 16) | (g << 8) | b;
    }
    return 0;
  };
};
