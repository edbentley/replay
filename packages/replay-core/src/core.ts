import { TextureFont, Texture } from "./t";
import {
  CustomSprite,
  Sprite,
  CustomSpriteProps,
  SpriteTextures,
  NativeSpriteImplementation,
  NativeSpriteUtils,
  PureSprite,
  PureCustomSprite,
} from "./sprite";
import { Device, DeviceSize } from "./device";
import { SpriteBaseProps, getDefaultProps } from "./props";

/**
 * The props type a game should take.
 */
export interface GameProps {
  id: "Game";
  size: GameSize;
  defaultFont?: TextureFont;
}

/**
 * The size of a game
 */
export type GameSize =
  // Orientation calculated by ratio of width and height
  | GameOrientationSize
  // Support both portrait and landscape
  | {
      portrait: GameOrientationSize;
      landscape: GameOrientationSize;
    };

/**
 * Type representing the game orientation
 */
export interface GameOrientationSize {
  width: number;
  height: number;
  /**
   * The minimum width of device in px for XL render methods to be used. Omit to
   * not use XL.
   */
  minWidthXL?: number;
  /**
   * The minimum height of device in px for XL render methods to be used. Omit
   * to not use XL.
   */
  minHeightXL?: number;
  /**
   * The max allowed margin on left and right of game in game coordinates.
   * @default 0
   */
  maxWidthMargin?: number;
  /**
   * The max allowed margin on top and bottom of game in game coordinates.
   * @default 0
   */
  maxHeightMargin?: number;
}

/**
 * Interface a platform that implements Replay must fit.
 */
export interface ReplayPlatform<I> {
  /**
   * This returns `getDevice`, which is a callback that can be shared every
   * frame.
   *
   * `getDevice` can then be called individually by each Sprite to get inputs
   * relative to its position
   */
  getGetDevice: () => (
    getLocalCoords: (globalCoords: {
      x: number;
      y: number;
    }) => { x: number; y: number }
  ) => Device<I>;
}

export type NativeSpriteMap = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NativeSpriteImplementation<any, any> | undefined
>;

export function replayCore<S, I>(
  platform: ReplayPlatform<I>,
  nativeSpriteSettings: NativeSpriteSettings,
  gameSprite: CustomSprite<GameProps, S, I>,
  /**
   * Optionally specify a game size when you want to override the
   * `gameSprite` prop
   */
  gameSizeArg?: GameSize
): {
  initTextures: SpriteTextures;
  getNextFrameTextures: (
    time: number,
    resetInputs: () => void
  ) => SpriteTextures;
} {
  const globalToGameCoords = ({ x, y }: { x: number; y: number }) => ({ x, y });

  const getInitDevice = platform.getGetDevice();
  const initDevice = getInitDevice(globalToGameCoords);
  const gameContainer = createCustomSpriteContainer(
    gameSprite,
    getInitDevice(globalToGameCoords),
    0
  );
  const gameSize = gameSizeArg || gameSprite.props.size;

  const initRenderMethod = getRenderMethod(initDevice.size, gameSize);

  let prevTime = 0;
  let currentLag = 0;

  let textures = traverseCustomSpriteContainer<GameProps, I>(
    gameContainer,
    gameSprite.props,
    getInitDevice,
    globalToGameCoords,
    true,
    initRenderMethod,
    0,
    1,
    gameSprite.props.id,
    nativeSpriteSettings
  );

  return {
    initTextures: textures,
    getNextFrameTextures(time, resetInputs) {
      const timeSinceLastCall = time - prevTime;
      prevTime = time;
      currentLag += timeSinceLastCall;

      while (currentLag >= REPLAY_TIME_PER_UPDATE_MS) {
        currentLag -= REPLAY_TIME_PER_UPDATE_MS;
        const extrapolateFactor = currentLag / REPLAY_TIME_PER_UPDATE_MS;

        const getDevice = platform.getGetDevice();
        const device = getDevice(globalToGameCoords);
        const renderMethod = getRenderMethod(device.size, gameSize);

        textures = traverseCustomSpriteContainer<GameProps, I>(
          gameContainer,
          gameSprite.props,
          getDevice,
          globalToGameCoords,
          false,
          renderMethod,
          extrapolateFactor,
          1,
          gameSprite.props.id,
          nativeSpriteSettings
        );
        // reset inputs after each update
        resetInputs();
      }

      return textures;
    },
  };
}

/**
 * A game is a tree of sprites. This function recursively traverses the tree of
 * sprites to update a tree of sprite containers, or create / destroy containers
 * as appropriate.
 */
function traverseCustomSpriteContainer<P, I>(
  customSpriteContainer: CustomSpriteContainer<P, unknown, I>,
  spriteProps: CustomSpriteProps<P>,
  getDeviceGlobal: (
    getLocalCoords: (globalCoords: {
      x: number;
      y: number;
    }) => { x: number; y: number }
  ) => Device<I>,
  getParentCoords: (globalCoords: {
    x: number;
    y: number;
  }) => { x: number; y: number },
  initCreation: boolean,
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentOpacity: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings
): SpriteTextures {
  const baseProps = getDefaultProps(spriteProps);
  baseProps.opacity *= parentOpacity;

  const { nativeSpriteMap, nativeSpriteUtils } = nativeSpriteSettings;

  const getLocalCoords = (globalCoords: { x: number; y: number }) => {
    const parentCoords = getParentCoords(globalCoords);
    const getParentToLocalCoords = getLocalCoordsForSprite(baseProps);
    return getParentToLocalCoords(parentCoords);
  };
  const device = getDeviceGlobal(getLocalCoords);

  const sprites = customSpriteContainer.getSprites(
    spriteProps,
    device,
    initCreation,
    renderMethod,
    extrapolateFactor
  );

  const unusedChildIds = new Set(customSpriteContainer.prevChildIds);
  const childIds: string[] = [];

  const textures = sprites
    .map(function mapTextures(sprite) {
      if (!sprite) return sprite;

      if (sprite.type === "native") {
        childIds.push(sprite.props.id);
        unusedChildIds.delete(sprite.props.id);

        const nativeSpriteImplementation = nativeSpriteMap[sprite.name];
        if (!nativeSpriteImplementation) {
          throw Error(`Cannot find Native Sprite "${sprite.name}"`);
        }

        let lookupNativeSpriteContainer =
          customSpriteContainer.childContainers[sprite.props.id];

        if (
          !lookupNativeSpriteContainer ||
          lookupNativeSpriteContainer.type !== "native"
        ) {
          // Create a native container
          const newContainer: NativeSpriteContainer<P, object> = {
            type: "native",
            state: nativeSpriteImplementation.create({
              props: sprite.props,
              parentGlobalId,
              getState: () => newContainer.state,
              updateState: (mergeState) => {
                newContainer.state = {
                  ...newContainer.state,
                  ...mergeState,
                };
              },
              utils: nativeSpriteUtils,
            }),
            cleanup: nativeSpriteImplementation.cleanup,
          };
          customSpriteContainer.childContainers[sprite.props.id] = newContainer;
          lookupNativeSpriteContainer = newContainer;
        }

        lookupNativeSpriteContainer.state = nativeSpriteImplementation.loop({
          props: sprite.props,
          state: lookupNativeSpriteContainer.state,
          parentGlobalId,
          utils: nativeSpriteUtils,
        });

        return null;
      }

      if (sprite.type === "pure") {
        childIds.push(sprite.props.id);
        unusedChildIds.delete(sprite.props.id);

        let lookupPureCustomSpriteContainer =
          customSpriteContainer.childContainers[sprite.props.id];

        if (
          !lookupPureCustomSpriteContainer ||
          lookupPureCustomSpriteContainer.type !== "pure"
        ) {
          lookupPureCustomSpriteContainer = createPureCustomSpriteContainer(
            sprite
          );
          customSpriteContainer.childContainers[
            sprite.props.id
          ] = lookupPureCustomSpriteContainer;
        }

        return traversePureCustomSpriteContainer(
          lookupPureCustomSpriteContainer,
          sprite.props,
          device.size,
          nativeSpriteUtils.didResize, // conveniently get this from native utils
          renderMethod,
          baseProps.opacity
        );
      }

      if (sprite.type === "custom") {
        childIds.push(sprite.props.id);
        unusedChildIds.delete(sprite.props.id);
        let spriteInitCreation = false;

        let lookupCustomSpriteContainer =
          customSpriteContainer.childContainers[sprite.props.id];

        if (
          !lookupCustomSpriteContainer ||
          lookupCustomSpriteContainer.type !== "custom"
        ) {
          spriteInitCreation = true;
          lookupCustomSpriteContainer = createCustomSpriteContainer(
            sprite,
            device,
            customSpriteContainer.prevTime
          );
          customSpriteContainer.childContainers[
            sprite.props.id
          ] = lookupCustomSpriteContainer;
        }

        return traverseCustomSpriteContainer(
          lookupCustomSpriteContainer,
          sprite.props,
          getDeviceGlobal,
          getLocalCoords,
          spriteInitCreation,
          renderMethod,
          extrapolateFactor,
          baseProps.opacity,
          `${parentGlobalId}--${sprite.props.id}`,
          nativeSpriteSettings
        );
      }

      return sprite;
    })
    .filter(isNotNullOrUndefined);

  nativeSpriteUtils.didResize = false;

  unusedChildIds.forEach((id) => {
    // Run cleanup of Native Sprites on all the removed child containers
    const recursiveNativeSpriteCleanup = (
      containers: SpriteContainer<unknown, unknown, I>[]
    ) => {
      Object.values(containers).forEach((container) => {
        if (container.type === "custom") {
          recursiveNativeSpriteCleanup(
            Object.values(container.childContainers)
          );
        } else if (container.type === "native") {
          container.cleanup({
            state: container.state,
            parentGlobalId,
          });
        }
      });
    };

    const spriteContainer = customSpriteContainer.childContainers[id];
    recursiveNativeSpriteCleanup([spriteContainer]);

    delete customSpriteContainer.childContainers[id];
  });

  customSpriteContainer.prevChildIds = childIds;

  return {
    id: spriteProps.id,
    baseProps,
    textures,
  };
}

/**
 * Replay will update at this frame rate on all platforms.
 */
const REPLAY_TIME_PER_UPDATE_MS = 1000 * (1 / 60);

/**
 * Returns a container of the state of the sprite. Should only be called once
 * per creation of sprite.
 */
function createCustomSpriteContainer<P, S, I>(
  sprite: CustomSprite<P, S, I>,
  initDevice: Device<I>,
  currentTime: number
): CustomSpriteContainer<P, S, I> {
  const { spriteObj, props: initProps } = sprite;

  // Use a queue so state is updated after rendering
  const updateStateQueue: ((state: S) => S)[] = [];

  const updateState = (update: (state: S) => S) => {
    updateStateQueue.push(update);
  };

  let spriteContainer: null | CustomSpriteContainer<P, S, I> = null;
  let initState;
  if (spriteObj.init) {
    initState = spriteObj.init({
      props: initProps,
      getState: () => {
        if (!spriteContainer) {
          throw Error("Cannot call getState synchronously in init");
        }
        return spriteContainer.state;
      },
      device: initDevice,
      updateState,
    });
  }

  spriteContainer = {
    type: "custom",
    // WARNING: types are a bit tricky here, need to cast.
    // If a sprite does not set an init state, this will simply pass undefined
    state: initState as S,
    childContainers: {},
    prevChildIds: [],
    prevTime: currentTime,
    currentLag: 0,
    getSprites(props, device, initCreation, renderMethod, extrapolateFactor) {
      const runUpdateStateCallbacks = () => {
        this.state = updateStateQueue.reduce(
          (state, update) => update(state),
          this.state
        );
        updateStateQueue.length = 0;
      };

      // Run any updateState from callbacks in other sprites last render
      runUpdateStateCallbacks();

      // Do not run loop on init creation of sprites
      if (!initCreation && spriteObj.loop) {
        this.state = spriteObj.loop({
          props,
          state: this.state,
          device,
          updateState,
        });
      }

      // Run any updateState from callbacks in loop
      runUpdateStateCallbacks();

      let render = spriteObj[renderMethod];
      if (!render) {
        // default to other renderXL or render method if not defined by user
        render =
          renderMethod === "renderPXL" && spriteObj.renderXL
            ? spriteObj.renderXL
            : spriteObj.render;
      }
      const sprites = render({
        props,
        state: this.state,
        device,
        updateState,
        extrapolateFactor,
      });

      // Run any updateState from callbacks in render
      runUpdateStateCallbacks();

      return sprites;
    },
  };
  return spriteContainer;
}

type RenderMethod = "render" | "renderP" | "renderXL" | "renderPXL";

/**
 * If the user did not specify portrait and landscape, then it is calculated by
 * the game dimensions. Otherwise, it is assumed `render` is for landscape and
 * `renderP` for portrait.
 */
function getRenderMethod(
  deviceSize: DeviceSize,
  gameSize: GameSize
): RenderMethod {
  const isPortrait = deviceSize.deviceHeight > deviceSize.deviceWidth;
  let supportsLandscapeAndPortrait = false;

  let gameOrientationSize;
  if ("portrait" in gameSize) {
    gameOrientationSize = isPortrait ? gameSize.portrait : gameSize.landscape;
    supportsLandscapeAndPortrait = true;
  } else {
    gameOrientationSize = gameSize;
  }

  const useXL =
    (gameOrientationSize.minHeightXL &&
      deviceSize.deviceHeight >= gameOrientationSize.minHeightXL) ||
    (gameOrientationSize.minWidthXL &&
      deviceSize.deviceWidth >= gameOrientationSize.minWidthXL);

  if (useXL) {
    return supportsLandscapeAndPortrait && isPortrait
      ? "renderPXL"
      : "renderXL";
  }
  return supportsLandscapeAndPortrait && isPortrait ? "renderP" : "render";
}

type SpriteContainer<P, S, I> =
  | CustomSpriteContainer<P, S, I>
  | PureCustomSpriteContainer<P>
  | NativeSpriteContainer<P, S>;

type CustomSpriteContainer<P, S, I> = {
  type: "custom";
  state: S;
  childContainers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: SpriteContainer<unknown, any, I>;
  };
  prevChildIds: string[];
  prevTime: number;
  currentLag: number;
  getSprites: (
    props: CustomSpriteProps<P>,
    device: Device<I>,
    initCreation: boolean,
    renderMethod: RenderMethod,
    time: number
  ) => Sprite[];
};

type PureCustomSpriteContainer<P> = {
  type: "pure";
  childContainers: {
    [id: string]: PureCustomSpriteContainer<unknown>;
  };
  prevChildIds: string[];
  cache?: (SpriteTextures | Texture)[];
  prevProps?: P;
  getSprites: (
    props: CustomSpriteProps<P>,
    size: DeviceSize,
    didResize: boolean,
    renderMethod: RenderMethod
  ) =>
    | { type: "pureSprites"; sprites: PureSprite[] }
    | { type: "cachedTextures"; textures: (SpriteTextures | Texture)[] };
};

function createPureCustomSpriteContainer<P>(
  sprite: PureCustomSprite<P>
): PureCustomSpriteContainer<P> {
  const { spriteObj } = sprite;

  return {
    type: "pure",
    childContainers: {},
    prevChildIds: [],
    getSprites(props, size, didResize, renderMethod) {
      let render = spriteObj[renderMethod];
      if (!render) {
        // default to other renderXL or render method if not defined by user
        render =
          renderMethod === "renderPXL" && spriteObj.renderXL
            ? spriteObj.renderXL
            : spriteObj.render;
      }

      if (
        this.prevProps &&
        this.cache &&
        !spriteObj.shouldRerender(this.prevProps, props) &&
        !didResize
      ) {
        this.prevProps = props;
        return { type: "cachedTextures", textures: this.cache };
      }

      // Cache will be updated outside of this function
      this.prevProps = props;
      return {
        type: "pureSprites",
        sprites: render({
          props,
          size,
        }),
      };
    },
  };
}

function traversePureCustomSpriteContainer<P, I>(
  customSpriteContainer: PureCustomSpriteContainer<P>,
  spriteProps: CustomSpriteProps<P>,
  deviceSize: DeviceSize,
  didResize: boolean,
  renderMethod: RenderMethod,
  parentOpacity: number
): SpriteTextures {
  const baseProps = getDefaultProps(spriteProps);
  baseProps.opacity *= parentOpacity;

  const spritesResult = customSpriteContainer.getSprites(
    spriteProps,
    deviceSize,
    didResize,
    renderMethod
  );

  if (spritesResult.type === "cachedTextures") {
    return {
      id: spriteProps.id,
      baseProps,
      textures: spritesResult.textures,
    };
  }
  const { sprites } = spritesResult;

  const unusedChildIds = new Set(customSpriteContainer.prevChildIds);
  const childIds: string[] = [];

  const textures = sprites
    .map(function mapPureTextures(sprite) {
      if (!sprite) return sprite;

      if (sprite.type === "pure") {
        childIds.push(sprite.props.id);
        unusedChildIds.delete(sprite.props.id);

        let lookupPureCustomSpriteContainer =
          customSpriteContainer.childContainers[sprite.props.id];

        if (
          !lookupPureCustomSpriteContainer ||
          lookupPureCustomSpriteContainer.type !== "pure"
        ) {
          lookupPureCustomSpriteContainer = createPureCustomSpriteContainer(
            sprite
          );
          customSpriteContainer.childContainers[
            sprite.props.id
          ] = lookupPureCustomSpriteContainer;
        }

        return traversePureCustomSpriteContainer(
          lookupPureCustomSpriteContainer,
          sprite.props,
          deviceSize,
          didResize,
          renderMethod,
          baseProps.opacity
        );
      }

      return sprite;
    })
    .filter(isNotNullOrUndefined);

  unusedChildIds.forEach((id) => {
    delete customSpriteContainer.childContainers[id];
  });

  // Update cache
  customSpriteContainer.cache = textures;
  customSpriteContainer.prevChildIds = childIds;

  return {
    id: spriteProps.id,
    baseProps,
    textures,
  };
}

type NativeSpriteContainer<P, S> = {
  type: "native";
  state: S;
  cleanup: (params: { state: S; parentGlobalId: string }) => void;
};

export type NativeSpriteSettings = {
  /**
   * A map of Native Sprite names and their platform's implementation
   */
  nativeSpriteMap: NativeSpriteMap;
  nativeSpriteUtils: NativeSpriteUtils;
};

function isNotNullOrUndefined<T>(arg: T | null | undefined): arg is T {
  return arg !== null && arg !== undefined;
}

/**
 * A mapping of the parent Sprite's (x, y) coordinate to local Sprite
 * coordinates
 */
export function getLocalCoordsForSprite(baseProps: SpriteBaseProps) {
  const toRad = Math.PI / 180;
  const rotation = -(baseProps.rotation || 0) * toRad;

  return ({ x, y }: { x: number; y: number }) => {
    // This explains the equation for rotating: https://www.youtube.com/watch?v=AAx8JON4KeQ
    const relativeX = x - baseProps.x;
    const relativeY = y - baseProps.y;

    const rotatedX =
      relativeX * Math.cos(rotation) + relativeY * Math.sin(rotation);
    const rotatedY =
      -relativeX * Math.sin(rotation) + relativeY * Math.cos(rotation);

    const scaledX = rotatedX / baseProps.scaleX;
    const scaledY = rotatedY / baseProps.scaleY;

    const anchoredX = scaledX + baseProps.anchorX;
    const anchoredY = scaledY + baseProps.anchorY;

    return { x: anchoredX, y: anchoredY };
  };
}
