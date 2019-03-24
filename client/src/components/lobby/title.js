import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from 'three';
import Fonts from '@/services/fonts';

class Title extends Mesh {
  constructor({ anisotropy }) {
    const renderer = document.createElement('canvas');
    renderer.width = 1024;
    renderer.height = 1024;
    const texture = new CanvasTexture(renderer);
    texture.anisotropy = anisotropy;
    super(
      new PlaneBufferGeometry(2, 2),
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
      })
    );
    this.lookAt(0, -0.2, 1);
    this.position.set(0, 2, -3);
    this.renderer = renderer;
    this.texture = texture;
    Fonts
      .waitUntilLoaded('Roboto')
      .then(() => (
        this.draw()
      ));
  }

  dispose() {
    const { geometry, material, texture } = this;
    geometry.dispose();
    material.dispose();
    texture.dispose();
  }

  draw() {
    const { renderer, texture } = this;
    const ctx = renderer.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 0, renderer.height);
    grd.addColorStop(0, 'rgba(0,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    ctx.font = '700 200px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eee';
    ctx.shadowColor = 'rgba(255, 255, 0, .5)';
    ctx.shadowBlur = 50;
    ctx.fillText(
      'RealmsVR',
      renderer.width * 0.5,
      renderer.height * 0.2
    );
    ctx.font = '70px Roboto';
    ctx.fillStyle = '#999';
    ctx.shadowBlur = 0;
    ctx.fillText(
      'A recursive VR experience',
      renderer.width * 0.5,
      renderer.height * 0.5
    );
    ctx.font = '50px Roboto';
    ctx.fillStyle = '#111';
    ctx.fillText(
      `v${__VERSION__} - dani@gatunes © 2019`,
      renderer.width * 0.5,
      renderer.height * 0.85
    );
    texture.needsUpdate = true;
  }
}

export default Title;
