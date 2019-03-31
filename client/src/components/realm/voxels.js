import {
  BufferAttribute,
  BufferGeometry,
  Frustum,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
  UniformsUtils,
  ShaderLib,
  VertexColors,
  Vector3,
} from 'three';
import Noise from '@/textures/noise';

class Voxels extends Object3D {
  constructor({ instanced = false }) {
    super();
    if (instanced) {
      const { shader } = Voxels;
      this.geometry = new InstancedBufferGeometry();
      this.material = new ShaderMaterial({
        defines: shader.defines,
        vertexShader: shader.vertex,
        fragmentShader: shader.fragment,
        uniforms: UniformsUtils.merge([
          shader.uniforms,
          { map: { value: Noise } },
        ]),
        fog: true,
        vertexColors: VertexColors,
      });
    } else {
      this.geometry = new BufferGeometry();
      this.material = new MeshBasicMaterial({
        map: Noise,
        vertexColors: VertexColors,
      });
    }
    this.instanced = instanced;
    this.visible = false;

    this.aux = {
      frustum: new Frustum(),
      matrix: new Matrix4(),
    };
  }

  dispose() {
    const { geometry, material } = this;
    geometry.dispose();
    material.dispose();
  }

  resize(size) {
    const {
      children,
      geometry,
      instanced,
      material,
    } = this;
    while (children.length) {
      this.remove(children[0]);
    }

    const radius = 8;
    this.instances = [];
    const aux = new Vector3();
    const origin = new Vector3();
    for (let z = -radius; z <= radius; z += 1) {
      for (let y = -radius; y <= radius; y += 1) {
        for (let x = -radius; x <= radius; x += 1) {
          const distance = aux.set(x, y, z).distanceTo(origin);
          if (Math.round(distance) <= radius) {
            const instance = new Mesh(
              geometry,
              material
            );
            instance.chunk = { x, y, z };
            instance.distance = distance;
            instance.matrixAutoUpdate = false;
            instance.position.set(x * size, y * size, z * size);
            instance.updateMatrix();
            instance.updateMatrixWorld();
            this.instances.push(instance);
          }
        }
      }
    }
    this.instances.sort(({ distance: a }, { distance: b }) => (
      a - b
    ));
    this.intersects = this.instances.filter((instance) => {
      const { chunk: { x, y, z } } = instance;
      return (
        x >= -2 && x <= 2
        && y >= -2 && y <= 2
        && z >= -2 && z <= 2
      );
    });

    if (instanced) {
      const mesh = new Mesh(
        geometry,
        material
      );
      mesh.frustumCulled = false;
      this.add(mesh);
      const offset = new Float32Array(this.instances.length * 3);
      if (geometry.attributes.offset) {
        geometry.attributes.offset.setArray(offset);
      } else {
        geometry.addAttribute('offset', new InstancedBufferAttribute(offset, 3));
        geometry.attributes.offset.setDynamic(true);
      }
      geometry.maxInstancedCount = 0;
    } else {
      this.instances.forEach(instance => this.add(instance));
    }
  }

  updateFrustum(camera) {
    const {
      aux: { frustum, matrix },
      geometry,
      instanced,
      instances,
    } = this;
    if (!instanced || !instances) return;
    matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.setFromMatrix(matrix);
    const offsets = instances
      .filter(({ worldSphere }) => worldSphere && frustum.intersectsSphere(worldSphere))
      .reduce((offsets, { position }) => {
        offsets.push(
          position.x,
          position.y,
          position.z
        );
        return offsets;
      }, []);
    geometry.attributes.offset.array.set(offsets);
    geometry.attributes.offset.needsUpdate = true;
    geometry.maxInstancedCount = offsets.length / 3;
  }

  update({
    index,
    position,
    color,
    normal,
    uv,
  }) {
    const { geometry, instances } = this;
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
    if (geometry.attributes.uv) {
      geometry.attributes.uv.setArray(uv);
      geometry.attributes.uv.needsUpdate = true;
    } else {
      geometry.addAttribute('uv', new BufferAttribute(uv, 2));
    }
    if (geometry.index) {
      geometry.index.setArray(index);
      geometry.index.needsUpdate = true;
    } else {
      geometry.setIndex(new BufferAttribute(index, 1));
    }
    geometry.computeBoundingSphere();
    instances.forEach((instance) => {
      instance.worldSphere = geometry.boundingSphere
        .clone()
        .applyMatrix4(instance.matrixWorld);
    });
    this.visible = true;
  }
}

Voxels.shader = {
  vertex: (
    ShaderLib.basic.vertexShader
      .replace(
        '#include <clipping_planes_pars_vertex>',
        [
          '#include <clipping_planes_pars_vertex>',
          'attribute vec3 offset;',
        ].join('\n')
      )
      .replace(
        '#include <begin_vertex>',
        [
          'vec3 transformed = vec3( offset + position );',
        ].join('\n')
      )
  ),
  fragment: ShaderLib.basic.fragmentShader,
  uniforms: UniformsUtils.clone(ShaderLib.basic.uniforms),
  defines: { USE_MAP: true },
};

export default Voxels;
