import { ImageFileData } from "../device";
import { createProgram, RenderState } from "./glUtils";
import { m2d, m2dMut, Matrix2D } from "./matrix";

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

export function getDrawImage(
  gl: WebGLRenderingContext,
  glVao: OES_vertex_array_object,
  mutRenderState: RenderState
) {
  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vao = glVao.createVertexArrayOES();
  glVao.bindVertexArrayOES(vao);

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

  // -- Texture Coords Buffer

  const texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

  gl.enableVertexAttribArray(aTexcoordLocation);
  gl.vertexAttribPointer(aTexcoordLocation, 2, gl.FLOAT, false, 0, 0);

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

  // -- Done
  glVao.bindVertexArrayOES(null);

  const uMatrixPooled = m2d.getNewIdentity3fv();
  const uTextureMatrixPooled = m2d.getNewIdentity3fv();

  return function drawImage(
    texture: WebGLTexture,
    matrix: Matrix2D,
    width: number,
    height: number,
    opacity: number,
    spriteSheet: SpriteSheetInfo | null
  ) {
    if (texture !== mutRenderState.texture) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      mutRenderState.texture = texture;
    }

    if (program !== mutRenderState.program) {
      gl.useProgram(program);
      mutRenderState.program = program;
      glVao.bindVertexArrayOES(vao);
    }

    // u_matrix * a_position
    // where
    // u_matrix = matrix * scale
    // scale converts position (which is -0.5 / 0.5 points) to the size of the image
    m2dMut.scaleToUniform3fvMut(matrix, width, height, uMatrixPooled);

    // Set the matrix which will be u_matrix * a_position
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    // Because texture coordinates go from 0 to 1 and because our texture
    // coordinates are already a unit quad we can select an area of the texture
    // by scaling the unit quad down
    setSpriteSheetMatrix(spriteSheet, uTextureMatrixPooled);

    // Set the texture matrix.
    gl.uniformMatrix3fv(uTextureMatrixLocation, false, uTextureMatrixPooled);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(uTextureLocation, 0);

    // Set opacity
    gl.uniform1f(uOpacityLocation, opacity);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
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

function setSpriteSheetMatrix(
  info: SpriteSheetInfo | null,
  uTextureMatrix: Float32Array
) {
  if (!info) {
    m2dMut.toUniform3fvMut(m2d.identityMatrix, uTextureMatrix);
    return;
  }

  const { columns, rows, index } = info;

  const columnIndex = index % columns;
  const rowIndex = Math.floor(index / columns) % rows;

  const matrix = m2dMut.multiplyPooled(
    m2dMut.getTranslateMatrixPooled(
      columnIndex / columns,
      (rows - 1 - rowIndex) / rows
    ),
    m2dMut.getScaleMatrixPooled(1 / columns, 1 / rows)
  );
  m2dMut.toUniform3fvMut(matrix, uTextureMatrix);
}
