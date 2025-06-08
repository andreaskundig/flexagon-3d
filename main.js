import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {blockDefinitionsShort, blockDefinitionsLong,
        WIDTH, THICKNESS,
        calculateBlockDimensions, createMeshes, resizeMesh
       } from './flexagon.js';
import { rotateAroundPoint, exposeObjectToWindow } from './utils.js';
import { quaternions, RotateMesh, makeAnimations, runAnimations } from './animations.js';
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

g.WIDTH = WIDTH;
g.THICKNESS = THICKNESS;

Object.assign(g, quaternions);
g.blockDefinitions = blockDefinitionsShort;

g.calculateBlockDimensions = calculateBlockDimensions;
g.blockDimensions = calculateBlockDimensions(g.blockDefinitions);

const meshes = createMeshes(scene, g.blockDimensions);
g.meshes = meshes;
meshes.forEach(mesh => g[mesh.name] = mesh);

const totalHeight = g.blockDefinitions.reduce(
  (total, box, i) =>
  total + (box.vertical ? box.size : 0) * (i%2 ? THICKNESS : 1),
  0);
const initialXY = [-totalHeight / 2, -totalHeight / 2];

const flexagonGroup = new THREE.Group();
flexagonGroup.position.set(...initialXY, 0);
flexagonGroup.add(meshes[0].parent);
scene.add(flexagonGroup);

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

g.RM = RotateMesh
g.makeAnimations = makeAnimations;
g.animationQueue = [];
g.runAnimations = runAnimations
g.resizeMesh = resizeMesh;

// To run animations:
g.fold = () => makeAnimations(ms).forEach(a => animationQueue.push(a));
g.unfold = () =>  makeAnimations(ms,0).forEach(a => animationQueue.push(a))

function calculateSize(meshes, width=WIDTH, thickness=THICKNESS){
  return meshes.map(m=>m.parent.position).reduce((a,p)=>{
    a[0]+=p.x;
    a[1]+=p.y;
    return a;
  }, [width - thickness/2, -thickness/2]);
}
g.calculateSize = calculateSize;

//one way to get the right size
// [u1,u2,u4].forEach(m=>resizeMesh(m,[0,-1,0]))

function animate() {
  renderer.render( scene, camera );
  // ct3a.parent.quaternion.multiply(q2);
  runAnimations(g.animationQueue);
  // rotateAroundPoint(ct3a.parent,axisPoint, q2inv, scene);
}
renderer.setAnimationLoop( animate );

exposeObjectToWindow(g);
