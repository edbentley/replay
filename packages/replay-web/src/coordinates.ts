/**
 * Convert game's `x` coordinate to DOM `x` coordinate
 */
export const getGameXToWebX = ({
  canvasOffsetLeft,
  widthMargin,
  scale,
  width,
}: {
  canvasOffsetLeft: number;
  widthMargin: number;
  scale: number;
  width: number;
}) => (gameX: number) => {
  return canvasOffsetLeft + scale * (gameX + width / 2 + widthMargin);
};

/**
 * Convert game's `y` coordinate to DOM `y` coordinate
 */
export const getGameYToWebY = ({
  canvasOffsetTop,
  heightMargin,
  scale,
  height,
}: {
  canvasOffsetTop: number;
  heightMargin: number;
  scale: number;
  height: number;
}) => (gameY: number) => {
  return canvasOffsetTop - scale * (gameY - height / 2 - heightMargin);
};
