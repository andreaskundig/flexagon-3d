import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

function createScene(width, height) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 0, 25);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-1, 2, 0);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0x888888, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3);
  directionalLight.position.set(-1, 2, 4);
  scene.add(directionalLight);

  return { scene, camera, renderer, controls };
}

export { createScene };
