module.exports = () => {
  const color = { r: 0.4, g: 0.6, b: 1 };
  // Sea of holes
  return ({ x, y, z }) => {
    if (
      y === 0
      && (
        (z * x) % 2 === 0
      )
    ) {
      const light = 127 - Math.floor(Math.random() * 32);
      return (
        (0x01 << 24)
        | (Math.floor(light * color.r) << 16)
        | (Math.floor(light * color.g) << 8)
        | Math.floor(light * color.b)
      );
    }
    return 0;
  };
};
