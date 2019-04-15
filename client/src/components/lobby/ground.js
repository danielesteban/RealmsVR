import {
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
  VertexColors,
} from 'three';
import Noise from '@/textures/noise';

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
      const size = 256;
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
      const uv = Ground.geometry.attributes.uv.array;
      for (let i = 0; i < uv.length / 2; i += 6) {
        uv.set([
          0, 1,
        ], i * 2);
        uv.set([
          0, 0,
        ], (i + 1) * 2);
        uv.set([
          1, 1,
        ], (i + 2) * 2);
        uv.set([
          0, 0,
        ], (i + 3) * 2);
        uv.set([
          1, 0,
        ], (i + 4) * 2);
        uv.set([
          1, 1,
        ], (i + 5) * 2);
      }
    }
    if (!Ground.material) {
      Ground.material = new MeshBasicMaterial({
        map: Noise,
        vertexColors: VertexColors,
      });
    }
  }
}

export default Ground;
