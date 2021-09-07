import { TextureFont, Texture } from "./t";
import {
  CustomSprite,
  Sprite,
  CustomSpriteProps,
  NativeSpriteImplementation,
  NativeSpriteUtils,
  PureSprite,
  PureCustomSprite,
  Context,
} from "./sprite";
import { Device, DeviceSize, preloadFiles, cleanupFiles } from "./device";
import { SpriteBaseProps, getDefaultProps, mutateBaseProps } from "./props";
import { ContextValue } from "./context";

/**
 * The props type a game should take.
 */
export interface GameProps {
  id: "Game";
  size: GameSize;
  defaultFont?: TextureFont;
  /**
   * Default `"white"`
   */
  backgroundColor?: string;
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
   * Get the inputs for an individual sprite
   */
  getInputs: (
    getLocalCoords: (globalCoords: {
      x: number;
      y: number;
    }) => { x: number; y: number }
  ) => I;

  /**
   * Returns a device instance that's shared between all Sprites and mutated by
   * the platform to update it
   */
  mutDevice: Device;

  render: PlatformRender;
}

export type PlatformRender = {
  newFrame: () => void;
  startRenderSprite: (baseProps: SpriteBaseProps) => void;
  endRenderSprite: () => void;
  renderTexture: (texture: Texture) => void;
};

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
  runNextFrame: (time: number, resetInputs: () => void) => void;
} {
  const globalToGameCoords = ({ x, y }: { x: number; y: number }) => ({ x, y });

  const { mutDevice, getInputs: getInputsPlatform } = platform;

  const gameContainer = createCustomSpriteContainer(
    gameSprite,
    mutDevice,
    () => getInputsPlatform(globalToGameCoords),
    0,
    gameSprite.props.id,
    []
  );
  const gameSize = gameSizeArg || gameSprite.props.size;

  const initRenderMethod = getRenderMethod(mutDevice.size, gameSize);

  let prevTime = 0;
  let currentLag = 0;

  traverseCustomSpriteContainer<GameProps, I>(
    gameContainer,
    gameSprite.props,
    mutDevice,
    getInputsPlatform,
    globalToGameCoords,
    true,
    initRenderMethod,
    0,
    gameSprite.props.id,
    nativeSpriteSettings,
    platform.render,
    []
  );

  const emptyRender: PlatformRender = {
    newFrame: () => null,
    startRenderSprite: () => null,
    endRenderSprite: () => null,
    renderTexture: () => null,
  };

  return {
    runNextFrame(time, resetInputs) {
      const timeSinceLastCall = time - prevTime;
      prevTime = time;
      currentLag += timeSinceLastCall;

      let framesToCatchup = Math.floor(currentLag / REPLAY_TIME_PER_UPDATE_MS);

      while (framesToCatchup > 0) {
        currentLag -= REPLAY_TIME_PER_UPDATE_MS;
        framesToCatchup--;

        const extrapolateFactor = currentLag / REPLAY_TIME_PER_UPDATE_MS;

        const renderMethod = getRenderMethod(mutDevice.size, gameSize);

        // Only draw on last frame
        const platformRender =
          framesToCatchup === 0 ? platform.render : emptyRender;

        platformRender.newFrame();

        traverseCustomSpriteContainer<GameProps, I>(
          gameContainer,
          gameSprite.props,
          mutDevice,
          getInputsPlatform,
          globalToGameCoords,
          false,
          renderMethod,
          extrapolateFactor,
          gameSprite.props.id,
          nativeSpriteSettings,
          platformRender,
          []
        );
        // reset inputs after each update
        resetInputs();
      }
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
  mutDevice: Device,
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  getParentCoords: (globalCoords: {
    x: number;
    y: number;
  }) => { x: number; y: number },
  initCreation: boolean,
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings,
  platformRender: PlatformRender,
  contextValues: ContextValue[]
) {
  const { baseProps } = customSpriteContainer;
  mutateBaseProps(baseProps, spriteProps);

  const getLocalCoords = (globalCoords: { x: number; y: number }) => {
    const parentCoords = getParentCoords(globalCoords);
    const getParentToLocalCoords = getLocalCoordsForSprite(baseProps);
    return getParentToLocalCoords(parentCoords);
  };

  // Cache in case called in multiple sprite methods
  let cachedInputs: I | null = null;
  const getInputs = () => {
    if (!cachedInputs) {
      cachedInputs = getInputsPlatform(getLocalCoords);
    }
    return cachedInputs;
  };

  const sprites = customSpriteContainer.getSprites(
    spriteProps,
    getInputs,
    initCreation,
    renderMethod,
    extrapolateFactor,
    contextValues
  );

  const unusedChildIds = customSpriteContainer.prevChildIdsSet;

  // Reuse original array to reduce GC
  const childIds = customSpriteContainer.prevChildIds;
  let childIdIndex = 0;
  const addChildId = (id: string) => {
    childIds[childIdIndex] = id;
    childIdIndex++;
    unusedChildIds.delete(id);
  };

  platformRender.startRenderSprite(baseProps);

  handleSprites(
    sprites,
    customSpriteContainer,
    mutDevice,
    getInputsPlatform,
    renderMethod,
    extrapolateFactor,
    parentGlobalId,
    nativeSpriteSettings,
    platformRender,
    contextValues,
    addChildId,
    getInputs,
    getLocalCoords
  );

  platformRender.endRenderSprite();

  nativeSpriteSettings.nativeSpriteUtils.didResize = false;
  if (childIdIndex < childIds.length) {
    childIds.length = childIdIndex;
  }

  unusedChildIds.forEach((id) => {
    // Run cleanup of Sprites on all the removed child containers
    const recursiveSpriteCleanup = (
      containers: { [id: string]: SpriteContainer<unknown, unknown, I> },
      containerParentGlobalId: string
    ) => {
      Object.entries(containers).forEach(([containerId, container]) => {
        if (container.type === "custom") {
          const containerGlobalId = `${containerParentGlobalId}--${containerId}`;

          recursiveSpriteCleanup(container.childContainers, containerGlobalId);

          container.cleanup(getInputs);

          if (container.loadFilesPromise) {
            container.loadFilesPromise.then(() => {
              // Only cleanup once the initial load is complete
              cleanupFiles(containerGlobalId, mutDevice.assetUtils);
            });
          }
        } else if (container.type === "native") {
          container.cleanup({
            state: container.state,
            parentGlobalId,
          });
        }
      });
    };

    const spriteContainer = customSpriteContainer.childContainers[id];
    recursiveSpriteCleanup({ [id]: spriteContainer }, parentGlobalId);

    delete customSpriteContainer.childContainers[id];
  });

  customSpriteContainer.prevChildIdsSet = new Set(childIds);

  if (customSpriteContainer.prevChildIdsSet.size < childIds.length) {
    const duplicate = childIds.find(
      (item, index) => childIds.indexOf(item) !== index
    );
    throw Error(`Duplicate Sprite id ${duplicate}`);
  }
}

function handleSprites<P, I>(
  sprites: Sprite[],
  customSpriteContainer: CustomSpriteContainer<P, unknown, I>,
  mutDevice: Device,
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings,
  platformRender: PlatformRender,
  contextValues: ContextValue[],
  addChildId: (id: string) => void,
  getInputs: () => I,
  getLocalCoords: (globalCoords: {
    x: number;
    y: number;
  }) => { x: number; y: number }
) {
  for (let i = 0; i < sprites.length; i++) {
    const sprite = sprites[i];

    if (!sprite) continue;

    if (sprite.type === "context") {
      handleSprites(
        sprite.sprites,
        customSpriteContainer,
        mutDevice,
        getInputsPlatform,
        renderMethod,
        extrapolateFactor,
        parentGlobalId,
        nativeSpriteSettings,
        platformRender,
        // Adding the context value to nested sprites here
        [...contextValues, sprite],
        addChildId,
        getInputs,
        getLocalCoords
      );
    } else if (sprite.type === "native") {
      addChildId(sprite.props.id);

      const { nativeSpriteMap, nativeSpriteUtils } = nativeSpriteSettings;

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
        const newContainer: NativeSpriteContainer<UnknownObject> = {
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
    } else if (sprite.type === "pure") {
      addChildId(sprite.props.id);

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

      traversePureCustomSpriteContainer(
        lookupPureCustomSpriteContainer,
        sprite.props,
        mutDevice.size,
        nativeSpriteSettings.nativeSpriteUtils.didResize, // conveniently get this from native utils
        renderMethod,
        platformRender
      );
    } else if (sprite.type === "custom") {
      addChildId(sprite.props.id);

      let spriteInitCreation = false;

      let lookupCustomSpriteContainer =
        customSpriteContainer.childContainers[sprite.props.id];

      const globalId = `${parentGlobalId}--${sprite.props.id}`;

      if (
        !lookupCustomSpriteContainer ||
        lookupCustomSpriteContainer.type !== "custom"
      ) {
        spriteInitCreation = true;
        lookupCustomSpriteContainer = createCustomSpriteContainer(
          sprite,
          mutDevice,
          getInputs,
          customSpriteContainer.prevTime,
          globalId,
          contextValues
        );
        customSpriteContainer.childContainers[
          sprite.props.id
        ] = lookupCustomSpriteContainer;
      }

      traverseCustomSpriteContainer(
        lookupCustomSpriteContainer,
        sprite.props,
        mutDevice,
        getInputsPlatform,
        getLocalCoords,
        spriteInitCreation,
        renderMethod,
        extrapolateFactor,
        globalId,
        nativeSpriteSettings,
        platformRender,
        contextValues
      );
    } else {
      platformRender.renderTexture(sprite);
    }
  }
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
  mutDevice: Device,
  getInitInputs: () => I,
  currentTime: number,
  globalId: string,
  contextValues: ContextValue[]
): CustomSpriteContainer<P, S, I> {
  const { spriteObj, props: initProps } = sprite;

  // Use a queue so state is updated after rendering
  const updateStateQueue: ((state: S) => S)[] = [];

  const updateState = (update: (state: S) => S) => {
    updateStateQueue.push(update);
  };

  let spriteContainer: null | CustomSpriteContainer<P, S, I> = null;
  let initState;
  let loadFilesPromise: null | Promise<void> = null;
  if (spriteObj.init) {
    initState = spriteObj.init({
      props: initProps,
      getState: () => {
        if (!spriteContainer) {
          throw Error("Cannot call getState synchronously in init");
        }
        return spriteContainer.state;
      },
      device: mutDevice,
      getInputs: getInitInputs,
      updateState,
      getContext: <T>(context: Context<T>): T => {
        const contextValue = contextValues.find((c) => c.context === context);
        if (!contextValue) {
          throw Error("No context setup");
        }
        return contextValue.value as T;
      },
      preloadFiles: async (assets) => {
        const loadFiles = preloadFiles(globalId, assets, mutDevice.assetUtils);
        if (spriteContainer) {
          spriteContainer.loadFilesPromise = loadFiles;
        } else {
          // Was called synchronously
          loadFilesPromise = loadFiles;
        }
        await loadFiles;
      },
    });
  }

  const runUpdateStateCallbacks = () => {
    let queueIndex = 0;

    // Use a while loop in case nested updateStates add to the array during
    // loop
    while (queueIndex < updateStateQueue.length) {
      const update = updateStateQueue[queueIndex];

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      spriteContainer!.state = update(spriteContainer!.state);

      queueIndex++;
    }
    updateStateQueue.length = 0;
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const getState = () => spriteContainer!.state;

  spriteContainer = {
    type: "custom",
    // WARNING: types are a bit tricky here, need to cast.
    // If a sprite does not set an init state, this will simply pass undefined
    state: initState as S,
    baseProps: getDefaultProps(initProps),
    childContainers: {},
    prevChildIds: [],
    prevChildIdsSet: new Set(),
    prevTime: currentTime,
    currentLag: 0,
    loadFilesPromise,
    getSprites(
      props,
      getInputs,
      initCreation,
      renderMethod,
      extrapolateFactor,
      contextValues
    ) {
      // Run any updateState from callbacks in other sprites last render
      runUpdateStateCallbacks();

      const getContext = <T>(context: Context<T>): T => {
        const contextValue = contextValues.find((c) => c.context === context);
        if (!contextValue) {
          throw Error("No context setup");
        }
        return contextValue.value as T;
      };

      // Do not run loop on init creation of sprites
      if (!initCreation && spriteObj.loop) {
        this.state = spriteObj.loop({
          props,
          state: this.state,
          device: mutDevice,
          getInputs,
          updateState,
          getState,
          getContext,
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
        device: mutDevice,
        getInputs,
        updateState,
        getState,
        getContext,
        extrapolateFactor,
      });

      // Run any updateState from callbacks in render
      runUpdateStateCallbacks();

      return sprites;
    },
    cleanup(getInputs) {
      spriteObj.cleanup?.({
        state: this.state,
        device: mutDevice,
        getInputs,
      });
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
  | NativeSpriteContainer<S>;

type CustomSpriteContainer<P, S, I> = {
  type: "custom";
  state: S;
  childContainers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: SpriteContainer<unknown, any, I>;
  };
  // stored for memory pooling
  baseProps: SpriteBaseProps;
  prevChildIds: string[];
  prevChildIdsSet: Set<string>;
  prevTime: number;
  currentLag: number;
  loadFilesPromise: null | Promise<void>;
  getSprites: (
    props: CustomSpriteProps<P>,
    getInputs: () => I,
    initCreation: boolean,
    renderMethod: RenderMethod,
    time: number,
    contextValues: ContextValue[]
  ) => Sprite[];
  cleanup: (getInputs: () => I) => void;
};

type PureCustomSpriteContainer<P> = {
  type: "pure";
  childContainers: {
    [id: string]: PureCustomSpriteContainer<unknown>;
  };
  prevChildIds: string[];
  prevChildIdsSet: Set<string>;
  baseProps: SpriteBaseProps;
  cache?: PureSpriteCache;
  prevProps?: P;
  getSprites: (
    props: CustomSpriteProps<P>,
    size: DeviceSize,
    didResize: boolean,
    renderMethod: RenderMethod
  ) => { type: "pureSprites"; sprites: PureSprite[] } | PureSpriteCache;
};

type PureSpriteCache = {
  type: "cache";
  baseProps: SpriteBaseProps;
  items: (PureSpriteCache | Texture)[];
};

function createPureCustomSpriteContainer<P>(
  sprite: PureCustomSprite<P>
): PureCustomSpriteContainer<P> {
  const { spriteObj } = sprite;

  return {
    type: "pure",
    childContainers: {},
    prevChildIds: [],
    prevChildIdsSet: new Set(),
    baseProps: getDefaultProps(sprite.props),
    getSprites(props, size, didResize, renderMethod) {
      if (
        this.prevProps &&
        this.cache &&
        !spriteObj.shouldRerender(this.prevProps, props) &&
        !didResize
      ) {
        this.prevProps = props;
        return this.cache;
      }

      let render = spriteObj[renderMethod];
      if (!render) {
        // default to other renderXL or render method if not defined by user
        render =
          renderMethod === "renderPXL" && spriteObj.renderXL
            ? spriteObj.renderXL
            : spriteObj.render;
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

function traversePureCustomSpriteContainer<P>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  spriteProps: CustomSpriteProps<P>,
  deviceSize: DeviceSize,
  didResize: boolean,
  renderMethod: RenderMethod,
  platformRender: PlatformRender
): PureSpriteCache {
  const { baseProps } = pureSpriteContainer;
  mutateBaseProps(baseProps, spriteProps);

  const spritesResult = pureSpriteContainer.getSprites(
    spriteProps,
    deviceSize,
    didResize,
    renderMethod
  );

  if (spritesResult.type === "cache") {
    // Need to traverse to apply base props of nested Sprites
    traversePureSpriteCache(spritesResult, platformRender);

    return spritesResult;
  }

  return traversePureCustomSpriteContainerNotCached(
    pureSpriteContainer,
    spritesResult.sprites,
    deviceSize,
    didResize,
    renderMethod,
    platformRender
  );
}

function traversePureCustomSpriteContainerNotCached<P>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  sprites: PureSprite<unknown>[],
  deviceSize: DeviceSize,
  didResize: boolean,
  renderMethod: RenderMethod,
  platformRender: PlatformRender
): PureSpriteCache {
  const { baseProps } = pureSpriteContainer;

  const unusedChildIds = pureSpriteContainer.prevChildIdsSet;

  // Mutate original to reduce GC
  const childIds = pureSpriteContainer.prevChildIds;
  let childIdIndex = 0;

  platformRender.startRenderSprite(baseProps);

  const cacheItems = new Array<PureSpriteCache | Texture>(sprites.length);
  let cacheItemIndex = 0;

  for (let i = 0; i < sprites.length; i++) {
    const sprite = sprites[i];

    if (!sprite) continue;

    if (sprite.type === "pure") {
      childIds[childIdIndex] = sprite.props.id;
      childIdIndex++;
      unusedChildIds.delete(sprite.props.id);

      let lookupPureCustomSpriteContainer =
        pureSpriteContainer.childContainers[sprite.props.id];

      if (
        !lookupPureCustomSpriteContainer ||
        lookupPureCustomSpriteContainer.type !== "pure"
      ) {
        lookupPureCustomSpriteContainer = createPureCustomSpriteContainer(
          sprite
        );
        pureSpriteContainer.childContainers[
          sprite.props.id
        ] = lookupPureCustomSpriteContainer;
      }

      cacheItems[cacheItemIndex] = traversePureCustomSpriteContainer(
        lookupPureCustomSpriteContainer,
        sprite.props,
        deviceSize,
        didResize,
        renderMethod,
        platformRender
      );
      cacheItemIndex++;
    } else {
      platformRender.renderTexture(sprite);

      cacheItems[cacheItemIndex] = sprite;
      cacheItemIndex++;
    }
  }
  if (cacheItemIndex < cacheItems.length) {
    cacheItems.length = cacheItemIndex;
  }

  platformRender.endRenderSprite();

  unusedChildIds.forEach((id) => {
    delete pureSpriteContainer.childContainers[id];
  });

  const cache: PureSpriteCache = {
    type: "cache",
    baseProps,
    items: cacheItems,
  };

  // Update cache
  pureSpriteContainer.cache = cache;

  if (childIdIndex < childIds.length) {
    childIds.length = childIdIndex;
  }

  pureSpriteContainer.prevChildIdsSet = new Set(childIds);

  if (pureSpriteContainer.prevChildIdsSet.size < childIds.length) {
    const duplicate = childIds.find(
      (item, index) => childIds.indexOf(item) !== index
    );
    throw Error(`Duplicate Sprite id ${duplicate}`);
  }

  return cache;
}

function traversePureSpriteCache(
  cache: PureSpriteCache,
  platformRender: PlatformRender
) {
  platformRender.startRenderSprite(cache.baseProps);

  for (let i = 0; i < cache.items.length; i++) {
    const item = cache.items[i];
    if (item.type === "cache") {
      traversePureSpriteCache(item, platformRender);
    } else {
      platformRender.renderTexture(item);
    }
  }

  platformRender.endRenderSprite();
}

type NativeSpriteContainer<S> = {
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

type UnknownObject = Record<string, unknown>;
