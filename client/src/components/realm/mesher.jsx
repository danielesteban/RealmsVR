import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { updateGeometry } from '@/actions/realm';
import Worker from '@/services/mesher.worker';

class Mesher extends Component {
  constructor(props) {
    super(props);
    this.onMessage = this.onMessage.bind(this);
  }

  componentDidMount() {
    const worker = new Worker();
    worker.onmessage = this.onMessage;
    this.worker = worker;
  }

  componentWillReceiveProps({ size, voxels }) {
    const { worker } = this;
    const { voxels: currentVoxels } = this.props;
    if (voxels !== currentVoxels) {
      worker.postMessage({
        size,
        voxels,
      });
    }
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    const { worker } = this;
    worker.destroy();
  }

  onMessage({ data: { geometry } }) {
    const { updateGeometry } = this.props;
    updateGeometry(geometry);
  }

  render() {
    return null;
  }
}

Mesher.propTypes = {
  size: PropTypes.number.isRequired,
  voxels: PropTypes.instanceOf(Uint32Array).isRequired,
  updateGeometry: PropTypes.func.isRequired,
};

export default connect(
  ({
    realm: {
      size,
      voxels,
    },
  }) => ({
    size,
    voxels,
  }),
  {
    updateGeometry,
  }
)(Mesher);
