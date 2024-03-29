import { PlatformRender } from "@replay/core/dist/core";
import { AssetMap } from "@replay/core/dist/device";
import { MaskShape } from "@replay/core/dist/mask";
import { ImageFileData } from "../device";
import { getDrawImage } from "./imageGL";
import { getDrawRect, getDrawRectGrad } from "./rectGL";
import {
  createCanvasTexture,
  getDrawCanvas,
  drawTextTexture,
} from "./canvasGL";
import { m2d, Matrix2D } from "@replay/core/dist/matrix";
import {
  LineArrayProps,
  TextArrayProps,
  TextureFont,
} from "@replay/core/dist/t";
import {
  getDrawLine,
  getDrawLineGrad,
  WebLineTextureState,
  WebLineArrayTextureState,
  generateLineArrayState,
} from "./lineGL";
import {
  getDrawCircle,
  WebCircleTextureState,
  WebCircleArrayTextureState,
  generateCircleArrayPoints,
} from "./circleGL";
import { createGradTexture, hexToRGBPooled, RenderState } from "./glUtils";
import { getDrawImageBatch, WebImageArrayTextureState } from "./imageBatchGL";
import { getDrawRectBatch, WebRectArrayTextureState } from "./rectBatchGL";
import { applyTransformMut } from "@replay/core/dist/transform";

export function draw(
  gl: WebGLRenderingContext,
  glInstArrays: ANGLE_instanced_arrays,
  glVao: OES_vertex_array_object,
  offscreenCanvas: HTMLCanvasElement,
  gameWidth: number,
  gameHeight: number,
  imageElements: AssetMap<ImageFileData>,
  defaultFont: TextureFont,
  bgColor: string,
  devicePixelRatio: number
): PlatformRender<TextureState, MaskState> {
  const canvasWidth = gl.canvas.width;
  const canvasHeight = gl.canvas.height;
  const pxPerPoint = (canvasWidth * devicePixelRatio) / gameWidth;

  // Default (needs resetting on window resize)
  gl.viewport(0, 0, canvasWidth, canvasHeight);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const offscreenCanvasCtx = offscreenCanvas.getContext("2d")!;

  const mutRenderState: RenderState = {
    texture: null,
    program: null,
  };

  const drawImage = getDrawImage(gl, glVao, mutRenderState);
  const drawImageBatch = getDrawImageBatch(
    gl,
    glInstArrays,
    glVao,
    mutRenderState
  );
  const drawRect = getDrawRect(gl, glVao, mutRenderState);
  const drawRectBatch = getDrawRectBatch(
    gl,
    glInstArrays,
    glVao,
    mutRenderState
  );
  const drawRectGrad = getDrawRectGrad(gl, glVao, mutRenderState);
  const drawLine = getDrawLine(gl, glVao, mutRenderState);
  const drawLineGrad = getDrawLineGrad(gl, glVao, mutRenderState);
  const drawCircle = getDrawCircle(gl, glVao, mutRenderState);
  const drawCanvas = getDrawCanvas(gl, glVao, mutRenderState);

  function applyMask(
    mask: MaskShape,
    maskState: MaskState | null,
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
      case "circleMask": {
        if (maskState === null) {
          maskState = { value: null };
        }
        if (maskState.value?.type !== "circleMask") {
          maskState.value = {
            type: "circleMask",
            points: new Float32Array(),
          };
        }
        drawCircle(
          newMatrix,
          maskState.value,
          "",
          mask.radius,
          gameWidth,
          gameHeight,
          devicePixelRatio,
          1,
          false
        );
        break;
      }

      case "lineMask": {
        if (maskState === null) {
          maskState = { value: null };
        }
        if (maskState.value?.type !== "lineMask") {
          maskState.value = {
            type: "lineMask",
            lineCaps: null,
            linePath: new Float32Array(),
            strokePath: new Float32Array(),
          };
        }
        drawLine(
          newMatrix,
          maskState.value,
          mask.path,
          0,
          undefined,
          " ", // Non empty string
          "butt",
          1
        );
        break;
      }

      case "rectangleMask":
        drawRect(newMatrix, "", mask.width, mask.height, 1);
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
  const unusedTextures = new Set<string>();

  const newMatrix: Matrix2D = [0, 0, 0, 0, 0, 0];

  const { r: bgR, g: bgG, b: bgB } = hexToRGBPooled(bgColor);

  function handleLineTexture(
    textureProps: LineArrayProps,
    stackOpacity: number,
    textureState: WebLineTextureState
  ) {
    const gradient = textureProps.fillGradient;
    if (gradient) {
      const gradCacheKey = `${gradient.type}-${gradient.colors.join("")}-${(
        gradient.opacities || []
      ).join("")}`;

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

      drawLineGrad(
        newMatrix,
        // Default for non-mut line
        textureState,
        cacheValue.texture,
        textureProps.path,
        gradient,
        textureProps.opacity * stackOpacity
      );
    }
    if (textureProps.color || textureProps.fillColor) {
      drawLine(
        newMatrix,
        textureState,
        textureProps.path,
        textureProps.thickness,
        textureProps.color,
        textureProps.fillColor,
        textureProps.lineCap,
        textureProps.opacity * stackOpacity
      );

      const capColor = textureProps.color;
      if (textureState.lineCaps && capColor) {
        for (const circle of textureState.lineCaps) {
          const m1 = m2d.multiplyPooled(
            m2d.getTranslateMatrixPooled(circle.x, circle.y),
            m2d.getRotateMatrixPooled(circle.angleRad)
          );
          const m2 = m2d.multiplyPooled(newMatrix, m1);
          drawCircle(
            m2,
            circle.textureState,
            capColor,
            textureProps.thickness / 2,
            gameWidth,
            gameHeight,
            pxPerPoint,
            textureProps.opacity * stackOpacity,
            true
          );
        }
      }
    }
  }

  function handleTextTexture(
    textureProps: TextArrayProps,
    stackOpacity: number
  ) {
    const { text, color, strokeColor, font } = textureProps;
    const cacheKey = font
      ? `${text}-${color}-${strokeColor}-${font.size}-${font.weight}-${font.style}-${font.align}`
      : `${text}-${color}-${strokeColor}`;

    let cacheValue = textureMap[cacheKey];

    if (!cacheValue) {
      const align = drawTextTexture(
        textureProps,
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

    drawCanvas(
      cacheValue.texture,
      align === "center"
        ? newMatrix
        : m2d.multiplyPooled(
            newMatrix,
            m2d.getTranslateMatrixPooled(
              (width / (2 * devicePixelRatio)) * (align === "left" ? 1 : -1),
              0
            )
          ),
      width,
      height,
      textureProps.opacity * stackOpacity,
      devicePixelRatio
    );
  }

  return {
    newFrame: () => {
      // Set background for game
      gl.clearColor(bgR, bgG, bgB, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (const key of unusedTextures) {
        gl.deleteTexture(textureMap[key].texture);
        delete textureMap[key];
      }
      unusedTextures.clear();
      for (const key in textureMap) {
        unusedTextures.add(key);
      }

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
    endFrame: () => {
      // Reset for any Native Sprites rendering before next frame
      glVao.bindVertexArrayOES(null);
      mutRenderState.program = null;
      mutRenderState.texture = null;
    },
    startRenderSprite: (baseProps, stackItem, maskState) => {
      applyMask(baseProps.mask, maskState, stackItem.transformation);
    },
    endRenderSprite: (stackItem) => {
      if (stackItem.hasMask) {
        clearMask();
      }
    },
    renderTexture: (topStack, texture, textureState, maskState) => {
      if (texture.type === "imageArray") {
        if (texture.props.length === 0) return;

        const imageArrayTextureState = textureState as WebImageArrayTextureState;

        applyMask(texture.mask, maskState, topStack.transformation);

        const imageInfo = getImage(imageElements, texture.fileName);
        drawImageBatch(
          imageInfo.texture,
          imageArrayTextureState,
          topStack.transformation,
          topStack.opacity,
          texture.props
        );

        if (texture.mask) {
          clearMask();
        }
        return;
      }
      if (texture.type === "rectangleArray") {
        if (texture.props.length === 0) return;

        const rectangleArrayTextureState = textureState as WebRectArrayTextureState;

        applyMask(texture.mask, maskState, topStack.transformation);

        drawRectBatch(
          topStack.transformation,
          rectangleArrayTextureState,
          topStack.opacity,
          texture.props
        );

        if (texture.mask) {
          clearMask();
        }
        return;
      }
      if (texture.type === "textArray") {
        if (texture.props.length === 0) return;

        applyMask(texture.mask, maskState, topStack.transformation);

        for (const textProps of texture.props) {
          if (!textProps.show) continue;
          applyTransformMut(topStack.transformation, newMatrix, textProps);
          handleTextTexture(textProps, topStack.opacity);
        }

        if (texture.mask) {
          clearMask();
        }
        return;
      }
      if (texture.type === "circleArray") {
        if (texture.props.length === 0) return;

        const circleArrayTextureState = textureState as WebCircleArrayTextureState;

        applyMask(texture.mask, maskState, topStack.transformation);

        generateCircleArrayPoints(circleArrayTextureState, texture);

        for (let index = 0; index < texture.props.length; index++) {
          const circleProps = texture.props[index];
          if (!circleProps.show) continue;

          applyTransformMut(topStack.transformation, newMatrix, circleProps);

          drawCircle(
            newMatrix,
            circleArrayTextureState.pointsByIndex[index],
            circleProps.color,
            circleProps.radius,
            gameWidth,
            gameHeight,
            pxPerPoint,
            circleProps.opacity * topStack.opacity,
            false
          );
        }

        if (texture.mask) {
          clearMask();
        }
        return;
      }
      if (texture.type === "lineArray") {
        if (texture.props.length === 0) return;

        const lineArrayTextureState = textureState as WebLineArrayTextureState;

        applyMask(texture.mask, maskState, topStack.transformation);

        generateLineArrayState(lineArrayTextureState, texture);

        for (let index = 0; index < texture.props.length; index++) {
          const lineProps = texture.props[index];
          if (!lineProps.show) continue;

          applyTransformMut(topStack.transformation, newMatrix, lineProps);
          handleLineTexture(
            lineProps,
            topStack.opacity,
            lineArrayTextureState.stateByIndex[index]
          );
        }

        if (texture.mask) {
          clearMask();
        }
        return;
      }

      if (!texture.props.show) {
        return;
      }

      applyTransformMut(topStack.transformation, newMatrix, texture.props);
      applyMask(
        texture.props.mask,
        maskState,
        topStack.transformation,
        texture.props.x,
        texture.props.y
      );

      switch (texture.type) {
        case "image":
        case "spriteSheet": {
          const imageInfo = getImage(imageElements, texture.props.fileName);
          drawImage(
            imageInfo.texture,
            newMatrix,
            texture.props.width,
            texture.props.height,
            texture.props.opacity * topStack.opacity,
            texture.type === "spriteSheet" ? texture.props : null
          );
          break;
        }

        case "line": {
          const lineTextureState = textureState as WebLineTextureState;
          handleLineTexture(texture.props, topStack.opacity, lineTextureState);
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

            drawRectGrad(
              newMatrix,
              cacheValue.texture,
              gradient,
              texture.props.width,
              texture.props.height,
              texture.props.opacity * topStack.opacity
            );
          } else {
            drawRect(
              newMatrix,
              texture.props.color,
              texture.props.width,
              texture.props.height,
              texture.props.opacity * topStack.opacity
            );
          }
          break;
        }

        case "circle": {
          const circleTextureState = textureState as WebCircleTextureState;
          drawCircle(
            newMatrix,
            circleTextureState,
            texture.props.color,
            texture.props.radius,
            gameWidth,
            gameHeight,
            pxPerPoint,
            texture.props.opacity * topStack.opacity,
            false
          );
          break;
        }

        case "text": {
          handleTextTexture(texture.props, topStack.opacity);
          break;
        }
      }

      if (texture.props.mask) {
        clearMask();
      }
    },
    startNativeSprite: () => {
      // Avoid other renderers changing attributes
      glVao.bindVertexArrayOES(null);
    },
    endNativeSprite: () => {
      // Could have been reset by a Native Sprite rendering WebGL
      mutRenderState.program = null;
      mutRenderState.texture = null;

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    },
    getInitTextureState: (texture) => {
      switch (texture.type) {
        case "imageArray":
          return {
            matrices: new Float32Array(),
            opacities: new Float32Array(),
          };

        case "line":
          return {
            lineCaps: null,
            linePath: new Float32Array(),
            strokePath: new Float32Array(),
          };

        case "circle":
          return {
            points: new Float32Array(),
          };

        case "rectangleArray":
          return {
            matrices: new Float32Array(),
            colours: new Float32Array(),
          };

        case "circleArray":
          return {
            pointsByIndex: Array.from({
              length: texture.array().length,
            }).map(() => ({ points: new Float32Array() })),
          };

        case "lineArray":
          return {
            stateByIndex: Array.from({
              length: texture.array().length,
            }).map(() => ({
              lineCaps: null,
              linePath: new Float32Array(),
              strokePath: new Float32Array(),
            })),
          };

        default:
          return null;
      }
    },
    getInitMaskState: (maskShape) => {
      if (maskShape === null) return { value: null };

      switch (maskShape.type) {
        case "lineMask":
          return {
            value: {
              type: maskShape.type,
              lineCaps: null,
              linePath: new Float32Array(),
              strokePath: new Float32Array(),
            },
          };

        case "circleMask":
          return {
            value: {
              type: maskShape.type,
              points: new Float32Array(),
            },
          };

        case "rectangleMask":
          return { value: null };
      }
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

export type TextureState =
  | WebCircleTextureState
  | WebCircleArrayTextureState
  | WebImageArrayTextureState
  | WebLineTextureState
  | WebLineArrayTextureState
  | WebRectArrayTextureState
  | null;

export type MaskState = {
  value:
    | ({ type: "circleMask" } & WebCircleTextureState)
    | ({ type: "lineMask" } & WebLineTextureState)
    | null;
};
