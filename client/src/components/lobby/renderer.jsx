import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';
import Menu from './menu';

class LobbyRenderer extends Renderer {
  constructor(props) {
    super(props);
    const { scene } = this;
    this.menu = new Menu();
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
}

LobbyRenderer.propTypes = {
  realms: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
  })).isRequired,
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
)(LobbyRenderer);
