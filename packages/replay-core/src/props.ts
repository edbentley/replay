import { MaskShape } from "./mask";

export type SpriteBaseProps = {
  /**
   * x coordinate of Sprite.
   * @default 0
   */
  x: number;
  /**
   * y coordinate of Sprite.
   * @default 0
   */
  y: number;
  /**
   * Rotation of Sprite around anchor point in degrees (clockwise).
   * @default 0
   */
  rotation: number;
  /**
   * A number between 0 and 1.
   * @default 1
   */
  opacity: number;
  /**
   * Scale the Texture horizontally around the anchor point.
   * @default 1
   */
  scaleX: number;
  /**
   * Scale the Texture vertically around the anchor point.
   * @default 1
   */
  scaleY: number;
  /**
   * Move the x anchor point in game coordinates from the center point of the Sprite.
   * @default 0.
   */
  anchorX: number;
  /**
   * Move the y anchor point in game coordinates from the center point of the Sprite.
   * @default 0.
   */
  anchorY: number;
  /**
   * Only render the content that fits within the outline of this shape.
   */
  mask: MaskShape;
};

/**
 * Avoid being able to use props with the same key as base props
 */
export type ExcludeSpriteBaseProps<P> = {
  [K in keyof P]: K extends keyof SpriteBaseProps ? never : P[K];
};

export function getDefaultProps(
  props: Partial<SpriteBaseProps>
): SpriteBaseProps {
  return {
    x: props.x || 0,
    y: props.y || 0,
    rotation: props.rotation || 0,
    opacity: Math.min(1, Math.max(0, props.opacity ?? 1)),
    scaleX: props.scaleX ?? 1,
    scaleY: props.scaleY ?? 1,
    anchorX: props.anchorX || 0,
    anchorY: props.anchorY || 0,
    mask: props.mask || null,
  };
}

export function mutateBaseProps(
  prevBaseProps: SpriteBaseProps,
  props: Partial<SpriteBaseProps>
) {
  prevBaseProps.x = props.x || 0;
  prevBaseProps.y = props.y || 0;
  prevBaseProps.rotation = props.rotation || 0;
  prevBaseProps.opacity = Math.min(1, Math.max(0, props.opacity ?? 1));
  prevBaseProps.scaleX = props.scaleX ?? 1;
  prevBaseProps.scaleY = props.scaleY ?? 1;
  prevBaseProps.anchorX = props.anchorX || 0;
  prevBaseProps.anchorY = props.anchorY || 0;
  prevBaseProps.mask = props.mask || null;
}
