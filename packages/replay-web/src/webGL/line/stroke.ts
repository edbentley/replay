import { Gradient } from "@replay/core/dist/t";
import { createProgram, hexToRGB, setupRampTexture } from "../glUtils";
import { m2d, Matrix2D } from "../matrix";

const vertexShaderSource = `
attribute vec2 a_origin;
attribute vec2 a_point1;
attribute vec2 a_point2;
attribute vec4 a_matrix_abcd;
attribute vec2 a_matrix_txty;
attribute vec4 a_colour;
attribute float a_half_thickness;

varying vec4 v_colour;

void main() {
  v_colour = a_colour;

  mat3 matrix = mat3(
    a_matrix_abcd.x, a_matrix_abcd.y, 0,
    a_matrix_abcd.z, a_matrix_abcd.w, 0,
    a_matrix_txty.x, a_matrix_txty.y, 1
  );

  if (a_point1 == a_point2) {
    // Avoid normalize a zero vector
    gl_Position = vec4(matrix * vec3(a_origin, 1.0), 1.0);
    return;
  }

  vec2 normal = normalize(a_point2 - a_point1);
  vec2 tangent = vec2(-normal.y, normal.x);
  vec2 pos = a_origin + tangent * a_half_thickness;

  gl_Position = vec4(matrix * vec3(pos, 1.0), 1.0);
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

export function getDrawLineStrokes(
  gl: WebGLRenderingContext,
  glExt: ANGLE_instanced_arrays
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPoint1Location = gl.getAttribLocation(program, "a_point1");
  const aPoint2Location = gl.getAttribLocation(program, "a_point2");
  const aOriginLocation = gl.getAttribLocation(program, "a_origin");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aColourLocation = gl.getAttribLocation(program, "a_colour");
  const aHalfThicknessLocation = gl.getAttribLocation(
    program,
    "a_half_thickness"
  );

  // Buffers
  const positionBuffer = gl.createBuffer();
  const matrixBuffer = gl.createBuffer();
  const coloursBuffer = gl.createBuffer();
  const halfThicknessBuffer = gl.createBuffer();

  return function drawLineStrokes(
    matrix: Matrix2D,
    path: [number, number][],
    lineWidth: number,
    strokeColor: string | undefined,
    fillColor: string | undefined,
    lineCap: "butt" | "round",
    opacity: number,
    prevProgram: WebGLProgram | null
  ): { program: WebGLProgram; lineCaps: LineCaps[] } {
    if (path.length <= 1) {
      return { program: prevProgram || program, lineCaps: [] };
    }

    const lineCaps: LineCaps[] = [];

    if (program !== prevProgram) {
      gl.useProgram(program);

      // Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aOriginLocation);
      glExt.vertexAttribDivisorANGLE(aOriginLocation, 0);

      gl.vertexAttribPointer(aPoint1Location, 2, gl.FLOAT, false, 24, 8);
      glExt.vertexAttribDivisorANGLE(aPoint1Location, 0);
      gl.vertexAttribPointer(aPoint2Location, 2, gl.FLOAT, false, 24, 16);
      glExt.vertexAttribDivisorANGLE(aPoint2Location, 0);

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

      gl.bindBuffer(gl.ARRAY_BUFFER, halfThicknessBuffer);
      gl.enableVertexAttribArray(aHalfThicknessLocation);
      gl.vertexAttribPointer(aHalfThicknessLocation, 1, gl.FLOAT, false, 0, 0);
      glExt.vertexAttribDivisorANGLE(aHalfThicknessLocation, 1);
    }
    // Add the path to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      generatePathDataStroke(path),
      gl.DYNAMIC_DRAW
    );

    const {
      matrices,
      fillColours,
      strokeColours,
      halfThicknesses,
    } = getBufferData(elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, halfThicknessBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, halfThicknesses, gl.DYNAMIC_DRAW);

    if (fillColor) {
      gl.bindBuffer(gl.ARRAY_BUFFER, coloursBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colours, gl.DYNAMIC_DRAW);

      // Stride to skip
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

      // draw the line shape
      gl.drawArrays(gl.TRIANGLE_FAN, 0, path.length);
    }
    if (strokeColor) {
      const rgb = hexToRGB(strokeColor);

      // Set colour
      gl.uniform4f(uColourLocation, ...rgb, opacity);

      gl.vertexAttribPointer(aOriginLocation, 2, gl.FLOAT, false, 24, 0);

      gl.enableVertexAttribArray(aPoint1Location);
      gl.enableVertexAttribArray(aPoint2Location);

      // draw the line shape
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, path.length * 4);

      if (lineCap === "round") {
        lineCaps.push(...generateLineCaps(path));
      }
    }

    return { program, lineCaps };
  };
}

export type LineCaps = {
  x: number;
  y: number;
  angleRad: number;
};

function generatePathDataStroke(path: [number, number][]): Float32Array {
  const floatsPerPoint = 24;

  const out = new Float32Array(path.length * floatsPerPoint);

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

  return out;
}

function generatePathDataFill(path: [number, number][]): Float32Array {
  const floatsPerPoint = 2;
  const out = new Float32Array(path.length * floatsPerPoint);

  path.forEach(([x, y], index) => {
    const n = index * floatsPerPoint;

    out[n] = x;
    out[n + 1] = y;
  });

  return out;
}

function generateLineCaps(path: [number, number][]): LineCaps[] {
  const first = path[0];
  const second = path[1];

  const secondLast = path[path.length - 2];
  const last = path[path.length - 1];

  return [
    {
      x: first[0],
      y: first[1],
      angleRad:
        Math.atan2(second[1] - first[1], second[0] - first[0]) + Math.PI / 2,
    },
    {
      x: last[0],
      y: last[1],
      angleRad:
        Math.atan2(last[1] - secondLast[1], last[0] - secondLast[0]) -
        Math.PI / 2,
    },
  ];
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

export function getDrawLineGrad(gl: WebGLRenderingContext) {
  const program = createProgram(
    gl,
    vertexShaderGradSource,
    fragmentShaderGradSource
  );

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

  // Buffers
  const positionBuffer = gl.createBuffer();

  return function drawLineGrad(
    matrix: Matrix2D,
    gradTexture: WebGLTexture,
    path: [number, number][],
    fillGradient: Gradient,
    opacity: number,
    prevProgram: WebGLProgram | null,
    prevTexture: WebGLTexture | null
  ): { program: WebGLProgram; texture: WebGLTexture } {
    if (path.length <= 1) {
      return {
        program: prevProgram || program,
        texture: prevTexture || gradTexture,
      };
    }
    if (gradTexture !== prevTexture) {
      gl.bindTexture(gl.TEXTURE_2D, gradTexture);
    }

    if (program !== prevProgram) {
      gl.useProgram(program);

      // Setup the attributes to pull data from our buffers
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(aPointLocation);
      gl.vertexAttribPointer(aPointLocation, 2, gl.FLOAT, false, 0, 0);
    }
    // Add the path to GPU
    gl.bufferData(gl.ARRAY_BUFFER, generatePathDataFill(path), gl.DYNAMIC_DRAW);

    // Set the matrix which will be u_matrix * a_position
    gl.uniformMatrix3fv(uMatrixLocation, false, m2d.toUniform3fv(matrix));

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

    return { program, texture: gradTexture };
  };
}
