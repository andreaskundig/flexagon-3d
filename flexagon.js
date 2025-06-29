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
  blockDefinitions.forEach((b,i) => {
    b.fold = i % 2 != 0;
    b.color = COLORS[b.fold ? 1 : 0];
  });
}

addFold(blockDefinitionsLong);
addFold(blockDefinitionsShort);

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
  const pos = msize.map((n,i) => - (n * multi[i] / 2 + axof[i]));
  const [w, h] = msize;
  return { size: { w , h }, pos };
}
// TODO add options for blocks to the left and below
// TODO calculate g.pos for top/right/bottom/left, on the current Dim, not previous
// in order to have calcuation for m and g in the same place
function groupDimensions(def, previousDims) {
  if(!previousDims) {// first
    return { pos: [0, 0] };
  } else if( def.vertical != previousDims.def.vertical) {// first after corner
    return { pos: [0, 0] };
  } else if (def.vertical) {
    return { pos: [0, previousDims.m.pos[1] * 2] };
  } else { // horizontal
    return { pos: [previousDims.m.pos[0] * 2, 0] };
  }
}

function blockDimensionsToString(bdims){
  const { m, g, def: { name } } = bdims;
  const sizeString = [m.size.w, m.size.h].join(' ');
  let logm = `${String(name).padEnd(5, ' ')}|s ${sizeString}|`;
  logm += `g${g.pos.map(formatNum).join(' ')}|`;
  logm += `m ${m.pos.map(formatNum).join(' ')}|`;
  return logm;
}

function formatNum(number) {
  const sign = number >= 0 ? ' ' : '-';
  return sign + Math.abs(number).toFixed(2);
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

function createParentGroup(block) {
  const { g, def: { name } } = block;
  const parentGroup = new THREE.Group();
  parentGroup.position.set(...g.pos, 0);
  parentGroup.name = 'g' + name;
  const smallRedSphere = new THREE.Mesh(smallSphereG, redMaterial);
  smallRedSphere.position.set(0, 0, 0);
  smallRedSphere.rotation.z = Math.PI / 2;
  smallRedSphere.name = 'a' + name;
  parentGroup.add(smallRedSphere);
  return parentGroup;
}

function createBoxMesh(blockDims, thickness){
  const { m, def: { name, color } } = blockDims;
  const boxGeometry = new THREE.BoxGeometry(m.size.w, m.size.h, thickness);
  const mesh = new THREE.Mesh(boxGeometry, makeTextMaterial(
    color, name, m.size.w / m.size.h));
  mesh.position.set(...m.pos, 0);
  mesh.name = name;
  mesh.userData.dims = blockDims
  return mesh;
}

function createBlockDims(breadth, depth, def, previousDims) {
  const top = false;
  const right = def.vertical;
  const bdims = {
    def,
    g: groupDimensions(def, previousDims),
    m: meshDimensions(def, breadth, depth, top, right, def.vertical)
  };
  console.log(blockDimensionsToString(bdims));
  return bdims;
}

function addBlockGroup(blockDims, previousMesh, thickness=THICKNESS){
  const parentGroup = createParentGroup(blockDims);
  const mesh = createBoxMesh(blockDims, thickness);
  parentGroup.add(mesh);
  previousMesh?.parent.add(mesh.parent);
  return mesh;
}

export function createMeshes(blockDefinitions, width = WIDTH, thickness = THICKNESS) {
  return blockDefinitions.reduce((meshes, def, i) => {
    const previousMesh = meshes[i - 1];
    const previousDims = previousMesh?.userData.dims
    const dims = createBlockDims(width, thickness, def, previousDims);
    return [...meshes, addBlockGroup(dims, previousMesh, thickness)];
  }, []);
}

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
