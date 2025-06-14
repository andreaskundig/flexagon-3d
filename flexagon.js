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
function axisOffset(depth, vertical, fold, top, right){
  let perpendicular = vertical ? [0, depth] : [depth, 0];
  let parallel = [...perpendicular].reverse().map(d => d/2);
  const north = vertical ? top : right;
  const east = vertical ? right : !top;
  if (east != vertical) { perpendicular = perpendicular.map(d => -d); }
  if (fold == north) { parallel = parallel.map(d => -d); }
  return perpendicular.map((d,i) => d + parallel[i]);
}

export function testAxisOffset(){
  // vertical fold
  assertEqual([-1, 2], axisOffset(2, true, true, true,  true));  // top right
  assertEqual([-1,-2], axisOffset(2, true, true, true,  false)); // top left
  assertEqual([ 1,-2], axisOffset(2, true, true, false, false)); // bottom left
  assertEqual([ 1, 2], axisOffset(2, true, true, false, true));  // bottom right
  
  // vertical non fold
  assertEqual([ 1, 2], axisOffset(2, true, false, true,  true));  // top right
  assertEqual([ 1,-2], axisOffset(2, true, false, true,  false)); // top left
  assertEqual([-1,-2], axisOffset(2, true, false, false, false)); // bottom left
  assertEqual([-1, 2], axisOffset(2, true, false, false, true));  // bottom right
   
  // horizontal fold
  assertEqual([ 2,-1], axisOffset(2, false, true, true,  true));  // top right
  assertEqual([ 2, 1], axisOffset(2, false, true, true,  false)); // top left
  assertEqual([-2, 1], axisOffset(2, false, true, false, false)); // bottom left
  assertEqual([-2,-1], axisOffset(2, false, true, false, true));  // bottom right
   
  // horizontal non fold
  assertEqual([ 2, 1], axisOffset(2, false, false, true,  true));  // top right
  assertEqual([ 2,-1], axisOffset(2, false, false, true,  false)); // top left
  assertEqual([-2,-1], axisOffset(2, false, false, false, false)); // bottom left
  assertEqual([-2, 1], axisOffset(2, false, false, false, true));  // bottom right
}

function assertEqual(arr1, arr2) {
  arr1.forEach((a1,i) => {
    if (a1!=arr2[i]) { throw Error(`${arr1} != ${arr2}`); }
  });
}

function blockSize(lengthUnits, breadth, depth, vertical, fold){
  const lengthUnitValue = fold ? 1 : depth;
  const length = lengthUnits * lengthUnitValue;
  return vertical ? [breadth, length] : [length, breadth];
}

function appendNewBlockDims(fold, width, thickness, vertical, box, previousBlock){
  // if it's a fold, axis is on the group, else it's before the group
  const gOffset = fold ? thickness : -thickness;
  const mOffset = - gOffset / 2;
  const mFoldOffset = thickness / 2;
  const sizeAdjustment = fold ? thickness : 1
  const m = {};
  const g = {}

  if (vertical) {
    m.size = { w: width, h: box.size * sizeAdjustment };
    m.pos = [- m.size.w / 2 - mFoldOffset, m.size.h / 2 + mOffset];
    if (previousBlock) {
      g.pos = [0, previousBlock.m.size.h + gOffset];
    } else {
      g.pos = [0, 0];
    }
  } else {
    m.size = { w: box.size * sizeAdjustment, h: width };
    m.pos = [m.size.w / 2 + mOffset, m.size.h / 2 + mFoldOffset];
    if (previousBlock.vertical) { // corner block
      g.pos = [0, 0];
    } else {
      g.pos = [previousBlock.m.size.w + gOffset, 0];
    }
  }
  const top = false;
  const right = vertical;
  const blosi = blockSize(1, width, thickness, vertical, fold);
  const axof = axisOffset(thickness, vertical, fold, top, right);
  console.log(m.pos, axof, blosi.map(d=>d/2));
  return { ...box, m, g }
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
  return blockDefinitions
    .reduce((blocks, box, i) => {
      const previousBlock = i == 0 ? undefined : blocks[i - 1];
      const fold = i % 2 != 0;
      const bdims = appendNewBlockDims(fold, width, thickness, box.vertical, box, previousBlock);
      console.log(blockDimensionsToString(bdims));
      blocks.push(bdims);
      return blocks;
    }, []);
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
    meshes.push(mesh);

    // const sizeString = [m.size.w, m.size.h].map(s => s.toFixed(1)).join(' ');
    // console.log(`${name}\tS[${sizeString}] P${posToString(parentGroup.position)} M${posToString(mesh.position)}`);
    return meshes;
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
