import * as THREE from 'three';

export const WIDTH = 3;
export const THICKNESS = 0.5;
const COLORS = ['#00ffff','#ffff00', '#ff00ff', '#00ff00', '#ff0000', '#0000ff'];
const CP = {N: 'n', E: 'e', S: 's', W: 'w'}; // cardinal points
const CP_ORDER = [CP.N, CP.E, CP.S, CP.W];

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

function addAttachDirection(blockDefinitions){
    blockDefinitions.forEach((currentBlock, i) => {
        const previousBlock = blockDefinitions[i-1];
        if (!previousBlock){
            return;
        } 
        if (!previousBlock.attach) {
            currentBlock.attach = CP_ORDER[0];
        } else if (currentBlock.vertical == previousBlock.vertical) {
            console.log('no change')
            currentBlock.attach = previousBlock.attach;
        } else { // Change of direction
            console.log('change')
            // Assumes next has been set on the previous Block
            const previousIndex = CP_ORDER.indexOf(previousBlock.attach);
            // Assumes there's no direction change after the last Direction.
            currentBlock.attach = CP_ORDER[previousIndex + 1];
        }
    });
}

function addFold(blockDefinitions){
    blockDefinitions.forEach((b, i) => b.fold = i % 2 != 0);
}

function addComputedParams(blockDefinitions){
    addFold(blockDefinitions);
    addAttachDirection(blockDefinitions);
}

addComputedParams(blockDefinitionsLong);
addComputedParams(blockDefinitionsShort);

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


export function blockLength(length, breadth, depth, vertical, fold){
  let adjustedLength = length;
  if (fold) { adjustedLength *= depth  }
  return vertical ? [breadth, adjustedLength] : [adjustedLength, breadth];
}

/*

Returns {size: {w, h}, pos: [x, y]
size is the dimension of the block
pos is it's position relative to the axis (origin of the group)

vertical
block: length 4, breadth 3, depth 0.5, vertical, nonfold, size [3,4]
axis: size 0.25, nonfold, bottom right, offset [0.25,-0.25]
pos: [-1.75, 2.25] distance of center from parent (?)
    ___________
    |         |  3/2 + 0.25 = 1.75
    |    .....|....
    |         |   :
    |_________|___:  4/2 - (-0.25) = 2.25
                  |

vertical
block: length 2, breadth 3, depth 0.5, vertical, fold, size [3,1]
axis: size 0.25, fold, bottom right, offset [0.25, 0.25]
    ___________
    |         |  3/2 + 0.25 = 1.75
    |    .....|....
    |         |   :  1/2 - 0.25 =  0.25
    |_________|___|

 */
export function meshDimensions(def, breadth, depth, top, right, vertical){
  const msize = blockLength(def.size, breadth, depth, vertical, def.fold);
  const axof = axisOffset(depth/2, vertical, def.fold, top, right);
  const multi = [right ? -1 : 1, top ? -1 : 1];

  // distance to right corner = w/2
  // dist right corner to axis = axisOffset[0]
  // total distance to move towards = w/2 + axisOffset[0]
  // m.pos -= w/2 + axisOffset[0]
  const pos = [
     msize[0] / 2 - axof[0] * multi[0],
     msize[1] * multi[1] / 2 - axof[1]
  ];
  const [w, h] = msize;
  return { size: { w , h }, pos };
}

// TODO calculate g.pos for top/right/bottom/left, on the current Dim, not previous
// in order to have calculation for m and g in the same place
export function groupPosition(vertical, after, previousMeshPos) {
  if(!previousMeshPos || !after) {
    return [0, 0];
  }
  return vertical ? [0, previousMeshPos[1] * 2] : [previousMeshPos[0] * 2, 0] ;
}

function createBlockDims(breadth, depth, def, previousDims) {
  const top = false;
  const right = def.vertical;

  const previousMeshPos = previousDims?.m.pos;
  const bdims = {
    def,
    g: { pos: groupPosition(def.vertical, true, previousMeshPos) },
    m: meshDimensions(def, breadth, depth, top, right, def.vertical),
    color: COLORS[def.fold ? 1 : 0]
  };
  return bdims;
}

export const createAllDims = (blockDefinitions, width = WIDTH, thickness = THICKNESS) =>
  blockDefinitions.reduce((dims, def, i) =>
    [...dims, createBlockDims(width, thickness, def, dims[i-1] )], []);

export function blockDimensionsToString(bdims){
  const { m, g, def: { name, attach } } = bdims;
  const sizeString = [m.size.w, m.size.h].join(' ');
  let logm = `${String(name).padEnd(5, ' ')}|s ${sizeString}|`;
  logm += `g${g.pos.map(formatNum).join(' ')}|`;
  logm += `m ${m.pos.map(formatNum).join(' ')}|`;
  logm += attach;
  return logm;
}

function formatNum(number) {
  const sign = number >= 0 ? ' ' : '-';
  return sign + Math.abs(number).toFixed(2);
}

const smallSphereG = new THREE.SphereGeometry( .1);
const redMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
const greenMaterial =  new THREE.MeshPhongMaterial({ color: 0x00ff00 });
export function makeSmallGreenSphere () {
  return new THREE.Mesh(smallSphereG, greenMaterial);
}
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
  smallRedSphere.name = 'a' + name;
  parentGroup.add(smallRedSphere);
  return parentGroup;
}

function createBoxMesh(blockDims, thickness){
  const { m, def: { name }, color } = blockDims;
  const boxGeometry = new THREE.BoxGeometry(m.size.w, m.size.h, thickness);
  const mesh = new THREE.Mesh(boxGeometry, makeTextMaterial(
    color, name, m.size.w / m.size.h));
  mesh.position.set(...m.pos, 0);
  mesh.name = name;
  mesh.userData.dims = blockDims
  return mesh;
}

export function createMeshGroup(dims, thickness = THICKNESS) {
        const parentGroup = createParentGroup(dims);
        const mesh = createBoxMesh(dims, thickness);
        parentGroup.add(mesh);
        return mesh;
}

export function createMeshes(blockDefinitions, width = WIDTH, thickness = THICKNESS) {
    const allDims = createAllDims(blockDefinitions, width, thickness);
    const meshes = allDims.map(dims => createMeshGroup(dims, thickness));
    meshes.forEach((m,i) => {
        if(i>0){ meshes[i-1].parent.add(m.parent); }
    });
    return meshes;
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
