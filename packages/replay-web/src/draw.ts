import { Texture, DeviceSize, TextureFont } from "@replay/core";
import { SpriteTextures } from "@replay/core/dist/sprite";
import { SpriteBaseProps } from "@replay/core/dist/props";
import { MaskShape } from "@replay/core/dist/mask";

export type ImageMap = {
  [fileName: string]: {
    /**
     * Which Sprites are using this asset
     */
    globalSpriteIds: Set<string>;
    image: HTMLImageElement;
  };
};

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
  imageElements: ImageMap,
  defaultFont: TextureFont
) {
  ctx.save();
  const scale = Math.min(deviceWidth / width, deviceHeight / height);
  const fullWidth = width + widthMargin * 2;
  const fullHeight = height + heightMargin * 2;
  ctx.translate(deviceWidth / 2, deviceHeight / 2);
  ctx.scale(scale, scale);
  return {
    scale,
    render: (spriteTextures: SpriteTextures) => {
      // First clear rect
      ctx.clearRect(
        -deviceWidth / 2 / scale,
        -deviceHeight / 2 / scale,
        deviceWidth / scale,
        deviceHeight / scale
      );
      // Set white background for game
      ctx.fillStyle = "white";
      ctx.fillRect(-fullWidth / 2, -fullHeight / 2, fullWidth, fullHeight);

      drawSpriteTextures(spriteTextures, ctx, imageElements, defaultFont);
    },
  };
}

function drawSpriteTextures(
  spriteTextures: SpriteTextures,
  ctx: CanvasRenderingContext2D,
  imageElements: ImageMap,
  defaultFont: TextureFont
) {
  const { baseProps, textures } = spriteTextures;

  ctx.save();

  transformCanvas(ctx, baseProps);

  textures.forEach((texture) => {
    if ("type" in texture) {
      // Is a texture to draw
      const drawUtilsCtx = drawUtils(ctx);

      ctx.save();
      transformCanvas(ctx, texture.props, baseProps.opacity);
      drawTexture(texture, drawUtilsCtx, imageElements, defaultFont);
      ctx.restore();

      return;
    }
    // Recursively draw SpriteTexture
    drawSpriteTextures(texture, ctx, imageElements, defaultFont);
  });

  ctx.restore();
}

// this returns 0 to ensure all cases of texture.type are handled
function drawTexture(
  texture: Texture,
  drawUtilsCtx: ReturnType<typeof drawUtils>,
  imageElements: ImageMap,
  defaultFont: TextureFont
): 0 {
  switch (texture.type) {
    case "text":
      drawUtilsCtx.text(
        texture.props.font || defaultFont,
        texture.props.text,
        texture.props.align,
        texture.props.color
      );
      return 0;
    case "circle":
      drawUtilsCtx.circle(texture.props.radius, texture.props.color);
      return 0;
    case "rectangle":
      drawUtilsCtx.rectangle(
        texture.props.width,
        texture.props.height,
        texture.props.color
      );
      return 0;
    case "line":
      drawUtilsCtx.line(
        texture.props.path,
        texture.props.thickness,
        texture.props.color,
        texture.props.fillColor,
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

const getImage = (imageElements: ImageMap, fileName: string) => {
  const imageElement = imageElements[fileName];
  if (!imageElement) {
    throw Error(`Image file "${fileName}" was not preloaded`);
  }
  return imageElement.image;
};

const toRad = Math.PI / 180;

/**
 * Apply base props to the canvas context
 */
const transformCanvas = (
  ctx: CanvasRenderingContext2D,
  baseProps: SpriteBaseProps,
  parentOpacity = 1
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

  ctx.translate(x, -y);
  ctx.rotate(rotation * toRad);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-anchorX, anchorY);
  ctx.globalAlpha = opacity * parentOpacity;

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
  circle(radius: number, fillStyle: string) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.round(radius), 0, Math.PI * 2);
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.closePath();
  },
  rectangle(width: number, height: number, fillStyle: string) {
    ctx.fillStyle = fillStyle;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.closePath();
  },
  line(
    path: [number, number][],
    lineWidth: number,
    strokeStyle: string | undefined,
    fillStyle: string | undefined,
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

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = lineCap;
      ctx.stroke();
    }
  },
  text(
    font: TextureFont,
    text: string,
    align: "left" | "center" | "right",
    fillStyle: string
  ) {
    const fontString = `${font.size}px ${font.name}`;
    ctx.font = fontString;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    ctx.fillStyle = fillStyle;
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
