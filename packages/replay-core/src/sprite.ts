import { Device } from "./device";
import { Texture } from "./t";
import { SpriteBaseProps } from "./props";

/**
 * A `Sprite` is a texture or custom sprite with props applied to it.
 */
// Use any here since there is a mix of values in a Sprite array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sprite<P = any, S = any, I = any> =
  | CustomSprite<P, S, I>
  | Texture
  | null;

/**
 * Function to define a custom sprite, returns a new function which can be
 * called to create instance in other sprites. Example:
 *
 * ```js
 * const Player = makeSprite({ ... })
 *
 * Player(props)
 * ```
 */
export function makeSprite<P, S = undefined, I = {}>(
  spriteObj: SpriteObj<P, S, I>
): (props: CustomSpriteProps<P>) => CustomSprite<P, S, I> {
  return (props) => ({
    type: "custom",
    spriteObj,
    props,
  });
}

export interface CustomSprite<P, S, I> {
  type: "custom";
  spriteObj: SpriteObj<P, S, I>;
  props: CustomSpriteProps<P>;
}

export type CustomSpriteProps<P> = P &
  Partial<SpriteBaseProps> & {
    /**
     * Identifier, must be unique within a single render function.
     */
    id: string;
  };

// make init function optional if no state is defined by user
export type SpriteObj<P, S, I> = S extends undefined
  ? Partial<SpriteObjInit<P, S, I>> & SpriteObjBase<P, S, I>
  : SpriteObjInit<P, S, I> & SpriteObjBase<P, S, I>;

interface SpriteObjInit<P, S, I> {
  /**
   * Called on sprite mount. Returns initial state.
   */
  init: (params: {
    props: Readonly<P>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
  }) => S;
}

interface SpriteObjBase<P, S, I> {
  /**
   * Called every frame to update the state of the sprite.
   */
  loop?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
  }) => S;

  // -- render methods

  /**
   * Return an array of sprites to render. The minimum required for a custom
   * sprite.
   */
  render: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
    /**
     * A value between 0 and 1 representing how much time has passed before
     * the next frame is scheduled.
     */
    extrapolateFactor: number;
  }) => Sprite[];

  /**
   * An alternative render method run if the device is in portrait. Note: this
   * method is only required if the game support both landscape and portrait,
   * where `render` will only run for landscape.
   */
  renderP?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
  }) => Sprite[];

  /**
   * An alternative render method run if the device's width or height is beyond
   * `minWidthXL` or `minHeightXL` set in game props.
   */
  renderXL?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
  }) => Sprite[];

  /**
   * An alternative render method run if the device is in portrait and its width
   * or height is beyond `minWidthXL` or `minHeightXL` set in game props. Note:
   * this method is only required if the game support both landscape and
   * portrait, where `renderXL` will only run for landscape.
   */
  renderPXL?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device<I>;
    updateState: (update: (state: S) => S) => void;
  }) => Sprite[];
}

/**
 * A nesting of textures sent to the platform to render. The nesting allows for
 * things like transforms on a Sprite.
 */
export type SpriteTextures = {
  id: string;
  baseProps: SpriteBaseProps;
  textures: (SpriteTextures | Texture)[];
};
