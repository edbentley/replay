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
    const scaledX = anchoredX - baseProps.anchorX;
    const scaledY = anchoredY - baseProps.anchorY;

    const rotatedX = (scaledX - baseProps.x) * baseProps.scaleX + baseProps.x;
    const rotatedY = (scaledY - baseProps.y) * baseProps.scaleY + baseProps.y;

    // solve simulataneous equation from replay-core to reverse
    const x = h + rotatedX * Math.cos(rotation) - rotatedY * Math.sin(rotation);
    const y = k + rotatedX * Math.sin(rotation) + rotatedY * Math.cos(rotation);

    return { x, y };
  };
}
