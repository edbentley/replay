import { Texture, DeviceSize, TextureFont } from "@replay/core";
import { SpriteBaseProps } from "@replay/core/dist/props";
import { MaskShape } from "@replay/core/dist/mask";
import { AssetMap } from "@replay/core/dist/device";
import { PlatformRender } from "@replay/core/dist/core";
import * as PIXI from "pixi.js";
import { ImageFileData } from "./device";

export type WebRender = PlatformRender;

export function drawCanvas(
  {
    width,
    height,
    widthMargin,
    heightMargin,
    deviceWidth,
    deviceHeight,
  }: DeviceSize,
  imageElements: AssetMap<ImageFileData>,
  defaultFont: TextureFont
): { scale: number; render: PlatformRender } {
  // Init setting up device size

  const scale = Math.min(deviceWidth / width, deviceHeight / height);

  const renderer = new PIXI.Renderer({
    width: width,
    height: height,
    backgroundColor: 0x1099bb,
    resolution: scale,
  });

  const stage = new PIXI.Container();

  document.body.appendChild(renderer.view);

  const textures: Record<
    string,
    { texture: Texture; object: PIXI.Container }
  > = {};

  return {
    scale,
    render: {
      newFrame: () => {
        renderer.render(stage);
      },
      newSprite: (platformStuff, baseProps) => {
        const container = new PIXI.Container();
        container.sortableChildren = true;
        transformContainer(container, baseProps);

        const parentContainer: PIXI.Container = platformStuff.data || stage;
        parentContainer.addChild(container);

        // Game sprite
        if (!platformStuff.data) {
          container.x = renderer.screen.width / 2;
          container.y = renderer.screen.height / 2;
        }

        return {
          type: "platformStuff",
          data: container,
        };
      },
      removeSprite: (platformStuff) => {
        const container = platformStuff.data as PIXI.Container;

        container.parent.removeChild(container);
      },
      enterSprite: (platformStuff, baseProps) => {
        const container = platformStuff.data as PIXI.Container;

        // container.x = container.parent.width / 2;
        // container.y = container.parent.height / 2;

        transformContainer(container, baseProps);
      },
      exitSprite: () => {
        // No-op
      },
      removeTexture: (parentStuff, globalId) => {
        const parentContainer = parentStuff.data as PIXI.Container;

        console.log("remove", globalId);

        const { object } = textures[globalId];
        parentContainer.removeChild(object);
        delete textures[globalId];
      },
      renderTexture: (parentStuff, globalId, texture, isNew) => {
        const parentContainer = parentStuff.data as PIXI.Container;

        if (isNew) {
          if (texture.type === "rectangle") {
            const graphic = new PIXI.Graphics();

            graphic.beginFill(0xff3300);
            graphic.drawRect(
              -texture.props.width / 2,
              -texture.props.height / 2,
              texture.props.width,
              texture.props.height
            );
            parentContainer.addChild(graphic);
            textures[globalId] = { texture, object: graphic };
          } else if (texture.type === "text") {
            // const text = new PIXI.Text(texture.props.text, {
            //   fill: "#333333",
            //   fontSize: 40,
            //   fontWeight: "bold",
            // });
            // text.x = texture.props.x;
            // text.y = texture.props.y;
            // parentContainer.addChild(text);
          } else if (texture.type === "image") {
            const imageTexture = PIXI.Texture.from(
              // assets dir for dev
              `${texture.props.fileName}`
            );
            const image = new PIXI.Sprite(imageTexture);
            image.width = texture.props.width;
            image.height = texture.props.height;
            image.anchor.set(0.5);

            // image.x = -texture.props.width / 2;
            // image.y = -texture.props.width / 2;

            parentContainer.addChild(image);
            textures[globalId] = { texture, object: image };
          }
        }
        // Move texture according to props
        const val = textures[globalId];
        if (!val) return;
        transformContainer(val.object, texture.props);
      },
    },
  };
}

const toRad = Math.PI / 180;

/**
 * Apply base props to the canvas context
 */
const transformContainer = (
  container: PIXI.Container,
  baseProps: SpriteBaseProps
  // currGlobalAlpha: number
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

  // Center sprite in local container coordinates
  // container.pivot.x = container.width / 2;
  // container.pivot.y = container.height / 2;

  if (x !== 0 || y !== 0) {
    container.x = x;
    container.y = -y;
  }
  if (rotation !== 0) {
    container.rotation = toRad * rotation;
  }
  if (scaleX !== 1 || scaleY !== 1) {
    // TODO
    // container.scale = new PIXI.ObservablePoint(scaleX, scaleY);
  }
  if (anchorX !== 0 || anchorY !== 0) {
    // TODO
  }
  // if (opacity !== currGlobalAlpha) {
  container.alpha = opacity;
  // }

  // TODO
  // applyMask(ctx, baseProps.mask);
};
