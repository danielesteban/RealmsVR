import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Vector3 } from 'three';
import {
  fetch,
  reset,
  updateFog,
  updateVoxels,
} from '@/actions/realm';
import Metadata from '@/components/realm/metadata';
import Picker from '@/components/realm/picker';
import Voxels from '@/components/realm/voxels';
import Renderer from '@/components/renderer';

class Realm extends PureComponent {
  componentDidMount() {
    const {
      fog,
      history,
      match: { params: { slug } },
      renderer: { current: renderer },
      fetch,
      updateFog,
    } = this.props;
    // Setup scene
    const scene = renderer.resetScene();
    this.picker = new Picker({
      anisotropy: renderer.getMaxAnisotropy(),
      fog,
      history,
      updateFog,
    });
    renderer.hands.children[1].add(this.picker);
    this.voxels = new Voxels({
      instanced: !!renderer.renderer.extensions.get('ANGLE_instanced_arrays'),
    });
    scene.add(this.voxels);
    this.head = new Vector3();
    this.intersects = [this.picker];
    this.renderer = renderer;
    this.scene = scene;
    scene.onBeforeRender = this.onBeforeRender.bind(this);
    // Fetch realm
    fetch(slug);
  }

  componentDidUpdate({
    geometry: previousGeometry,
    fog: previousFog,
    size: previousSize,
  }) {
    const { geometry, fog, size } = this.props;
    const { picker, renderer, voxels } = this;
    const {
      isScreenshot,
      raycaster,
      room,
      renderer: { vr },
    } = renderer;
    if (fog !== previousFog) {
      // Update fog
      renderer.setFog(fog);
    }
    if (size !== previousSize) {
      // Resize voxels
      room.position.set(
        size * 0.5 + 0.5,
        size * 0.5,
        size * 0.5 + 0.5
      );
      voxels.resize(size);
      this.intersects = [
        picker,
        ...voxels.intersects,
      ];
    }
    if (geometry !== previousGeometry) {
      // Update voxels
      voxels.update(geometry);
      if (!previousGeometry.index && vr.enabled) {
        // Pull the player down to the nearest voxel
        raycaster.ray.origin.copy(room.position);
        raycaster.ray.direction.set(0, -1, 0);
        const hit = raycaster.intersectObjects(voxels.intersects)[0];
        if (hit) {
          room.position.y = hit.point.y;
        }
      }
      if (isScreenshot) {
        setImmediate(() => {
          window.__SCREENSHOT_READY__ = true;
        });
      }
    }
  }

  componentWillUnmount() {
    const { picker, renderer, scene } = this;
    const { reset } = this.props;
    renderer.hands.children[1].remove(picker);
    picker.dispose();
    delete scene.onBeforeRender;
    reset();
  }

  onBeforeRender(renderer, scene, camera) {
    const {
      head,
      intersects,
      picker,
      props: {
        size,
        updateVoxels,
      },
      renderer: {
        hands,
        isScreenshot,
        raycaster,
        room,
      },
      voxels,
    } = this;

    voxels.updateFrustum(camera);

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
      // Color picker
      if (object === picker) {
        if (buttons.triggerDown) {
          picker.onPointer(point);
        }
        return;
      }
      // Translocation
      if (
        buttons.padDown
        && normal.x === 0
        && normal.y === 1
        && normal.z === 0
      ) {
        head.setFromMatrixPosition(camera.matrixWorld);
        const offset = {
          x: head.x - room.position.x,
          y: 0,
          z: head.z - room.position.z,
        };
        const [x, y, z] = ['x', 'y', 'z'].map((axis) => {
          let position = point[axis] - offset[axis];
          while (position < 0) position += size;
          while (position >= size) position -= size;
          return position;
        });
        room.position.set(x, y, z);
      }
      // Voxel update
      if (
        buttons.triggerDown
        || buttons.gripDown
      ) {
        updateVoxels({
          color: picker.colors.fg,
          point,
          normal,
          remove: buttons.gripDown,
        });
      }
    });

    // Animation for non-vr browsers
    const { animation, vr } = renderer;
    if (!isScreenshot && !vr.enabled && !camera.isLocked && size) {
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

  render() {
    const { isCreator } = this.props;
    return isCreator ? (
      <Metadata />
    ) : null;
  }
}

Realm.propTypes = {
  geometry: PropTypes.shape({
    index: PropTypes.instanceOf(Uint32Array),
    position: PropTypes.instanceOf(Float32Array),
    color: PropTypes.instanceOf(Float32Array),
    normal: PropTypes.instanceOf(Float32Array),
    uv: PropTypes.instanceOf(Float32Array),
  }).isRequired,
  fog: PropTypes.number.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  history: PropTypes.object.isRequired,
  isCreator: PropTypes.bool.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  size: PropTypes.number.isRequired,
  renderer: PropTypes.shape({
    current: PropTypes.instanceOf(Renderer),
  }).isRequired,
  fetch: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  updateFog: PropTypes.func.isRequired,
  updateVoxels: PropTypes.func.isRequired,
};

export default connect(
  ({
    realm: {
      geometry,
      fog,
      isCreator,
      size,
    },
  }) => ({
    geometry,
    fog,
    isCreator,
    size,
  }),
  {
    fetch,
    reset,
    updateFog,
    updateVoxels,
  }
)(Realm);
