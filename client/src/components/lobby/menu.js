import Panel from '@/components/panel';

class Menu extends Panel {
  constructor({ history }) {
    super();
    this.history = history;
    this.position.set(0, 1.6, -1);
    this.realms = [];
    this.draw();
  }

  draw() {
    const {
      context: ctx,
      hover,
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
    }, i) => {
      ctx.fillStyle = hover === i ? '#555' : '#333';
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

  onPointer({
    isDown,
    point,
  }) {
    const { history, pointer, realms } = this;
    super.onPointer(point);
    for (let i = 0; i < realms.length; i += 1) {
      const {
        slug,
        x,
        y,
        width,
        height,
      } = realms[i];
      if (
        pointer.x >= x
        && pointer.x <= x + width
        && pointer.y >= y
        && pointer.y <= y + height
      ) {
        if (isDown) {
          history.push(`/${slug}`);
          return;
        }
        if (this.hover !== i) {
          this.hover = i;
          this.draw();
        }
        return;
      }
    }
    if (this.hover) {
      delete this.hover;
      this.draw();
    }
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
}

export default Menu;
