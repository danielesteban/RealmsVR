import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';
import Menu from './menu';

class LobbyRenderer extends Renderer {
  constructor(props) {
    super(props);
    const { scene } = this;
    this.menu = new Menu({
      history: props.history,
    });
    scene.add(this.menu);
  }

  componentWillReceiveProps({ realms }) {
    const { realms: currentRealms } = this.props;
    if (realms !== currentRealms) {
      this.menu.update(realms);
    }
  }

  componentDidMount() {
    const { fetchRealms } = this.props;
    super.componentDidMount();
    fetchRealms({ page: 0 });
  }

  onBeforeRender(renderer, scene, camera) {
    super.onBeforeRender(renderer, scene, camera);
    const {
      hands,
      menu,
      raycaster,
    } = this;

    // Handle controls
    hands.children.forEach((hand) => {
      const { buttons, pointer } = hand;
      hand.setupRaycaster(raycaster);
      const hit = raycaster.intersectObject(menu)[0] || false;
      if (!hit) {
        pointer.visible = false;
        return;
      }
      const {
        distance,
        point,
      } = hit;
      // Pointer feedback
      pointer.scale.z = distance - 0.175;
      pointer.visible = true;
      // Menu
      menu.onPointer({
        isDown: buttons.triggerDown,
        point,
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
