import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Touches from 'touches';
import {
  fetchRealms,
  setFilter,
  setPage,
} from '@/actions/lobby';
import {
  create as createRealm,
} from '@/actions/realm';
import { showSessionPopup as signin, signout } from '@/actions/user';
import Ground from '@/components/lobby/ground';
import Menu from '@/components/lobby/menu';
import Starfield from '@/components/lobby/starfield';
import Title from '@/components/lobby/title';
import Renderer from '@/components/renderer';

class Lobby extends PureComponent {
  componentDidMount() {
    const {
      filter,
      hasLoaded,
      history,
      isSigningIn,
      pagination,
      realms,
      user,
      renderer: { current: renderer },
      createRealm,
      fetchRealms,
      setFilter,
      setPage,
      signin,
      signout,
    } = this.props;
    // Setup scene
    const anisotropy = renderer.getMaxAnisotropy();
    const scene = renderer.resetScene();
    scene.add(new Ground());
    scene.add(new Starfield());
    scene.add(new Title({ anisotropy }));
    this.menu = new Menu({
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
    });
    scene.add(this.menu);
    this.renderer = renderer;
    this.scene = scene;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    // Input for non-vr browsers
    if (!renderer.renderer.vr.enabled) {
      this.touches = Touches(window, {
        filtered: true,
        target: renderer.canvas.current,
      })
        .on('start', this.onPointerDown.bind(this));
    }
    if (!hasLoaded) {
      // Fetch realms
      fetchRealms();
    }
  }

  componentDidUpdate({
    filter: previousFilter,
    isSigningIn: wasSigningIn,
    pagination: previousPagination,
    realms: previousRealms,
    user: previousUser,
  }) {
    const {
      filter,
      isSigningIn,
      pagination,
      realms,
      user,
      fetchRealms,
      setFilter,
    } = this.props;
    const {
      menu,
      renderer: { isScreenshot },
    } = this;
    const filterHasUpdated = filter !== previousFilter;
    if (
      filterHasUpdated
      || pagination.page !== previousPagination.page
    ) {
      // Fetch realms
      fetchRealms();
    }
    if (filterHasUpdated) {
      // Update filter
      menu.updateFilter(filter);
    }
    if (isSigningIn !== wasSigningIn) {
      // Update Session
      menu.updateSession({ isSigningIn });
    }
    if (pagination !== previousPagination) {
      // Update pagination
      menu.updatePagination(pagination);
    }
    if (realms !== previousRealms) {
      // Update realms
      menu.updateRealms(realms);
      if (isScreenshot) {
        setImmediate(() => {
          window.__SCREENSHOT_READY__ = true;
        });
      }
    }
    if (user !== previousUser) {
      // Update Session
      menu.updateSession({ user });
      if (!user && filter === 'user') {
        setFilter('all');
      }
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
        point,
      } = hit;
      // Pointer feedback
      pointer.scale.z = distance - 0.175;
      pointer.visible = true;
      // Menu
      object.onPointer({
        hand: i,
        isDown: buttons.triggerDown,
        point,
      });
    });
  }

  onPointerDown(e, [x, y]) {
    // Handle non-vr browsers input
    const {
      menu,
      props: {
        isSigningIn,
      },
      renderer: {
        camera,
        raycaster,
        width,
        height,
      },
    } = this;
    if (isSigningIn) {
      return;
    }
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
      point: hit.point,
    });
  }

  render() {
    return null;
  }
}

Lobby.defaultProps = {
  user: undefined,
};

Lobby.propTypes = {
  filter: PropTypes.string.isRequired,
  hasLoaded: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  isSigningIn: PropTypes.bool.isRequired,
  pagination: PropTypes.shape({
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
  }).isRequired,
  realms: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  createRealm: PropTypes.func.isRequired,
  fetchRealms: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  signin: PropTypes.func.isRequired,
  signout: PropTypes.func.isRequired,
};

export default connect(
  ({
    lobby: {
      filter,
      hasLoaded,
      pagination,
      realms,
    },
    user: {
      isAuth,
      isSigningIn,
      profile: user,
    },
  }) => ({
    filter,
    hasLoaded,
    isSigningIn,
    pagination,
    realms,
    user: isAuth ? user : undefined,
  }),
  {
    createRealm,
    fetchRealms,
    setFilter,
    setPage,
    signin,
    signout,
  }
)(Lobby);
