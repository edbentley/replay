import { PlatformRender } from "@replay/core/dist/core";
import { AssetMap } from "@replay/core/dist/device";
import { MaskShape } from "@replay/core/dist/mask";
import { ImageFileData } from "../device";
import { getDrawImage } from "./imageGL";
import { getDrawRect, getDrawRectGrad } from "./rectGL";
import {
  createCanvasTexture,
  getDrawCanvas,
  handleTextTexture,
} from "./canvasGL";
import { m2d, Matrix2D } from "./matrix";
import { TextureFont } from "@replay/core/dist/t";
import { getDrawLine, getDrawLineGrad } from "./lineGL";
import { getDrawCircle } from "./circleGL";
import { applyTransform, createGradTexture, hexToRGB } from "./glUtils";
import { getDrawImageBatch } from "./imageBatchGL";
import { getDrawRectBatch } from "./rectBatchGL";

export function draw(
  gl: WebGLRenderingContext,
  glInstArrays: ANGLE_instanced_arrays,
  offscreenCanvas: HTMLCanvasElement,
  gameWidth: number,
  gameHeight: number,
  imageElements: AssetMap<ImageFileData>,
  defaultFont: TextureFont,
  bgColor: string,
  devicePixelRatio: number
): PlatformRender {
  const canvasWidth = gl.canvas.width;
  const canvasHeight = gl.canvas.height;
  const pxPerPoint = (canvasWidth * devicePixelRatio) / gameWidth;

  // Default (needs resetting on window resize)
  gl.viewport(0, 0, canvasWidth, canvasHeight);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const offscreenCanvasCtx = offscreenCanvas.getContext("2d")!;

  const drawImage = getDrawImage(gl);
  const drawImageBatch = getDrawImageBatch(gl, glInstArrays);
  const drawRect = getDrawRect(gl);
  const drawRectBatch = getDrawRectBatch(gl, glInstArrays);
  const drawRectGrad = getDrawRectGrad(gl);
  const drawLine = getDrawLine(gl);
  const drawLineGrad = getDrawLineGrad(gl);
  const drawCircle = getDrawCircle(gl);
  const drawCanvas = getDrawCanvas(gl);

  const stateStack: {
    opacity: number;
    transformation: Matrix2D;
    hasMask: boolean;
  }[] = [
    {
      opacity: 1,
      // Game coordinates to clip space -1/+1
      // This is the last matrix applied
      transformation: m2d.getScaleMatrix(2 / gameWidth, 2 / gameHeight),
      hasMask: false,
    },
  ];

  function applyMask(
    mask: MaskShape,
    matrix: Matrix2D,
    x?: number,
    y?: number
  ) {
    if (!mask) return;

    if (gl.isEnabled(gl.STENCIL_TEST)) {
      throw Error("Nested masks not supported");
    }

    gl.enable(gl.STENCIL_TEST);
    gl.clear(gl.STENCIL_BUFFER_BIT);

    // Set the stencil test so it always passes
    // and the reference to 1
    gl.stencilFunc(
      gl.ALWAYS, // the test (always passes / draws)
      1, // sets this reference value
      0xff // all 1s
    );
    // Set it so we replace with the reference value 1
    gl.stencilOp(
      gl.KEEP, // stencil test fails (not used since always passes)
      gl.KEEP, // depth test fails
      gl.REPLACE // what to do if both tests pass (so set all pixels to ref 1)
    );

    const newMatrix = m2d.multiply(
      // Also translate by texture's coordinates
      x !== undefined && y !== undefined && (x !== 0 || y !== 0)
        ? m2d.multiply(matrix, m2d.getTranslateMatrix(x, y))
        : matrix,
      m2d.getTranslateMatrix(mask.x, mask.y)
    );

    // Disable drawing of mask itself
    gl.colorMask(false, false, false, false);

    switch (mask.type) {
      case "circleMask":
        prevProgram = drawCircle(
          newMatrix,
          "",
          mask.radius,
          gameWidth,
          gameHeight,
          devicePixelRatio,
          1,
          false,
          prevProgram
        );
        break;

      case "lineMask":
        prevProgram = drawLine(
          newMatrix,
          mask.path,
          0,
          undefined,
          " ", // Non empty string
          "butt",
          1,
          prevProgram
        );
        break;

      case "rectangleMask":
        prevProgram = drawRect(
          newMatrix,
          "",
          mask.width,
          mask.height,
          1,
          prevProgram
        );
        break;
    }

    // Re-enable drawing
    gl.colorMask(true, true, true, true);

    // Set the test that the stencil must = 1
    gl.stencilFunc(
      gl.EQUAL, // the test - must have ref = 1 (will only draw if passes test)
      1, // set ref if passed (so no change)
      0xff
    );
    // don't change the stencil buffer on draw
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
  }

  function clearMask() {
    gl.disable(gl.STENCIL_TEST);
  }

  // Used for text and gradient ramp textures
  const textureMap: Record<
    string,
    {
      texture: WebGLTexture;
      width: number;
      height: number;
      align: "center" | "left" | "right";
    }
  > = {};
  let unusedTextures = new Set<string>();

  let prevTexture: WebGLTexture | null = null;
  let prevProgram: WebGLProgram | null = null;

  const [bgR, bgG, bgB] = hexToRGB(bgColor);

  return {
    newFrame: () => {
      // Set background for game
      gl.clearColor(bgR, bgG, bgB, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      unusedTextures.forEach((key) => {
        gl.deleteTexture(textureMap[key].texture);
        delete textureMap[key];
      });
      unusedTextures = new Set(Object.keys(textureMap));

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
    startRenderSprite: (baseProps) => {
      const topStack = stateStack[0];
      const newMatrix = applyTransform(topStack.transformation, baseProps);

      applyMask(baseProps.mask, newMatrix);

      stateStack.unshift({
        opacity: topStack.opacity * baseProps.opacity,
        transformation: newMatrix,
        hasMask: baseProps.mask !== null,
      });
    },
    endRenderSprite: () => {
      const state = stateStack.shift();

      if (state?.hasMask) {
        clearMask();
      }
    },
    renderTexture: (texture) => {
      const topStack = stateStack[0];

      if (texture.type === "imageArray") {
        if (texture.props.length === 0) return;

        applyMask(texture.mask, topStack.transformation);

        const imageInfo = getImage(imageElements, texture.fileName);
        const result = drawImageBatch(
          imageInfo.texture,
          topStack.transformation,
          topStack.opacity,
          texture.props,
          prevProgram,
          prevTexture
        );
        prevProgram = result.program;
        prevTexture = result.texture;

        if (texture.mask) {
          clearMask();
        }
        return;
      }
      if (texture.type === "rectangleArray") {
        if (texture.props.length === 0) return;

        applyMask(texture.mask, topStack.transformation);

        prevProgram = drawRectBatch(
          topStack.transformation,
          topStack.opacity,
          texture.props,
          prevProgram
        );

        if (texture.mask) {
          clearMask();
        }
        return;
      }

      const newMatrix = applyTransform(topStack.transformation, texture.props);
      applyMask(
        texture.props.mask,
        topStack.transformation,
        texture.props.x,
        texture.props.y
      );

      switch (texture.type) {
        case "image":
        case "spriteSheet": {
          const imageInfo = getImage(imageElements, texture.props.fileName);
          const result = drawImage(
            imageInfo.texture,
            newMatrix,
            texture.props.width,
            texture.props.height,
            texture.props.opacity * topStack.opacity,
            texture.type === "spriteSheet"
              ? {
                  columns: texture.props.columns,
                  rows: texture.props.rows,
                  index: texture.props.index,
                }
              : null,
            prevProgram,
            prevTexture
          );
          prevProgram = result.program;
          prevTexture = result.texture;
          break;
        }

        case "line": {
          const gradient = texture.props.fillGradient;
          if (gradient) {
            const gradCacheKey = `${gradient.type}-${gradient.colors.join(
              ""
            )}-${(gradient.opacities || []).join("")}`;

            let cacheValue = textureMap[gradCacheKey];

            if (!cacheValue) {
              cacheValue = {
                texture: createGradTexture(gl, gradient),
                // unused
                width: 0,
                height: 0,
                align: "center",
              };
              textureMap[gradCacheKey] = cacheValue;
            } else {
              unusedTextures.delete(gradCacheKey);
            }

            const result = drawLineGrad(
              newMatrix,
              cacheValue.texture,
              texture.props.path,
              gradient,
              texture.props.opacity * topStack.opacity,
              prevProgram,
              prevTexture
            );
            prevProgram = result.program;
            prevTexture = result.texture;
          }
          if (texture.props.color || texture.props.fillColor) {
            const result = drawLine(
              newMatrix,
              texture.props.path,
              texture.props.thickness,
              texture.props.color,
              texture.props.fillColor,
              texture.props.lineCap,
              texture.props.opacity * topStack.opacity,
              prevProgram
            );
            prevProgram = result.program;

            const capColor = texture.props.color;
            if (capColor) {
              result.lineCaps.forEach((circle) => {
                prevProgram = drawCircle(
                  m2d.multiplyMultiple([
                    newMatrix,
                    m2d.getTranslateMatrix(circle.x, circle.y),
                    m2d.getRotateMatrix(circle.angleRad),
                  ]) || newMatrix,
                  capColor,
                  texture.props.thickness / 2,
                  gameWidth,
                  gameHeight,
                  pxPerPoint,
                  texture.props.opacity * topStack.opacity,
                  true,
                  prevProgram
                );
              });
            }
          }
          break;
        }

        case "rectangle": {
          const gradient = texture.props.gradient;
          if (gradient) {
            const gradCacheKey = `${gradient.type}-${gradient.colors.join(
              ""
            )}-${(gradient.opacities || []).join("")}`;

            let cacheValue = textureMap[gradCacheKey];

            if (!cacheValue) {
              cacheValue = {
                texture: createGradTexture(gl, gradient),
                // unused
                width: 0,
                height: 0,
                align: "center",
              };
              textureMap[gradCacheKey] = cacheValue;
            } else {
              unusedTextures.delete(gradCacheKey);
            }

            const result = drawRectGrad(
              newMatrix,
              cacheValue.texture,
              gradient,
              texture.props.width,
              texture.props.height,
              texture.props.opacity * topStack.opacity,
              prevProgram,
              prevTexture
            );
            prevProgram = result.program;
            prevTexture = result.texture;
          } else {
            prevProgram = drawRect(
              newMatrix,
              texture.props.color,
              texture.props.width,
              texture.props.height,
              texture.props.opacity * topStack.opacity,
              prevProgram
            );
          }
          break;
        }

        case "circle":
          prevProgram = drawCircle(
            newMatrix,
            texture.props.color,
            texture.props.radius,
            gameWidth,
            gameHeight,
            pxPerPoint,
            texture.props.opacity * topStack.opacity,
            false,
            prevProgram
          );
          break;

        case "text": {
          const { text, color, strokeColor, font } = texture.props;
          let cacheKey = `${text}-${color}-${strokeColor}`;
          if (font) {
            cacheKey += `-${font.size}-${font.weight}-${font.style}-${font.align}`;
          }

          let cacheValue = textureMap[cacheKey];

          if (!cacheValue) {
            const align = handleTextTexture(
              texture,
              offscreenCanvas,
              offscreenCanvasCtx,
              defaultFont,
              devicePixelRatio
            );

            cacheValue = {
              texture: createCanvasTexture(gl, offscreenCanvas),
              width: offscreenCanvas.width,
              height: offscreenCanvas.height,
              align,
            };

            textureMap[cacheKey] = cacheValue;
          } else {
            unusedTextures.delete(cacheKey);
          }

          const { align, width, height } = cacheValue;

          const result = drawCanvas(
            cacheValue.texture,
            align === "center"
              ? newMatrix
              : m2d.multiply(
                  newMatrix,
                  m2d.getTranslateMatrix(
                    (width / (2 * devicePixelRatio)) *
                      (align === "left" ? 1 : -1),
                    0
                  )
                ),
            width,
            height,
            texture.props.opacity * topStack.opacity,
            devicePixelRatio,
            prevProgram
          );
          prevProgram = result.program;
          prevTexture = result.texture;
          break;
        }
      }

      if (texture.props.mask) {
        clearMask();
      }
    },
    calledNativeSprite: () => {
      // Could have been reset by a Native Sprite rendering WebGL
      prevProgram = null;
      prevTexture = null;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
  };
}

const getImage = (imageElements: AssetMap<ImageFileData>, fileName: string) => {
  const imageElement = imageElements[fileName];
  if (!imageElement) {
    throw Error(`Image file "${fileName}" was not preloaded`);
  }
  if ("then" in imageElement.data) {
    throw Error(
      `Image file "${fileName}" did not finish loading before it was used`
    );
  }
  return imageElement.data;
};
