import { axisOffset } from './flexagon.js';

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
