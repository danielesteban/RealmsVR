import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
  VertexColors,
  Vector3,
} from 'three';

class Panel extends Mesh {
  constructor({
    anisotropy,
    width = 512,
    height = 512,
  }) {
    if (
      !Panel.backplate
      || !Panel.geometry
    ) {
      Panel.setup();
    }
    const renderer = document.createElement('canvas');
    renderer.width = width;
    renderer.height = height;
    const texture = new CanvasTexture(renderer);
    texture.anisotropy = anisotropy;
    super(
      Panel.geometry,
      new MeshBasicMaterial({
        map: texture,
      })
    );
    this.add(Panel.backplate.clone());
    this.context = renderer.getContext('2d');
    this.pointer = new Vector3();
    this.renderer = renderer;
    this.texture = texture;
  }

  dispose() {
    const { material, texture } = this;
    material.dispose();
    texture.dispose();
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

  static setup() {
    if (!Panel.backplate) {
      const geometry = new BoxGeometry(1, 1, 0.06);
      geometry.faces.splice(8, 2);
      geometry.faces.forEach((face, i) => (
        face.color.setHex(
          Math.floor(i / 2) === 4 ? 0x111111 : 0x222222
        )
      ));
      geometry.translate(0, 0, -0.01);
      const backplate = new Mesh(
        (new BufferGeometry()).fromGeometry(geometry),
        new MeshBasicMaterial({
          side: DoubleSide,
          vertexColors: VertexColors,
        })
      );
      Panel.backplate = backplate;
    }

    if (!Panel.geometry) {
      Panel.geometry = new PlaneBufferGeometry(1, 1);
    }
  }
}

export default Panel;
