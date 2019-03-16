import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  Vector3,
} from 'three';

class Panel extends Mesh {
  constructor({ anisotropy }) {
    const renderer = document.createElement('canvas');
    renderer.width = 512;
    renderer.height = 512;
    const texture = new CanvasTexture(renderer);
    texture.anisotropy = anisotropy;
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
    this.context = renderer.getContext('2d');
    this.pointer = new Vector3();
    this.renderer = renderer;
    this.texture = texture;
  }

  draw() {
    const {
      context: ctx,
      renderer,
      texture,
    } = this;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    texture.needsUpdate = true;
  }

  onPointer(point) {
    const { pointer, renderer } = this;
    this.worldToLocal(pointer.copy(point));
    pointer.set(
      (pointer.x + 0.5) * renderer.width,
      (1 - (pointer.y + 0.5)) * renderer.height,
      0
    );
  }
}

export default Panel;
