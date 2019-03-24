const { vec3 } = require('gl-matrix');
const {
  getNoise,
  sampleColorFromNoise,
} = require('./utils');

module.exports = ({ size }) => {
  const noise = getNoise();
  const radius = size * 0.5;
  noise.seed(Math.random());
  const entropyX = Math.random() * 0.15;
  const entropyY = Math.random() * 0.3;
  const entropyZ = Math.random() * 0.15;
  const c = vec3.fromValues(radius, radius, radius);
  const v = vec3.create();
  return ({ x, y, z }) => {
    // SlicedSphere
    v[0] = x * (1 + (Math.random() * entropyX));
    v[1] = y * (1 + (Math.random() * entropyY));
    v[2] = z * (1 + (Math.random() * entropyZ));
    const d = vec3.distance(v, c);
    const n = Math.floor(
      Math.abs(noise.perlin3(x / 16, y / 16, z / 16) * 20)
    );
    if (
      n < 10
      && d > size * 0.4 && d < size * 0.6
      && (y < radius - 1 || y > radius + 2)
    ) {
      return sampleColorFromNoise({
        noise,
        x,
        y,
        z,
      });
    }
    return 0;
  };
};
