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
import API from '@/services/api';
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
    super({
      anisotropy,
    });
    this.name = name;
    this.onPointer = onPointer;
    this.scale.set(0.3, 0.3, 1);
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

class ButtonsPanel extends Panel {
  constructor({
    anisotropy,
  }) {
    super({
      anisotropy,
      width: 256,
      height: 256,
    });
    this.scale.set(0.25, 0.25, 1);
    this.hasLoadedFont = false;
    Fonts
      .waitUntilLoaded('Roboto')
      .then(() => {
        this.hasLoadedFont = true;
        this.draw();
      });
  }

  draw() {
    const {
      buttons,
      context: ctx,
    } = this;
    super.draw();
    ctx.font = '700 30px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    buttons.forEach(({
      label,
      x,
      y,
      width,
      height,
      isActive,
      isDisabled,
    }) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      if (isDisabled) {
        ctx.fillStyle = '#555';
      } else if (isActive) {
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = '#222';
      }
      ctx.strokeStyle = '#333';
      ctx.fill();
      ctx.stroke();
      if (isDisabled) {
        ctx.fillStyle = '#777';
      } else if (isActive) {
        ctx.fillStyle = '#222';
      } else {
        ctx.fillStyle = '#fff';
      }
      ctx.fillText(
        label,
        width * 0.5,
        height * 0.5
      );
      ctx.restore();
    });
  }

  onPointer({ isDown, point }) {
    const { buttons, pointer } = this;
    if (!isDown) return;
    super.onPointer(point);
    buttons
      .filter(({ isDisabled }) => (!isDisabled))
      .forEach(({
        x,
        y,
        width,
        height,
        onPointer,
      }) => {
        if (
          pointer.x < x
          || pointer.x > x + width
          || pointer.y < y
          || pointer.y > y + height
        ) {
          return;
        }
        onPointer();
      });
  }
}

class CreateRealm extends ButtonsPanel {
  constructor({
    anisotropy,
    history,
    createRealm,
  }) {
    super({ anisotropy });
    this.scale.set(0.3, 0.3, 1);
    const { width, height } = this.renderer;
    this.buttons = [
      {
        label: 'Create Realm',
        x: width * 0.1,
        y: height * 0.3,
        width: width * 0.8,
        height: height * 0.4,
        onPointer: () => (
          createRealm()
            .then(({ value: slug }) => history.push(`/${slug}`))
        ),
      },
    ];
  }
}

class Pagination extends ButtonsPanel {
  constructor({
    anisotropy,
    page,
    pages,
    update,
  }) {
    super({ anisotropy });
    const { width, height } = this.renderer;
    this.buttons = [
      {
        label: '<',
        x: width * 0.1,
        y: height * 0.3,
        width: width * 0.3,
        height: height * 0.4,
        onPointer: () => {
          if (this.page > 0) update(this.page - 1);
        },
      },
      {
        label: '>',
        x: width * 0.6,
        y: height * 0.3,
        width: width * 0.3,
        height: height * 0.4,
        onPointer: () => {
          if (this.page < this.pages - 1) update(this.page + 1);
        },
      },
    ];
    this.page = page;
    this.pages = pages;
  }

  draw() {
    const {
      context: ctx,
      page,
      pages,
      renderer,
    } = this;
    super.draw();
    ctx.fillStyle = '#fff';
    ctx.fillText(
      `${page + 1} / ${pages}`,
      renderer.width * 0.5,
      renderer.height * 0.85
    );
  }
}

class Session extends ButtonsPanel {
  constructor({
    anisotropy,
    isSigningIn,
    user,
    signin,
    signout,
  }) {
    super({ anisotropy });
    this.signin = signin;
    this.signout = signout;
    this.updateSession({
      isSigningIn,
      user,
    });
  }

  updateSession({ isSigningIn, user }) {
    const { renderer, signin, signout } = this;
    const { width, height } = renderer;
    if (isSigningIn) {
      this.buttons = [];
    } else if (!user) {
      this.buttons = [{
        label: 'Sign-In',
        x: width * 0.1,
        y: height * 0.4,
        width: width * 0.8,
        height: height * 0.4,
        onPointer: signin,
      }];
    } else {
      this.buttons = [{
        label: 'Sign-Out',
        x: width * 0.1,
        y: height * 0.7,
        width: width * 0.8,
        height: height * 0.2,
        onPointer: signout,
      }];
    }
    this.isSigningIn = isSigningIn;
    this.user = user;
    delete this.userPhoto;
    if (user) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = `${API.baseURL}user/${user._id}/photo`;
      image.onload = () => {
        this.userPhoto = image;
        if (this.hasLoadedFont) {
          this.draw();
        }
      };
    }
  }

  draw() {
    const {
      context: ctx,
      isSigningIn,
      renderer,
      user,
      userPhoto,
    } = this;
    super.draw();
    ctx.fillStyle = '#fff';
    if (isSigningIn) {
      ctx.fillText(
        'Remove your',
        renderer.width * 0.5,
        renderer.height * 0.25
      );
      ctx.fillText(
        'headset',
        renderer.width * 0.5,
        renderer.height * 0.4
      );
      ctx.fillText(
        'And Sign-In',
        renderer.width * 0.5,
        renderer.height * 0.6
      );
      ctx.fillText(
        'in your browser',
        renderer.width * 0.5,
        renderer.height * 0.75
      );
    } else {
      ctx.fillText(
        user ? user.firstName : 'Guest',
        renderer.width * 0.5,
        renderer.height * 0.2
      );
    }
    if (user && userPhoto) {
      ctx.drawImage(
        userPhoto,
        renderer.width * 0.5 - 40, renderer.height * 0.5 - 50,
        80, 80
      );
    }
  }
}

class Filter extends ButtonsPanel {
  constructor({
    anisotropy,
    isAuth,
    filter,
    update,
  }) {
    super({ anisotropy });
    const { width, height } = this.renderer;
    this.buttons = [
      {
        id: 'all',
        label: 'All Realms',
        x: width * 0.1,
        y: height * 0.2,
        width: width * 0.8,
        height: height * 0.2,
        onPointer: () => update('all'),
      },
      {
        id: 'user',
        label: 'Your Realms',
        x: width * 0.1,
        y: height * 0.6,
        width: width * 0.8,
        height: height * 0.2,
        isDisabled: !isAuth,
        onPointer: () => update('user'),
      },
    ];
    this.filter = filter;
    this.update = update;
  }

  updateSession({ isAuth }) {
    this.buttons[1].isDisabled = !isAuth;
  }

  draw() {
    const { buttons, filter } = this;
    buttons.forEach((button) => {
      button.isActive = button.id === filter;
    });
    super.draw();
  }
}

class Menu extends Object3D {
  constructor({
    anisotropy,
    filter,
    history,
    isSigningIn,
    pagination,
    realms,
    user,
    createRealm,
    setFilter,
    setPage,
    signin,
    signout,
  }) {
    super();
    this.anisotropy = anisotropy;
    this.history = history;
    this.hover = {};
    this.intersects = [];
    this.position.set(0, 1, -1);
    this.pagination = this.addPanel(
      Pagination,
      {
        ...pagination,
        update: setPage,
      },
      0, -0.3, 0.13
    );
    this.session = this.addPanel(
      Session,
      {
        isSigningIn,
        user,
        signin,
        signout,
      },
      -0.3, -0.3, 0.13
    );
    this.filter = this.addPanel(
      Filter,
      {
        filter,
        isAuth: !!user,
        update: setFilter,
      },
      0.3, -0.3, 0.13
    );
    this.createRealm = createRealm;
    this.updateRealms(realms);
  }

  addPanel(Panel, props, x, y, z) {
    const { anisotropy, intersects } = this;
    const panel = new Panel({ ...props, anisotropy });
    panel.position.set(x, y, z);
    panel.lookAt(0, 0.5, 1);
    this.add(panel);
    const pillar = new Pillar();
    pillar.position.copy(panel.position);
    this.add(pillar);
    intersects.push(panel);
    return panel;
  }

  dispose() {
    const { children } = this;
    children.forEach(child => child.dispose && child.dispose());
  }

  setHover({ hand, realm }) {
    const { hover } = this;
    if (hover[hand] === realm) {
      return;
    }
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

  updateFilter(value) {
    const { filter } = this;
    filter.filter = value;
    filter.draw();
  }

  updatePagination({ page, pages }) {
    const { pagination } = this;
    pagination.page = page;
    pagination.pages = pages;
    pagination.draw();
  }

  updateRealms(realms) {
    const {
      anisotropy,
      children,
      createRealm,
      filter: { filter },
      history,
      pagination,
    } = this;
    while (children.length > 6) {
      this.remove(children[children.length - 1]);
    }
    this.intersects.length = 3;
    const showCreateRealm = filter === 'user' && pagination.page === 0;
    const count = realms.length + (showCreateRealm ? 1 : 0);
    let offset = 0.25 + count * -0.25;
    if (showCreateRealm) {
      this.addPanel(
        CreateRealm,
        {
          history,
          createRealm,
        },
        offset, 0, 0
      );
      offset += 0.5;
    }
    realms.forEach((realm, i) => {
      const panel = this.addPanel(
        Realm,
        {
          ...realm,
          anisotropy,
          onPointer: ({ hand, isDown }) => {
            this.setHover({ hand, realm: panel });
            if (isDown) {
              history.push(`/${realm.slug}`);
            }
          },
        },
        offset + (i * 0.5), 0, 0
      );
    });
  }

  updateSession({ isSigningIn, user }) {
    const { filter, session } = this;
    filter.updateSession({ isAuth: !!user });
    filter.draw();
    session.updateSession({ isSigningIn, user });
    session.draw();
  }
}

export default Menu;
