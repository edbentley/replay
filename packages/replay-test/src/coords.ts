import { SpriteBaseProps } from "@replay/core/dist/props";

/**
 * A mapping of the local Sprite's (x, y) coordinate to parent Sprite
 * coordinates. Opposite of `getLocalCoordsForSprite` in replay-core.
 */
export function getParentCoordsForSprite(baseProps: SpriteBaseProps) {
  const toRad = Math.PI / 180;
  const rotation = -(baseProps.rotation || 0) * toRad;

  return ({ x: anchoredX, y: anchoredY }: { x: number; y: number }) => {
    const scaledX = anchoredX - baseProps.anchorX;
    const scaledY = anchoredY - baseProps.anchorY;

    const rotatedX = scaledX * baseProps.scaleX;
    const rotatedY = scaledY * baseProps.scaleY;

    // solve simulataneous equation from replay-core to reverse
    const relativeX =
      rotatedX * Math.cos(rotation) - rotatedY * Math.sin(rotation);
    const relativeY =
      rotatedX * Math.sin(rotation) + rotatedY * Math.cos(rotation);

    const x = relativeX + baseProps.x;
    const y = relativeY + baseProps.y;

    return { x, y };
  };
}
