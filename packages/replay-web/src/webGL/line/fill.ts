import { ShapeBatchElement } from "../batch";
import { createProgram, hexToRGB, setupRampTexture } from "../glUtils";

const vertexShaderSource = `
attribute vec2 a_point;
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

  gl_Position = vec4(matrix * vec3(a_point, 1.0), 1.0);
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

export function getDrawLineFills(
  gl: WebGLRenderingContext,
  glExt: ANGLE_instanced_arrays
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPointLocation = gl.getAttribLocation(program, "a_point");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aColourLocation = gl.getAttribLocation(program, "a_colour");

  // Buffers
  const pointsBuffer = gl.createBuffer();
  const matrixBuffer = gl.createBuffer();
  const coloursBuffer = gl.createBuffer();

  return function drawLineFills(
    elements: ShapeBatchElement[],
    pathLength: number,
    prevProgram: WebGLProgram | null
  ): WebGLProgram {
    if (pathLength <= 1) {
      return prevProgram || program;
    }

    if (program !== prevProgram) {
      gl.useProgram(program);

      // Attributes
      gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
      gl.enableVertexAttribArray(aPointLocation);
      glExt.vertexAttribDivisorANGLE(aPointLocation, 0);

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
    const { points, matrices, colours } = generateData(elements, pathLength);

    // Add the path to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.DYNAMIC_DRAW);

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
        aPointLocation,
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

      gl.vertexAttribPointer(aPointLocation, 2, gl.FLOAT, false, 24, 0);

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

function generateData(elements: ShapeBatchElement[], pathLength: number) {
  const floatsPerPoint = 2;
  const floatsPerPath = floatsPerPoint * pathLength;
  const points = new Float32Array(floatsPerPoint * elements.length);

  const floatsPerMatrix = 6;
  const matrices = new Float32Array(elements.length * floatsPerMatrix);

  const floatsPerColour = 4;
  const colours = new Float32Array(elements.length * floatsPerColour);

  for (let i1 = 0; i1 < elements.length; i1++) {
    const { path, matrix, colour, opacity } = elements[i1];

    const n = i1 * floatsPerMatrix;
    matrices[n] = matrix[0];
    matrices[n + 1] = matrix[1];
    matrices[n + 2] = matrix[2];
    matrices[n + 3] = matrix[3];
    matrices[n + 4] = matrix[4];
    matrices[n + 5] = matrix[5];

    const [r, g, b] = hexToRGB(colour);

    const n2 = i1 * floatsPerColour;

    colours[n2] = r;
    colours[n2 + 1] = g;
    colours[n2 + 2] = b;
    colours[n2 + 3] = opacity;

    for (let i2 = 0; i2 < path.length; i2++) {
      const [x, y] = path[i2];
      const n = i1 * floatsPerPath + i2 * floatsPerPoint;

      points[n] = x;
      points[n + 1] = y;
    }
  }

  return { points, matrices, colours };
}
