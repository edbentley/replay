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

  if (
    dimensions === "game-coords" ||
    // avoid dividing by 0s
    innerWidth === 0 ||
    innerHeight === 0
  ) {
    return {
      width,
      height,
      widthMargin: 0,
      heightMargin: 0,
      fullWidth: width,
      fullHeight: height,
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
    const heightMargin =
      ((scaledHeight - noMarginScaledHeight) / 2) *
      (height / noMarginScaledHeight);

    return {
      width,
      height,
      widthMargin: 0,
      // height margin in px, then convert to game coordinates
      heightMargin,
      fullWidth: width,
      fullHeight: height + heightMargin * 2,
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
    const widthMargin =
      ((scaledWidth - noMarginScaledWidth) / 2) * (width / noMarginScaledWidth);

    return {
      width,
      height,
      widthMargin,
      heightMargin: 0,
      fullWidth: width + widthMargin * 2,
      fullHeight: height,
      deviceWidth: scaledWidth,
      deviceHeight: scaledHeight,
    };
  }
}
