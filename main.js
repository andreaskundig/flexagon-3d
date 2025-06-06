import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const g = {}; //globals
const scene = new THREE.Scene();
g.THREE = THREE;
g.scene = scene;
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
g.camera = camera;

camera.position.set(0,0,25)
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const width = 3;
const thickness = 0.5;
g.d = thickness;
const colors = [0x00ffff,0xffff00, 0xff00ff, 0x00ff00, 0xff0000, 0x0000ff];
const colorStrings = ['#00ffff','#ffff00', '#ff00ff', '#00ff00', '#ff0000', '#0000ff'];

const blockBenchBoxes1 = [
  {vertical: true,  size: 4, angle:   0, name: "u1"},
  {vertical: true,  size: 2, angle:  90, name: "u1_2"},
  {vertical: true,  size: 4, angle: -90, name: "u2"},
  {vertical: true,  size: 4, angle: -90, name: "u3"},
  {vertical: true,  size: 4, angle: -90, name: "u4"},
  {vertical: true,  size: 2, angle: -90, name: "u4_5"},
  {vertical: true,  size: 3, angle: -90, name: "u5"},
  {vertical: false, size: 2, angle: -90, name: "u5_6"},
  {vertical: false, size: 3, angle: -90, name: "u6"},
  {vertical: false, size: 4, angle: -90, name: "u7"},
  {vertical: false, size: 4, angle: -90, name: "u8"},
  {vertical: false, size: 4, angle: -90, name: "u9"}
];

const blockBenchBoxes0 = [
  {vertical: true,  size: 4, angle:   0, name: "u1"},
  {vertical: true,  size: 2, angle:  90, name: "u1_2"},
  {vertical: true,  size: 4, angle: -90, name: "u2"},
  {vertical: true,  size: 1, angle: -90, name: "u2_3"},
  {vertical: true,  size: 2, angle:   0, name: "u3"},
  {vertical: true,  size: 1, angle: -90, name: "u3_4"},
  {vertical: true,  size: 4, angle:   0, name: "u4"},
  {vertical: true,  size: 2, angle: -90, name: "u4_5"},
  {vertical: true,  size: 3, angle: -90, name: "u5"},
  {vertical: false, size: 2, angle: -90, name: "u5_6"},
  {vertical: false, size: 3, angle: -90, name: "u6"},
  {vertical: false, size: 1, angle: -90, name: "u6_7"},
  {vertical: false, size: 2, angle:   0, name: "u7"},
  {vertical: false, size: 1, angle: -90, name: "u7_8"},
  {vertical: false, size: 4, angle:   0, name: "u8"},
  {vertical: false, size: 1, angle: -90, name: "u8_9"},
  {vertical: false, size: 2, angle:   0, name: "u9"},
  {vertical: false, size: 1, angle:   0, name: "u9_10"}
];

const blockBenchBoxes = blockBenchBoxes1;
g.boxes = blockBenchBoxes;
const totalHeight = blockBenchBoxes.reduce(
  (total, box, i) =>
  total + (box.vertical ? box.size : 0) * (i%2 ? thickness : 1),
  0);
const initialXY = [-totalHeight / 2, -totalHeight / 2];
function createBlocks(blockBenchBoxes, initialXY){
  return blockBenchBoxes
    .reduce((blocks, box, i) => {
      const previousBlock = i == 0 ? undefined : blocks[i - 1];
      const fold = i % 2 != 0;
      const gOffset = fold ? thickness : -thickness;
      const mOffset = - gOffset / 2;
      const sizeAdjustment = fold ? thickness : 1
      const m = {};
      const g = {}

      if (box.vertical) {
        m.size = { w: width, h: box.size * sizeAdjustment };
        m.pos = [m.size.w / 2, m.size.h / 2 + mOffset];
        if (!previousBlock) { //first block
          // g.pos = [-totalHeight / 2, -totalHeight / 2 + gOffset];
          g.pos = initialXY;
        } else {
          g.pos = [0, previousBlock.m.size.h + gOffset];
        }
      } else {
        m.size = { w: box.size * sizeAdjustment, h: width };
        m.pos = [m.size.w / 2 + mOffset, -m.size.h / 2];
        if (previousBlock.vertical) { // corner block
          g.pos = [
            previousBlock.m.size.w + gOffset / 2,
            previousBlock.m.size.h + gOffset / 2];
        } else {
          g.pos = [previousBlock.m.size.w + gOffset, 0];
        }
      }
      blocks.push({ ...box, m, g });
      return blocks;
    }, []);
}
g.create = createBlocks;
g.bs = createBlocks(blockBenchBoxes, initialXY);

const smallSphereG = new THREE.SphereGeometry( .1);
const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

function posToString(pos) {
  return `[${[pos.x, pos.y, pos.z].map(n => n.toFixed(1)).join(' ')}]`;
}

const qv90 = new THREE.Quaternion();
qv90.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2);
g.qv90 = qv90;
const qvm90 = new THREE.Quaternion();
qvm90.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/2);
g.qvm90 = qvm90;
const qh90 = new THREE.Quaternion();
qh90.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI/2);
g.qh90 = qh90;
const qhm90 = new THREE.Quaternion();
qhm90.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2);
g.qhm90 = qhm90;

function determineQuaternion(angle, vertical) {
  if (!angle) {
    return null;
  } else if(vertical){
    return angle > 0 ? qv90 : qvm90;
  }else{
    return angle > 0 ? qh90 : qhm90;
  }
}

function makeTextMaterial(color, text, ratio=1){
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 100 ;
  ctx.canvas.height = 100 / ratio;
  ctx.fillStyle = ''+color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText(text, 1, 35);
  const texture = new THREE.CanvasTexture(ctx.canvas);
  return new THREE.MeshPhongMaterial({ map: texture });
}

const displayBlocks = (blocks) =>
  blocks.reduce((meshes, block, i) => {
    const { m, g, name } = block;

    const parentGroup = new THREE.Group();
    parentGroup.position.set(...g.pos, 0);
    parentGroup.name = 'g' + name;

    const smallRedSphere = new THREE.Mesh(smallSphereG, redMaterial);
    smallRedSphere.position.set(0, 0, 0);
    smallRedSphere.rotation.z = Math.PI / 2;
    smallRedSphere.name = 'a' + name;
    parentGroup.add(smallRedSphere);

    const boxGeometry = new THREE.BoxGeometry(m.size.w, m.size.h, thickness);
    const mesh = new THREE.Mesh(boxGeometry, makeTextMaterial(
      colorStrings[i % 2], name, m.size.w / m.size.h));
    mesh.position.set(...m.pos, 0);
    mesh.name = name;

    mesh.userData.angle = block.angle;
    mesh.userData.vertical = block.vertical;

    parentGroup.add(mesh);

    const previousMesh = meshes[meshes.length - 1];

    scene.add(parentGroup);
    // only works if added after scene.add
    previousMesh?.parent.add(mesh.parent);
    meshes.push(mesh);

    const sizeString = [m.size.w, m.size.h].map(s => s.toFixed(1)).join(' ');
    console.log(`${name}\tS[${sizeString}] P${posToString(parentGroup.position)} M${posToString(mesh.position)}`);
    return meshes;
  }, []);

const meshes = displayBlocks(g.bs);

g.ms = meshes;
meshes.forEach(mesh => window[mesh.name] = mesh);

// use a quaternion to rotate the second block 45%
const q2 = new THREE.Quaternion();
q2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI/200);
g.q2 = q2;

const c2 = meshes[1];
// c2.parent.quaternion.multiply(qvert);

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

function exposeObjectToWindow(obj) {
  Object.keys(obj).forEach(key => {
    window[key] = obj[key];
  });
}
function formatEpoch(epoch){
  const date = new Date(epoch);
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}
class RotateMesh {
  constructor(mesh, start, duration, quat){
    [this.mesh, this.start, this.duration, this.quat] = [mesh, start, duration, quat];
    this.end = start + duration;
    console.log('RM',formatEpoch(this.start), formatEpoch(this.end));
  }
  active(now){ return this.start < now && now < this.end; }
  done(now) { return this._done; }
  animate(now){
    if (this.active(now)) {
      const lastTime = this.lastTime || this.start;
      const runningTime = lastTime - this.start;
      const fractionToInterpolate = (now - lastTime) / (this.duration - runningTime);
      this.mesh.parent.quaternion.slerp(this.quat, fractionToInterpolate);
      this.lastTime = now;
    } else if (this.end < now && !this._done){
      this.mesh.parent.quaternion.slerp(this.quat, 1);
      this._done = true;
    }
  }
}
g.RM = RotateMesh
// defaults are recalculated at every function call
function makeAnimations(meshes, animationDuration=2000, animationStart=Date.now()) {
  let start = animationStart;
  return meshes.filter(m => !!m.userData.angle)
    .map(m => {
      const quat = determineQuaternion(m.userData.angle, m.userData.vertical);
      const anim = new RotateMesh(m, start, animationDuration, quat);
      // uncomment to animate one after the other
      // start = anim.end;
      return anim;
    });
}
g.makeAnimations = makeAnimations;
g.animationQueue = [];
// g.animations = makeAnimations(meshes, animDuration, animationStart);
function runAnimations(animationQueue){
  const now = Date.now();
  let i = animationQueue.length;
  while(i--){
    const animation = animationQueue[i];
    animation.animate(now);
    if(animation.done(now)){
      animationQueue.splice(i,1);
    }
  }
}
g.runAnimations = runAnimations

// TODO calculate width and height
// TODO grow some blocks
// ms[9].parent.position.x += 1
// ms[8].position.x += 0.5
// ms[8].geometry.scale(4/3,1,1)
function resizeMesh(m,xyz){
  const [x,y,z] = xyz;
  const diffs = {x:x, y:y, z:z};
  const subgroup = m.parent.children.find(c=>c.type==='Group');
  ['x','y','z'].forEach(dim =>{
    if (subgroup) {
      subgroup.position[dim] += diffs[dim];
    }
    m.position[dim] += diffs[dim] / 2;
  });
  m.geometry.computeBoundingBox();
  const {min, max} = m.geometry.boundingBox;
  const scaleFactors = ['x','y','z'].map(dim => 1 + diffs[dim]/(max[dim]-min[dim]));
  console.log(scaleFactors);
  m.geometry.scale(...scaleFactors);
}
g.resizeMesh = resizeMesh;

// To run animations:
// makeAnimations(ms).forEach(a => animationQueue.push(a))
function animate() {
  renderer.render( scene, camera );
  // ct3a.parent.quaternion.multiply(q2);
  // rotateAroundPoint(b, new THREE.Vector3(1,1,1), q2, scene);
  runAnimations(g.animationQueue);
  // rotateAroundPoint(ct3a.parent,axisPoint, q2inv, scene);
}
renderer.setAnimationLoop( animate );

exposeObjectToWindow(g);
