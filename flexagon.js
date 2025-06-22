import * as THREE from 'three';

export const WIDTH = 3;
export const THICKNESS = 0.5;
const COLORS = ['#00ffff','#ffff00', '#ff00ff', '#00ff00', '#ff0000', '#0000ff'];

export const blockDefinitionsShort = [
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

export const blockDefinitionsLong = [
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

function addFold(blockDefinitions){
  blockDefinitions.forEach((b,i) => b.fold = i % 2 != 0);
}

addFold(blockDefinitionsLong);
addFold(blockDefinitionsShort);

function formatNum(number) {
  const sign = number >= 0 ? ' ' : '-';
  return sign + Math.abs(number).toFixed(2);
}

/*
  size
   __________
  |         |\ depth
  |         | |
  |_________| | breadth
  \__________\|
   length

  orientation
   horizontal                 vertical
   ___________________        _______
  |        |         |\      |      |\
  |        |         | |     |      | |
  |________|_________| |     |______| |
   \________\_________\|     |      |\|
                             |      | |
                             |      | |
                             |______| |
                              \______\|

  offset from axis
             __  parallel
            |
            | perpendicular
   _________|
  |         |\
  |         | |
  |_________| |
   \_________\|

  non fold
  vertical                  horizontal
                             _             _
    |________________|        |___________|
       |          |           |           |
       |          |           |___________|
     __|__________|__        _|           |_
    |                |

  fold
  vertical                  horizontal
     ________________          _         _
    |  |          |  |        |___________|
       |          |           |           |
    |__|__________|__|        |___________|
                              |_         _|
 */
export function axisOffset(size, vertical, fold, top, right, perpToParall=1){
  let perpendicular = vertical ? [size, 0] : [0, size];
  let parallel = [...perpendicular].reverse().map(d => d * perpToParall);
  const north = vertical ? top : right;
  const east = vertical ? right : !top;
  if (east != vertical) { perpendicular = perpendicular.map(d => -d); }
  if (fold == north) { parallel = parallel.map(d => -d); }
  return perpendicular.map((d,i) => d + parallel[i]);
}

export function testAxisOffset(){
  const top    = fold    = right = vertical   = true;
  const bottom = nonfold = left  = horizontal = false;

  // vertical fold
  assertEqual([ 2,-1], axisOffset(2, vertical, fold, top,    right, 0.5));
  assertEqual([-2,-1], axisOffset(2, vertical, fold, top,    left,  0.5));
  assertEqual([-2, 1], axisOffset(2, vertical, fold, bottom, left,  0.5));
  assertEqual([ 2, 1], axisOffset(2, vertical, fold, bottom, right, 0.5));

  // vertical non fold
  assertEqual([ 2, 1], axisOffset(2, vertical, nonfold, top,    right, 0.5));
  assertEqual([-2, 1], axisOffset(2, vertical, nonfold, top,    left,  0.5));
  assertEqual([-2,-1], axisOffset(2, vertical, nonfold, bottom, left,  0.5));
  assertEqual([ 2,-1], axisOffset(2, vertical, nonfold, bottom, right, 0.5));

  // horizontal fold
  assertEqual([-1, 2], axisOffset(2, horizontal, fold, top,    right, 0.5));
  assertEqual([ 1, 2], axisOffset(2, horizontal, fold, top,    left,  0.5));
  assertEqual([ 1,-2], axisOffset(2, horizontal, fold, bottom, left,  0.5));
  assertEqual([-1,-2], axisOffset(2, horizontal, fold, bottom, right, 0.5));

  // horizontal non fold
  assertEqual([ 1, 2], axisOffset(2, horizontal, nonfold, top,    right, 0.5));
  assertEqual([-1, 2], axisOffset(2, horizontal, nonfold, top,    left,  0.5));
  assertEqual([-1,-2], axisOffset(2, horizontal, nonfold, bottom, left,  0.5));
  assertEqual([ 1,-2], axisOffset(2, horizontal, nonfold, bottom, right, 0.5));

}

function assertEqual(arr1, arr2) {
  arr1.forEach((a1,i) => {
    if (a1!=arr2[i]) { throw Error(`${arr1} != ${arr2}`); }
  });
}

function blockSize(length, breadth, depth, vertical, fold){
  const lengthAdjustment = fold ? depth : 1;
  const adjLength = length * lengthAdjustment;
  return vertical ? [breadth, adjLength] : [adjLength, breadth];
}

/*

vertical
block: length 4, breadth 3, depth 0.5, vertical, nonfold, size [3,4]
axis: size 0.25, nonfold, bottom right, offset [0.25,-0.25]
    ___________
    |         | - 3/2 - 0.25 = -1.75
    |    .....|....
    |         |   :
    |_________|___:  4/2 - (-0.25) = 2.25
                  |

vertical
block: length 1, breadth 3, depth 0.5, vertical, fold, size [3,1]
axis: size 0.25, fold, bottom right, offset [0.25, 0.25]
    ___________
    |         | - 3/2 - (-0.25) = -1.75
    |    .....|....
    |         |   :  1/2 - 0.25 =  0.25
    |_________|___|

 */

function meshDimensions(def,breadth, depth, top, right, vertical){
  const msize = blockSize(def.size, breadth, depth, vertical, def.fold);
  const axof = axisOffset(depth/2, vertical, def.fold, top, right);
  const multi = [right ? 1 : -1, top ? 1 : -1];

  // distance to right corner = w/2
  // dist right corner to axis = axisOffset[0]
  // total distance to move towards = w/2 + axisOffset[0]
  // m.pos -= w/2 + axisOffset[0]
  const pos = msize.map((n,i)=> - (n * multi[i] / 2 + axof[i]));
  const [w, h] = msize;
  return { size: { w , h }, pos };
}

function groupDimensions(def, previousDim) {
  if(!previousDim) {// first
    return { pos: [0, 0] };
  } else if( def.vertical != previousDim.vertical) {// first after corner
    return { pos: [0, 0] };
  } else if (def.vertical) {
    return { pos: [0, previousDim.m.pos[1] * 2] };
  } else { // horizontal
    return { pos: [previousDim.m.pos[0] * 2, 0] };
  }
}

function appendNewBlockDims(breadth, depth, def, previousDims) {
  const previousDim = previousDims[previousDims.length-1]
  const top = false;
  const right = def.vertical;
  const bdims = {
    ...def,
    g: groupDimensions(def, previousDim),
    m: meshDimensions(def, breadth, depth, top, right, def.vertical)
  };
  console.log(blockDimensionsToString(bdims));
  return [...previousDims, bdims];
}

function blockDimensionsToString(bdims){
  const {m, g, name} = bdims;
  const sizeString = [m.size.w, m.size.h].join(' ');
  let logm = `${String(name).padEnd(5, ' ')}|s ${sizeString}|`;
  logm += `g${g.pos.map(formatNum).join(' ')}|`;
  logm += `m ${m.pos.map(formatNum).join(' ')}|`;
  return logm;
}

export function calculateBlockDimensions(blockDefinitions, width=WIDTH, thickness=THICKNESS){
  return blockDefinitions.reduce(
    (dims, def) => appendNewBlockDims(width, thickness, def, dims), []);
}

const smallSphereG = new THREE.SphereGeometry( .1);
const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

function posToString(pos) {
  return `[${[pos.x, pos.y, pos.z].map(n => n.toFixed(1)).join(' ')}]`;
}

export function makeTextMaterial(color, text, ratio=1){
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.canvas.width = 100 ;
  ctx.canvas.height = 100 / ratio;
  ctx.fillStyle = ''+color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = 'black';
  ctx.fillText(text, 1, 28);
  const texture = new THREE.CanvasTexture(ctx.canvas);
  return new THREE.MeshPhongMaterial({ map: texture });
}

export const createMeshes = (scene, blocks, thickness=THICKNESS, colors=COLORS) =>
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
      colors[i % 2], name, m.size.w / m.size.h));
    mesh.position.set(...m.pos, 0);
    mesh.name = name;

    mesh.userData.angle = block.angle;
    mesh.userData.vertical = block.vertical;

    parentGroup.add(mesh);

    const previousMesh = meshes[meshes.length - 1];

    scene.add(parentGroup);
    // only works if added after scene.add
    previousMesh?.parent.add(mesh.parent);

    // const sizeString = [m.size.w, m.size.h].map(s => s.toFixed(1)).join(' ');
    // console.log(`${name}\tS[${sizeString}] P${posToString(parentGroup.position)} M${posToString(mesh.position)}`);
    return [...meshes, mesh];
  }, []);

export function resizeMesh(m,xyz){
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
