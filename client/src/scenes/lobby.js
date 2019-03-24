import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Touches from 'touches';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';
import Floor from '@/components/lobby/floor';
import Menu from '@/components/lobby/menu';
import Title from '@/components/lobby/title';

class Lobby extends PureComponent {
  componentDidMount() {
    const {
      history,
      renderer: { current: renderer },
      fetchRealms,
    } = this.props;
    // Setup scene
    const anisotropy = renderer.getMaxAnisotropy();
    const scene = renderer.resetScene();
    scene.add(new Floor());
    scene.add(new Title({ anisotropy }));
    this.menu = new Menu({
      anisotropy,
      history,
    });
    scene.add(this.menu);
    this.renderer = renderer;
    this.scene = scene;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    // Input for non-vr browsers
    if (!renderer.renderer.vr.enabled) {
      this.touches = Touches(
        window,
        {
          filtered: true,
          target: renderer.canvas.current,
        }
      )
        .on('start', this.onPointerDown.bind(this));
    }
    // Fetch realms list
    fetchRealms({ page: 0 });
  }

  componentDidUpdate({ realms: previousRealms }) {
    const { realms } = this.props;
    if (realms !== previousRealms) {
      // Update realms
      this.menu.update(realms);
    }
  }

  componentWillUnmount() {
    const { scene, touches } = this;
    delete scene.onBeforeRender;
    if (touches) {
      touches.disable();
    }
  }

  onBeforeRender() {
    const {
      menu,
      renderer: {
        hands,
        raycaster,
      },
    } = this;

    // Handle controls
    hands.children.forEach((hand, i) => {
      const { buttons, pointer } = hand;
      hand.setupRaycaster(raycaster);
      const hit = raycaster.intersectObjects(menu.intersects)[0] || false;
      if (!hit) {
        pointer.visible = false;
        menu.setHover({ hand: i });
        return;
      }
      const {
        distance,
        object,
      } = hit;
      // Pointer feedback
      pointer.scale.z = distance - 0.175;
      pointer.visible = true;
      // Menu
      object.onPointer({
        hand: i,
        isDown: buttons.triggerDown,
      });
    });
  }

  onPointerDown(e, [x, y]) {
    // Handle non-vr browsers input
    const {
      menu,
      renderer: {
        camera,
        raycaster,
        width,
        height,
      },
    } = this;
    raycaster.setFromCamera({
      x: Math.min(Math.max(0.5 - (x / width), -0.5), 0.5) * -2,
      y: Math.min(Math.max(0.5 - (y / height), -0.5), 0.5) * 2,
    }, camera);
    const hit = raycaster.intersectObjects(menu.intersects)[0] || false;
    if (!hit) {
      return;
    }
    hit.object.onPointer({
      hand: 0,
      isDown: true,
    });
  }

  render() {
    return null;
  }
}

Lobby.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  realms: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
  fetchRealms: PropTypes.func.isRequired,
};

export default connect(
  ({
    lobby: {
      realms,
    },
  }) => ({
    realms,
  }),
  {
    fetchRealms,
  }
)(Lobby);
