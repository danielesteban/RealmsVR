import {
  Object3D,
} from 'three';
import Panel from '@/components/panel';

class Realm extends Panel {
  constructor({ anisotropy, name, onPointer }) {
    super({ anisotropy });
    this.scale.set(0.25, 0.25, 1);
    this.name = name;
    this.onPointer = onPointer;
    this.draw();
  }

  draw() {
    const {
      context: ctx,
      isHover,
      name,
      renderer,
    } = this;
    super.draw();
    ctx.fillStyle = isHover ? '#333' : '#111';
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    ctx.font = '80px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(
      name,
      renderer.width * 0.5,
      renderer.height * 0.5
    );
  }
}

class Menu extends Object3D {
  constructor({ anisotropy, history }) {
    super();
    this.anisotropy = anisotropy;
    this.history = history;
    this.hover = {};
    this.position.set(0, 1.25, -1);
  }

  dispose() {
    const { children } = this;
    children.forEach(child => child.dispose());
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
    } = this;
    while (children.length) {
      this.remove(children[0]);
    }
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
    });
  }
}

export default Menu;
