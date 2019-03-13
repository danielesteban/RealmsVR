import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Renderer from '@/components/renderer';
import Voxels from './voxels';

class RealmRenderer extends Renderer {
  constructor(props) {
    super(props);
    const { scene } = this;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    this.voxels = new Voxels();
    scene.add(this.voxels);
  }

  componentWillReceiveProps({ geometry, size }) {
    const { room, voxels } = this;
    const { geometry: currentGeometry } = this.props;
    if (geometry !== currentGeometry) {
      voxels.update({
        ...geometry,
        size,
      });
      // room.position.set(
      //   size * 0.5,
      //   size * 0.5,
      //   size * 0.5
      // );
      room.position.set(
        0, 2, 4
      );
    }
  }

  onBeforeRender({ animation, vr }, scene, camera) {
    const { size } = this.props;
    if (!vr.enabled && size) {
      const { delta, time } = animation;
      const rotation = Math.sin(time * 0.1) * 0.001;
      camera.rotateY(rotation);
      camera.rotateX(rotation);
      camera.translateZ(delta * 0.5);
      camera.updateMatrixWorld();
      ['x', 'y', 'z'].forEach((axis) => {
        if (camera.position[axis] < 0) {
          camera.position[axis] += size;
        }
        if (camera.position[axis] >= size) {
          camera.position[axis] -= size;
        }
      });
    }
  }
}

RealmRenderer.propTypes = {
  geometry: PropTypes.shape({
    index: PropTypes.instanceOf(Uint32Array),
    position: PropTypes.instanceOf(Float32Array),
    color: PropTypes.instanceOf(Float32Array),
    normal: PropTypes.instanceOf(Float32Array),
  }).isRequired,
  size: PropTypes.number,
};

export default connect(
  ({
    realm: {
      geometry,
      size,
    },
  }) => ({
    geometry,
    size,
  })
)(RealmRenderer);
