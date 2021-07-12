import { GameSize, DeviceSize } from "@replay/core";
import { Dimensions } from "./dimensions";

export function calculateDeviceSize(
  innerWidth: number,
  innerHeight: number,
  dimensions: Dimensions,
  size: GameSize
): DeviceSize {
  let orientationSize;
  if ("portrait" in size) {
    const isPortrait = innerHeight > innerWidth;
    orientationSize = isPortrait ? size.portrait : size.landscape;
  } else {
    orientationSize = size;
  }
  const {
    width,
    height,
    maxWidthMargin = 0,
    maxHeightMargin = 0,
  } = orientationSize;

  if (dimensions === "game-coords") {
    return {
      width,
      height,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: width,
      deviceHeight: height,
    };
  }

  // scale the game up into browser window
  const windowWidthHeightRatio = innerWidth / innerHeight;
  const gameWidthHeightRatio = width / height;

  if (dimensions === "scale-up-proportional") {
    // find max height & width based on screen size
    const landscapeLayout = gameWidthHeightRatio > windowWidthHeightRatio;
    const scaleUnrounded = landscapeLayout
      ? innerWidth / width
      : innerHeight / height;
    const scale = Math.floor(scaleUnrounded);

    return {
      width,
      height,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: width * scale,
      deviceHeight: height * scale,
    };
  }

  if (gameWidthHeightRatio > windowWidthHeightRatio) {
    // game is wider than window, so set width to match window and scale height with margin
    const scaledWidth = innerWidth;
    const noMarginScaledHeight = scaledWidth / gameWidthHeightRatio;
    const scaledMaxHeightMargin =
      (noMarginScaledHeight / height) * maxHeightMargin;
    const scaledHeight = Math.min(
      innerHeight,
      noMarginScaledHeight + scaledMaxHeightMargin * 2
    );
    return {
      width,
      height,
      widthMargin: 0,
      // height margin in px, then convert to game coordinates
      heightMargin:
        ((scaledHeight - noMarginScaledHeight) / 2) *
        (height / noMarginScaledHeight),
      deviceWidth: scaledWidth,
      deviceHeight: scaledHeight,
    };
  } else {
    // game is taller than window, so set height to match window and scale width
    // with margin
    const scaledHeight = innerHeight;
    const noMarginScaledWidth = scaledHeight * gameWidthHeightRatio;
    const scaledMaxWidthMargin = (noMarginScaledWidth / width) * maxWidthMargin;
    const scaledWidth = Math.min(
      innerWidth,
      noMarginScaledWidth + scaledMaxWidthMargin * 2
    );
    return {
      width,
      height,
      widthMargin:
        ((scaledWidth - noMarginScaledWidth) / 2) *
        (width / noMarginScaledWidth),
      heightMargin: 0,
      deviceWidth: scaledWidth,
      deviceHeight: scaledHeight,
    };
  }
}
