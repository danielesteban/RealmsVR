import React, { Component } from 'react';
import {
  Clock,
  FogExp2,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  Scene,
  ShaderChunk,
  WebGLRenderer,
} from 'three';
import Hands from './hands';

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.onAnimationTick = this.onAnimationTick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    const { canvas: { current: canvas } } = this;
    this.camera = new PerspectiveCamera(90, 1, 0.1, 1024);
    this.clock = new Clock();
    this.raycaster = new Raycaster();
    this.raycaster.far = 32;
    this.room = new Object3D();
    this.room.add(this.camera);
    this.hands = new Hands();
    this.room.add(this.hands);
    this.resetCamera();
    this.resetScene();
    const renderer = new WebGLRenderer({
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(this.scene.fog.color);
    renderer.setAnimationLoop(this.onAnimationTick);
    window.addEventListener('resize', this.onResize, false);
    this.renderer = renderer;
    this.onResize();
    this.setupVR();
  }

  shouldComponentUpdate() {
    return false;
  }

  onAnimationTick() {
    const {
      camera,
      clock,
      hands,
      renderer,
      scene,
    } = this;
    renderer.animation = {
      delta: clock.getDelta(),
      time: clock.oldTime / 1000,
    };
    hands.update();
    renderer.render(scene, camera);
  }

  onResize() {
    const {
      canvas: { current: canvas },
      camera,
      renderer,
    } = this;
    const { width, height } = canvas.parentNode.getBoundingClientRect();
    if (!renderer.vr.isPresenting()) {
      renderer.setSize(width, height);
    }
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  getMaxAnisotropy() {
    const { renderer } = this;
    return renderer.capabilities.getMaxAnisotropy();
  }

  setupVR() {
    const { hands, renderer } = this;
    const hasWebXR = 'xr' in navigator;
    const hasWebVR = 'getVRDisplays' in navigator;
    if (hasWebXR) {
      // TODO:
      // Verify that this actually works
      const enterVR = () => {
        if (renderer.vr.isPresenting()) return;
        const display = renderer.vr.getDevice();
        if (!display) {
          navigator.xr.requestDevice().then((display) => {
            renderer.vr.enabled = true;
            renderer.vr.setDevice(display);
          });
          return;
        }
        display
          .requestSession({ immersive: true, exclusive: true /* DEPRECATED */ })
          .then((session) => {
            renderer.vr.setSession(session, { frameOfReferenceType: 'stage' });
          });
      };
      window.addEventListener('mousedown', enterVR, false);
      enterVR();
    } else if (hasWebVR) {
      const enterVR = () => {
        if (renderer.vr.isPresenting()) return;
        const display = renderer.vr.getDevice();
        if (!display) {
          navigator.getVRDisplays().then((displays) => {
            if (!displays.length) return;
            const [display] = displays;
            renderer.vr.enabled = true;
            renderer.vr.setDevice(display);
          });
          return;
        }
        display.requestPresent([{ source: renderer.domElement }]);
      };
      window.addEventListener('mousedown', enterVR, false);
      window.addEventListener('vrdisplayactivate', enterVR, false);
      enterVR();
    }
    hands.standingMatrix = renderer.vr.getStandingMatrix();
  }

  resetCamera() {
    const { camera } = this;
    camera.position.set(0, 1.6, 0);
    camera.rotation.set(0, 0, 0);
  }

  resetScene() {
    this.room.position.set(0, 0, 0);
    this.scene = new Scene();
    this.scene.add(this.room);
    this.scene.fog = new FogExp2(0, 0.015);
    this.scene.fog.color.setRGB(0, 0, 0.1);
    return this.scene;
  }

  render() {
    const { canvas } = this;
    return (
      <canvas ref={canvas} />
    );
  }
}

// Fix threeJS Fog
ShaderChunk.fog_pars_vertex = ShaderChunk.fog_pars_vertex.replace(
  'varying float fogDepth;',
  'varying vec4 fogDepth;'
);
ShaderChunk.fog_vertex = ShaderChunk.fog_vertex.replace(
  'fogDepth = -mvPosition.z;',
  'fogDepth = mvPosition;'
);
ShaderChunk.fog_pars_fragment = ShaderChunk.fog_pars_fragment.replace(
  'varying float fogDepth;',
  'varying vec4 fogDepth;'
);
ShaderChunk.fog_fragment = ShaderChunk.fog_fragment.replace(
  'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );',
  [
    'float fogDist = length(fogDepth);',
    'float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDist * fogDist * LOG2 ) );',
  ].join('\n')
).replace(
  'float fogFactor = smoothstep( fogNear, fogFar, fogDepth );',
  'float fogFactor = smoothstep( fogNear, fogFar, length(fogDepth) );'
);

export default Renderer;
