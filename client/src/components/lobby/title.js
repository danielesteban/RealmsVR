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
    this.lookAt(0, -0.5, 1);
    this.position.set(0, 2.5, -3);
    this.renderer = renderer;
    this.texture = texture;
    this.visible = false;
    Fonts
      .waitUntilLoaded('Roboto')
      .then(() => {
        this.draw();
        this.visible = true;
      });
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
    const subdivision = 8;
    const radius = subdivision * 0.5;
    const color = { r: 0x33, g: 0x99, b: 0x33 };
    for (let y = 0; y < renderer.height; y += subdivision) {
      for (let x = 0; x < renderer.width; x += subdivision) {
        const a = (1 - (y / (renderer.height - subdivision)) + 0.1) / 3;
        const l = Math.random() * 0.6 + 0.3;
        ctx.fillStyle = `rgba(${Math.floor(color.r * l)}, ${Math.floor(color.g * l)}, ${Math.floor(color.b * l)}, ${a})`;
        ctx.beginPath();
        ctx.arc(x + radius, y + radius, radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.font = '700 200px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText(
      'REALMS',
      renderer.width * 0.5,
      renderer.height * 0.21
    );
    ctx.font = '70px Roboto';
    ctx.fillStyle = '#999';
    ctx.fillText(
      'A recursive VR experience',
      renderer.width * 0.5,
      renderer.height * 0.5
    );
    ctx.font = '50px Roboto';
    ctx.fillStyle = '#696';
    ctx.fillText(
      `v${__VERSION__} - dani@gatunes © 2019`,
      renderer.width * 0.5,
      renderer.height * 0.815
    );
    texture.needsUpdate = true;
  }
}

export default Title;
