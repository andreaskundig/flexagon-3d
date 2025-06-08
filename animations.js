import * as THREE from 'three';

const quaternionConfigs = [
  ['qv0', [1, 0, 0], 0],
  ['qv90', [1, 0, 0], Math.PI / 2],
  ['qvm90', [1, 0, 0], -Math.PI / 2],
  ['qh0', [0, 1, 0], 0],
  ['qh90', [0, 1, 0], Math.PI / 2],
  ['qhm90', [0, 1, 0], -Math.PI / 2],
];

export const quaternions = quaternionConfigs.reduce((acc, [name, axis, angle]) => {
  const q = new THREE.Quaternion();
  q.setFromAxisAngle(new THREE.Vector3(...axis), angle);
  acc[name] = q;
  return acc;
}, {});

export function determineQuaternion(angle, vertical) {
  if (isNaN(angle)) {
    return null;
  } else if(angle===0) {
    return vertical ? quaternions.qv0: quaternions.qh0;
  } else if(angle > 0){
    return vertical ? quaternions.qv90 : quaternions.qh90;
  }else{
    return vertical ? quaternions.qvm90 : quaternions.qhm90;
  }
}

function formatEpoch(epoch){
  const date = new Date(epoch);
  return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}
export class RotateMesh {
  constructor(mesh, quat, duration=1000, start=Date.now()){
    [this.mesh, this.start, this.duration, this.quat] = [mesh, start, duration, quat];
    this.end = start + duration;
    // console.log('RM',formatEpoch(this.start), formatEpoch(this.end));
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
// defaults are recalculated at every function call
export function makeAnimations(meshes, angleMultiplier=1, animationDuration=2000, animationStart=Date.now()) {
  let start = animationStart;
  return meshes.filter(m => !!m.userData.angle)
    .map(m => {
      const quat = determineQuaternion(m.userData.angle * angleMultiplier,
                                       m.userData.vertical);
      const anim = new RotateMesh(m, quat, animationDuration, start);
      // uncomment to animate one after the other
      // start = anim.end;
      return anim;
    });
}

export function runAnimations(animationQueue){
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
