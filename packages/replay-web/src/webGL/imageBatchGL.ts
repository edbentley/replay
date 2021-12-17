import { ImageArrayTexture } from "@replay/core/dist/t";
import { applyTransform, createProgram } from "./glUtils";
import { m2d, Matrix2D } from "./matrix";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_matrix_abcd;
attribute vec2 a_matrix_txty;
attribute float a_opacity;

varying vec2 v_texcoord;
varying float v_opacity;

const mat3 flipY = mat3(
  1.0, 0.0, 0.0,
  0.0, -1.0, 0.0,
  0.0, 1.0, 1.0
);

void main() {
  mat3 matrix = mat3(
    a_matrix_abcd.x, a_matrix_abcd.y, 0,
    a_matrix_abcd.z, a_matrix_abcd.w, 0,
    a_matrix_txty.x, a_matrix_txty.y, 1
  );
  gl_Position = vec4(matrix * vec3(a_position, 1.0), 1.0);
  v_texcoord = (flipY * vec3(a_texcoord, 1.0)).xy;
  v_opacity = a_opacity;
}`;
const fragmentShaderSource = `
precision mediump float;

varying vec2 v_texcoord;
varying float v_opacity;

uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord) * v_opacity;
}
`;

export function getDrawImageBatch(
  gl: WebGLRenderingContext,
  glInstArrays: ANGLE_instanced_arrays
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aTexcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aOpacityLocation = gl.getAttribLocation(program, "a_opacity");

  // Buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

  // Create a buffer for texture coords
  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  // Put texcoords in the buffer
  // prettier-ignore
  const texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  const matrixBuffer = gl.createBuffer();
  const opacitiesBuffer = gl.createBuffer();

  return function drawImageBatch(
    texture: WebGLTexture,
    matrix: Matrix2D,
    opacity: number,
    elements: ImageArrayTexture["props"],
    prevProgram: WebGLProgram | null,
    prevTexture: WebGLTexture | null
  ): { program: WebGLProgram; texture: WebGLTexture } {
    if (texture !== prevTexture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
    }

    if (program !== prevProgram) {
      gl.useProgram(program);

      // Setup the attributes to pull data from our buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPositionLocation);
      gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.enableVertexAttribArray(aTexcoordLocation);
      gl.vertexAttribPointer(aTexcoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.enableVertexAttribArray(aMatrixABCDLocation);
      gl.vertexAttribPointer(aMatrixABCDLocation, 4, gl.FLOAT, false, 24, 0); // 6 * 4

      gl.enableVertexAttribArray(aMatrixTXTYLocation);
      gl.vertexAttribPointer(
        aMatrixTXTYLocation,
        2,
        gl.FLOAT,
        false,
        24, // 6 * 4
        16 // 4 * 4
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, opacitiesBuffer);
      gl.enableVertexAttribArray(aOpacityLocation);
      gl.vertexAttribPointer(aOpacityLocation, 1, gl.FLOAT, false, 0, 0);
    }

    const { matrices, opacities } = getMatricesOpacityData(
      elements,
      matrix,
      opacity
    );

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, opacitiesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, opacities, gl.DYNAMIC_DRAW);

    glInstArrays.vertexAttribDivisorANGLE(aMatrixABCDLocation, 1);
    glInstArrays.vertexAttribDivisorANGLE(aMatrixTXTYLocation, 1);
    glInstArrays.vertexAttribDivisorANGLE(aOpacityLocation, 1);

    glInstArrays.drawArraysInstancedANGLE(
      gl.TRIANGLES,
      0, // offset
      6, // num vertices per instance
      elements.length // num instances
    );

    // Reset state (can even affect programs not using extension)
    glInstArrays.vertexAttribDivisorANGLE(aMatrixABCDLocation, 0);
    glInstArrays.vertexAttribDivisorANGLE(aMatrixTXTYLocation, 0);
    glInstArrays.vertexAttribDivisorANGLE(aOpacityLocation, 0);

    return { program, texture };
  };
}

function getMatricesOpacityData(
  elements: ImageArrayTexture["props"],
  matrix: Matrix2D,
  opacity: number
) {
  // floats per mat3
  const floatsPerMatrix = 6;

  const matrices = new Float32Array(elements.length * floatsPerMatrix);

  // 1 float for opacity
  const opacities = new Float32Array(elements.length);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const newMatrix = m2d.multiply(
      applyTransform(matrix, element),
      // This converts vertices in shader (which is -0.5 / 0.5 points) to the
      // size of the image
      m2d.getScaleMatrix(element.width, element.height)
    );

    const n = i * floatsPerMatrix;
    matrices[n] = newMatrix[0];
    matrices[n + 1] = newMatrix[1];
    matrices[n + 2] = newMatrix[2];
    matrices[n + 3] = newMatrix[3];
    matrices[n + 4] = newMatrix[4];
    matrices[n + 5] = newMatrix[5];

    opacities[i] = element.opacity * opacity;
  }

  return { matrices, opacities };
}
