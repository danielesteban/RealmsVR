module.exports = ({ size }) => {
  const radius = size * 0.5;
  const isBalcony = (x, y) => (
    y === 0
    && x >= radius - 2
    && x <= radius + 1
  );
  const isWall = (x, y, z) => (
    (
      y < 1
      || y > 4
      || (
        x < radius - 3
        || x > radius + 2
      )
    )
    && (
      z === radius
      || z === radius - 1
    )
  );
  const isWindow = (x, y) => {
    const gx = x % 8;
    const gy = y % 8;
    return (
      gx > 2 && gx < 5
      && gy > 1 && gy < 4
    );
  };
  const wallColor = { r: 0.2, g: 0, b: 0.3 };
  const windowColor = { r: 0.6, g: 0.4, b: 0.2 };
  return ({ x, y, z }) => {
    // Balcony
    if (
      isBalcony(x, y, z)
    ) {
      const light = 64 - Math.floor(Math.random() * 64);
      return (0x01 << 24) | (light << 16) | ((light * 2) << 8) | light;
    }
    if (
      isWall(x, y, z)
    ) {
      const light = 128 - Math.floor(Math.random() * 16);
      const color = isWindow(x, y) ? windowColor : wallColor;
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
