import { TextureFont } from "./t";
import {
  CustomSprite,
  Sprite,
  CustomSpriteProps,
  SpriteTextures,
  NativeSpriteImplementation,
  NativeSpriteUtils,
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

/**
 * In some platforms (e.g. iOS) the game is loaded in the same container as a
 * global variable.
 */
declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, unknown>;
  gameProps: GameProps;
};

export function replayCore<S, I>(
  platform: ReplayPlatform<I>,
  nativeSpriteSettings: NativeSpriteSettings,
  gameSpriteArg?: CustomSprite<GameProps, S, I>,
  /**
   * Optionally specify a game size when you want to override the
   * `gameSpriteArg` prop
   */
  gameSizeArg?: GameSize
): {
  initTextures: SpriteTextures;
  getNextFrameTextures: (time: number) => SpriteTextures;
} {
  const gameSprite =
    gameSpriteArg ||
    (game.Game(game.gameProps) as CustomSprite<GameProps, S, I>);

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

  return {
    initTextures: traverseCustomSpriteContainer<GameProps, I>(
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
    ),
    getNextFrameTextures(time) {
      const getDevice = platform.getGetDevice();
      const device = getDevice(globalToGameCoords);
      const renderMethod = getRenderMethod(device.size, gameSize);
      return traverseCustomSpriteContainer<GameProps, I>(
        gameContainer,
        gameSprite.props,
        getDevice,
        globalToGameCoords,
        false,
        renderMethod,
        time,
        1,
        gameSprite.props.id,
        nativeSpriteSettings
      );
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
  time: number,
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
    time
  );

  const childIds: string[] = [];

  const textures = sprites
    .map((sprite) => {
      if (!sprite) return sprite;

      if (sprite.type === "native") {
        childIds.push(sprite.props.id);

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
          lookupNativeSpriteContainer = {
            type: "native",
            state: nativeSpriteImplementation.init({
              props: sprite.props,
              parentGlobalId,
              getState: () => lookupNativeSpriteContainer.state,
              updateState: (update) => {
                lookupNativeSpriteContainer.state = update(
                  lookupNativeSpriteContainer.state
                );
              },
              utils: nativeSpriteUtils,
            }),
            cleanup: nativeSpriteImplementation.cleanup,
          };
          customSpriteContainer.childContainers[
            sprite.props.id
          ] = lookupNativeSpriteContainer;
        }

        lookupNativeSpriteContainer.state = nativeSpriteImplementation.loop({
          props: sprite.props,
          state: lookupNativeSpriteContainer.state,
          parentGlobalId,
          utils: nativeSpriteUtils,
        });

        nativeSpriteUtils.didResize = false;

        return null;
      }

      if (sprite.type === "custom") {
        childIds.push(sprite.props.id);
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
          time,
          baseProps.opacity,
          `${parentGlobalId}--${sprite.props.id}`,
          nativeSpriteSettings
        );
      }

      return sprite;
    })
    .filter(isNotNull);

  // Clean up removed sprites
  Object.keys(customSpriteContainer.childContainers).forEach((id) => {
    if (!childIds.includes(id)) {
      const spriteContainer = customSpriteContainer.childContainers[id];
      if (spriteContainer.type === "native") {
        spriteContainer.cleanup({
          state: spriteContainer.state,
          parentGlobalId,
        });
      }
      delete customSpriteContainer.childContainers[id];
    }
  });

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

  let initState;
  if (spriteObj.init) {
    initState = spriteObj.init({
      props: initProps,
      device: initDevice,
      updateState,
    });
  }

  return {
    type: "custom",
    // WARNING: types are a bit tricky here, need to cast.
    // If a sprite does not set an init state, this will simply pass undefined
    state: initState as S,
    childContainers: {},
    prevTime: currentTime,
    currentLag: 0,
    getSprites(
      props: CustomSpriteProps<P>,
      device: Device<I>,
      initCreation: boolean,
      renderMethod: RenderMethod,
      time: number
    ) {
      const timeSinceLastFrame = time - this.prevTime;
      this.prevTime = time;
      this.currentLag += timeSinceLastFrame;

      let extrapolateFactor = 0;

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
      if (!initCreation) {
        if (spriteObj.loop) {
          while (this.currentLag >= REPLAY_TIME_PER_UPDATE_MS) {
            this.state = spriteObj.loop({
              props,
              state: this.state,
              device,
              updateState,
            });
            this.currentLag -= REPLAY_TIME_PER_UPDATE_MS;
          }
          extrapolateFactor = this.currentLag / REPLAY_TIME_PER_UPDATE_MS;
        }
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
  | NativeSpriteContainer<P, S>;

type CustomSpriteContainer<P, S, I> = {
  type: "custom";
  state: S;
  childContainers: {
    [id: string]: SpriteContainer<unknown, unknown, I>;
  };
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

type NativeSpriteContainer<P, S> = {
  type: "native";
  state: S;
  cleanup: (params: { state: S; parentGlobalId: string }) => void;
};

type NativeSpriteSettings = {
  /**
   * A map of Native Sprite names and their platform's implementation
   */
  nativeSpriteMap: NativeSpriteMap;
  nativeSpriteUtils: NativeSpriteUtils;
};

function isNotNull<T>(arg: T | null): arg is T {
  return arg !== null;
}

/**
 * A mapping of the parent Sprite's (x, y) coordinate to local Sprite
 * coordinates
 */
export function getLocalCoordsForSprite(baseProps: SpriteBaseProps) {
  const h = baseProps.x;
  const k = baseProps.y;
  const toRad = Math.PI / 180;
  const rotation = -(baseProps.rotation || 0) * toRad;

  return ({ x, y }: { x: number; y: number }) => {
    // This explains the equation for rotating: https://www.youtube.com/watch?v=AAx8JON4KeQ
    const rotatedX =
      (x - h) * Math.cos(rotation) + (y - k) * Math.sin(rotation);
    const rotatedY =
      -(x - h) * Math.sin(rotation) + (y - k) * Math.cos(rotation);

    const scaledX = baseProps.x + (rotatedX - baseProps.x) / baseProps.scaleX;
    const scaledY = baseProps.y + (rotatedY - baseProps.y) / baseProps.scaleY;

    const anchoredX = scaledX + baseProps.anchorX;
    const anchoredY = scaledY + baseProps.anchorY;

    return { x: anchoredX, y: anchoredY };
  };
}
