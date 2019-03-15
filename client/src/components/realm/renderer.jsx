import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateVoxels } from '@/actions/realm';
import Renderer from '@/components/renderer';
import Picker from './picker';
import Voxels from './voxels';

class RealmRenderer extends Renderer {
  constructor(props) {
    super(props);
    const { hands, scene } = this;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    this.picker = new Picker();
    hands.children[1].add(this.picker);
    this.intersects = [this.picker];
    this.voxels = new Voxels();
    scene.add(this.voxels);
  }

  componentWillReceiveProps({ geometry, size }) {
    const { picker, room, voxels } = this;
    const { geometry: currentGeometry, size: currentSize } = this.props;
    if (size !== currentSize) {
      room.position.set(
        size * 0.5,
        size * 0.5,
        size * 0.5
      );
      voxels.resize(size);
      this.intersects = [
        picker,
        ...voxels.children,
      ];
    }
    if (geometry !== currentGeometry) {
      voxels.update(geometry);
    }
  }

  onBeforeRender(renderer, scene, camera) {
    super.onBeforeRender(renderer, scene, camera);
    const { size, updateVoxels } = this.props;
    const {
      hands,
      head,
      intersects,
      picker,
      raycaster,
      room,
    } = this;

    // Handle controls
    hands.children.forEach((hand) => {
      const { buttons, pointer } = hand;
      hand.setupRaycaster(raycaster);
      const hit = raycaster.intersectObjects(intersects)[0] || false;
      if (!hit) {
        pointer.visible = false;
        return;
      }
      const {
        distance,
        face: { normal },
        object,
        point,
      } = hit;
      // Pointer feedback
      pointer.scale.z = distance - 0.175;
      pointer.visible = true;
      if (
        // Translocation
        buttons.padDown
        && normal.x === 0
        && normal.y === 1
        && normal.z === 0
      ) {
        const offset = {
          x: -head.offset.x,
          y: 0,
          z: -head.offset.z,
        };
        const [x, y, z] = ['x', 'y', 'z'].map((axis) => {
          let position = Math.floor(point[axis] - offset[axis]);
          while (position < 0) position += size;
          while (position >= size) position -= size;
          return position;
        });
        room.position.set(x, y, z);
      }
      if (
        // Color picker
        buttons.trigger
        && object === picker
      ) {
        picker.onPointer({
          isDown: buttons.triggerDown,
          point,
        });
      } else if (
        // Voxel update
        buttons.triggerDown
        || buttons.gripDown
      ) {
        updateVoxels({
          color: { r: 0xFF, g: 0xFF, b: 0xFF },
          point,
          normal,
          remove: buttons.gripDown,
        });
      }
    });

    // Animation for non-vr browsers
    const { animation, vr } = renderer;
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
