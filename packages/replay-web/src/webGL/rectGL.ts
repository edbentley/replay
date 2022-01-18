import { Gradient } from "@replay/core/dist/t";
import {
  createProgram,
  hexToRGBPooled,
  RenderState,
  setupRampTexture,
} from "./glUtils";
import { m2d, m2dMut, Matrix2D } from "./matrix";

const vertexShaderSource = `
attribute vec2 a_position;

uniform mat3 u_matrix;

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1.0), 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec4 u_colour;

void main() {
  gl_FragColor = u_colour;
}
`;

export function getDrawRect(
  gl: WebGLRenderingContext,

  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");

  // Uniforms
  const uMatrixLocation = gl.getUniformLocation(program, "u_matrix");
  const uColourLocation = gl.getUniformLocation(program, "u_colour");

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

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();

  return function drawRect(
    matrix: Matrix2D,
    colour: string,
    width: number,
    height: number,
    opacity: number
  ) {
    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);
    }

    // u_matrix * a_position
    // where
    // u_matrix = matrix * scale
    // scale converts position (which is -0.5 / 0.5 points) to the size of the image
    const uMatrixValue = m2dMut.multiplyPooled(
      matrix,
      m2dMut.getScaleMatrixPooled(width, height)
    );
    m2dMut.toUniform3fvMut(uMatrixValue, uMatrixPooled);

    // Set the matrix which will be u_matrix * a_position
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    // Set colour
    const { r, g, b } = hexToRGBPooled(colour, opacity);
    gl.uniform4f(uColourLocation, r, g, b, opacity);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
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

export function getDrawRectGrad(
  gl: WebGLRenderingContext,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(
    gl,
    vertexGradShaderSource,
    fragmentGradShaderSource
  );

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

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

  // -- Position Buffer

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aPositionLocation);
  gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

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

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();

  return function drawRectGrad(
    matrix: Matrix2D,
    gradTexture: WebGLTexture,
    gradient: Gradient,
    width: number,
    height: number,
    opacity: number
  ) {
    if (gradTexture !== mutRenderState.texture) {
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      mutRenderState.texture = gradTexture;
    }

    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);
    }

    const uMatrixValue = m2dMut.multiplyPooled(
      matrix,
      m2dMut.getScaleMatrixPooled(width, height)
    );
    m2dMut.toUniform3fvMut(uMatrixValue, uMatrixPooled);

    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

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
  };
}
