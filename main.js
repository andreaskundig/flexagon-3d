import * as THREE from 'three';
import { createScene } from './scene.js';
import {blockDefinitionsShort, blockDefinitionsLong,
        blockDimensionsToString,
        WIDTH, THICKNESS,
        createMeshGroup,
        createMeshes,
        resizeMesh,
        axisOffset
       } from './flexagon.js';
import { testAxisOffset} from './tests.js';
import { rotateAroundPoint, exposeObjectToWindow } from './utils.js';
import { quaternions, RotateMesh, makeAnimations, runAnimations } from './animations.js';

const { scene, camera, renderer } = createScene(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const g = {THREE, scene, camera}; //globals
g.WIDTH = WIDTH;
g.THICKNESS = THICKNESS;
Object.assign(g, quaternions);
// g.blockDefinitions = blockDefinitionsLong;
g.blockDefinitions = blockDefinitionsShort;
g.blockDimensionsToString = blockDimensionsToString;
g.createMeshGroup = createMeshGroup;
g.runTests = testAxisOffset;
g.axisOffset = axisOffset
// arguments for axisOffset
// g.top=true; top is an inbuilt object
g.bottom=false; g.right=true; g.left=false;
g.foldYes=true; g.foldNo=false; g.vertical=true; g.horizontal=false;

const meshes1 = createMeshes(g.blockDefinitions);
// const meshes1 = createMeshes(g.blockDimensions);
g.meshes1 = meshes1;
meshes1.forEach(mesh => g[mesh.name] = mesh);

const meshes2 = createMeshes(g.blockDefinitions.map(b => ({...b, name: b.name +'b'})));
meshes2.forEach(mesh => g[mesh.name] = mesh);
g.meshes2 = meshes2;
g.qz180 = new THREE.Quaternion();
g.qz180.setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI);
meshes2[0].parent.quaternion.multiply(g.qz180);
meshes1[meshes1.length-1].parent.add(meshes2[0].parent);
const lastDim = meshes1[meshes1.length-1].userData.dims
meshes2[0].parent.position.set(lastDim.m.size.w - THICKNESS,
                               lastDim.m.size.h + THICKNESS);
// meshes2[0].parent.quaternion.multiply(g.qhm90)

const totalHeight = g.blockDefinitions.reduce(
  (total, box, i) =>
  total + (box.vertical ? box.size : 0) * (i%2 ? THICKNESS : 1),
  0);
const initialXY = [-totalHeight / 2, -totalHeight / 2];

const flexagonGroup = new THREE.Group();
flexagonGroup.position.set(...initialXY, 0);
flexagonGroup.add(meshes1[0].parent);


// meshes2[0].parent.position.set(18, 19.5, 0);

scene.add(flexagonGroup);
g.flexagonGroup = flexagonGroup;

g.RM = RotateMesh
g.makeAnimations = makeAnimations;
g.animationQueue = [];
g.runAnimations = runAnimations
g.resizeMesh = resizeMesh;

// To run animations:
g.fold = (ms,am) => makeAnimations(ms,am).forEach(a => animationQueue.push(a));

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
// fold(meshes1)
// fold(meshes2,-1)
runTests();
meshes1.map(m =>   console.log(blockDimensionsToString(m.userData.dims)))
