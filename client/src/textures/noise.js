import {
  CanvasTexture,
  NearestFilter,
  RepeatWrapping,
} from 'three';

class Noise extends CanvasTexture {
  constructor() {
    const renderer = document.createElement('canvas');
    const ctx = renderer.getContext('2d');
    renderer.width = 16;
    renderer.height = 16;
    const pixels = ctx.getImageData(0, 0, renderer.width, renderer.height);
    for (let y = 0; y < renderer.height; y += 1) {
      for (let x = 0; x < renderer.width; x += 1) {
        let light = 0.9 + Math.random() * 0.05;
        if (
          x === 0
          || x === renderer.width - 1
          || y === 0
          || y === renderer.height - 1
        ) {
          light *= 0.9;
        } else if (
          x === 1
          || x === renderer.width - 2
          || y === 1
          || y === renderer.height - 2
        ) {
          light *= 1.2;
        }
        light = Math.floor(Math.min(Math.max(light, 0), 1) * 0xFF);
        const i = (y * renderer.height + x) * 4;
        pixels.data[i] = light;
        pixels.data[i + 1] = light;
        pixels.data[i + 2] = light;
        pixels.data[i + 3] = 0xFF;
      }
    }
    ctx.putImageData(pixels, 0, 0);
    super(renderer);
    this.magFilter = NearestFilter;
    this.minFilter = NearestFilter;
    this.wrapS = RepeatWrapping;
    this.wrapT = RepeatWrapping;
    this.needsUpdate = true;
  }
}

export default new Noise();
