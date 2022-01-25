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
  /**
   * Show or hide texture
   * @default true
   */
  show: boolean; // TODO: only in Textures currently
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
    show: props.show || true,
  };
}

export function mutateBaseProps<T extends SpriteBaseProps>(
  mutProps: Omit<T, keyof SpriteBaseProps>,
  props: Partial<SpriteBaseProps>
): T {
  const toAddProps = mutProps as T;
  toAddProps.x = props.x || 0;
  toAddProps.y = props.y || 0;
  toAddProps.rotation = props.rotation || 0;
  toAddProps.opacity = Math.min(1, Math.max(0, props.opacity ?? 1));
  toAddProps.scaleX = props.scaleX ?? 1;
  toAddProps.scaleY = props.scaleY ?? 1;
  toAddProps.anchorX = props.anchorX || 0;
  toAddProps.anchorY = props.anchorY || 0;
  toAddProps.mask = props.mask || null;
  toAddProps.show = props.show ?? true;
  return toAddProps;
}
