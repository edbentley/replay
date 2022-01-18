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

// prettier-ignore
const identityMatrix: Matrix2D = [
  1, 0,
  0, 1,
  0, 0,
];

// prettier-ignore
const identityMatrix3fv = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1
]);
function getNewIdentity3fv() {
  return new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
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

/**
 * Applies all of the common Sprite props matrices in one go.
 *
 * Equivalent to:
 *
 * m2d.multiplyMultiple([
 *    matrix,
 *    m2d.getTranslateMatrix(x, y),
 *    m2d.getRotateMatrix(rotation),
 *    m2d.getScaleMatrix(scaleX, scaleY,
 *    m2d.getTranslateMatrix(anchorX, anchorY),
 *    m2d.getScaleMatrix(initScaleX, initScaleY,
 * ])
 */
function transform(
  matrix: Matrix2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  rotationRad: number,
  anchorX: number,
  anchorY: number,
  initScaleX: number,
  initScaleY: number
): Matrix2D {
  const thetaC = Math.cos(rotationRad);
  const thetaS = Math.sin(rotationRad);

  const a0 = matrix[0],
    a1 = matrix[1],
    a2 = matrix[2],
    a3 = matrix[3],
    a4 = matrix[4],
    a5 = matrix[5];
  const b0 = initScaleX * thetaC * scaleX,
    b1 = initScaleX * thetaS * scaleX,
    b2 = initScaleY * -thetaS * scaleY,
    b3 = initScaleY * thetaC * scaleY,
    b4 = thetaC * scaleX * anchorX - thetaS * scaleY * anchorY + x,
    b5 = thetaS * scaleX * anchorX + thetaC * scaleY * anchorY + y;

  // prettier-ignore
  return [
    a0 * b0 + a2 * b1, a1 * b0 + a3 * b1,
    a0 * b2 + a2 * b3, a1 * b2 + a3 * b3,
    a0 * b4 + a2 * b5 + a4, a1 * b4 + a3 * b5 + a5,
  ];
}

function transformMut(
  matrix: Matrix2D,
  x: number,
  y: number,
  scaleX: number,
  scaleY: number,
  rotationRad: number,
  anchorX: number,
  anchorY: number,
  initScaleX: number,
  initScaleY: number,
  mutOutput: Matrix2D
) {
  const thetaC = Math.cos(rotationRad);
  const thetaS = Math.sin(rotationRad);

  const a0 = matrix[0],
    a1 = matrix[1],
    a2 = matrix[2],
    a3 = matrix[3],
    a4 = matrix[4],
    a5 = matrix[5];
  const b0 = initScaleX * thetaC * scaleX,
    b1 = initScaleX * thetaS * scaleX,
    b2 = initScaleY * -thetaS * scaleY,
    b3 = initScaleY * thetaC * scaleY,
    b4 = thetaC * scaleX * anchorX - thetaS * scaleY * anchorY + x,
    b5 = thetaS * scaleX * anchorX + thetaC * scaleY * anchorY + y;

  mutOutput[0] = a0 * b0 + a2 * b1;
  mutOutput[1] = a1 * b0 + a3 * b1;
  mutOutput[2] = a0 * b2 + a2 * b3;
  mutOutput[3] = a1 * b2 + a3 * b3;
  mutOutput[4] = a0 * b4 + a2 * b5 + a4;
  mutOutput[5] = a1 * b4 + a3 * b5 + a5;
}

/**
 * Optimise the number of matrices GC'd
 */
function scaleToUniform3fvMut(
  matrix: Matrix2D,
  scaleX: number,
  scaleY: number,
  mutOutput: Float32Array
) {
  const a0 = matrix[0],
    a1 = matrix[1],
    a2 = matrix[2],
    a3 = matrix[3],
    a4 = matrix[4],
    a5 = matrix[5];

  mutOutput[0] = a0 * scaleX;
  mutOutput[1] = a1 * scaleX;
  mutOutput[2] = 0;
  mutOutput[3] = a2 * scaleY;
  mutOutput[4] = a3 * scaleY;
  mutOutput[5] = 0;
  mutOutput[6] = a4;
  mutOutput[7] = a5;
  mutOutput[8] = 1;
}

function toUniform3fv(matrix: Matrix2D): Float32Array {
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

export const m2d = {
  identityMatrix,
  identityMatrix3fv,
  getNewIdentity3fv,
  getRotateMatrix,
  getScaleMatrix,
  getTranslateMatrix,
  transform,
  multiply,
  multiplyMultiple,
  toUniform3fv,
};

function toUniform3fvMut(matrix: Matrix2D, out: Float32Array) {
  out[0] = matrix[0];
  out[1] = matrix[1];
  out[2] = 0;
  out[3] = matrix[2];
  out[4] = matrix[3];
  out[5] = 0;
  out[6] = matrix[4];
  out[7] = matrix[5];
  out[8] = 1;
}

const multiplyResult: Matrix2D = [0, 0, 0, 0, 0, 0];
function multiplyPooled(matrixA: Matrix2D, matrixB: Matrix2D): Matrix2D {
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

  multiplyResult[0] = a0 * b0 + a2 * b1;
  multiplyResult[1] = a1 * b0 + a3 * b1;
  multiplyResult[2] = a0 * b2 + a2 * b3;
  multiplyResult[3] = a1 * b2 + a3 * b3;
  multiplyResult[4] = a0 * b4 + a2 * b5 + a4;
  multiplyResult[5] = a1 * b4 + a3 * b5 + a5;
  return multiplyResult;
}

const translateResult: Matrix2D = [1, 0, 0, 1, 0, 0];
function getTranslateMatrixPooled(x: number, y: number): Matrix2D {
  translateResult[4] = x;
  translateResult[5] = y;
  return translateResult;
}

const scaleResult: Matrix2D = [0, 0, 0, 0, 0, 0];
function getScaleMatrixPooled(scaleX: number, scaleY: number): Matrix2D {
  scaleResult[0] = scaleX;
  scaleResult[3] = scaleY;
  return scaleResult;
}

const rotateResult: Matrix2D = [0, 0, 0, 0, 0, 0];
function getRotateMatrixPooled(rotationRad: number): Matrix2D {
  const s = Math.sin(rotationRad);
  const c = Math.cos(rotationRad);

  rotateResult[0] = c;
  rotateResult[1] = s;
  rotateResult[2] = -s;
  rotateResult[4] = c;

  return rotateResult;
}

const calcScaleResult = { scaleX: 0, scaleY: 0 };
function getScalePooled(matrix: Matrix2D) {
  calcScaleResult.scaleX = Math.hypot(matrix[0], matrix[2]);
  calcScaleResult.scaleY = Math.hypot(matrix[1], matrix[3]);
  return calcScaleResult;
}

export const m2dMut = {
  transformMut,
  toUniform3fvMut,
  scaleToUniform3fvMut,
  multiplyPooled,
  getTranslateMatrixPooled,
  getScaleMatrixPooled,
  getRotateMatrixPooled,
  getScalePooled,
  invertPooled,
};

const invertResult: Matrix2D = [0, 0, 0, 0, 0, 0];
function invertPooled(matrix: Matrix2D) {
  const aa = matrix[0],
    ab = matrix[1],
    ac = matrix[2],
    ad = matrix[3];
  const atx = matrix[4],
    aty = matrix[5];

  let det = aa * ad - ab * ac;
  if (!det) {
    return null;
  }
  det = 1.0 / det;

  invertResult[0] = ad * det;
  invertResult[1] = -ab * det;
  invertResult[2] = -ac * det;
  invertResult[3] = aa * det;
  invertResult[4] = (ac * aty - ad * atx) * det;
  invertResult[5] = (ab * atx - aa * aty) * det;

  return invertResult;
}
