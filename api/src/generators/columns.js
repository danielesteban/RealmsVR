const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  const noise = getNoise();
  const radius = size * 0.5;
  const slope = 0.3 + (Math.random() * 0.8);
  const scale = 1.0 + Math.random();
  const column = Math.random() * 0.5;
  const isArc = (x, y, z) => (
    (x === 0 || x === (size - 1))
    && y > (size - (Math.floor(Math.abs(z - radius) * slope) * scale))
  );
  const isColumn = (x, y, z) => (
    (x === 0 || x === (size - 1))
    && (z < radius * column || z > (radius * (2 - column)) - 1)
  );
  const isFloor = (x, y) => (
    y === 0
    || (y >= size - 2 && Math.random() < 0.3)
  );
  return ({ x, y, z }) => {
    // Column Forest
    if (
      isFloor(x, y, z)
      || isColumn(x, y, z)
      || isColumn(z, y, x)
      || isArc(x, y, z)
      || isArc(z, y, x)
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
