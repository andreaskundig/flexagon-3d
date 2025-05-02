import * as THREE from 'three';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const width = 3;
const depth = 0.75;
const colors = [0x00ffff,0xffff00, 0xff00ff, 0x00ff00, 0xff0000, 0x0000ff];
const blocks = [
  {name: 't3a', size: {w: width, h:4}, pos:{x:0, y:0}},
  {name: '2', size: {w: width, h:2}, pos:{x:0, y:-4}}
]

const meshes = blocks.reduce((meshes, block, i) => {
// const meshes = blocks.map((block, i) => {
  const {size, pos, name} = block;

  const parentGroup = new THREE.Group();
  parentGroup.position.set(pos.x, pos.y, 0);
  parentGroup.name = 'g' + name;

  const geometry = new THREE.BoxGeometry(size.w, size.h, depth);
  const material = new THREE.MeshPhongMaterial({ color: colors[i % blocks.length] });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-size.w/2, -size.h/2, 0);
  mesh.name = 'c' + name;

  parentGroup.add(mesh);

  const previousMesh = meshes[meshes.length - 1];

  scene.add(parentGroup);
  // only works if added after scene.add
  previousMesh?.parent.add(mesh.parent);
  meshes.push(mesh);
  return meshes;
}, []);

window.ms = meshes;
meshes.forEach(mesh => window[mesh.name] = mesh);

// use a quaternion to rotate the second block 45%
const q = new THREE.Quaternion();
q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/50);
window.q = q;
const q2 = new THREE.Quaternion();
q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/200);
window.q2 = q2;

const c2 = meshes[1];
c2.parent.quaternion.multiply(q);

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const ambColor = 0x888888;
const ambIntensity = 1;
const amblight = new THREE.AmbientLight(ambColor, ambIntensity);
scene.add(amblight);

camera.position.z = 15;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-1, 2, 0);
controls.update();

// cuboidT3a.rotation.y = 0.3;
function animate() {
  renderer.render( scene, camera );
  c2.parent.quaternion.multiply(q2);
  ct3a.parent.quaternion.multiply(q2);
}
renderer.setAnimationLoop( animate );
