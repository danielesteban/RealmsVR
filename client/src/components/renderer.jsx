import React, { Component } from 'react';
import Stats from 'stats.js';
import {
  Clock,
  FogExp2,
  Object3D,
  Raycaster,
  Scene,
  ShaderChunk,
  WebGLRenderer,
} from 'three';
import Camera from './camera';
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
    this.isScreenshot = window.__SCREENSHOT__;
    this.camera = new Camera({ canvas });
    this.clock = new Clock();
    this.fog = new FogExp2(0, 0.0125);
    this.raycaster = new Raycaster();
    const renderer = new WebGLRenderer({
      antialias: true,
      canvas,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setAnimationLoop(this.onAnimationTick);
    window.addEventListener('resize', this.onResize, false);
    this.renderer = renderer;
    this.room = new Object3D();
    this.room.add(this.camera);
    this.hands = new Hands();
    this.room.add(this.hands);
    this.resetScene();
    this.onResize();
    this.setupVR();
    if (!__PRODUCTION__ && !this.isScreenshot) {
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    }
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
      stats,
    } = this;
    if (stats) stats.begin();
    renderer.animation = {
      delta: clock.getDelta(),
      time: clock.oldTime / 1000,
    };
    camera.onAnimationTick(renderer.animation);
    hands.update();
    renderer.render(scene, camera);
    if (stats) stats.end();
  }

  onResize() {
    const {
      canvas: { current: canvas },
      camera,
      renderer,
    } = this;
    const { width, height } = canvas.parentNode.getBoundingClientRect();
    this.width = width;
    this.height = height;
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

  setFog(color) {
    const { fog, renderer } = this;
    fog.color.setHex(color);
    renderer.setClearColor(fog.color);
  }

  setupVR() {
    const { hands, renderer } = this;
    // const hasWebXR = 'xr' in navigator;
    const hasWebVR = 'getVRDisplays' in navigator;
    // if (hasWebXR) {
    //   // TODO:
    //   // Verify that this actually works
    //   const enterVR = () => {
    //     if (renderer.vr.isPresenting()) return;
    //     const display = renderer.vr.getDevice();
    //     if (!display) {
    //       navigator.xr.requestDevice().then((display) => {
    //         renderer.vr.enabled = true;
    //         renderer.vr.setDevice(display);
    //       });
    //       return;
    //     }
    //     display
    //       .requestSession({ immersive: true, exclusive: true /* DEPRECATED */ })
    //       .then((session) => {
    //         renderer.vr.setSession(session, { frameOfReferenceType: 'stage' });
    //       });
    //   };
    //   window.addEventListener('mousedown', enterVR, false);
    //   enterVR();
    // } else if (hasWebVR) {
    if (hasWebVR) {
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

  resetScene() {
    if (this.scene) {
      this.scene.children.forEach((child) => {
        if (child.dispose) child.dispose();
      });
    }
    this.room.position.set(0, 0, 0);
    this.camera.reset();
    this.setFog(0x020214);
    this.scene = new Scene();
    this.scene.add(this.room);
    this.scene.fog = this.fog;
    return this.scene;
  }

  render() {
    const { canvas } = this;
    return (
      <canvas ref={canvas} />
    );
  }
}

// Tweak ThreeJS Fog
ShaderChunk.fog_vertex = ShaderChunk.fog_vertex.replace(
  'fogDepth = -mvPosition.z;',
  'fogDepth = length(mvPosition);'
);

export default Renderer;
