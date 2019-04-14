module.exports = ({ size }) => {
  const isWall = (x, y, z) => (
    x === 0
    || x === size - 1
    || z === 0
    || z === size - 1
    || y === 0
    || y === size - 1
  );
  // This generator is just for debugging purposes
  return ({ x, y, z }) => {
    if (
      isWall(x, y, z)
    ) {
      const color = {
        r: Math.floor((0.6 - Math.random() * 0.5) * 0xFF),
        g: Math.floor((0.6 - Math.random() * 0.5) * 0xFF),
        b: Math.floor((0.6 - Math.random() * 0.5) * 0xFF),
      };
      return (
        (0x01 << 24)
        | (color.r << 16)
        | (color.g << 8)
        | color.b
      );
    }
    return 0;
  };
};
