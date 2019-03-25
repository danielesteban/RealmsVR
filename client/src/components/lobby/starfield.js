import {
  BufferGeometry,
  Points,
  PointsMaterial,
  VertexColors,
  BufferAttribute,
  Vector3,
} from 'three';

class Starfield extends Points {
  constructor() {
    if (
      !Starfield.geometry
      || !Starfield.material
    ) {
      Starfield.setup();
    }
    super(
      Starfield.geometry,
      Starfield.material
    );
  }

  static setup() {
    if (!Starfield.geometry) {
      const count = 2048;
      const radius = 512;
      const position = new Float32Array(count * 3);
      const color = new Float32Array(count * 3);
      const aux = new Vector3();
      for (let i = 0; i < count * 3; i += 3) {
        aux
          .set(
            Math.random() * 2 - 1,
            Math.random(),
            Math.random() * 2 - 1
          )
          .normalize()
          .multiplyScalar(radius);
        position[i] = aux.x;
        position[i + 1] = aux.y;
        position[i + 2] = aux.z;
        const c = 0.2 + Math.random() * 0.5;
        color[i] = c - Math.random() * 0.1;
        color[i + 1] = c - Math.random() * 0.1;
        color[i + 2] = c - Math.random() * 0.1;
      }
      Starfield.geometry = new BufferGeometry();
      Starfield.geometry.addAttribute('position', new BufferAttribute(position, 3));
      Starfield.geometry.addAttribute('color', new BufferAttribute(color, 3));
    }
    if (!Starfield.material) {
      Starfield.material = new PointsMaterial({
        fog: false,
        vertexColors: VertexColors,
      });
    }
  }
}

export default Starfield;
