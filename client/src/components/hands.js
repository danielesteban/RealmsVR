import {
  BoxGeometry,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from 'three';

class Hands extends Object3D {
  constructor() {
    if (
      !Hands.mesh
      || !Hands.pointerMesh
    ) Hands.setup();

    super();
    const { mesh, pointerMesh } = Hands;
    for (let i = 0; i < 2; i += 1) {
      const hand = mesh.clone();
      hand.buttons = {
        menu: false,
        menuDown: false,
        menuUp: false,
        grip: false,
        gripDown: false,
        gripUp: false,
        pad: false,
        padDown: false,
        padUp: false,
        trigger: false,
        triggerDown: false,
        triggerUp: false,
      };
      hand.pointer = pointerMesh.clone();
      hand.pointer.visible = false;
      hand.add(hand.pointer);
      hand.matrixAutoUpdate = false;
      hand.setupRaycaster = raycaster => Hands.setupRaycaster({ hand, raycaster });
      hand.visible = false;
      this.add(hand);
    }
  }

  update() {
    const { children } = this;
    const gamepads = ('getGamepads' in navigator ? navigator.getGamepads() : []);
    children.forEach((hand) => {
      hand.visible = false;
    });
    let hand = 0;
    for (let i = 0; i < gamepads.length; i += 1) {
      const gamepad = gamepads[i];
      if (
        gamepad
        && (
          gamepad.id === 'OpenVR Gamepad'
          || gamepad.id.startsWith('Oculus Touch')
          || gamepad.id.startsWith('Spatial Controller')
        )
      ) {
        if (gamepad.pose) {
          this.updateHand({
            hand: children[hand],
            buttons: gamepad.buttons,
            pose: gamepad.pose,
          });
        }
        hand += 1;
        if (hand > 1) break;
      }
    }
  }

  updateHand({
    hand,
    buttons,
    pose,
  }) {
    const { standingMatrix } = this;
    if (pose.position !== null) {
      hand.position.fromArray(pose.position);
    }
    if (pose.orientation !== null) {
      hand.quaternion.fromArray(pose.orientation);
    }
    hand.matrix.compose(hand.position, hand.quaternion, hand.scale);
    hand.matrix.premultiply(standingMatrix);
    hand.matrixWorldNeedsUpdate = true;
    hand.visible = true;

    const menu = buttons[3] && buttons[3].pressed;
    hand.buttons.menuDown = menu && hand.buttons.menu !== menu;
    hand.buttons.menuUp = !menu && hand.buttons.menu !== menu;
    hand.buttons.menu = menu;
    const grip = buttons[2] && buttons[2].pressed;
    hand.buttons.gripDown = grip && hand.buttons.grip !== grip;
    hand.buttons.gripUp = !grip && hand.buttons.grip !== grip;
    hand.buttons.grip = grip;
    const pad = buttons[0] && buttons[0].pressed;
    hand.buttons.padDown = pad && hand.buttons.pad !== pad;
    hand.buttons.padUp = !pad && hand.buttons.pad !== pad;
    hand.buttons.pad = pad;
    const trigger = buttons[1] && buttons[1].pressed;
    hand.buttons.triggerDown = trigger && hand.buttons.trigger !== trigger;
    hand.buttons.triggerUp = !trigger && hand.buttons.trigger !== trigger;
    hand.buttons.trigger = trigger;
  }

  static setupRaycaster({ hand, raycaster }) {
    if (!hand.auxMatrix) {
      hand.auxMatrix = new Matrix4();
    }
    const { auxMatrix, matrixWorld } = hand;
    auxMatrix.identity().extractRotation(matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(auxMatrix);
    raycaster.ray.origin.addScaledVector(raycaster.ray.direction, -0.175);
  }

  static setup() {
    if (!Hands.geometry) {
      const geometry = new BoxGeometry(1, 1, 1);
      geometry.scale(0.05, 0.03, 0.2);
      geometry.translate(0, 0, 0.075);
      geometry.faces.forEach((face, i) => {
        face.color.set(0x777777);
        if (i >= 10 && i <= 11) {
          face.color.offsetHSL(0, 0, -0.1);
        }
      });
      Hands.geometry = (new BufferGeometry()).fromGeometry(geometry);
    }
    if (!Hands.material) {
      Hands.material = new MeshBasicMaterial({
        color: 0xffe0bd,
      });
    }
    if (!Hands.mesh) {
      Hands.mesh = new Mesh(
        Hands.geometry,
        Hands.material
      );
    }
    if (!Hands.pointerGeometry) {
      Hands.pointerGeometry = (new BufferGeometry())
        .setFromPoints([new Vector3(0, 0, 0), new Vector3(0, 0, -1)]);
    }
    if (!Hands.pointerMaterial) {
      Hands.pointerMaterial = new LineBasicMaterial({
        color: 0xffe0bd,
      });
    }
    if (!Hands.pointerMesh) {
      Hands.pointerMesh = new Line(
        Hands.pointerGeometry,
        Hands.pointerMaterial
      );
    }
  }
}

export default Hands;
