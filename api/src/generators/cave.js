const HSV2RGB = require('hsv-rgb');
const { Noise } = require('noisejs');

module.exports = ({ size }) => {
  const radius = size * 0.5;
  const c = p => Math.abs(p - radius + 0.5);
  const isCave = (x, y, z) => (
    c(y + 4) <= c(x)
    && c(y) <= Math.cos(x * z) * radius
  );
  const noise = new Noise();
  noise.seed(Math.random());
  return ({ x, y, z }) => {
    if (
      isCave(x, y, z)
    ) {
      /* Paint it with a random hue using perlin noise */
      const [r, g, b] = HSV2RGB(
        Math.min(Math.floor(Math.abs(noise.perlin3(z / 16, x / 16, y / 16)) * 359), 359),
        60,
        Math.min(Math.floor(
          Math.abs(noise.perlin3(z / radius, x / radius, y / size) + 0.5) * 100
        ), 100)
      );
      return (0x01 << 24) | (r << 16) | (g << 8) | b;
    }
    return 0;
  };
};
