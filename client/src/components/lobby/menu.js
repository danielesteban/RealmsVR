import Panel from '@/components/panel';

class Menu extends Panel {
  constructor() {
    super();
    this.position.set(0, 1.6, -1);
    this.realms = [];
    this.draw();
  }

  draw() {
    const {
      context: ctx,
      realms,
      renderer,
    } = this;
    super.draw();
    ctx.font = '40px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    realms.forEach(({
      name,
      x,
      y,
      width,
      height,
    }) => {
      ctx.fillStyle = '#333';
      ctx.fillRect(
        x,
        y + renderer.height * 0.01,
        width,
        height - renderer.height * 0.02
      );
      ctx.fillStyle = '#fff';
      ctx.fillText(
        name,
        width * 0.5,
        y + height * 0.5
      );
    });
  }

  update(realms) {
    const { renderer } = this;
    this.realms = realms.map(({ name, slug }, i) => ({
      name,
      slug,
      x: 0,
      y: i * renderer.height * 0.2,
      width: renderer.width,
      height: renderer.height * 0.2,
    }));
    this.draw();
  }

  onPointer(point) {
    const { pointer, realms } = this;
    super.onPointer(point);
    realms.forEach(({
      slug,
      x,
      y,
      width,
      height,
    }) => {
      if (
        pointer.x < x
        || pointer.x > x + width
        || pointer.y < y
        || pointer.y > y + height
      ) {
        return;
      }
      console.log(slug);
    });
  }
}

export default Menu;
