const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  const noise = getNoise();
  const radius = size * 0.5;
  return ({ x, y, z }) => {
    // HourGlass
    if (x > radius) x -= size;
    if (z > radius) z -= size;
    const height = radius * Math.exp(-(x * x + z * z) / (size * 1.3));
    if (
      y <= height || y > size - height
    ) {
      return sampleColorFromNoise({
        noise,
        s: 20,
        x,
        y,
        z,
      });
    }
    return 0;
  };
};
