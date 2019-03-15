module.exports = ({ size }) => {
  const radius = size * 0.5;
  return ({ x, y, z }) => {
    if (
      y === radius - 1
      && x >= radius - 2
      && x <= radius + 1
      && z >= radius - 2
      && z <= radius + 1
    ) {
      const light = 255 - Math.floor(Math.random() * 16);
      return (0x01 << 24) | (light << 16) | (light << 8) | light;
    }
    return 0;
  };
};
