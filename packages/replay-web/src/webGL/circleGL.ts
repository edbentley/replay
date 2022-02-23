import { createProgram, hexToRGBPooled, RenderState } from "./glUtils";
import { m2d, Matrix2D } from "@replay/core/dist/matrix";

const vertexShaderSource = `
#define PI 3.1415926538

attribute float a_vertex;
uniform float u_num_vertex;
uniform float u_radius;
uniform float u_angle_multiplier;

uniform mat3 u_matrix;

void main() {
  if (a_vertex < 0.0) {
    // Origin
    gl_Position = vec4(u_matrix * vec3(0.0, 0.0, 1.0), 1.0);
    return;
  }
  float dr = a_vertex / u_num_vertex;
  float angle = dr * PI * 2.0 * u_angle_multiplier;

  vec2 position = vec2(cos(angle), sin(angle)) * u_radius;

  gl_Position = vec4(u_matrix * vec3(position, 1.0), 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec4 u_colour;

void main() {
  gl_FragColor = u_colour;
}
`;

export function getDrawCircle(
  gl: WebGLRenderingContext,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

  // Attributes
  const aVertexLocation = gl.getAttribLocation(program, "a_vertex");

  // Uniforms
  const uNumVertexLocation = gl.getUniformLocation(program, "u_num_vertex");
  const uRadiusLocation = gl.getUniformLocation(program, "u_radius");
  const uAngleMultiplierLocation = gl.getUniformLocation(
    program,
    "u_angle_multiplier"
  );
  const uMatrixLocation = gl.getUniformLocation(program, "u_matrix");
  const uColourLocation = gl.getUniformLocation(program, "u_colour");

  // -- Vertex Buffer

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.enableVertexAttribArray(aVertexLocation);
  gl.vertexAttribPointer(aVertexLocation, 1, gl.FLOAT, false, 0, 0);

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();

  return function drawCircle(
    matrix: Matrix2D,
    mutTextureState: WebCircleTextureState,
    colour: string,
    radius: number,
    gameWidth: number,
    gameHeight: number,
    pxPerPoint: number,
    opacity: number,
    semiCircle: boolean
  ) {
    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);

      // Only 1 buffer so don't have to rebind every time
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    }

    // Calculate number points to draw based on one pixel resolution
    const { scaleX, scaleY } = m2d.getScalePooled(matrix);
    const scale = Math.max(scaleX * gameWidth, scaleY * gameHeight) / 2; // Undo initial transform in matrix (* gameSize/2)
    const numVertex = Math.ceil(Math.PI * radius * scale * pxPerPoint); // 2πr * scale / 2

    generatePoints(mutTextureState, numVertex);

    gl.bufferData(gl.ARRAY_BUFFER, mutTextureState.points, gl.DYNAMIC_DRAW);

    m2d.toUniform3fvMut(matrix, uMatrixPooled);
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    // Set uniforms
    const { r, g, b } = hexToRGBPooled(colour, opacity);
    gl.uniform4f(uColourLocation, r, g, b, opacity);
    gl.uniform1f(uNumVertexLocation, numVertex);
    gl.uniform1f(uRadiusLocation, radius);
    gl.uniform1f(uAngleMultiplierLocation, semiCircle ? 0.5 : 1);

    // draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertex + 2);
  };
}

export type WebCircleTextureState = {
  points: Float32Array;
};
export type WebCircleArrayTextureState = {
  pointsByIndex: WebCircleTextureState[];
};

function generatePoints(
  mutTextureState: WebCircleTextureState,
  numVertex: number
) {
  const length = numVertex + 2;

  if (mutTextureState.points.length !== length) {
    mutTextureState.points = new Float32Array(length);
    for (let i = -1; i < length - 1; i++) {
      // 0th element is centre point
      mutTextureState.points[i] = i;
    }
  }
}
