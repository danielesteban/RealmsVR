import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateVoxels } from '@/actions/realm';
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
    const { geometry: currentGeometry, size: currentSize } = this.props;
    if (size !== currentSize) {
      room.position.set(
        size * 0.5,
        size * 0.5,
        size * 0.5
      );
      voxels.resize(size);
    }
    if (geometry !== currentGeometry) {
      voxels.update(geometry);
    }
  }

  onBeforeRender({ animation, vr }, scene, camera) {
    const { hands, raycaster, voxels } = this;
    const { size, updateVoxels } = this.props;
    hands.children.forEach((hand) => {
      hand.setupRaycaster(raycaster);
      const hit = raycaster.intersectObjects(voxels.children)[0] || false;
      if (!hit) {
        hand.pointer.visible = false;
        return;
      }
      const { distance } = hit;
      hand.pointer.scale.z = distance - 0.175;
      hand.pointer.visible = true;
      if (hand.buttons.triggerDown || hand.buttons.gripDown) {
        const { point, face: { normal } } = hit;
        updateVoxels({
          color: { r: 0xFF, g: 0xFF, b: 0xFF },
          point,
          normal,
          remove: hand.buttons.gripDown,
        });
      }
    });
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
  updateVoxels: PropTypes.func.isRequired,
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
  }),
  {
    updateVoxels,
  }
)(RealmRenderer);
