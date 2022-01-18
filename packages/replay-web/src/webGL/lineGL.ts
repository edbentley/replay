import { Gradient } from "@replay/core/dist/t";
import {
  createProgram,
  hexToRGBPooled,
  RenderState,
  setupRampTexture,
} from "./glUtils";
import { m2d, m2dMut, Matrix2D } from "./matrix";

// TODO: better line joins to avoid overlaps

const vertexShaderSource = `
attribute vec2 a_origin;
attribute vec2 a_point1;
attribute vec2 a_point2;

uniform mat3 u_matrix;
uniform float u_half_thickness;

void main() {
  if (a_point1 == a_point2) {
    // Avoid normalize a zero vector
    gl_Position = vec4(u_matrix * vec3(a_origin, 1.0), 1.0);
    return;
  }

  vec2 normal = normalize(a_point2 - a_point1);
  vec2 tangent = vec2(-normal.y, normal.x);
  vec2 pos = a_origin + tangent * u_half_thickness;

  gl_Position = vec4(u_matrix * vec3(pos, 1.0), 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform vec4 u_colour;

void main() {
  gl_FragColor = u_colour;
}
`;

export function getDrawLine(
  gl: WebGLRenderingContext,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vaoStroke = glVao.createVertexArrayOES();
  const vaoFill = glVao.createVertexArrayOES();

  // Attributes
  const aPoint1Location = gl.getAttribLocation(program, "a_point1");
  const aPoint2Location = gl.getAttribLocation(program, "a_point2");
  const aOriginLocation = gl.getAttribLocation(program, "a_origin");

  // Uniforms
  const uMatrixLocation = gl.getUniformLocation(program, "u_matrix");
  const uHalfThicknessLocation = gl.getUniformLocation(
    program,
    "u_half_thickness"
  );
  const uColourLocation = gl.getUniformLocation(program, "u_colour");

  // Buffer
  const positionBuffer = gl.createBuffer();

  // -- 1st VAO (stroke)

  glVao.bindVertexArrayOES(vaoStroke);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aPoint1Location);
  gl.vertexAttribPointer(aPoint1Location, 2, gl.FLOAT, false, 24, 8);

  gl.enableVertexAttribArray(aPoint2Location);
  gl.vertexAttribPointer(aPoint2Location, 2, gl.FLOAT, false, 24, 16);

  gl.enableVertexAttribArray(aOriginLocation);
  gl.vertexAttribPointer(aOriginLocation, 2, gl.FLOAT, false, 24, 0);

  // -- 2nd VAO (fill)

  glVao.bindVertexArrayOES(vaoFill);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.enableVertexAttribArray(aOriginLocation);
  gl.vertexAttribPointer(
    aOriginLocation,
    2,
    gl.FLOAT,
    false,
    // 24 * 4 (24 floats per row, 4 bytes per float)
    96,
    0
  );

  // Not using these values
  gl.disableVertexAttribArray(aPoint1Location);
  gl.disableVertexAttribArray(aPoint2Location);

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();

  return function drawLine(
    matrix: Matrix2D,
    mutTextureState: WebLineTextureState,
    path: [number, number][],
    lineWidth: number,
    strokeColor: string | undefined,
    fillColor: string | undefined,
    lineCap: "butt" | "round",
    opacity: number
  ) {
    if (path.length <= 1) {
      return;
    }

    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;

      // Only 1 buffer so don't have to rebind every time
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    }

    generatePathDataStroke(mutTextureState, path);

    // Add the path to GPU
    gl.bufferData(gl.ARRAY_BUFFER, mutTextureState.strokePath, gl.DYNAMIC_DRAW);

    // Set the matrix which will be u_matrix * a_position
    m2dMut.toUniform3fvMut(matrix, uMatrixPooled);
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    gl.uniform1f(uHalfThicknessLocation, lineWidth / 2);

    if (fillColor) {
      // Set colour
      const { r, g, b } = hexToRGBPooled(fillColor, opacity);
      gl.uniform4f(uColourLocation, r, g, b, opacity);

      glVao.bindVertexArrayOES(vaoFill);

      // draw the line shape
      gl.drawArrays(gl.TRIANGLE_FAN, 0, path.length);
    }
    if (strokeColor) {
      const { r, g, b } = hexToRGBPooled(strokeColor, opacity);

      // Set colour
      gl.uniform4f(uColourLocation, r, g, b, opacity);

      glVao.bindVertexArrayOES(vaoStroke);

      // draw the line shape
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, path.length * 4);

      if (lineCap === "round") {
        generateLineCaps(path, mutTextureState);
      } else {
        mutTextureState.lineCaps = null;
      }
    } else {
      mutTextureState.lineCaps = null;
    }
  };
}

export type LineCaps = {
  x: number;
  y: number;
  angleRad: number;
  textureState: { points: Float32Array };
};

type WebLineTextureState = {
  lineCaps: [LineCaps, LineCaps] | null;
  linePath: Float32Array;
  strokePath: Float32Array;
};

function generatePathDataStroke(
  mutTextureState: WebLineTextureState,
  path: [number, number][]
) {
  const floatsPerPoint = 24;

  const strokePathLength = path.length * floatsPerPoint;
  if (mutTextureState.strokePath.length !== strokePathLength) {
    mutTextureState.strokePath = new Float32Array(strokePathLength);
  }
  const out = mutTextureState.strokePath;

  let prevPointX: number | undefined = undefined;
  let prevPointY: number | undefined = undefined;
  let pointX: number | undefined = undefined;
  let pointY: number | undefined = undefined;
  let nextPointX: number = path[0][0];
  let nextPointY: number = path[0][1];

  for (let index = 0; index < path.length; index++) {
    const n = index * floatsPerPoint;

    prevPointX = pointX;
    prevPointY = pointY;

    pointX = nextPointX;
    pointY = nextPointY;

    const nextPoint = path[index + 1];
    if (nextPoint) {
      [nextPointX, nextPointY] = nextPoint;
    } else {
      nextPointX = pointX;
      nextPointY = pointY;
    }

    if (prevPointX === undefined || prevPointY === undefined) {
      prevPointX = pointX;
      prevPointY = pointY;
    }

    // Origin
    out[n] = pointX;
    out[n + 1] = pointY;
    // point1
    out[n + 2] = prevPointX;
    out[n + 3] = prevPointY;
    // point2
    out[n + 4] = pointX;
    out[n + 5] = pointY;

    out[n + 6] = pointX;
    out[n + 7] = pointY;
    out[n + 8] = pointX;
    out[n + 9] = pointY;
    out[n + 10] = prevPointX;
    out[n + 11] = prevPointY;

    out[n + 12] = pointX;
    out[n + 13] = pointY;
    out[n + 14] = pointX;
    out[n + 15] = pointY;
    out[n + 16] = nextPointX;
    out[n + 17] = nextPointY;

    out[n + 18] = pointX;
    out[n + 19] = pointY;
    out[n + 20] = nextPointX;
    out[n + 21] = nextPointY;
    out[n + 22] = pointX;
    out[n + 23] = pointY;
  }
}

function generatePathDataFill(
  path: [number, number][],
  mutTextureState: WebLineTextureState
) {
  const floatsPerPoint = 2;

  const pathLength = path.length * floatsPerPoint;
  if (mutTextureState.linePath.length !== pathLength) {
    mutTextureState.linePath = new Float32Array(pathLength);
  }
  const out = mutTextureState.linePath;

  path.forEach(([x, y], index) => {
    const n = index * floatsPerPoint;

    out[n] = x;
    out[n + 1] = y;
  });
}

function generateLineCaps(
  path: [number, number][],
  mutTextureState: WebLineTextureState
) {
  const first = path[0];
  const second = path[1];

  const secondLast = path[path.length - 2];
  const last = path[path.length - 1];

  if (mutTextureState.lineCaps) {
    mutTextureState.lineCaps[0].x = first[0];
    mutTextureState.lineCaps[0].y = first[1];
    mutTextureState.lineCaps[0].angleRad =
      Math.atan2(second[1] - first[1], second[0] - first[0]) + Math.PI / 2;

    mutTextureState.lineCaps[1].x = last[0];
    mutTextureState.lineCaps[1].y = last[1];
    mutTextureState.lineCaps[1].angleRad =
      Math.atan2(last[1] - secondLast[1], last[0] - secondLast[0]) -
      Math.PI / 2;
  } else {
    mutTextureState.lineCaps = [
      {
        x: first[0],
        y: first[1],
        angleRad:
          Math.atan2(second[1] - first[1], second[0] - first[0]) + Math.PI / 2,
        textureState: { points: new Float32Array() },
      },
      {
        x: last[0],
        y: last[1],
        angleRad:
          Math.atan2(last[1] - secondLast[1], last[0] - secondLast[0]) -
          Math.PI / 2,
        textureState: { points: new Float32Array() },
      },
    ];
  }
}

const vertexShaderGradSource = `
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

const fragmentShaderGradSource = `
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

export function getDrawLineGrad(
  gl: WebGLRenderingContext,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(
    gl,
    vertexShaderGradSource,
    fragmentShaderGradSource
  );

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

  // Attributes
  const aPointLocation = gl.getAttribLocation(program, "a_point");

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
  gl.enableVertexAttribArray(aPointLocation);
  gl.vertexAttribPointer(aPointLocation, 2, gl.FLOAT, false, 0, 0);

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();

  return function drawLineGrad(
    matrix: Matrix2D,
    mutTextureState: WebLineTextureState,
    gradTexture: WebGLTexture,
    path: [number, number][],
    fillGradient: Gradient,
    opacity: number
  ) {
    if (path.length <= 1) {
      return;
    }
    if (gradTexture !== mutRenderState.texture) {
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
      mutRenderState.texture = gradTexture;
    }

    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);

      // Only 1 buffer so don't have to rebind every time
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    }

    generatePathDataFill(path, mutTextureState);
    gl.bufferData(gl.ARRAY_BUFFER, mutTextureState.linePath, gl.DYNAMIC_DRAW);

    // Set the matrix which will be u_matrix * a_position
    m2dMut.toUniform3fvMut(matrix, uMatrixPooled);
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    // Set opacity
    gl.uniform1f(uOpacityLocation, opacity);

    setupRampTexture(
      gl,
      fillGradient,
      uRampTextureLocation,
      uRampWidthLocation,
      uGradientLengthLocation,
      uHorizontalLocation,
      1,
      1
    );

    // draw the line shape
    gl.drawArrays(gl.TRIANGLE_FAN, 0, path.length);
  };
}
