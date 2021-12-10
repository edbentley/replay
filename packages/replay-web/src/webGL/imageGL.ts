import { ImageFileData } from "../device";
import { createProgram } from "./glUtils";
import { m2d, Matrix2D } from "./matrix";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform mat3 u_matrix;
uniform mat3 u_texture_matrix;

varying vec2 v_texcoord;

const mat3 flipY = mat3(
  1.0, 0.0, 0.0,
  0.0, -1.0, 0.0,
  0.0, 1.0, 1.0
);

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1.0), 1.0);
  v_texcoord = (flipY * u_texture_matrix * vec3(a_texcoord, 1.0)).xy;
}`;
const fragmentShaderSource = `
precision mediump float;

varying vec2 v_texcoord;

uniform sampler2D u_texture;
uniform float u_opacity;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord) * u_opacity;
}
`;

export function getDrawImage(gl: WebGLRenderingContext) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Attributes
  const aPositionLocation = gl.getAttribLocation(program, "a_position");
  const aTexcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // Uniforms
  const uMatrixLocation = gl.getUniformLocation(program, "u_matrix");
  const uTextureMatrixLocation = gl.getUniformLocation(
    program,
    "u_texture_matrix"
  );
  const uTextureLocation = gl.getUniformLocation(program, "u_texture");
  const uOpacityLocation = gl.getUniformLocation(program, "u_opacity");

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

  return function drawImage(
    texture: WebGLTexture,
    matrix: Matrix2D,
    width: number,
    height: number,
    opacity: number,
    spriteSheet: SpriteSheetInfo | null,
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
    }

    // u_matrix * a_position
    // where
    // u_matrix = matrix * scale
    // scale converts position (which is -0.5 / 0.5 points) to the size of the image
    const uMatrixValue = m2d.multiply(
      matrix,
      m2d.getScaleMatrix(width, height)
    );

    // Set the matrix which will be u_matrix * a_position
    gl.uniformMatrix3fv(uMatrixLocation, false, m2d.toUniform3fv(uMatrixValue));

    // Because texture coordinates go from 0 to 1 and because our texture
    // coordinates are already a unit quad we can select an area of the texture
    // by scaling the unit quad down
    const uTextureMatrixValue = spriteSheet
      ? getSpriteSheetMatrix(spriteSheet)
      : m2d.getIdentityMatrix();

    // Set the texture matrix.
    gl.uniformMatrix3fv(
      uTextureMatrixLocation,
      false,
      m2d.toUniform3fv(uTextureMatrixValue)
    );

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(uTextureLocation, 0);

    // Set opacity
    gl.uniform1f(uOpacityLocation, opacity);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);

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
}
