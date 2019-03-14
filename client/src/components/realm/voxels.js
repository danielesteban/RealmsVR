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
    this.geometry = new BufferGeometry();
    this.material = new MeshBasicMaterial({
      vertexColors: VertexColors,
    });
  }

  resize(size) {
    const { children, geometry, material } = this;
    const radius = 8;
    while (children.length) {
      this.remove(children[0]);
    }
    for (let z = -radius; z <= radius; z += 1) {
      for (let y = -radius; y <= radius; y += 1) {
        for (let x = -radius; x <= radius; x += 1) {
          const instance = new Mesh(
            geometry,
            material
          );
          instance.position.set(x * size, y * size, z * size);
          instance.updateMatrix();
          this.add(instance);
        }
      }
    }
  }

  update({
    index,
    position,
    color,
    normal,
  }) {
    const { geometry } = this;
    if (geometry.attributes.position) {
      geometry.attributes.position.setArray(position);
      geometry.attributes.position.needsUpdate = true;
    } else {
      geometry.addAttribute('position', new BufferAttribute(position, 3));
    }
    if (geometry.attributes.color) {
      geometry.attributes.color.setArray(color);
      geometry.attributes.color.needsUpdate = true;
    } else {
      geometry.addAttribute('color', new BufferAttribute(color, 3));
    }
    if (geometry.attributes.normal) {
      geometry.attributes.normal.setArray(normal);
      geometry.attributes.normal.needsUpdate = true;
    } else {
      geometry.addAttribute('normal', new BufferAttribute(normal, 3));
    }
    if (geometry.index) {
      geometry.index.setArray(index);
      geometry.index.needsUpdate = true;
    } else {
      geometry.setIndex(new BufferAttribute(index, 1));
    }
    geometry.computeBoundingSphere();
  }
}

export default Voxels;
