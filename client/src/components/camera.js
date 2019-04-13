import pointerlock from 'pointer-lock';
import {
  PerspectiveCamera,
  Vector2,
  Vector3,
} from 'three';

class Camera extends PerspectiveCamera {
  constructor({ canvas }) {
    super(70, 1, 0.1, 1024);
    this.canvas = canvas;
    this.rotation.order = 'YXZ';
    this.aux = {
      direction: new Vector3(),
      forward: new Vector3(),
      right: new Vector3(),
      worldUp: new Vector3(0, 1, 0),
    };
    this.input = {
      keyboard: new Vector2(0, 0),
      pointer: new Vector2(0, 0),
    };
    this.onKeyboardDown = this.onKeyboardDown.bind(this);
    this.onKeyboardUp = this.onKeyboardUp.bind(this);
    this.reset();
  }

  get canLock() {
    return this._canLock;
  }

  set canLock(value) {
    if (value && !this.pointerlock && pointerlock.available()) {
      this.pointerlock = pointerlock(this.canvas);
      this.pointerlock.on('attain', this.onPointerLockAttain.bind(this));
    }
    if (!value && this.pointerlock) {
      this.pointerlock.destroy();
      delete this.pointerlock;
    }
    this._canLock = value;
  }

  onKeyboardDown({ keyCode, repeat }) {
    const { input: { keyboard } } = this;
    if (repeat) return;
    switch (keyCode) {
      case 87:
        keyboard.y = 1;
        break;
      case 83:
        keyboard.y = -1;
        break;
      case 65:
        keyboard.x = -1;
        break;
      case 68:
        keyboard.x = 1;
        break;
      default:
        break;
    }
  }

  onKeyboardUp({ keyCode, repeat }) {
    const { input: { keyboard } } = this;
    if (repeat) return;
    switch (keyCode) {
      case 87:
      case 83:
        keyboard.y = 0;
        break;
      case 65:
      case 68:
        keyboard.x = 0;
        break;
      default:
        break;
    }
  }

  onPointerLockAttain(movements) {
    this.isLocked = true;
    this.rotation.z = 0;
    window.addEventListener('keydown', this.onKeyboardDown, false);
    window.addEventListener('keyup', this.onKeyboardUp, false);
    movements.on('data', this.onPointerMovement.bind(this));
    movements.on('close', this.onPointerLockClose.bind(this));
  }

  onPointerLockClose() {
    const { input: { keyboard, pointer } } = this;
    window.removeEventListener('keydown', this.onKeyboardDown);
    window.removeEventListener('keyup', this.onKeyboardUp);
    this.isLocked = false;
    keyboard.set(0, 0);
    pointer.set(0, 0);
  }

  onPointerMovement({ dx, dy }) {
    const { input: { pointer } } = this;
    pointer.set(dx, dy);
  }

  onAnimationTick({ delta }) {
    const {
      isLocked,
      input: { keyboard, pointer },
      rotation,
      position,
    } = this;
    if (!isLocked) {
      return;
    }
    if (pointer.x !== 0 || pointer.y !== 0) {
      const sensitivity = 0.003;
      rotation.y -= pointer.x * sensitivity;
      rotation.x -= pointer.y * sensitivity;
      const PI_2 = Math.PI / 2;
      rotation.x = Math.max(-PI_2, Math.min(PI_2, rotation.x));
      pointer.set(0, 0);
    }
    if (keyboard.x !== 0 || keyboard.y !== 0) {
      const {
        direction,
        forward,
        right,
        worldUp,
      } = this.aux;
      this.getWorldDirection(forward);
      right.crossVectors(forward, worldUp);
      direction
        .set(0, 0, 0)
        .addScaledVector(right, keyboard.x)
        .addScaledVector(forward, keyboard.y)
        .normalize();
      position.addScaledVector(direction, 6 * delta);
      this.updateMatrixWorld();
    }
  }

  reset() {
    const { position, rotation } = this;
    position.set(0, 1.25, 0);
    rotation.set(0, 0, 0);
    this.lookAt(0, 1.25, -1);
    this.canLock = false;
  }
}

export default Camera;
