import React, { Component } from 'react';
import {
  Clock,
  FogExp2,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderChunk,
  WebGLRenderer,
} from 'three';

class Renderer extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.camera = new PerspectiveCamera(90, 1, 0.1, 1024);
    this.clock = new Clock();
    this.room = new Object3D();
    this.room.add(this.camera);
    this.scene = new Scene();
    this.scene.add(this.room);
    this.scene.fog = new FogExp2(0, 0.008);
    this.scene.fog.color.setRGB(0, 0, 0.1);
    this.onAnimationTick = this.onAnimationTick.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  componentDidMount() {
    const { canvas: { current: canvas } } = this;
    const renderer = new WebGLRenderer({ alpha: false, antialias: true, canvas });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setClearColor(this.scene.fog.color);
    this.renderer = renderer;
    this.onResize();
    this.setupVR();
    window.addEventListener('resize', this.onResize, false);
    renderer.setAnimationLoop(this.onAnimationTick);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    const { renderer } = this;
    renderer.setAnimationLoop(null);
    renderer.dispose();
    renderer.forceContextLoss();
    window.removeEventListener('resize', this.onResize);
  }

  onAnimationTick() {
    const {
      camera,
      clock,
      renderer,
      scene,
    } = this;
    renderer.animation = {
      delta: clock.getDelta(),
      time: clock.oldTime / 1000,
    };
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

  setupVR() {
    const hasWebXR = 'xr' in navigator;
    const hasWebVR = 'getVRDisplays' in navigator;
    if (hasWebXR) {
      // TODO:
      // Verify that this actually works
      const enterVR = () => {
        if (this.renderer.vr.isPresenting()) return;
        const display = this.renderer.vr.getDevice();
        if (!display) {
          navigator.xr.requestDevice().then((display) => {
            this.renderer.vr.enabled = true;
            this.renderer.vr.setDevice(display);
          });
          return;
        }
        display
          .requestSession({ immersive: true, exclusive: true /* DEPRECATED */ })
          .then((session) => {
            this.renderer.vr.setSession(session, { frameOfReferenceType: 'stage' });
            this.scene.onEnterVR();
          });
      };
      window.addEventListener('mousedown', enterVR, false);
      enterVR();
    } else if (hasWebVR) {
      const enterVR = () => {
        if (this.renderer.vr.isPresenting()) return;
        const display = this.renderer.vr.getDevice();
        if (!display) {
          navigator.getVRDisplays().then((displays) => {
            if (!displays.length) return;
            const [display] = displays;
            this.renderer.vr.enabled = true;
            this.renderer.vr.setDevice(display);
          });
          return;
        }
        display.requestPresent([{ source: this.renderer.domElement }]);
        this.scene.onEnterVR();
      };
      window.addEventListener('mousedown', enterVR, false);
      window.addEventListener('vrdisplayactivate', enterVR, false);
      enterVR();
    }
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
