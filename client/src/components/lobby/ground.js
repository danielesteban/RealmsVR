import {
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
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
      const size = 256;
      const geometry = new PlaneGeometry(size, size, size, size);
      geometry.rotateX(Math.PI * -0.5);
      const color = new Color();
      geometry.faces.forEach((face, i) => {
        if (i % 2 === 1) {
          face.color.copy(color);
        } else {
          face.color.setHex(0x666655);
          face.color.offsetHSL(0, 0, Math.random() * -0.1);
          color.copy(face.color);
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
