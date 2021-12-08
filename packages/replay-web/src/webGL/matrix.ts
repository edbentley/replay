/**
 * Module adapted from glMatrix library.
 *
 * This is a short form for the 3x3 matrix:
 * ```
 * [a, b, 0,
 *  c, d, 0,
 *  tx, ty, 1]
 * ```
 * The last column is ignored so the array is shorter and operations are faster.
 */
// prettier-ignore
export type Matrix2D = [
  a: number, b: number,
  c: number, d: number,
  tx: number, ty: number
];

function getRotateMatrix(rotationRad: number): Matrix2D {
  const s = Math.sin(rotationRad);
  const c = Math.cos(rotationRad);

  // prettier-ignore
  return [
    c, s,
    -s, c,
    0, 0,
  ];
}

function getIdentityMatrix(): Matrix2D {
  // prettier-ignore
  return [
    1, 0,
    0, 1,
    0, 0
  ];
}

function getScaleMatrix(scaleX: number, scaleY: number): Matrix2D {
  // prettier-ignore
  return [
    scaleX, 0,
    0, scaleY,
    0, 0
  ];
}

function getTranslateMatrix(x: number, y: number): Matrix2D {
  // prettier-ignore
  return [
    1, 0,
    0, 1,
    x, y
  ];
}

function multiply(matrixA: Matrix2D, matrixB: Matrix2D): Matrix2D {
  const a0 = matrixA[0],
    a1 = matrixA[1],
    a2 = matrixA[2],
    a3 = matrixA[3],
    a4 = matrixA[4],
    a5 = matrixA[5];
  const b0 = matrixB[0],
    b1 = matrixB[1],
    b2 = matrixB[2],
    b3 = matrixB[3],
    b4 = matrixB[4],
    b5 = matrixB[5];

  // prettier-ignore
  return [
    a0 * b0 + a2 * b1, a1 * b0 + a3 * b1,
    a0 * b2 + a2 * b3, a1 * b2 + a3 * b3,
    a0 * b4 + a2 * b5 + a4, a1 * b4 + a3 * b5 + a5,
  ];
}

function multiplyMultiple(matrices: Matrix2D[]): Matrix2D | null {
  if (matrices.length === 0) return null;
  return matrices
    .slice(1)
    .reduce((prev, curr) => multiply(prev, curr), matrices[0]);
}

function toUniform3fv(matrix: Matrix2D): Float32List {
  const out = new Float32Array(9);
  out[0] = matrix[0];
  out[1] = matrix[1];
  out[2] = 0;
  out[3] = matrix[2];
  out[4] = matrix[3];
  out[5] = 0;
  out[6] = matrix[4];
  out[7] = matrix[5];
  out[8] = 1;
  return out;
}

function getScale(matrix: Matrix2D): [scaleX: number, scaleY: number] {
  const scaleX = Math.hypot(matrix[0], matrix[2]);
  const scaleY = Math.hypot(matrix[1], matrix[3]);
  return [scaleX, scaleY];
}

export const m2d = {
  getIdentityMatrix,
  getRotateMatrix,
  getScaleMatrix,
  getTranslateMatrix,
  multiply,
  multiplyMultiple,
  toUniform3fv,
  getScale,
};
