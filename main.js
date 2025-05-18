import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const g = {}; //globals
const scene = new THREE.Scene();
g.T = THREE;
g.s = scene;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
g.c = camera;

camera.position.set(0,0,25)
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const width = 3;
const depth = 0.75;
const colors = [0x00ffff,0xffff00, 0xff00ff, 0x00ff00, 0xff0000, 0x0000ff];

const blockBenchBoxes = [
  {vertical: true, size: 4, name: "u1"},
  {vertical: true, size: 2, name: "u1_2"},
  {vertical: true, size: 4, name: "u2"},
  {vertical: true, size: 1, name: "u2_3"},
  {vertical: true, size: 2, name: "u3"},
  {vertical: true, size: 1, name: "u3_4"},
  {vertical: true, size: 4, name: "u4"},
  {vertical: true, size: 2, name: "u4_5"},
  {vertical: true, size: 3, name: "u5"},
  {vertical: false, size: 2, name: "u5_6"},
  {vertical: false, size: 3, name: "u6"},
  {vertical: false, size: 1, name: "u6_7"},
  {vertical: false, size: 2, name: "u7"},
  {vertical: false, size: 1, name: "u7_8"},
  {vertical: false, size: 4, name: "u8"},
  {vertical: false, size: 1, name: "u8_9"},
  {vertical: false, size: 2, name: "u9"},
  {vertical: false, size: 1, name: "u9_10"}
];
const totalHeight = blockBenchBoxes.reduce(
  (total, box) => total + (box.vertical ? box.size : 0), 0);
const blocks = blockBenchBoxes
      .reduce((blocks, box, i) => {
        if(i === 0){
          const pos = { x: -totalHeight/2, y:  totalHeight/2 };
          blocks.push({ ...box, size: { w: width, h: box.size }, pos });
          return blocks;
        }
        const previousBlock = blocks[i - 1];
        if (box.vertical) {
          const pos = { x: 0, y:  - previousBlock.size.h };
          blocks.push({ ...box, size: { w: width, h: box.size }, pos });
        }else{
          const pos = { x: previousBlock.size.w, y: 0 };
          blocks.push({ ...box, size: { w: box.size, h: width }, pos });
        }
        return blocks;
},[]);



const smallBoxG = new THREE.BoxGeometry(.5, .5, .5);
const smallCylG = new THREE.CylinderGeometry( .25, .25, .5, 20 );
const smallSphereG = new THREE.SphereGeometry( .25);
const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
g.b = new THREE.Mesh(smallBoxG, redMaterial);
g.b.position.set(0,0,0);
scene.add(g.b);


function posToString(pos) {
  return `[${pos.x} ${pos.y} ${pos.z}]`;
}

const boxMaterials = colors.map(c => new THREE.MeshPhongMaterial({ color: c }));
const displayBlocks = (blocks1) =>
  blocks1.reduce((meshes, block, i) => {
    const { size, pos, name } = block;

    const parentGroup = new THREE.Group();
    parentGroup.position.set(pos.x, pos.y, 0);
    parentGroup.name = 'g' + name;

    const smallRedSphere = new THREE.Mesh(smallSphereG, redMaterial);
    smallRedSphere.position.set(0, 0, 0);
    smallRedSphere.rotation.z = Math.PI / 2;
    smallRedSphere.name = 'a' + name;
    parentGroup.add(smallRedSphere);

    const boxGeometry = new THREE.BoxGeometry(size.w, size.h, depth);
    const mesh = new THREE.Mesh(boxGeometry, boxMaterials[i%2]);
    mesh.position.set(size.w / 2, -size.h / 2, 0);
    mesh.name = name;

    parentGroup.add(mesh);

    const previousMesh = meshes[meshes.length - 1];

    scene.add(parentGroup);
    // only works if added after scene.add
    previousMesh?.parent.add(mesh.parent);
    meshes.push(mesh);

    console.log(`${name}\tS[${size.w} ${size.h}] P${posToString(parentGroup.position)} M${posToString(mesh.position)}`);
    return meshes;
  }, []);

const meshes = displayBlocks(blocks);

g.ms = meshes;
meshes.forEach(mesh => window[mesh.name] = mesh);

// use a quaternion to rotate the second block 45%
const qvert = new THREE.Quaternion();
qvert.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/50);
g.qvert = qvert;
const qhori = new THREE.Quaternion();
qhori.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/50);
g.qhori = qhori;
const q2 = new THREE.Quaternion();
q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/200);
g.q2 = q2;

const c2 = meshes[1];
c2.parent.quaternion.multiply(qvert);

const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const ambColor = 0x888888;
const ambIntensity = 1;
const amblight = new THREE.AmbientLight(ambColor, ambIntensity);
scene.add(amblight);


const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(-1, 2, 0);
controls.update();

function addMeshToGroup0(mesh, group) {
  // add mesh to group
  const diff = new THREE.Vector3();
  diff.sub(group.position)
  scene.add(group);
  group.add(mesh);
  mesh.position.add(diff);
}

function addMeshToGroup(mesh, group) {
  const initialPosition = new THREE.Vector3();
  mesh.getWorldPosition(initialPosition);
  // console.log('initialPosition', initialPosition);
  const localPosition = initialPosition.clone();
  group.worldToLocal(localPosition);
  // console.log('localPosition', localPosition);
  group.add(mesh);
  mesh.position.copy(localPosition);
}

function removeMeshFromGroup(mesh, scene) {
  const newPosition = new THREE.Vector3();
  mesh.getWorldPosition(newPosition);
  // console.log('newPosition', newPosition);
  scene.add(b);
  b.position.copy(newPosition);
}

function rotateAroundPoint(mesh, rotationPoint, quaternion, scene) {
  const previousGroup = mesh.parent;
  const group = new THREE.Group();
  group.position.copy(rotationPoint);
  addMeshToGroup(mesh, group);
  group.quaternion.multiply(quaternion);
  if(previousGroup) {
    addMeshToGroup(mesh, previousGroup);
  }else{
    removeMeshFromGroup(mesh, scene);
  }
  mesh.quaternion.multiply(quaternion);
}
// clone the quaternion
const q2inv = q2.clone();
q2inv.invert();
const axisPoint = new THREE.Vector3(0, 0, 0);
c2.parent.getWorldPosition(axisPoint);

// cuboidT3a.rotation.y = 0.3;
function animate() {
  renderer.render( scene, camera );
  // ct3a.parent.quaternion.multiply(q2);
  // rotateAroundPoint(b, new THREE.Vector3(1,1,1), q2, scene);

  // c2.parent.quaternion.multiply(q2);
  // rotateAroundPoint(ct3a.parent,axisPoint, q2inv, scene);
}
renderer.setAnimationLoop( animate );

function exposeObjectToWindow(obj) {
  Object.keys(obj).forEach(key => {
    window[key] = obj[key];
  });
}
exposeObjectToWindow(g);
