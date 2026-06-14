import { axisOffset, meshDimensions, blockLength } from './flexagon.js';

export function runTests() {
    [testAxisOffset, testMeshDimensions]
        .forEach(testFunc => {
            console.log('run', testFunc.name);
            testFunc();
        });
}

export function testAxisOffset(){
  const top   = true;
  const fold  = true;
  const right = true;
  const vertical = true;
  const bottom = false;
  const nonfold = false;
  const left = false;
  const horizontal = false;

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

export function testMeshDimensions(){
    const breadth = 3;
    const depth = 0.5;
    const vertical = true;
    const bottom = false;
    const right = true;
    const foldYes = true;
    const foldNo = false;

    assertEqual({size: {w: 3, h: 4}, pos: [-1.75, 2.25] },
        meshDimensions({ fold: foldNo, size: 4 },
            breadth, depth, bottom, right, vertical));

    assertEqual({size: {w: 3, h: 1}, pos: [-1.75, 0.25] },
        meshDimensions({ fold: foldYes, size: 2 },
            breadth, depth, bottom, right, vertical));
}

function assertArrayEqual(arr1, arr2) {
    arr1.forEach((a1, i) => {
        assertEqualGeneric(a1, arr2[i]);
    });
}

function assertObjectEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    assertEqualGeneric(keys1, keys2);
    keys1.forEach(k => {
        assertEqualGeneric(obj1[k], obj2[k]);
    });
}

function assertEqualGeneric(a,b) {
        if (typeof a != typeof b) { throw Error(`typeof ${a} != typeof ${b}`); }
        if (typeof a != 'object') {
            if (a != b) { throw Error(`${a} != ${b}`); }
        } else if (Array.isArray(a)) {
            assertArrayEqual(a, b);
        } else {
            assertObjectEqual(a, b);
        }
}
function assertEqual(a,b) {
    try {
        assertEqualGeneric(a,b);
    } catch (err) {
        console.error(' '+JSON.stringify(a), '\n!=\n', JSON.stringify(b));
        console.error(err);
    }
}
