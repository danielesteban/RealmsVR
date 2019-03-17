import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';
import Floor from '@/components/lobby/floor';
import Menu from '@/components/lobby/menu';

class Lobby extends PureComponent {
  componentDidMount() {
    const {
      history,
      renderer: { current: renderer },
      fetchRealms,
    } = this.props;
    const scene = renderer.resetScene();
    scene.add(new Floor());
    this.menu = new Menu({
      anisotropy: renderer.getMaxAnisotropy(),
      history,
    });
    scene.add(this.menu);
    this.renderer = renderer;
    this.scene = scene;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    fetchRealms({ page: 0 });
  }

  componentDidUpdate({ realms: previousRealms }) {
    const { realms } = this.props;
    if (realms !== previousRealms) {
      this.menu.update(realms);
    }
  }

  componentWillUnmount() {
    const { scene } = this;
    delete scene.onBeforeRender;
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
      const hit = raycaster.intersectObjects(menu.children)[0] || false;
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
