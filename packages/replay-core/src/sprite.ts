import { Device, DeviceSize, Assets } from "./device";
import { Texture } from "./t";
import { MutTexture } from "./t2";
import { SpriteBaseProps, ExcludeSpriteBaseProps } from "./props";

/**
 * A `Sprite` is a texture or custom sprite with props applied to it.
 */
// Use any here since there is a mix of values in a Sprite array
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Sprite<P = any, S = any, I = any> =
  | CustomSprite<P, S, I>
  | PureCustomSprite<P>
  | NativeSprite<P>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ContextSprite<any>
  | MutableSprite<any, any, any>
  | Texture
  | null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PureSprite<P = any> = PureCustomSprite<P> | Texture | null;

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
export function makeSprite<
  P extends ExcludeSpriteBaseProps<P>,
  S = undefined,
  I = {}
>(
  spriteObj: SpriteObj<P, S, I>
): (props: CustomSpriteProps<P>) => CustomSprite<P, S, I> {
  return function makeSpriteCallback(props) {
    return {
      type: "custom",
      spriteObj,
      props,
    };
  };
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
    /**
     * Access state for asynchronous callbacks. If you call this before `init`
     * returns it will throw an error.
     */
    getState: () => S;
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    /**
     * Asset file names to preload for this Sprite. They'll be cleared from
     * memory when the Sprite is unmounted.
     */
    preloadFiles: (assets: Assets) => Promise<void>;
    getContext: <T>(context: Context<T>) => T;
  }) => S;
}

interface SpriteObjBase<P, S, I> {
  /**
   * Called every frame to update the state of the sprite.
   */
  loop?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    getState: () => S;
    getContext: <T>(context: Context<T>) => T;
  }) => S;

  /**
   * Called on sprite unmount.
   */
  cleanup?: (params: { state: Readonly<S>; device: Device }) => void;

  // -- render methods

  /**
   * Return an array of sprites to render. The minimum required for a custom
   * sprite.
   */
  render: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    getState: () => S;
    getContext: <T>(context: Context<T>) => T;
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
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    getState: () => S;
    getContext: <T>(context: Context<T>) => T;
  }) => Sprite[];

  /**
   * An alternative render method run if the device's width or height is beyond
   * `minWidthXL` or `minHeightXL` set in game props.
   */
  renderXL?: (params: {
    props: Readonly<P>;
    state: Readonly<S>;
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    getState: () => S;
    getContext: <T>(context: Context<T>) => T;
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
    device: Device;
    getInputs: () => I;
    updateState: (update: (state: S) => S) => void;
    getState: () => S;
    getContext: <T>(context: Context<T>) => T;
  }) => Sprite[];
}

/**
 * Pure Sprites are an optimisation for dealing with large numbers of Sprites
 * with only a render function. They can only depend on props and device size,
 * and may only return other Pure Sprites or Textures.
 */
export type PureCustomSprite<P> = {
  type: "pure";
  spriteObj: PureSpriteObj<P>;
  props: CustomSpriteProps<P>;
};

/**
 * Function to define a Pure Sprite, returns a new function which can be
 * called to create instance in other Sprites. Example:
 *
 * ```js
 * const Player = makePureSprite({ ... })
 *
 * Player(props)
 * ```
 */
export function makePureSprite<P extends ExcludeSpriteBaseProps<P>>(
  spriteObj: PureSpriteObj<P>
): (props: CustomSpriteProps<P>) => PureCustomSprite<P> {
  return function makePureSpriteCallback(props) {
    return {
      type: "pure",
      spriteObj,
      props,
    };
  };
}

type PureSpriteObj<P> = {
  /**
   * Return whether the render function needs to be called again based on the
   * change of props. Reducing the number of renders can boost performance.
   */
  shouldRerender: (prevProps: P, newProps: P) => boolean;

  /**
   * Return an array of sprites to render.
   */
  render: (params: { props: Readonly<P>; size: DeviceSize }) => PureSprite[];

  /**
   * An alternative render method run if the device is in portrait. Note: this
   * method is only required if the game supports both landscape and portrait,
   * where `render` will only run for landscape.
   */
  renderP?: (params: { props: Readonly<P>; size: DeviceSize }) => PureSprite[];

  /**
   * An alternative render method run if the device's width or height is beyond
   * `minWidthXL` or `minHeightXL` set in game props.
   */
  renderXL?: (params: { props: Readonly<P>; size: DeviceSize }) => PureSprite[];

  /**
   * An alternative render method run if the device is in portrait and its width
   * or height is beyond `minWidthXL` or `minHeightXL` set in game props. Note:
   * this method is only required if the game supports both landscape and
   * portrait, where `renderXL` will only run for landscape.
   */
  renderPXL?: (params: {
    props: Readonly<P>;
    size: DeviceSize;
  }) => PureSprite[];
};

/**
 * Native Sprites are custom platform-specific elements not inside Replay
 * itself, like text inputs. Their name is stored, and implementation
 * dynamically looked up within each platform.
 */
export type NativeSprite<P> = {
  type: "native";
  name: string;
  props: P;
  update?: (thisProps: P) => void;
};

export type NativeSpriteImplementation<P, S> = {
  create: (params: {
    props: P;
    parentGlobalId: string;
    getState: () => S;
    updateState: (mergeState: Partial<S>) => void;
    utils: NativeSpriteUtils;
  }) => S;
  loop: (params: {
    props: P;
    state: S;
    parentGlobalId: string;
    utils: NativeSpriteUtils;
    spriteToGameCoords: <T extends { x: number; y: number }>(
      x: number,
      y: number,
      out: T
    ) => void;
  }) => S;
  cleanup: (params: { state: S; parentGlobalId: string }) => void;
};

export type NativeSpriteUtils = {
  isLastFrame: boolean;
  didResize: boolean;
  scale: number;
  gameXToPlatformX: (x: number) => number;
  gameYToPlatformY: (y: number) => number;
  size: DeviceSize;
};

/**
 * Function to define a Native Sprite, returns a new function which can be
 * called to create an instance in other Sprites. Example:
 *
 * ```js
 * const MyWidget = makeNativeSprite("MyWidget")
 *
 * MyWidget(props)
 * ```
 *
 * An implementation of the Native Sprite must be defined for each platform.
 */
export function makeNativeSprite<P extends { id: string }>(
  name: string
): (props: P, update?: (thisProps: P) => void) => NativeSprite<P> {
  return (props) => ({
    type: "native",
    name,
    props,
  });
}

export type ContextSprite<T> = {
  type: "context";
  context: Context<T>;
  value: T;
  sprites: Sprite[];
};

export type MutContextSprite<T> = {
  type: "mutContext";
  context: Context<T>;
  value: () => T;
  sprites: AllMutSprite[];
};

export type Context<T> = {
  Sprite: (args: { context: T; sprites: Sprite[] }) => ContextSprite<T>;
  Single: (args: {
    context: () => T;
    sprites: AllMutSprite[];
  }) => MutContextSprite<T>;
};

// -- Mutable

export type AllMutSprite =
  | MutableSprite<any, any, any>
  | MutableSpriteArray<any, any, any, any>
  | MutTexture
  | MutConditionalItem
  | MutContextSprite<any>
  | NativeSprite<any>;

export type MutSpriteProps<P> = P &
  Partial<SpriteBaseProps> & {
    /**
     * Only required if NOT in Mutable Sprite
     */
    id?: string;
  };

/**
 * Mutable
 */
export function makeMutableSprite<
  P extends ExcludeSpriteBaseProps<P>,
  S = undefined,
  I = {}
>(spriteObj: MutableSpriteObj<P, S, I>) {
  return {
    Single: function makeSpriteCallback(
      props: MutSpriteProps<P>,
      update?: (thisProps: MutSpriteProps<P>, index: number) => void
    ): MutableSprite<P, S, I> {
      return {
        type: "mutable",
        spriteObj,
        props,
        update,
      };
    },
    Array: function makeSpriteArrayCallback<ItemState>({
      props,
      update,
      filter,
      array,
      key,
    }: {
      props: (itemState: ItemState, index: number) => MutSpriteProps<P>;
      update?: (
        thisProps: MutSpriteProps<P>,
        itemState: ItemState,
        index: number
      ) => void;
      filter?: (itemState: ItemState, index: number) => boolean;
      array: () => ItemState[];
      key: (itemState: ItemState, index: number) => string | number;
    }): MutableSpriteArray<P, S, I, ItemState> {
      return {
        type: "mutableArray",
        spriteObj,
        props,
        update,
        filter,
        array,
        key,
      };
    },
  };
}

export interface MutableSprite<P, S, I> {
  type: "mutable";
  spriteObj: MutableSpriteObj<P, S, I>;
  props: MutSpriteProps<P>;
  update?: (arg: P, index: number) => void;
}
export interface MutableSpriteArray<P, S, I, ItemState> {
  type: "mutableArray";
  spriteObj: MutableSpriteObj<P, S, I>;
  props: (itemState: ItemState, index: number) => MutSpriteProps<P>;
  update?: (thisProps: P, itemState: ItemState, index: number) => void;
  filter?: (itemState: ItemState, index: number) => boolean;
  array: () => ItemState[];
  key: (itemState: ItemState, index: number) => string | number;
}

type MutableSpriteObj<P, S, I> = S extends undefined
  ? Partial<MutableSpriteObjInit<P, S, I>> & MutableSpriteObjBase<P, S, I>
  : MutableSpriteObjInit<P, S, I> & MutableSpriteObjBase<P, S, I>;

interface MutableSpriteObjInit<P, S, I> {
  /**
   * Called on sprite mount. Returns initial state.
   */
  init: (params: {
    props: Readonly<P>;
    getState: () => S;
    device: Device;
    getInputs: () => I;
    /**
     * Asset file names to preload for this Sprite. They'll be cleared from
     * memory when the Sprite is unmounted.
     */
    preloadFiles: (assets: Assets) => Promise<void>;
    getContext: <T>(context: Context<T>) => T;
  }) => S;
}

interface MutableSpriteObjBase<P, S, I> {
  /**
   * Called every frame to update the state of the sprite.
   */
  loop?: (params: {
    props: Readonly<P>;
    state: S;
    device: Device;
    getInputs: () => I;
    getContext: <T>(context: Context<T>) => T;
  }) => void;

  /**
   * Called on sprite unmount.
   */
  cleanup?: (params: { state: Readonly<S>; device: Device }) => void;

  // -- render methods

  /**
   * Return an array of sprites to render. The minimum required for a custom
   * sprite.
   */
  render: (params: {
    props: Readonly<P>;
    state: S;
    device: Device;
    getInputs: () => I;
    getContext: <T>(context: Context<T>) => T;
  }) => AllMutSprite[];
}

export const r = {
  if: (
    condition: () => boolean,
    sprites: () => AllMutSprite[]
  ): MutConditionalItem => {
    return {
      type: "conditional",
      condition,
      trueSprites: sprites,
      falseSprites: () => [],
    };
  },
  ifElse: (
    condition: () => boolean,
    trueSprites: () => AllMutSprite[],
    falseSprites: () => AllMutSprite[]
  ): MutConditionalItem => {
    return {
      type: "conditional",
      condition,
      trueSprites,
      falseSprites,
    };
  },
};

export type MutConditionalItem = {
  type: "conditional";
  condition: () => boolean;
  trueSprites: () => AllMutSprite[];
  falseSprites: () => AllMutSprite[];
};
