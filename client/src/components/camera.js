import {
  PerspectiveCamera,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor(fov, aspect, near, far) {
    super(fov, aspect, near, far);
    this.reset();
    // TODO:
    // PointerLock camera for debugging
    // and non-vr browsers
  }

  reset() {
    const { position, rotation } = this;
    position.set(0, 1.25, 0);
    rotation.set(0, 0, 0);
    this.lookAt(0, 1.25, -1);
  }

  // onPointerLock() {

  // }

  // onPointerMove() {

  // }
}

export default Camera;
