import { Texture, DeviceSize, TextureFont } from "@replay/core";

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
  imageElements: { [fileName: string]: HTMLImageElement },
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
    render: (textures: Texture[]) => {
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

      textures.forEach((texture) => {
        const position = texture.props.position || { x: 0, y: 0 };
        const drawUtilsCtx = drawUtils(ctx, {
          x: position.x,
          y: -position.y, // game Y axis is inverted to canvas
          rotation: position.rotation || 0,
          opacity: texture.props.opacity ?? 1,
          scaleX: texture.props.scaleX ?? 1,
          scaleY: texture.props.scaleY ?? 1,
          anchorX: texture.props.anchorX || 0,
          anchorY: texture.props.anchorY || 0,
        });
        const drawTexture = getDrawTexture(
          texture,
          drawUtilsCtx,
          imageElements,
          defaultFont
        );
        drawTexture();
      });
    },
  };
}

// this returns a function to ensure all cases of texture.type are handled
function getDrawTexture(
  texture: Texture,
  drawUtilsCtx: ReturnType<typeof drawUtils>,
  imageElements: { [fileName: string]: HTMLImageElement },
  defaultFont: TextureFont
): () => void {
  switch (texture.type) {
    case "text":
      return () =>
        drawUtilsCtx.text(
          texture.props.font || defaultFont,
          texture.props.text,
          texture.props.color
        );
    case "circle":
      return () =>
        drawUtilsCtx.circle(texture.props.radius, texture.props.color);
    case "rectangle":
      return () =>
        drawUtilsCtx.rectangle(
          texture.props.width,
          texture.props.height,
          texture.props.color
        );
    case "line":
      return () =>
        drawUtilsCtx.line(
          texture.props.path,
          texture.props.thickness,
          texture.props.color
        );
    case "image":
      return () => {
        const imageElement = imageElements[texture.props.fileName];
        if (!imageElement) {
          throw Error(`Cannot find image file "${texture.props.fileName}"`);
        }
        drawUtilsCtx.image(
          imageElement,
          texture.props.width,
          texture.props.height
        );
      };
    case "spriteSheet":
      return () =>
        drawUtilsCtx.spriteSheet(
          imageElements[texture.props.fileName],
          texture.props.columns,
          texture.props.rows,
          texture.props.index,
          texture.props.width,
          texture.props.height
        );
  }
}

const toRad = Math.PI / 180;

const drawUtils = (
  ctx: CanvasRenderingContext2D,
  props: {
    x: number;
    y: number;
    rotation: number;
    opacity: number;
    scaleX: number;
    scaleY: number;
    anchorX: number;
    anchorY: number;
  }
) => ({
  circle(radius: number, fillStyle: string) {
    ctx.save();

    const offsetX = radius * props.anchorX;
    const offsetY = radius * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.beginPath();
    ctx.arc(0, 0, Math.round(radius), 0, Math.PI * 2);
    ctx.globalAlpha = props.opacity;
    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  },
  rectangle(width: number, height: number, fillStyle: string) {
    ctx.save();

    const offsetX = (width / 2) * props.anchorX;
    const offsetY = (height / 2) * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.globalAlpha = props.opacity;
    ctx.fillStyle = fillStyle;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.closePath();

    ctx.restore();
  },
  line(path: [number, number][], lineWidth: number, strokeStyle: string) {
    if (path.length < 2) {
      return;
    }

    ctx.save();

    const [[moveToX, moveToY], ...lineTo] = path;

    const { width, height } = getPathSize(path);

    const offsetX = (width / 2) * props.anchorX;
    const offsetY = (height / 2) * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.globalAlpha = props.opacity;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(moveToX, -moveToY);
    lineTo.forEach(([x, y]) => {
      ctx.lineTo(x, -y);
    });
    ctx.stroke();

    ctx.restore();
  },
  text(font: TextureFont, text: string, fillStyle: string) {
    ctx.save();

    const fontString = `${font.size}px ${font.name}`;

    ctx.font = fontString;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const { width } = ctx.measureText(text);
    const height = font.size;

    const offsetX = (width / 2) * props.anchorX;
    const offsetY = (height / 2) * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.font = fontString;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.globalAlpha = props.opacity;
    ctx.fillStyle = fillStyle;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  },
  image(image: HTMLImageElement, width: number, height: number) {
    ctx.save();

    const offsetX = (width / 2) * props.anchorX;
    const offsetY = (height / 2) * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.globalAlpha = props.opacity;
    ctx.drawImage(image, -width / 2, -height / 2, width, height);

    ctx.restore();
  },
  spriteSheet(
    image: HTMLImageElement,
    columns: number,
    rows: number,
    index: number,
    width: number,
    height: number
  ) {
    ctx.save();

    const offsetX = (width / 2) * props.anchorX;
    const offsetY = (height / 2) * props.anchorY;
    ctx.translate(props.x, props.y);
    ctx.rotate(props.rotation * toRad);
    ctx.scale(props.scaleX, props.scaleY);
    ctx.translate(-offsetX, offsetY);

    ctx.globalAlpha = props.opacity;

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

    ctx.restore();
  },
});

function getPathSize(path: [number, number][]) {
  if (path.length < 2) return { width: 0, height: 0 };

  let minX = Number.MAX_SAFE_INTEGER;
  let maxX = -Number.MAX_SAFE_INTEGER;
  let minY = Number.MAX_SAFE_INTEGER;
  let maxY = -Number.MAX_SAFE_INTEGER;

  path.forEach(([x, y]) => {
    if (x > maxX) {
      maxX = x;
    }
    if (x < minX) {
      minX = x;
    }
    if (y > maxY) {
      maxY = y;
    }
    if (y < minY) {
      minY = y;
    }
  });

  return {
    width: maxX - minX,
    height: maxY - minY,
  };
}
