import { GameSize, DeviceSize } from "@replay/core";
import { Dimensions } from "./dimensions";

// We use a variable we mutate so that we don't need to calculate the size every
// frame - on window resize we simply mutate the value to update it.
let deviceSize: DeviceSize | undefined;

/**
 * Get the device size, use `setDeviceSize` to update the value.
 */
export function getDeviceSize() {
  return deviceSize;
}

/**
 * Update the device size. This mutates the value received from `getDeviceSize`.
 */
export function setDeviceSize(
  innerWidth: number,
  innerHeight: number,
  dimensions: Dimensions,
  gameSize: GameSize
) {
  const newDeviceSize = calculateDeviceSize(
    innerWidth,
    innerHeight,
    dimensions,
    gameSize
  );
  deviceSize = newDeviceSize;
  return newDeviceSize;
}

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
