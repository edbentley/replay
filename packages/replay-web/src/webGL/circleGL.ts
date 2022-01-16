import { createProgram, hexToRGB, RenderState } from "./glUtils";
import { m2d, Matrix2D } from "./matrix";

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

  return function drawCircle(
    matrix: Matrix2D,
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
    const [scaleX, scaleY] = m2d.getScale(matrix);
    const scale = Math.max(scaleX * gameWidth, scaleY * gameHeight) / 2; // Undo initial transform in matrix (* gameSize/2)
    const numVertex = Math.ceil(Math.PI * radius * scale * pxPerPoint); // 2πr * scale / 2

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        // 0th element is centre point
        [-1].concat(
          Array.from({ length: numVertex + 1 }).map((_, index) => index)
        )
      ),
      gl.DYNAMIC_DRAW
    );

    gl.uniformMatrix3fv(uMatrixLocation, false, m2d.toUniform3fv(matrix));

    // Set uniforms
    gl.uniform4f(uColourLocation, ...hexToRGB(colour, opacity), opacity);
    gl.uniform1f(uNumVertexLocation, numVertex);
    gl.uniform1f(uRadiusLocation, radius);
    gl.uniform1f(uAngleMultiplierLocation, semiCircle ? 0.5 : 1);

    // draw
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertex + 2);
  };
}
