const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  const noise = getNoise();
  const radius = size * 0.5;
  const c = (p) => Math.abs(p - radius + 0.5);
  const isCave = (x, y, z) => (
    c(y + 4) <= c(x)
    && c(y) <= Math.cos(x * z) * radius
  );
  return ({ x, y, z }) => {
    // Mineshaft
    if (
      isCave(x, y, z)
    ) {
      return sampleColorFromNoise({
        noise,
        s: 40,
        x,
        y,
        z,
      });
    }
    return 0;
  };
};
