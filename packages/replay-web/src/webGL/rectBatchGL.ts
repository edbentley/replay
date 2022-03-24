import { Matrix2D } from "@replay/core/dist/matrix";
import { applyTransformPooled } from "@replay/core/dist/transform";
import { RectangleArrayTexture } from "@replay/core/dist/t";
import { createProgram, hexToRGBPooled, RenderState } from "./glUtils";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec4 a_matrix_abcd;
attribute vec2 a_matrix_txty;
attribute vec4 a_colour;

varying vec4 v_colour;

void main() {
  mat3 matrix = mat3(
    a_matrix_abcd.x, a_matrix_abcd.y, 0,
    a_matrix_abcd.z, a_matrix_abcd.w, 0,
    a_matrix_txty.x, a_matrix_txty.y, 1
  );
  gl_Position = vec4(matrix * vec3(a_position, 1.0), 1.0);
  v_colour = a_colour;
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec4 v_colour;

void main() {
  gl_FragColor = v_colour;
}
`;

export function getDrawRectBatch(
  gl: WebGLRenderingContext,
  glInstArrays: ANGLE_instanced_arrays,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aColourLocation = gl.getAttribLocation(program, "a_colour");

  // -- Position Buffer

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aPositionLocation);
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

  // Put a unit quad in the buffer translated to be centered
  // prettier-ignore
  const positions = [
    -0.5, -0.5,
    -0.5, 0.5,
    0.5, -0.5,
    0.5, -0.5,
    -0.5, 0.5,
    0.5, 0.5,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // -- Matrix Buffer

  const matrixBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);

  gl.enableVertexAttribArray(aMatrixABCDLocation);
  gl.vertexAttribPointer(aMatrixABCDLocation, 4, gl.FLOAT, false, 24, 0); // 6 * 4
  glInstArrays.vertexAttribDivisorANGLE(aMatrixABCDLocation, 1);

  gl.enableVertexAttribArray(aMatrixTXTYLocation);
  gl.vertexAttribPointer(
    aMatrixTXTYLocation,
    2,
    gl.FLOAT,
    false,
    24, // 6 * 4
    16 // 4 * 4
  );
  glInstArrays.vertexAttribDivisorANGLE(aMatrixTXTYLocation, 1);

  // -- Colours Buffer

  const coloursBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);

  gl.enableVertexAttribArray(aColourLocation);
  gl.vertexAttribPointer(aColourLocation, 4, gl.FLOAT, false, 0, 0);
  glInstArrays.vertexAttribDivisorANGLE(aColourLocation, 1);

  // -- Done
  glVao.bindVertexArrayOES(null);

  return function drawRectBatch(
    matrix: Matrix2D,
    mutTextureState: WebRectArrayTextureState,
    opacity: number,
    elements: RectangleArrayTexture["props"]
  ) {
    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);
    }

    setMatricesColoursData(mutTextureState, matrix, opacity, elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mutTextureState.matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mutTextureState.colours, gl.DYNAMIC_DRAW);

    glInstArrays.drawArraysInstancedANGLE(
      gl.TRIANGLES,
      0, // offset
      6, // num vertices per instance
      elements.length // num instances
    );
  };
}

function setMatricesColoursData(
  mutTextureState: WebRectArrayTextureState,
  matrix: Matrix2D,
  parentOpacity: number,
  elements: RectangleArrayTexture["props"]
) {
  const floatsPerMatrix = 6;
  const floatsPerColour = 4;

  // floats per mat3
  const matricesLength = elements.length * floatsPerMatrix;
  if (mutTextureState.matrices.length !== matricesLength) {
    mutTextureState.matrices = new Float32Array(matricesLength);
  }
  const matrices = mutTextureState.matrices;

  // floats for colour vec4
  const coloursLength = elements.length * floatsPerColour;
  if (mutTextureState.colours.length !== coloursLength) {
    mutTextureState.colours = new Float32Array(coloursLength);
  }
  const colours = mutTextureState.colours;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const newMatrix = applyTransformPooled(
      matrix,
      element,
      // This converts vertices in shader (which is -0.5 / 0.5 points) to the
      // size of the rect
      element.width,
      element.height
    );

    const n = i * floatsPerMatrix;
    matrices[n] = newMatrix[0];
    matrices[n + 1] = newMatrix[1];
    matrices[n + 2] = newMatrix[2];
    matrices[n + 3] = newMatrix[3];
    matrices[n + 4] = newMatrix[4];
    matrices[n + 5] = newMatrix[5];

    // TODO: more efficient hiding
    const opacity = element.show ? parentOpacity * element.opacity : 0;

    const { r, g, b } = hexToRGBPooled(element.color, opacity);

    const n2 = i * floatsPerColour;

    colours[n2] = r;
    colours[n2 + 1] = g;
    colours[n2 + 2] = b;
    colours[n2 + 3] = opacity;
  }
}

export type WebRectArrayTextureState = {
  matrices: Float32Array;
  colours: Float32Array;
};
