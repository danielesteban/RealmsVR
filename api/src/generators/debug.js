module.exports = ({ size }) => {
  // This generator is just for debugging purposes
  const radius = size * 0.5;
  return ({ x, y, z }) => {
    if (
      (
        z === 0
        && x >= radius - 2
        && x <= radius + 1
        && y >= radius - 2
        && y <= radius + 1
      )
      || (
        z === 1
        && y === radius
        && x === radius
      )
    ) {
      const light = 255 - Math.floor(Math.random() * 8);
      return (0x01 << 24) | (light << 16) | (light << 8) | light;
    }
    return 0;
  };
};
