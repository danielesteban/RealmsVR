import fullscreen from 'fullscreen';
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
      up: new Vector3(),
      worldUp: new Vector3(0, 1, 0),
    };
    this.input = {
      keyboard: new Vector3(0, 0, 0),
      pointer: new Vector2(0, 0),
    };
    this.fullscreen = fullscreen(canvas);
    this.onBlur = this.onBlur.bind(this);
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

  onBlur() {
    const { input: { keyboard } } = this;
    keyboard.set(0, 0, 0);
  }

  onKeyboardDown({ keyCode, repeat }) {
    const { input: { keyboard } } = this;
    if (repeat) return;
    switch (keyCode) {
      case 65:
        keyboard.x = -1;
        break;
      case 68:
        keyboard.x = 1;
        break;
      case 16:
        keyboard.y = -1;
        break;
      case 32:
        keyboard.y = 1;
        break;
      case 83:
        keyboard.z = -1;
        break;
      case 87:
        keyboard.z = 1;
        break;
      default:
        break;
    }
  }

  onKeyboardUp({ keyCode, repeat }) {
    const { input: { keyboard } } = this;
    if (repeat) return;
    switch (keyCode) {
      case 65:
        if (keyboard.x < 0) keyboard.x = 0;
        break;
      case 68:
        if (keyboard.x > 0) keyboard.x = 0;
        break;
      case 16:
        if (keyboard.y < 0) keyboard.y = 0;
        break;
      case 32:
        if (keyboard.y > 0) keyboard.y = 0;
        break;
      case 83:
        if (keyboard.z < 0) keyboard.z = 0;
        break;
      case 87:
        if (keyboard.z > 0) keyboard.z = 0;
        break;
      default:
        break;
    }
  }

  onPointerLockAttain(movements) {
    const { fullscreen } = this;
    this.isLocked = true;
    this.rotation.z = 0;
    window.addEventListener('blur', this.onBlur, false);
    window.addEventListener('keydown', this.onKeyboardDown, false);
    window.addEventListener('keyup', this.onKeyboardUp, false);
    movements.on('data', this.onPointerMovement.bind(this));
    movements.on('close', this.onPointerLockClose.bind(this));
    fullscreen.request();
  }

  onPointerLockClose() {
    const {
      fullscreen,
      input: { keyboard, pointer },
    } = this;
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('keydown', this.onKeyboardDown);
    window.removeEventListener('keyup', this.onKeyboardUp);
    this.isLocked = false;
    fullscreen.release();
    keyboard.set(0, 0, 0);
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
    if (keyboard.x !== 0 || keyboard.y !== 0 || keyboard.z !== 0) {
      const {
        direction,
        forward,
        right,
        up,
        worldUp,
      } = this.aux;
      this.getWorldDirection(forward);
      right.crossVectors(forward, worldUp).normalize();
      up.crossVectors(right, forward).normalize();
      direction
        .set(0, 0, 0)
        .addScaledVector(right, keyboard.x)
        .addScaledVector(up, keyboard.y)
        .addScaledVector(forward, keyboard.z)
        .normalize();
      position.addScaledVector(direction, 6 * delta);
      this.updateMatrixWorld();
    }
  }

  reset() {
    const { position, rotation } = this;
    position.set(0, 1.5, 0.5);
    rotation.set(0, 0, 0);
    this.lookAt(0, 1.5, 0.5);
    this.canLock = false;
  }
}

export default Camera;
