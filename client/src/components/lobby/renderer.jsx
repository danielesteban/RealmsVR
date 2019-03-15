import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchRealms } from '@/actions/lobby';
import Renderer from '@/components/renderer';

class LobbyRenderer extends Renderer {
  componentDidMount() {
    const { fetchRealms } = this.props;
    super.componentDidMount();
    fetchRealms({ page: 0 });
  }
}

LobbyRenderer.propTypes = {
  realms: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    geometry: PropTypes.shape({
      index: PropTypes.instanceOf(Uint32Array),
      position: PropTypes.instanceOf(Float32Array),
      color: PropTypes.instanceOf(Float32Array),
      normal: PropTypes.instanceOf(Float32Array),
    }).isRequired,
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
