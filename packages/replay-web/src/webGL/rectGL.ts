import { Gradient } from "@replay/core/dist/t";
import { RectBatchElement } from "./batch";
import { createProgram, hexToRGB, setupRampTexture } from "./glUtils";
import { m2d, Matrix2D } from "./matrix";

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
  gl_FragColor.rgb *= v_colour.a;
}
`;

export function getDrawRects(
  gl: WebGLRenderingContext,
  glExt: ANGLE_instanced_arrays
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aColourLocation = gl.getAttribLocation(program, "a_colour");

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

  const matrixBuffer = gl.createBuffer();
  const coloursBuffer = gl.createBuffer();

  return function drawRects(
    elements: RectBatchElement[],
    prevProgram: WebGLProgram | null
  ): WebGLProgram {
    if (program !== prevProgram) {
      gl.useProgram(program);

      // Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPositionLocation);
      gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);
      glExt.vertexAttribDivisorANGLE(aPositionLocation, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.enableVertexAttribArray(aMatrixABCDLocation);
      gl.vertexAttribPointer(aMatrixABCDLocation, 4, gl.FLOAT, false, 6 * 4, 0);
      glExt.vertexAttribDivisorANGLE(aMatrixABCDLocation, 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
      gl.enableVertexAttribArray(aMatrixTXTYLocation);
      gl.vertexAttribPointer(
        aMatrixTXTYLocation,
        2,
        gl.FLOAT,
        false,
        6 * 4,
        4 * 4
      );
      glExt.vertexAttribDivisorANGLE(aMatrixTXTYLocation, 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
      gl.enableVertexAttribArray(aColourLocation);
      gl.vertexAttribPointer(aColourLocation, 4, gl.FLOAT, false, 0, 0);
      glExt.vertexAttribDivisorANGLE(aColourLocation, 1);
    }

    const { matrices, colours } = getMatricesColoursData(elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colours, gl.DYNAMIC_DRAW);

    glExt.drawArraysInstancedANGLE(
      gl.TRIANGLES,
      0, // offset
      6, // num vertices per instance
      elements.length // num instances
    );

    return program;
  };
}

function getMatricesColoursData(elements: RectBatchElement[]) {
  const floatsPerMatrix = 6;
  const floatsPerColour = 4;

  // floats per mat3
  const matrices = new Float32Array(elements.length * floatsPerMatrix);

  // floats for colour vec4
  const colours = new Float32Array(elements.length * floatsPerColour);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const n = i * floatsPerMatrix;
    matrices[n] = element.matrix[0];
    matrices[n + 1] = element.matrix[1];
    matrices[n + 2] = element.matrix[2];
    matrices[n + 3] = element.matrix[3];
    matrices[n + 4] = element.matrix[4];
    matrices[n + 5] = element.matrix[5];

    const [r, g, b] = hexToRGB(element.colour);

    const n2 = i * floatsPerColour;

    colours[n2] = r;
    colours[n2 + 1] = g;
    colours[n2 + 2] = b;
    colours[n2 + 3] = element.opacity;
  }

  return { matrices, colours };
}

const vertexGradShaderSource = `
attribute vec2 a_point;

uniform mat3 u_matrix;
uniform bool u_horizontal;
uniform float u_ramp_width;
uniform float u_gradient_length;

varying float ramp_distance;

void main() {
  float grad_coord = 0.0;

  if (u_horizontal) {
    grad_coord = a_point.x;
  } else {
    grad_coord = -a_point.y;
  }

  // grad_coord = -0.5 / 0.5 is edges of rect
  // mixValue varies from 0 -> 1 along gradient length
  float mixValue = 0.5 + grad_coord / u_gradient_length;

  float rampPixelLength = 1.0 / u_ramp_width;

  ramp_distance =
    // Left offset to middle of pixel
    rampPixelLength / 2.0 +
    // Distance along ramp width
    mixValue * (1.0 - rampPixelLength);

  gl_Position = vec4(u_matrix * vec3(a_point, 1.0), 1.0);
}
`;

const fragmentGradShaderSource = `
precision mediump float;

uniform sampler2D u_ramp_texture;
uniform float u_opacity;

varying float ramp_distance;

void main() {
  gl_FragColor = texture2D(
    u_ramp_texture,
    vec2(ramp_distance, 0.5)
  ) * u_opacity;
}
`;

export function getDrawRectGrad(gl: WebGLRenderingContext) {
  const program = createProgram(
    gl,
    vertexGradShaderSource,
    fragmentGradShaderSource
  );

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_point");

  // Uniforms
  const uMatrixLocation = gl.getUniformLocation(program, "u_matrix");
  const uRampTextureLocation = gl.getUniformLocation(program, "u_ramp_texture");
  const uRampWidthLocation = gl.getUniformLocation(program, "u_ramp_width");
  const uGradientLengthLocation = gl.getUniformLocation(
    program,
    "u_gradient_length"
  );
  const uHorizontalLocation = gl.getUniformLocation(program, "u_horizontal");
  const uOpacityLocation = gl.getUniformLocation(program, "u_opacity");

  // Buffers
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

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

  return function drawRectGrad(
    matrix: Matrix2D,
    gradTexture: WebGLTexture,
    gradient: Gradient,
    width: number,
    height: number,
    opacity: number,
    prevProgram: WebGLProgram | null,
    prevTexture: WebGLTexture | null
  ): { program: WebGLProgram; texture: WebGLTexture } {
    if (gradTexture !== prevTexture) {
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
    }

    if (program !== prevProgram) {
      gl.useProgram(program);

      // Setup the attributes to pull data from our buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPositionLocation);
      gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    const uMatrixValue = m2d.multiply(
      matrix,
      m2d.getScaleMatrix(width, height)
    );

    gl.uniformMatrix3fv(uMatrixLocation, false, m2d.toUniform3fv(uMatrixValue));

    gl.uniform1f(uOpacityLocation, opacity);

    setupRampTexture(
      gl,
      gradient,
      uRampTextureLocation,
      uRampWidthLocation,
      uGradientLengthLocation,
      uHorizontalLocation,
      width,
      height
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return { program, texture: gradTexture };
  };
}
