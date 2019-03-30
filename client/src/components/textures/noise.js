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
    for (let i = 0; i < pixels.data.length; i += 4) {
      const light = Math.floor((0.9 + (Math.random() * 0.05)) * 0xFF);
      pixels.data[i] = light;
      pixels.data[i + 1] = light;
      pixels.data[i + 2] = light;
      pixels.data[i + 3] = 0xFF;
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

export default Noise;
