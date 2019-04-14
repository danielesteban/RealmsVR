const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  const noise = getNoise();
  const radius = size * 0.5 - 0.5;
  const opening = size / 3;
  const isAtCenter = (a, b) => (
    Math.ceil(Math.sqrt(((radius - a) ** 2) + ((radius - b) ** 2))) < opening
  );
  const isWall = (x, y, z) => (
    (x === 0 && !isAtCenter(y, z))
    || (x === size - 1 && !isAtCenter(y, z))
    || (z === 0 && !isAtCenter(y, x))
    || (z === size - 1 && !isAtCenter(y, x))
    || y === 0
    || y === size - 1
  );
  // Box
  return ({ x, y, z }) => {
    if (
      isWall(x, y, z)
    ) {
      return sampleColorFromNoise({
        noise,
        s: 100,
        x,
        y,
        z,
      });
    }
    return 0;
  };
};
