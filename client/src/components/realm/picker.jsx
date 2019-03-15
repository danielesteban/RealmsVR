import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Vector3,
} from 'three';

class Picker extends Mesh {
  constructor() {
    const renderer = document.createElement('canvas');
    const texture = new CanvasTexture(renderer);
    super(
      new PlaneBufferGeometry(1, 1),
      new MeshBasicMaterial({
        map: texture,
      })
    );
    {
      const backplate = new Mesh(
        new PlaneBufferGeometry(1, 1),
        new MeshBasicMaterial({
          color: 0x111111,
        })
      );
      backplate.geometry.rotateY(Math.PI);
      this.add(backplate);
    }
    this.position.set(-0.15, 0.15, 0.075);
    this.rotation.set(0, Math.PI * 0.5, Math.PI * 0.1, 'ZYX');
    this.scale.set(0.3, 0.3, 1);
    this.matrixAutoUpdate = false;
    this.updateMatrix();
    this.context = renderer.getContext('2d');
    this.pointer = new Vector3();
    this.renderer = renderer;
    this.texture = texture;
    this.draw();
  }

  draw() {
    const { context: ctx, renderer, texture } = this;
    renderer.width = 512;
    renderer.height = 512;
    ctx.fillStyle = '#0f0';
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    texture.needsUpdate = true;
  }

  onPointer({
    // isDown,
    point,
  }) {
    const { pointer } = this;
    this.worldToLocal(pointer.copy(point));
    // Do something with the pointer here
    this.draw();
  }
}

export default Picker;
