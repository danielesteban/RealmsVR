import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';
import Floor from './floor';
import Menu from './menu';

class LobbyRenderer extends Renderer {
  componentDidMount() {
    super.componentDidMount();
    const { renderer, scene } = this;
    const { fetchRealms, history } = this.props;
    this.floor = new Floor();
    scene.add(this.floor);
    this.menu = new Menu({
      anisotropy: renderer.capabilities.getMaxAnisotropy(),
      history,
    });
    scene.add(this.menu);
    fetchRealms({ page: 0 });
  }

  componentWillReceiveProps({ realms }) {
    const { realms: currentRealms } = this.props;
    if (realms !== currentRealms) {
      this.menu.update(realms);
    }
  }

  onBeforeRender(renderer, scene, camera) {
    super.onBeforeRender(renderer, scene, camera);
    const {
      hands,
      menu,
      raycaster,
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
}

LobbyRenderer.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  realms: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
  fetchRealms: PropTypes.func.isRequired,
};

export default withRouter(connect(
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
)(LobbyRenderer));
