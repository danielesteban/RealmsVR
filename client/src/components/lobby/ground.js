import {
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
  VertexColors,
} from 'three';

class Ground extends Mesh {
  constructor() {
    if (
      !Ground.geometry
      || !Ground.material
    ) {
      Ground.setup();
    }
    super(
      Ground.geometry,
      Ground.material
    );
  }

  static setup() {
    if (!Ground.geometry) {
      const size = 224;
      const geometry = new PlaneGeometry(size, size, size, size);
      geometry.rotateX(Math.PI * -0.5);
      const origin = new Vector3();
      geometry.vertices.forEach((vertex) => {
        const distance = Math.floor(vertex.distanceTo(origin)) / 4;
        const height = Math.floor(distance * distance / 3) / 6;
        vertex.y = (
          height * (Math.random() * 0.4 + 0.6)
          + Math.max(Math.min(-(distance - 1.25), 0), -2)
        );
      });
      geometry.faces.forEach((face, i) => {
        if (i % 2 === 1) {
          const p = geometry.faces[i - 1];
          const v = [
            face.a, face.b, face.c,
            p.a, p.b, p.c,
          ].map(v => geometry.vertices[v]);
          const height = v.reduce((avg, v) => (
            avg + v.y
          ), 0) / v.length;
          v.forEach((v) => { v.y = height; });
          const factor = Math.min(height / 40 + 0.25, 1);
          face.color.setRGB(factor * 0.5, factor, factor * 0.75);
          face.color.offsetHSL(
            Math.random() * 0.03 - 0.01,
            Math.random() * 0.2,
            Math.random() * -0.05
          );
          p.color.copy(face.color);
        }
      });
      Ground.geometry = (new BufferGeometry()).fromGeometry(geometry);
    }
    if (!Ground.material) {
      Ground.material = new MeshBasicMaterial({
        vertexColors: VertexColors,
      });
    }
  }
}

export default Ground;
