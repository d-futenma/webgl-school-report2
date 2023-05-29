import * as THREE from 'three';

window.addEventListener('DOMContentLoaded', () => {
  const app = new App3();
}, false);

class App3 {
  static get COLOR_PARAM() {
    return {
      white: 0xffffff,
      black: 0x212121,
    };
  }

  static get CAMERA_PARAM() {
    return {
      fovy: 40,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 50.0,
      x: 0.0,
      y: 3.0,
      z: 20.0,
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }

  static get RENDERER_PARAM() {
    return {
      clearColor: App3.COLOR_PARAM.black,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: App3.COLOR_PARAM.white,
      intensity: 1.0, 
      x: 1.0,
      y: 1.0,
      z: 1.0
    };
  }

  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: App3.COLOR_PARAM.white,
      intensity: 0.2,
    };
  }

  constructor() {
    this.renderer;
    this.scene;
    this.perspectiveCamera;
    this.directionalLight;
    this.ambientLight;
    this.controls;
    this.fan;
    this.headGroup;
    this.wingGroup;

    this.$webgl = document.querySelector('[data-webgl]');
    this.$powerBtn = document.querySelector('[data-power-btn]');
    this.$fanSpeedBtn = [...document.querySelectorAll('[data-fan-speed-btn]')];
    this.$oscillationBtn = document.querySelector('[data-oscillation-btn]');

    this.fanSpeed = 0.15
    this.rotationCount = 0
    this.isPower = false
    this.isOscillation = false
    this.render = this.render.bind(this);

    this.init();
    this.createFan();
    this.render();
    this.gridHelper();
    this.onPowerClicked();
    this.onFanSpeedClicked();
    this.onOscillationClicked();
    this.onResize();
  }

  createFan() {
    this.fan = new THREE.Group();
    this.scene.add(this.fan);
    
    const standGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 32); 
    const standMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.white }); 
    const stand = new THREE.Mesh(standGeometry, standMaterial);
    stand.position.y = 0.05
    this.fan.add(stand);

    const standDecoGeometry = new THREE.PlaneGeometry(0.5, 0.2); 
    const standDecoMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.black }); 
    const standDeco = new THREE.Mesh(standDecoGeometry, standDecoMaterial);
    standDeco.position.y = 0.11
    standDeco.position.z = 0.4
    standDeco.rotation.x = Math.PI / -2;
    this.fan.add(standDeco);

    const strutGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1.6, 32); 
    const strutMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.white }); 
    const strut = new THREE.Mesh(strutGeometry, strutMaterial);
    strut.position.y = 1.6 / 2
    this.fan.add(strut);

    const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3.0, 32); 
    const pipeMaterial = new THREE.MeshStandardMaterial( { color: App3.COLOR_PARAM.white } ); 
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe.position.y = 1.5
    this.fan.add(pipe);

    this.headGroup = new THREE.Group();
    this.fan.add(this.headGroup);

    const motorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 32); 
    const motorMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.white }); 
    const motor = new THREE.Mesh(motorGeometry, motorMaterial);
    motor.position.y = 3
    motor.rotation.set(Math.PI/2,0,0); 
    this.fan.add(motor);
    this.headGroup.add(motor);

    const shaftGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 32); 
    const shaftMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.white }); 
    const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 3
    shaft.position.z = 0.5
    shaft.rotation.set(Math.PI/2,0,0); 
    this.fan.add(shaft);
    this.headGroup.add(shaft);

    const coverBackGeometry = new THREE.SphereGeometry(1.5, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 5 );
    const coverBackMaterial = new THREE.MeshBasicMaterial({ color: App3.COLOR_PARAM.white, opacity: 0.2, transparent: true, wireframe: true }); 
    const coverBack = new THREE.Mesh(coverBackGeometry, coverBackMaterial);
    coverBack.rotation.set(-Math.PI/2, 0, 0); 
    coverBack.position.y = 3
    coverBack.position.z = 1.86
    this.fan.add(coverBack);
    this.headGroup.add(coverBack);

    const rimGeometry = new THREE.TorusGeometry( 0.9, 0.02, 16, 100 ); 
    const rimMaterial = new THREE.MeshBasicMaterial({ color: App3.COLOR_PARAM.black }); 
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.position.y = 3
    rim.position.z = 0.65
    this.fan.add(rim);
    this.headGroup.add(rim);

    this.wingGroup = new THREE.Group();
    this.fan.add(this.wingGroup);

    const WING_COUNT = 4;
    for (let i = 1; i <= WING_COUNT; i++) {
      const angle = Math.PI * (i - 1) / 2.0;
      const wingGeometry = new THREE.RingGeometry(0.2, 0.7, 32, 0, Math.PI * i, 1);
      const wingMaterial = new THREE.MeshBasicMaterial({ color: App3.COLOR_PARAM.white, opacity: 0.8, transparent: true, side: THREE.DoubleSide });
      const wing = new THREE.Mesh(wingGeometry, wingMaterial);
      wing.position.z = 0.65;
      wing.rotation.z = angle;
      this.wingGroup.add(wing);
    }
    this.wingGroup.position.set(0, 3, 0)
    this.headGroup.add(this.wingGroup);

    const capGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32); 
    const capMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.white }); 
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = 3
    cap.position.z = 0.65
    cap.rotation.set(Math.PI/2,0,0); 
    this.fan.add(cap);
    this.headGroup.add(cap);

    const coverFrontGeometry = new THREE.SphereGeometry(1.5, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 5 );
    const coverFrontMaterial = new THREE.MeshBasicMaterial({ color: App3.COLOR_PARAM.white, opacity: 0.2, transparent: true, wireframe: true }); 
    const coverFront = new THREE.Mesh(coverFrontGeometry, coverFrontMaterial);
    coverFront.rotation.set(Math.PI/2, 0, 0); 
    coverFront.position.y = 3
    coverFront.position.z = - 0.55
    this.fan.add(coverFront);
    this.headGroup.add(coverFront);

    const coverFrontDecoGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.01, 32); 
    const coverFrontDecoMaterial = new THREE.MeshStandardMaterial({ color: App3.COLOR_PARAM.black }); 
    const coverFrontDeco = new THREE.Mesh(coverFrontDecoGeometry, coverFrontDecoMaterial);
    coverFrontDeco.position.y = 3
    coverFrontDeco.position.z = 0.95
    coverFrontDeco.rotation.set(Math.PI/2,0,0); 
    this.fan.add(coverFrontDeco);
    this.headGroup.add(coverFrontDeco);

    this.fan.position.set(0, 0, 10)
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(new THREE.Color(App3.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App3.RENDERER_PARAM.width, App3.RENDERER_PARAM.height);
    this.$webgl.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.light();
    this.camera();
  }

  light() {
    this.directionalLight = new THREE.DirectionalLight(
      App3.DIRECTIONAL_LIGHT_PARAM.color,
      App3.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App3.DIRECTIONAL_LIGHT_PARAM.x,
      App3.DIRECTIONAL_LIGHT_PARAM.y,
      App3.DIRECTIONAL_LIGHT_PARAM.z,
    );
    this.scene.add(this.directionalLight);
    this.ambientLight = new THREE.AmbientLight(
      App3.AMBIENT_LIGHT_PARAM.color,
      App3.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);
  }

  camera() {
    this.perspectiveCamera = new THREE.PerspectiveCamera(
      App3.CAMERA_PARAM.fovy,
      App3.CAMERA_PARAM.aspect,
      App3.CAMERA_PARAM.near,
      App3.CAMERA_PARAM.far,
    );
    this.perspectiveCamera.position.set(
      App3.CAMERA_PARAM.x,
      App3.CAMERA_PARAM.y,
      App3.CAMERA_PARAM.z,
    );
    this.perspectiveCamera.lookAt(App3.CAMERA_PARAM.lookAt);
  }

  render() {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.perspectiveCamera);
    if (this.isPower) {
      this.wingGroup.rotation.z -= this.fanSpeed
    } 
    if (this.isOscillation && this.isPower) {
      this.headGroup.rotation.y = Math.sin(++ this.rotationCount / 200)
    }
  }

  gridHelper() {
    this.gridHelper = new THREE.GridHelper(100, 100);
    this.scene.add(this.gridHelper);
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight;
      this.perspectiveCamera.updateProjectionMatrix();
    }, false);
  }

  onPowerClicked() {
    this.$powerBtn.addEventListener('click', () => {
      this.fanSpeed = 0.15
      if (this.isPower) {
        this.isPower = false
        this.isOscillation = false
      } else {
        this.isPower = true
        this.isOscillation = true
      }
    });
  }

  onFanSpeedClicked() {
    this.$fanSpeedBtn.forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.fanSpeed === 'high') {
          this.fanSpeed = 0.4
        } else {
          this.fanSpeed = 0.2
        }
      });
    });
  }

  onOscillationClicked() {
    this.$oscillationBtn.addEventListener('click', () => {
      if (this.isOscillation) {
        this.isOscillation = false
      } else {
        this.isOscillation = true
      }
    });
  }
}