import { Texture, DeviceSize, TextureFont } from "@replay/core";
import { SpriteBaseProps } from "@replay/core/dist/props";
import { MaskShape } from "@replay/core/dist/mask";
import { AssetMap } from "@replay/core/dist/device";
import { PlatformRender } from "@replay/core/dist/core";
import { ImageFileData } from "./device";
import { Gradient } from "@replay/core/dist/t";

export type WebRender = PlatformRender;

export function drawCanvas(
  ctx: CanvasRenderingContext2D,
  {
    width,
    height,
    widthMargin,
    heightMargin,
    deviceWidth,
    deviceHeight,
  }: DeviceSize,
  devicePixelRatio: number,
  imageElements: AssetMap<ImageFileData>,
  defaultFont: TextureFont
): { scale: number; render: PlatformRender } {
  // Init setting up device size
  ctx.save();

  // Scale to pixel ratio for sharper graphics
  const deviceWidthPx = deviceWidth * devicePixelRatio;
  const deviceHeightPx = deviceHeight * devicePixelRatio;

  const fullWidth = width + widthMargin * 2;
  const fullHeight = height + heightMargin * 2;
  ctx.translate(deviceWidthPx / 2, deviceHeightPx / 2);

  const scale = deviceWidthPx / fullWidth;
  ctx.scale(scale, scale);

  const drawUtilsCtx = drawUtils(ctx);

  return {
    // Scale of device points (not pixels) to game
    scale: deviceWidth / fullWidth,
    render: {
      newFrame: () => {
        // First clear rect
        ctx.clearRect(-fullWidth / 2, -fullHeight / 2, fullWidth, fullHeight);
        // Set white background for game
        ctx.fillStyle = "white";
        ctx.fillRect(-fullWidth / 2, -fullHeight / 2, fullWidth, fullHeight);
      },
      startRenderSprite: (baseProps) => {
        ctx.save();

        const globalAlpha =
          baseProps.opacity * drawUtilsCtx.globalAlphaStack[0];

        transformCanvas(ctx, baseProps, globalAlpha);

        drawUtilsCtx.globalAlphaStack.unshift(globalAlpha);
      },
      endRenderSprite: () => {
        ctx.restore();
        drawUtilsCtx.globalAlphaStack.shift();
      },
      renderTexture: (texture) => {
        ctx.save();

        const globalAlpha =
          texture.props.opacity * drawUtilsCtx.globalAlphaStack[0];

        transformCanvas(ctx, texture.props, globalAlpha);
        drawTexture(texture, drawUtilsCtx, imageElements, defaultFont);

        ctx.restore();
      },
    },
  };
}

// this returns 0 to ensure all cases of texture.type are handled
function drawTexture(
  texture: Texture,
  drawUtilsCtx: ReturnType<typeof drawUtils>,
  imageElements: AssetMap<ImageFileData>,
  defaultFont: TextureFont
): 0 {
  switch (texture.type) {
    case "text":
      const fontDetails = { ...defaultFont, ...texture.props.font };
      drawUtilsCtx.text(
        fontDetails,
        texture.props.text,
        texture.props.color,
        texture.props.gradient,
        texture.props.strokeColor,
        texture.props.strokeThickness
      );
      return 0;
    case "circle":
      drawUtilsCtx.circle(
        texture.props.radius,
        texture.props.color,
        texture.props.gradient
      );
      return 0;
    case "rectangle":
      drawUtilsCtx.rectangle(
        texture.props.width,
        texture.props.height,
        texture.props.color,
        texture.props.gradient
      );
      return 0;
    case "line":
      drawUtilsCtx.line(
        texture.props.path,
        texture.props.thickness,
        texture.props.color,
        texture.props.fillColor,
        texture.props.gradient,
        texture.props.fillGradient,
        texture.props.lineCap
      );
      return 0;
    case "image":
      drawUtilsCtx.image(
        getImage(imageElements, texture.props.fileName),
        texture.props.width,
        texture.props.height
      );
      return 0;
    case "spriteSheet":
      drawUtilsCtx.spriteSheet(
        getImage(imageElements, texture.props.fileName),
        texture.props.columns,
        texture.props.rows,
        texture.props.index,
        texture.props.width,
        texture.props.height
      );
      return 0;
  }
}

const generateGradient = (
  ctx: CanvasRenderingContext2D,
  gradient: Gradient
): CanvasGradient => {
  const [[x1, y1], [x2, y2]] = gradient.path;

  const canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);

  gradient.colors.forEach(({ offset, color }) => {
    canvasGradient.addColorStop(offset, color);
  });

  return canvasGradient;
};

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

const toRad = Math.PI / 180;

/**
 * Apply base props to the canvas context
 */
const transformCanvas = (
  ctx: CanvasRenderingContext2D,
  baseProps: SpriteBaseProps,
  globalAlpha: number
) => {
  const {
    x,
    y,
    rotation,
    scaleX,
    scaleY,
    anchorX,
    anchorY,
    opacity,
  } = baseProps;

  if (x !== 0 || y !== 0) {
    ctx.translate(x, -y);
  }
  if (rotation !== 0) {
    ctx.rotate(rotation * toRad);
  }
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.scale(scaleX, scaleY);
  }
  if (anchorX !== 0 || anchorY !== 0) {
    ctx.translate(-anchorX, anchorY);
  }
  if (opacity !== 1) {
    // This will only need to change if not 1
    ctx.globalAlpha = globalAlpha;
  }

  applyMask(ctx, baseProps.mask);
};

// Return 0 to ensure switch is exhaustive
function applyMask(ctx: CanvasRenderingContext2D, mask: MaskShape): 0 {
  if (!mask) return 0;
  switch (mask.type) {
    case "lineMask": {
      const [[moveToX, moveToY], ...lineTo] = mask.path;

      ctx.beginPath();
      ctx.moveTo(moveToX, -moveToY);
      lineTo.forEach(([x, y]) => {
        ctx.lineTo(x, -y);
      });

      ctx.clip();
      return 0;
    }

    case "circleMask": {
      ctx.beginPath();
      ctx.arc(mask.x, -mask.y, Math.round(mask.radius), 0, Math.PI * 2);

      ctx.clip();
      return 0;
    }

    case "rectangleMask": {
      ctx.beginPath();
      ctx.rect(
        mask.x - mask.width / 2,
        -mask.y - mask.height / 2,
        mask.width,
        mask.height
      );

      ctx.clip();
      return 0;
    }
  }
}

const drawUtils = (ctx: CanvasRenderingContext2D) => ({
  globalAlphaStack: [1],
  circle(radius: number, color: string, gradient?: Gradient) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.round(radius), 0, Math.PI * 2);
    ctx.fillStyle = gradient ? generateGradient(ctx, gradient) : color;
    ctx.fill();
    ctx.closePath();
  },
  rectangle(width: number, height: number, color: string, gradient?: Gradient) {
    ctx.fillStyle = gradient ? generateGradient(ctx, gradient) : color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.closePath();
  },
  line(
    path: [number, number][],
    lineWidth: number,
    strokeColor: string | undefined,
    fillColor: string | undefined,
    strokeGradient: Gradient | undefined,
    fillGradient: Gradient | undefined,
    lineCap: "butt" | "round" | "square"
  ) {
    if (path.length < 2) {
      return;
    }
    const [[moveToX, moveToY], ...lineTo] = path;

    ctx.beginPath();
    ctx.moveTo(moveToX, -moveToY);
    lineTo.forEach(([x, y]) => {
      ctx.lineTo(x, -y);
    });

    if (fillGradient) {
      ctx.fillStyle = generateGradient(ctx, fillGradient);
      ctx.fill();
    } else if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    if (strokeGradient) {
      ctx.strokeStyle = generateGradient(ctx, strokeGradient);
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.stroke();
    } else if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.stroke();
    }
  },
  text(
    font: TextureFont,
    text: string,
    color: string,
    gradient?: Gradient,
    strokeColor?: string,
    strokeThickness = 1
  ) {
    const { size, weight = "normal", style = "normal", family } = font;
    const fontString = `${style} ${weight} ${size ? `${size}px` : ""} ${
      family ? `${family}` : ""
    }`;
    ctx.font = fontString;
    ctx.textBaseline = font.baseline || "middle";
    ctx.textAlign = font.align || "center";

    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeThickness;
      ctx.strokeText(text, 0, 0);
    }

    ctx.fillStyle = gradient ? generateGradient(ctx, gradient) : color;
    ctx.fillText(text, 0, 0);
  },
  image(image: HTMLImageElement, width: number, height: number) {
    ctx.drawImage(image, -width / 2, -height / 2, width, height);
  },
  spriteSheet(
    image: HTMLImageElement,
    columns: number,
    rows: number,
    index: number,
    width: number,
    height: number
  ) {
    const tileWidth = image.width / columns;
    const tileHeight = image.height / rows;

    const columnIndex = index % columns;
    const rowIndex = Math.floor(index / columns) % rows;
    ctx.drawImage(
      image,
      columnIndex * tileWidth,
      rowIndex * tileHeight,
      tileWidth,
      tileHeight,
      -width / 2,
      -height / 2,
      width,
      height
    );
  },
});
