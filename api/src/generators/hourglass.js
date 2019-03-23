const HSV2RGB = require('hsv-rgb');
const { Noise } = require('noisejs');

module.exports = ({ size }) => {
  const radius = size * 0.5;
  const noise = new Noise();
  noise.seed(Math.random());
  return ({ x, y, z }) => {
    // HourGlass
    if (x > radius) x -= size;
    if (z > radius) z -= size;
    const height = radius * Math.exp(-(x * x + z * z) / (size * 1.3));
    if (
      y <= height || y > size - height
    ) {
      // Paint it with a random hue using perlin noise
      const [r, g, b] = HSV2RGB(
        Math.min(Math.floor(Math.abs(noise.perlin3(z / 16, x / 16, y / 16)) * 359), 359),
        30,
        Math.min(Math.floor(
          Math.abs(noise.perlin3(z / radius, x / radius, y / size) + 0.5) * 100
        ), 100)
      );
      return (0x01 << 24) | (r << 16) | (g << 8) | b;
    }
    return 0;
  };
};
