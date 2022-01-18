import { Gradient, TextTexture, TextureFont } from "@replay/core/dist/t";
import { MutTextTexture } from "@replay/core/dist/t2";
import { createProgram, hexToRGB, RenderState } from "./glUtils";
import { m2d, m2dMut, Matrix2D } from "@replay/core/dist/matrix";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform mat3 u_matrix;

varying vec2 v_texcoord;

const mat3 flipY = mat3(
  1.0, 0.0, 0.0,
  0.0, -1.0, 0.0,
  0.0, 1.0, 1.0
);

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1.0), 1.0);
  v_texcoord = (flipY * vec3(a_texcoord, 1.0)).xy;
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

export function getDrawCanvas(
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

  return function drawCanvas(
    offscreenTexture: WebGLTexture,
    matrix: Matrix2D,
    width: number,
    height: number,
    opacity: number,
    devicePixelRatio: number
  ) {
    gl.bindTexture(gl.TEXTURE_2D, offscreenTexture);
    mutRenderState.texture = offscreenTexture;

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
      m2dMut.getScaleMatrixPooled(
        width / devicePixelRatio,
        height / devicePixelRatio
      )
    );
    m2dMut.toUniform3fvMut(uMatrixValue, uMatrixPooled);

    // Set the matrix which will be u_matrix * a_position
    gl.uniformMatrix3fv(uMatrixLocation, false, uMatrixPooled);

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(uTextureLocation, 0);

    // Set opacity
    gl.uniform1f(uOpacityLocation, opacity);

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };
}

export function createCanvasTexture(
  gl: WebGLRenderingContext,
  canvas: HTMLCanvasElement
): WebGLTexture {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Upload the the canvas into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

  return texture;
}

/**
 * Returns required align
 */
export function handleTextTexture(
  texture: TextTexture | MutTextTexture,
  offscreenCanvas: HTMLCanvasElement,
  offscreenCanvasCtx: CanvasRenderingContext2D,
  defaultFont: TextureFont,
  devicePixelRatio: number
): "left" | "center" | "right" {
  const fontDetails = { ...defaultFont, ...texture.props.font };

  const {
    size = 10,
    weight = "normal",
    style = "normal",
    family,
    align = "center",
    baseline = "middle",
  } = fontDetails;
  const fontString = `${style} ${weight} ${size ? `${size}px` : ""} ${
    family ? `${family}` : ""
  }`;
  const { text, strokeThickness = 1, color } = texture.props;

  resetCanvas(
    offscreenCanvas,
    offscreenCanvasCtx,
    devicePixelRatio,
    getTextWidth(offscreenCanvasCtx, text, strokeThickness, fontString),
    size * 1.5 * (baseline !== "middle" ? 2 : 1)
  );

  drawText(
    offscreenCanvasCtx,
    fontString,
    text,
    color,
    strokeThickness,
    baseline,
    "center",
    texture.props.gradient,
    texture.props.strokeColor
  );

  return align;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  font: string,
  text: string,
  color: string,
  strokeThickness: number,
  baseline: CanvasTextBaseline,
  align: CanvasTextAlign,
  gradient?: Gradient,
  strokeColor?: string
) {
  ctx.font = font;
  ctx.textBaseline = baseline;
  ctx.textAlign = align;

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeThickness;
    ctx.strokeText(text, 0, 0);
  }

  ctx.fillStyle = gradient ? generateGradient(ctx, gradient) : color;
  ctx.fillText(text, 0, 0);
}

const generateGradient = (
  ctx: CanvasRenderingContext2D,
  gradient: Gradient
): CanvasGradient => {
  const canvasGradient =
    gradient.type === "linearHoriz"
      ? ctx.createLinearGradient(-gradient.width / 2, 0, gradient.width / 2, 0)
      : ctx.createLinearGradient(
          0,
          -gradient.height / 2,
          0,
          gradient.height / 2
        );

  gradient.colors.forEach((colour, index) => {
    if (gradient.opacities) {
      const a = gradient.opacities[index];
      if (a !== undefined) {
        // Add alpha to colour value
        const [r, g, b] = hexToRGB(colour);
        colour = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a}`;
      }
    }

    const offset = index / (gradient.colors.length - 1);
    canvasGradient.addColorStop(offset, colour);
  });

  return canvasGradient;
};

function resetCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  devicePixelRatio: number,
  width: number,
  height: number
) {
  // Set canvas to only the size required
  const canvasWidth = devicePixelRatio * width;
  const canvasHeight = devicePixelRatio * height;

  if (canvasWidth !== canvas.width || canvasHeight !== canvas.height) {
    // Resetting dimensions resets all canvas state
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  } else {
    ctx.clearRect(
      -canvasWidth / 2,
      -canvasHeight / 2,
      canvas.width,
      canvas.height
    );
  }
}

function getTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  strokeThickness: number,
  font: string
): number {
  ctx.font = font;
  return ctx.measureText(text).width + strokeThickness * 2;
}
