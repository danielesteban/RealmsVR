import {
  BufferAttribute,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  VertexColors,
} from 'three';

class Voxels extends Object3D {
  constructor() {
    super();
    this.material = new MeshBasicMaterial({
      vertexColors: VertexColors,
    });
  }

  update({
    index,
    position,
    color,
    normal,
    size,
  }) {
    const { material } = this;
    const geometry = new BufferGeometry();
    geometry.addAttribute('position', new BufferAttribute(position, 3));
    geometry.addAttribute('color', new BufferAttribute(color, 3));
    geometry.addAttribute('normal', new BufferAttribute(normal, 3));
    geometry.setIndex(new BufferAttribute(index, 1));
    const mesh = new Mesh(
      geometry,
      material
    );
    while (this.children.length) {
      this.remove(this.children[0]);
    }
    const radius = 8;
    for (let z = -radius; z <= radius; z += 1) {
      for (let y = -radius; y <= radius; y += 1) {
        for (let x = -radius; x <= radius; x += 1) {
          const instance = mesh.clone();
          instance.position.set(x * size, y * size - 1, z * size);
          this.add(instance);
        }
      }
    }
  }
}

export default Voxels;
