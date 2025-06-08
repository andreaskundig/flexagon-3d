import * as THREE from 'three';


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

export function rotateAroundPoint(mesh, rotationPoint, quaternion, scene) {
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

export function exposeObjectToWindow(obj) {
  Object.keys(obj).forEach(key => {
    window[key] = obj[key];
  });
}
