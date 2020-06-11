import { SpriteBaseProps } from "@replay/core/dist/props";

/**
 * A mapping of the local Sprite's (x, y) coordinate to parent Sprite
 * coordinates. Opposite of `getLocalCoordsForSprite` in replay-core.
 */
export function getParentCoordsForSprite(baseProps: SpriteBaseProps) {
  const h = baseProps.x;
  const k = baseProps.y;
  const toRad = Math.PI / 180;
  const rotation = -(baseProps.rotation || 0) * toRad;

  return ({ x: anchoredX, y: anchoredY }: { x: number; y: number }) => {
    const rotatedX = anchoredX - baseProps.anchorX;
    const rotatedY = anchoredY - baseProps.anchorY;

    // solve simulataneous equation from replay-core to reverse
    const scaledX =
      h + rotatedX * Math.cos(rotation) - rotatedY * Math.sin(rotation);
    const scaledY =
      k + rotatedX * Math.sin(rotation) + rotatedY * Math.cos(rotation);

    const x = (scaledX - baseProps.x) * baseProps.scaleX + baseProps.x;
    const y = (scaledY - baseProps.y) * baseProps.scaleY + baseProps.y;

    return { x, y };
  };
}
