import { Gradient } from "@replay/core/dist/t";

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  throw Error(gl.getProgramInfoLog(program) || "");
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  throw Error(gl.getShaderInfoLog(shader) || "");
}

const cssLevel1Colours: Record<string, string> = {
  black: "#000000",
  silver: "#c0c0c0",
  gray: "#808080",
  white: "#ffffff",
  maroon: "#800000",
  red: "#ff0000",
  purple: "#800080",
  fuchsia: "#ff00ff",
  green: "#008000",
  lime: "#00ff00",
  olive: "#808000",
  yellow: "#ffff00",
  navy: "#000080",
  blue: "#0000ff",
  teal: "#008080",
  aqua: "#00ffff",
};

const rgbResult = { r: 0, g: 0, b: 0 };
export function hexToRGBPooled(hex: string, premultiplyAlpha?: number) {
  if (!hex.startsWith("#")) {
    hex = cssLevel1Colours[hex] || cssLevel1Colours.black;
  }

  const number = Number.parseInt(hex.slice(1), 16);
  const red = number >> 16;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  if (premultiplyAlpha !== undefined) {
    rgbResult.r = premultiplyAlpha * (red / 255);
    rgbResult.g = premultiplyAlpha * (green / 255);
    rgbResult.b = premultiplyAlpha * (blue / 255);
  } else {
    rgbResult.r = red / 255;
    rgbResult.g = green / 255;
    rgbResult.b = blue / 255;
  }

  return rgbResult;
}

export function setupRampTexture(
  gl: WebGLRenderingContext,
  gradient: Gradient,
  uRampTextureLocation: WebGLUniformLocation | null,
  uRampWidthLocation: WebGLUniformLocation | null,
  uGradientLengthLocation: WebGLUniformLocation | null,
  uHorizontalLocation: WebGLUniformLocation | null,
  scaleX: number,
  scaleY: number
) {
  const rampLength = gradient.colors.length;

  // Tell the shader to get the ramp texture from texture unit 0
  gl.uniform1i(uRampTextureLocation, 0);

  gl.uniform1f(uRampWidthLocation, rampLength);

  if (gradient.type === "linearHoriz") {
    gl.uniform1f(uGradientLengthLocation, gradient.width / scaleX);
    gl.uniform1i(uHorizontalLocation, 1);
  } else {
    gl.uniform1f(uGradientLengthLocation, gradient.height / scaleY);
    gl.uniform1i(uHorizontalLocation, 0);
  }
}

export function createGradTexture(
  gl: WebGLRenderingContext,
  gradient: Gradient
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const gradTexture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, gradTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  const rampLength = gradient.colors.length;

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    rampLength, // width
    1, // height
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    getRampData(gradient)
  );

  return gradTexture;
}

function getRampData(gradient: Gradient) {
  const array = Array.from<number>({ length: gradient.colors.length * 4 });

  for (let index = 0; index < gradient.colors.length; index++) {
    const colour = gradient.colors[index];

    const { r, g, b } = hexToRGBPooled(colour);
    let a = 1;
    if (gradient.opacities) {
      const value = gradient.opacities[index];
      if (value !== undefined) {
        a = value;
      }
    }

    const n = index * 4;
    array[n] = r * 255;
    array[n + 1] = g * 255;
    array[n + 2] = b * 255;
    array[n + 3] = a * 255;
  }

  return new Uint8Array(array);
}

export type RenderState = {
  texture: WebGLTexture | null;
  program: WebGLProgram | null;
};
