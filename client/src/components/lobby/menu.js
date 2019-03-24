import {
  BufferGeometry,
  Color,
  CylinderGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  VertexColors,
} from 'three';
import Panel from '@/components/panel';
import Fonts from '@/services/fonts';

class Pillar extends Mesh {
  constructor() {
    if (!Pillar.geometry || !Pillar.material) {
      Pillar.setup();
    }
    super(
      Pillar.geometry,
      Pillar.material
    );
  }

  static setup() {
    if (!Pillar.geometry) {
      const geometry = new CylinderGeometry(0.025, 0.025, 1, 8, 16);
      geometry.translate(0, -0.575, 0);
      const color = new Color();
      geometry.faces.forEach((face, i) => {
        if (i % 2 === 1) {
          face.color.copy(color);
        } else {
          face.color.setHex(0x556655);
          face.color.offsetHSL(0, 0, Math.random() * -0.1);
          color.copy(face.color);
        }
      });
      Pillar.geometry = (new BufferGeometry()).fromGeometry(geometry);
    }
    if (!Pillar.material) {
      Pillar.material = new MeshBasicMaterial({
        vertexColors: VertexColors,
      });
    }
  }
}

class Realm extends Panel {
  constructor({
    anisotropy,
    name,
    onPointer,
    screenshot,
  }) {
    super({ anisotropy });
    this.scale.set(0.25, 0.25, 1);
    this.name = name;
    this.onPointer = onPointer;
    {
      const { width, height } = this.renderer;
      const vignette = this.context.createRadialGradient(
        width * 0.5, height * 0.5, width * 0.2,
        width * 0.5, height * 0.5, width * 0.5
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, .5)');
      this.vignette = vignette;
    }
    let hasLoadedFont = false;
    Fonts
      .waitUntilLoaded('Roboto')
      .then(() => {
        hasLoadedFont = true;
        this.draw();
      });
    if (screenshot) {
      const image = new Image();
      image.src = `data:image/jpeg;base64,${screenshot}`;
      image.onload = () => {
        this.screenshot = image;
        if (hasLoadedFont) {
          this.draw();
        }
      };
    }
  }

  draw() {
    const {
      context: ctx,
      isHover,
      name,
      renderer,
      screenshot,
      vignette,
    } = this;
    super.draw();
    if (screenshot) {
      ctx.drawImage(screenshot, 0, 0);
    }
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    ctx.fillStyle = `rgba(${isHover ? '255, 255, 255' : '0, 0, 0'}, .5)`;
    ctx.fillRect(0, renderer.height * 0.75, renderer.width, renderer.height * 0.25);
    ctx.font = '700 60px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isHover ? '#333' : '#fff';
    ctx.fillText(
      name,
      renderer.width * 0.5,
      renderer.height * 0.875
    );
  }
}

class Menu extends Object3D {
  constructor({ anisotropy, history }) {
    super();
    this.anisotropy = anisotropy;
    this.history = history;
    this.hover = {};
    this.intersects = [];
    this.position.set(0, 1, -1);
  }

  dispose() {
    const { children } = this;
    children.forEach(child => child.dispose && child.dispose());
  }

  setHover({ hand, realm }) {
    const { hover } = this;
    if (hover[hand]) {
      hover[hand].isHover = false;
      hover[hand].draw();
    }
    if (realm) {
      realm.isHover = true;
      realm.draw();
    }
    this.hover[hand] = realm;
  }

  update(realms) {
    const {
      anisotropy,
      children,
      history,
      intersects,
    } = this;
    while (children.length) {
      this.remove(children[0]);
    }
    intersects.length = 0;
    const offset = 0.25 + realms.length * -0.25;
    realms.forEach((realm, i) => {
      const panel = new Realm({
        ...realm,
        anisotropy,
        onPointer: ({ hand, isDown }) => {
          this.setHover({ hand, realm: panel });
          if (isDown) {
            history.push(`/${realm.slug}`);
          }
        },
      });
      panel.position.set(
        offset + (i * 0.5),
        0,
        0
      );
      panel.lookAt(0, 0.5, 1);
      this.add(panel);
      intersects.push(panel);
      const pillar = new Pillar();
      pillar.position.copy(panel.position);
      this.add(pillar);
    });
  }
}

export default Menu;
