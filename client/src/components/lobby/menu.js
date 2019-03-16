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
    ctx.fillStyle = isHover ? '#555' : '#333';
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
    this.position.set(0, 1, -1);
  }

  setHover(realm) {
    const { hover } = this;
    if (hover) {
      hover.isHover = false;
      hover.draw();
    }
    if (realm) {
      realm.isHover = true;
      realm.draw();
    }
    this.hover = realm;
  }

  update(realms) {
    const {
      anisotropy,
      children,
      // history,
    } = this;
    while (children.length) {
      this.remove(children[0]);
    }
    const offset = 0.25 + realms.length * -0.25;
    realms.forEach((realm, i) => {
      const panel = new Realm({
        ...realm,
        anisotropy,
        onPointer: ({ isDown }) => {
          this.setHover(panel);
          if (isDown) {
            // history.push(`/${realm.slug}`);
            window.location = `/${realm.slug}`;
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
