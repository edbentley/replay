import { RectangleArrayTexture } from "@replay/core/dist/t";
import { applyTransform, createProgram, hexToRGB } from "./glUtils";
import { Matrix2D } from "./matrix";

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
  glVao: OES_vertex_array_object
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
    opacity: number,
    elements: RectangleArrayTexture["props"],
    prevProgram: WebGLProgram | null
  ): WebGLProgram {
    if (program !== prevProgram) {
      gl.useProgram(program);
      glVao.bindVertexArrayOES(vao);
    }

    const { matrices, colours } = getMatricesColoursData(
      matrix,
      opacity,
      elements
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.DYNAMIC_DRAW);

    glInstArrays.drawArraysInstancedANGLE(
      gl.TRIANGLES,
      0, // offset
      6, // num vertices per instance
      elements.length // num instances
    );

    return program;
  };
}

function getMatricesColoursData(
  matrix: Matrix2D,
  parentOpacity: number,
  elements: RectangleArrayTexture["props"]
) {
  const floatsPerMatrix = 6;
  const floatsPerColour = 4;

  // floats per mat3
  const matrices = new Float32Array(elements.length * floatsPerMatrix);

  // floats for colour vec4
  const colours = new Float32Array(elements.length * floatsPerColour);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const newMatrix = applyTransform(
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

    const opacity = parentOpacity * element.opacity;

    const [r, g, b] = hexToRGB(element.color, opacity);

    const n2 = i * floatsPerColour;

    colours[n2] = r;
    colours[n2 + 1] = g;
    colours[n2 + 2] = b;
    colours[n2 + 3] = opacity;
  }

  return { matrices, colours };
}
