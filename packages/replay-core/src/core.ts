import { Texture, TextureFont } from "./t";
import {
  CustomSprite,
  Sprite,
  CustomSpriteProps,
  SpritePosition as SpritePositionObj,
} from "./sprite";
import { Device, DeviceSize } from "./device";

type SpritePosition = SpritePositionObj["position"];

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
  getGetDevice: () => (position: SpritePosition) => Device<I>;
}

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
  gameSpriteArg?: CustomSprite<GameProps, S, I>,
  /**
   * Optionally specify a game size when you want to override the
   * `gameSpriteArg` prop
   */
  gameSizeArg?: GameSize
) {
  const gameSprite =
    gameSpriteArg ||
    (game.Game(game.gameProps) as CustomSprite<GameProps, S, I>);

  const getInitDevice = platform.getGetDevice();
  const initDevice = getInitDevice(gameSprite.props.position);
  const gameContainer = createSpriteContainer(gameSprite, getInitDevice, 0);
  const gameSize = gameSizeArg || gameSprite.props.size;

  const initRenderMethod = getRenderMethod(initDevice.size, gameSize);

  return {
    initTextures: traverseSpriteContainer<GameProps, I>(
      gameContainer,
      gameSprite.props,
      getInitDevice,
      true,
      initRenderMethod,
      0
    ),
    getNextFrameTextures(time: number) {
      const getDevice = platform.getGetDevice();
      const device = getDevice(gameSprite.props.position);
      const renderMethod = getRenderMethod(device.size, gameSize);
      return traverseSpriteContainer<GameProps, I>(
        gameContainer,
        gameSprite.props,
        getDevice,
        false,
        renderMethod,
        time
      );
    },
  };
}

/**
 * A game is a tree of sprites. This function recursively traverses the tree of
 * sprites to update a tree of sprite containers, or create / destroy containers
 * as appropriate.
 */
function traverseSpriteContainer<P, I>(
  spriteContainer: SpriteContainer<P, unknown, I>,
  spriteProps: CustomSpriteProps<P>,
  getDevice: (position: SpritePosition) => Device<I>,
  initCreation: boolean,
  renderMethod: RenderMethod,
  time: number
): Texture[] {
  const parentPosition = defaultPosition(spriteProps.position);
  const sprites = spriteContainer.getSprites(
    spriteProps,
    getDevice,
    parentPosition,
    initCreation,
    renderMethod,
    time
  );

  const childIds: string[] = [];

  const textures = sprites.filter(isNotNull).map((spriteLocal) => {
    // translate sprite position to absolute coordinates
    const sprite = {
      ...spriteLocal,
      props: {
        ...spriteLocal.props,
        position: addPositions(parentPosition, spriteLocal.props.position),
      },
    };

    if (sprite.type === "custom") {
      childIds.push(sprite.props.id);
      let spriteInitCreation = false;
      if (!spriteContainer.childContainers[sprite.props.id]) {
        spriteInitCreation = true;
        spriteContainer.childContainers[
          sprite.props.id
        ] = createSpriteContainer(sprite, getDevice, spriteContainer.prevTime);
      }
      return traverseSpriteContainer(
        spriteContainer.childContainers[sprite.props.id],
        sprite.props,
        getDevice,
        spriteInitCreation,
        renderMethod,
        time
      );
    }
    return [sprite as Texture];
  });

  // Clean up removed sprites
  Object.keys(spriteContainer.childContainers).forEach((id) => {
    if (!childIds.includes(id)) {
      delete spriteContainer.childContainers[id];
    }
  });

  // Flatten into one array
  return textures.reduce(
    (flat: Texture[], texture) => flat.concat(texture),
    []
  );
}

/**
 * Replay will update at this frame rate on all platforms.
 */
const REPLAY_TIME_PER_UPDATE_MS = 1000 * (1 / 60);

/**
 * Returns a container of the state of the sprite. Should only be called once
 * per creation of sprite.
 */
function createSpriteContainer<P, S, I>(
  sprite: CustomSprite<P, S, I>,
  getInitDevice: (position: SpritePosition) => Device<I>,
  currentTime: number
): SpriteContainer<P, S, I> {
  const { spriteObj, props: initProps } = sprite;
  const initDevice = getInitDevice(initProps.position);

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
    // WARNING: types are a bit tricky here, need to cast.
    // If a sprite does not set an init state, this will simply pass undefined
    state: initState as S,
    childContainers: {},
    prevTime: currentTime,
    currentLag: 0,
    getSprites(
      props: CustomSpriteProps<P>,
      getDevice: (position: SpritePosition) => Device<I>,
      parentPosition: { x: number; y: number; rotation: number },
      initCreation: boolean,
      renderMethod: RenderMethod,
      time: number
    ) {
      const timeSinceLastFrame = time - this.prevTime;
      this.prevTime = time;
      this.currentLag += timeSinceLastFrame;

      const device = getDevice(parentPosition);

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

interface SpriteContainer<P, S, I> {
  state: S;
  childContainers: {
    [id: string]: SpriteContainer<unknown, unknown, I>;
  };
  prevTime: number;
  currentLag: number;
  getSprites: (
    props: CustomSpriteProps<P>,
    getDevice: (position: SpritePosition) => Device<I>,
    parentPosition: { x: number; y: number; rotation: number },
    initCreation: boolean,
    renderMethod: RenderMethod,
    time: number
  ) => Sprite[];
}

function isNotNull<T>(arg: T | null): arg is T {
  return arg !== null;
}

function defaultPosition(position?: SpritePosition) {
  if (!position) {
    return { x: 0, y: 0, rotation: 0 };
  }
  return { ...position, rotation: position.rotation || 0 };
}

function addPositions(
  parentPosition: { x: number; y: number; rotation: number },
  position?: SpritePosition
) {
  if (!position) {
    return parentPosition;
  }
  const { x, y, rotation } = defaultPosition(position);
  const toRad = Math.PI / 180;
  const parentRotRad = -parentPosition.rotation * toRad;
  return {
    x:
      Math.round(
        parentPosition.x +
          x * Math.cos(parentRotRad) -
          y * Math.sin(parentRotRad)
      ) || 0, // || 0 to avoid -0
    y:
      Math.round(
        parentPosition.y +
          x * Math.sin(parentRotRad) +
          y * Math.cos(parentRotRad)
      ) || 0,
    rotation: parentPosition.rotation + rotation,
  };
}
