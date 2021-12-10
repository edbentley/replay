import { ImageFileData } from "../device";
import { ImageBatchElement } from "./batch";
import { createProgram } from "./glUtils";
import { m2d, Matrix2D } from "./matrix";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_matrix_abcd;
attribute vec2 a_matrix_txty;
attribute float a_opacity;

uniform mat3 u_textureMatrix;

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
  v_texcoord = (flipY * u_textureMatrix * vec3(a_texcoord, 1.0)).xy;
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

export function getDrawImages(
  gl: WebGLRenderingContext,
  glExt: ANGLE_instanced_arrays
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aTexcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  const aMatrixABCDLocation = gl.getAttribLocation(program, "a_matrix_abcd");
  const aMatrixTXTYLocation = gl.getAttribLocation(program, "a_matrix_txty");
  const aOpacityLocation = gl.getAttribLocation(program, "a_opacity");

  // Uniforms
  const uTextureMatrixLocation = gl.getUniformLocation(
    program,
    "u_textureMatrix"
  );
  const uTextureLocation = gl.getUniformLocation(program, "u_texture");

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

  return function drawImages(
    texture: WebGLTexture,
    elements: ImageBatchElement[],
    // spriteSheet: SpriteSheetInfo | null,
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
      // Doesn't change between instances
      glExt.vertexAttribDivisorANGLE(aPositionLocation, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.enableVertexAttribArray(aTexcoordLocation);
      gl.vertexAttribPointer(aTexcoordLocation, 2, gl.FLOAT, false, 0, 0);
      glExt.vertexAttribDivisorANGLE(aTexcoordLocation, 0);

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

      gl.bindBuffer(gl.ARRAY_BUFFER, opacitiesBuffer);
      gl.enableVertexAttribArray(aOpacityLocation);
      gl.vertexAttribPointer(aOpacityLocation, 1, gl.FLOAT, false, 0, 0);
      glExt.vertexAttribDivisorANGLE(aOpacityLocation, 1);
    }

    const { matrices, opacities } = getMatricesOpacityData(elements);

    gl.bindBuffer(gl.ARRAY_BUFFER, matrixBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, matrices, gl.DYNAMIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, opacitiesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, opacities, gl.DYNAMIC_DRAW);

    // Because texture coordinates go from 0 to 1
    // and because our texture coordinates are already a unit quad
    // we can select an area of the texture by scaling the unit quad
    // down
    // const uTextureMatrixValue = spriteSheet
    //   ? getSpriteSheetMatrix(spriteSheet)
    //   : m2d.getIdentityMatrix();
    const uTextureMatrixValue = m2d.getIdentityMatrix();

    // Set the texture matrix.
    gl.uniformMatrix3fv(
      uTextureMatrixLocation,
      false,
      m2d.toUniform3fv(uTextureMatrixValue)
    );

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(uTextureLocation, 0);

    // draw the quad (2 triangles, 6 vertices)
    // gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Draw batch
    glExt.drawArraysInstancedANGLE(
      gl.TRIANGLES,
      0, // offset
      6, // num vertices per instance
      elements.length // num instances
    );

    return { program, texture };
  };
}

export function createTextureInfo(
  gl: WebGLRenderingContext,
  img: HTMLImageElement,
  scaleSharp: boolean
): ImageFileData {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  if (scaleSharp) {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // MAG is default LINEAR
  }

  const textureInfo = {
    texture: tex,
    image: img,
  };

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  return textureInfo;
}

type SpriteSheetInfo = { columns: number; rows: number; index: number };

function getSpriteSheetMatrix(info: SpriteSheetInfo): Matrix2D {
  const { columns, rows, index } = info;

  const columnIndex = index % columns;
  const rowIndex = Math.floor(index / columns) % rows;

  return m2d.multiply(
    m2d.getTranslateMatrix(columnIndex / columns, (rows - 1 - rowIndex) / rows),
    m2d.getScaleMatrix(1 / columns, 1 / rows)
  );

  // let uTextureMatrixValue = m2d.translation(
  //   srcX / texWidth,
  //   srcY / texHeight,
  //   0
  // );
  // uTextureMatrixValue = m2d.scale(
  //   uTextureMatrixValue,
  //   srcWidth / texWidth,
  //   srcHeight / texHeight,
  //   1
  // );
}

function getMatricesOpacityData(elements: ImageBatchElement[]) {
  const floatsPerMatrix = 6;

  // floats per mat3
  const matrices = new Float32Array(elements.length * floatsPerMatrix);

  // 1 float for opacity
  const opacities = new Float32Array(elements.length);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const n = i * floatsPerMatrix;
    matrices[n] = element.matrix[0];
    matrices[n + 1] = element.matrix[1];
    matrices[n + 2] = element.matrix[2];
    matrices[n + 3] = element.matrix[3];
    matrices[n + 4] = element.matrix[4];
    matrices[n + 5] = element.matrix[5];

    opacities[i] = element.opacity;
  }

  return { matrices, opacities };
}
