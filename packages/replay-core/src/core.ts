import { TextureFont, Texture } from "./t";
import {
  CustomSprite,
  MutableSprite,
  AllMutSprite,
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
import { ContextValue, MutContextValue } from "./context";
import {
  MutArrayTextureRenderable,
  MutSingleTexture,
  MutTexture,
  RenderableMutTexture,
} from "./t2";
import { m2d, m2dMut, Matrix2D } from "./matrix";
import { applyTransformMut } from "./transform";

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
  getInputs: (matrix: Matrix2D, mutInputs: I) => I;

  /**
   * Get a new set of inputs to mutate for a Sprite
   */
  newInputs: () => I;

  /**
   * Returns a device instance that's shared between all Sprites and mutated by
   * the platform to update it
   */
  mutDevice: Device;

  render: PlatformRender;
}

export type PlatformRender = {
  newFrame: () => void;
  endFrame: () => void;
  startRenderSprite: (
    baseProps: SpriteBaseProps,
    stateStackItem: StateStackItem
  ) => void;
  endRenderSprite: (stateStackItem: StateStackItem) => void;
  renderTexture: (
    stateStackItem: StateStackItem,
    texture: Texture | RenderableMutTexture,
    texureState: any
  ) => void;
  startNativeSprite: () => void;
  endNativeSprite: () => void;
};

export type NativeSpriteMap = Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  NativeSpriteImplementation<any, any> | undefined
>;

type StateStackPool = {
  index: number;
  stack: StateStackItem[];
};
type StateStackItem = {
  opacity: number;
  transformation: Matrix2D;
  transformationGameCoords: Matrix2D;
  hasMask: boolean;
};
type StateStackFns = {
  addToStack: (baseProps: SpriteBaseProps) => StateStackItem;
  removeFromStack: () => StateStackItem;
  getStack: (index: number) => StateStackItem;
  getStackIndex: () => number;
  getTopStack: () => StateStackItem;
};

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
  const { mutDevice, getInputs: getInputsPlatform, newInputs } = platform;

  const stateStackPool: StateStackPool = {
    index: 0,
    stack: [
      {
        opacity: 1,
        // Game coordinates to clip space -1/+1
        // This is the last matrix applied
        transformation: m2d.getScaleMatrix(
          2 / mutDevice.size.fullWidth,
          2 / mutDevice.size.fullHeight
        ),
        transformationGameCoords: [...m2d.identityMatrix],
        hasMask: false,
      },
    ],
  };

  // For pooling
  const m1: Matrix2D = [0, 0, 0, 0, 0, 0];
  const m2: Matrix2D = [0, 0, 0, 0, 0, 0];

  const stateStackFns: StateStackFns = {
    addToStack: (baseProps) => {
      const topStack = stateStackPool.stack[stateStackPool.index];

      applyTransformMut(topStack.transformation, m1, baseProps);
      applyTransformMut(topStack.transformationGameCoords, m2, baseProps);

      stateStackPool.index++;

      const stackItem = stateStackPool.stack[stateStackPool.index];

      if (!stackItem) {
        const transformation: Matrix2D = [...m1];
        const transformationGameCoords: Matrix2D = [...m2];
        const stackItem = {
          opacity: topStack.opacity * baseProps.opacity,
          hasMask: baseProps.mask !== null,
          transformation,
          transformationGameCoords,
        };
        stateStackPool.stack.push(stackItem);
        return stackItem;
      } else {
        stackItem.opacity = topStack.opacity * baseProps.opacity;
        stackItem.hasMask = baseProps.mask !== null;
        for (let i = 0; i < m1.length; i++) {
          stackItem.transformation[i] = m1[i];
        }
        for (let i = 0; i < m2.length; i++) {
          stackItem.transformationGameCoords[i] = m2[i];
        }
        return stackItem;
      }
    },
    removeFromStack: () => {
      const stackItem = stateStackPool.stack[stateStackPool.index];
      stateStackPool.index--;

      return stackItem;
    },
    getStack: (index: number) => {
      const stackItem = stateStackPool.stack[index];
      return stackItem;
    },
    getStackIndex: () => stateStackPool.index,
    getTopStack: () => {
      const stackItem = stateStackPool.stack[stateStackPool.index];
      return stackItem;
    },
  };

  const gameContainer = createCustomSpriteContainer(
    gameSprite,
    mutDevice,
    getInputsPlatform,
    newInputs,
    stateStackFns,
    0,
    gameSprite.props.id,
    []
  );
  const gameSize = gameSizeArg || gameSprite.props.size;

  const initRenderMethod = getRenderMethod(mutDevice.size, gameSize);

  let prevTime = 0;
  let currentLag = 0;

  const mutPlatformRender: PlatformRender & { isEmpty: boolean } = {
    isEmpty: false,
    newFrame: platform.render.newFrame,
    endFrame: platform.render.endFrame,
    startRenderSprite: platform.render.startRenderSprite,
    endRenderSprite: platform.render.endRenderSprite,
    renderTexture: platform.render.renderTexture,
    startNativeSprite: platform.render.startNativeSprite,
    endNativeSprite: platform.render.endNativeSprite,
  };

  mutPlatformRender.newFrame();

  traverseCustomSpriteContainer<GameProps, I>(
    gameContainer,
    gameSprite.props,
    mutDevice,
    stateStackFns,
    getInputsPlatform,
    newInputs,
    true,
    initRenderMethod,
    0,
    gameSprite.props.id,
    nativeSpriteSettings,
    mutPlatformRender,
    []
  );

  mutPlatformRender.endFrame();

  const emptyRender: PlatformRender = {
    newFrame: () => null,
    endFrame: () => null,
    startRenderSprite: () => null,
    endRenderSprite: () => null,
    renderTexture: () => null,
    startNativeSprite: () => null,
    endNativeSprite: () => null,
  };

  return {
    runNextFrame(time, resetInputs) {
      const timeSinceLastCall = time - prevTime;
      prevTime = time;
      currentLag += timeSinceLastCall;

      let framesToCatchup = Math.floor(currentLag / REPLAY_TIME_PER_UPDATE_MS);

      if (nativeSpriteSettings.nativeSpriteUtils.didResize) {
        // Resize
        stateStackPool.stack[0].transformation = m2d.getScaleMatrix(
          2 / mutDevice.size.fullWidth,
          2 / mutDevice.size.fullHeight
        );
      }

      while (framesToCatchup > 0) {
        currentLag -= REPLAY_TIME_PER_UPDATE_MS;
        framesToCatchup--;

        const extrapolateFactor = currentLag / REPLAY_TIME_PER_UPDATE_MS;

        const renderMethod = getRenderMethod(mutDevice.size, gameSize);

        const isLastFrame = framesToCatchup === 0;

        // Only draw on last frame
        if (isLastFrame && mutPlatformRender.isEmpty) {
          mutPlatformRender.isEmpty = false;
          mutPlatformRender.newFrame = platform.render.newFrame;
          mutPlatformRender.endFrame = platform.render.endFrame;
          mutPlatformRender.startRenderSprite =
            platform.render.startRenderSprite;
          mutPlatformRender.endRenderSprite = platform.render.endRenderSprite;
          mutPlatformRender.renderTexture = platform.render.renderTexture;
          mutPlatformRender.startNativeSprite =
            platform.render.startNativeSprite;
          mutPlatformRender.endNativeSprite = platform.render.endNativeSprite;
        } else if (!isLastFrame && !mutPlatformRender.isEmpty) {
          mutPlatformRender.isEmpty = true;
          mutPlatformRender.newFrame = emptyRender.newFrame;
          mutPlatformRender.endFrame = emptyRender.endFrame;
          mutPlatformRender.startRenderSprite = emptyRender.startRenderSprite;
          mutPlatformRender.endRenderSprite = emptyRender.endRenderSprite;
          mutPlatformRender.renderTexture = emptyRender.renderTexture;
          mutPlatformRender.startNativeSprite = emptyRender.startNativeSprite;
          mutPlatformRender.endNativeSprite = emptyRender.endNativeSprite;
        }

        nativeSpriteSettings.nativeSpriteUtils.isLastFrame = isLastFrame;

        mutPlatformRender.newFrame();

        traverseCustomSpriteContainer<GameProps, I>(
          gameContainer,
          gameSprite.props,
          mutDevice,
          stateStackFns,
          getInputsPlatform,
          newInputs,
          false,
          renderMethod,
          extrapolateFactor,
          gameSprite.props.id,
          nativeSpriteSettings,
          mutPlatformRender,
          []
        );

        mutPlatformRender.endFrame();

        nativeSpriteSettings.nativeSpriteUtils.didResize = false;

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
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  newInputs: () => I,
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

  const stackItem = stateStackFns.addToStack(baseProps);

  const sprites = customSpriteContainer.getSprites(
    spriteProps,
    stackItem,
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

  platformRender.startRenderSprite(baseProps, stackItem);

  handleSprites(
    sprites,
    customSpriteContainer,
    mutDevice,
    stateStackFns,
    getInputsPlatform,
    newInputs,
    renderMethod,
    extrapolateFactor,
    parentGlobalId,
    nativeSpriteSettings,
    platformRender,
    contextValues,
    addChildId
  );

  platformRender.endRenderSprite(stateStackFns.removeFromStack());

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

          if (container.loadFilesPromise) {
            container.loadFilesPromise.then(() => {
              // Only cleanup once the initial load is complete
              cleanupFiles(containerGlobalId, mutDevice.assetUtils);
            });
          }
        }
        container.cleanup();
      });
    };

    const spriteContainer = customSpriteContainer.childContainers[id];
    recursiveSpriteCleanup({ [id]: spriteContainer }, parentGlobalId);

    delete customSpriteContainer.childContainers[id];
  });

  customSpriteContainer.prevChildIdsSet.clear();
  childIds.forEach((id) => {
    customSpriteContainer.prevChildIdsSet.add(id);
  });

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
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  newInputs: () => I,
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings,
  platformRender: PlatformRender,
  contextValues: ContextValue[],
  addChildId: (id: string) => void
) {
  for (let i = 0; i < sprites.length; i++) {
    const sprite = sprites[i];

    if (!sprite) continue;

    if (sprite.type === "context") {
      handleSprites(
        sprite.sprites,
        customSpriteContainer,
        mutDevice,
        stateStackFns,
        getInputsPlatform,
        newInputs,
        renderMethod,
        extrapolateFactor,
        parentGlobalId,
        nativeSpriteSettings,
        platformRender,
        // Adding the context value to nested sprites here
        [...contextValues, sprite],
        addChildId
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
        const newContainer: NativeSpriteContainer<unknown, UnknownObject> = {
          type: "native",
          props: sprite.props,
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
          updateSprite() {
            platformRender.startNativeSprite();

            newContainer.update?.(sprite.props);

            newContainer.state = nativeSpriteImplementation.loop({
              props: sprite.props,
              state: newContainer.state,
              parentGlobalId,
              utils: nativeSpriteUtils,
              spriteToGameCoords: (x, y, out) => {
                const result = m2dMut.multiplyPooled(
                  stateStackFns.getTopStack().transformationGameCoords,
                  [0, 0, 0, 0, x, y]
                );
                out.x = result[4];
                out.y = result[5];
              },
            });

            platformRender.endNativeSprite();
          },
          cleanup() {
            nativeSpriteImplementation.cleanup({
              state: this.state,
              parentGlobalId,
            });
          },
        };
        customSpriteContainer.childContainers[sprite.props.id] = newContainer;
        lookupNativeSpriteContainer = newContainer;
      }

      lookupNativeSpriteContainer.updateSprite();
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
        stateStackFns,
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
          getInputsPlatform,
          newInputs,
          stateStackFns,
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
        stateStackFns,
        getInputsPlatform,
        newInputs,
        spriteInitCreation,
        renderMethod,
        extrapolateFactor,
        globalId,
        nativeSpriteSettings,
        platformRender,
        contextValues
      );
    } else if (sprite.type === "mutable") {
      if (!sprite.props.id) {
        throw Error("Mutable sprite must have id prop in non-Mutable Sprites");
      }
      addChildId(sprite.props.id);

      let lookupMutableSpriteContainer =
        customSpriteContainer.childContainers[sprite.props.id];

      const globalId = `${parentGlobalId}--${sprite.props.id}`;

      if (
        !lookupMutableSpriteContainer ||
        lookupMutableSpriteContainer.type !== "mutable"
      ) {
        lookupMutableSpriteContainer = createMutableSpriteContainer(
          sprite,
          mutDevice,
          stateStackFns,
          getInputsPlatform,
          newInputs,
          customSpriteContainer.prevTime,
          globalId,
          [],
          platformRender,
          nativeSpriteSettings
        ) as MutableSpriteContainer<any, any, any>;
        if (lookupMutableSpriteContainer.type !== "mutable") {
          throw Error("Can only render mutable Sprite");
        }
        customSpriteContainer.childContainers[
          sprite.props.id
        ] = lookupMutableSpriteContainer;
      }

      for (const key in sprite.props) {
        (lookupMutableSpriteContainer.props as any)[key] = sprite.props[key];
      }

      const stackItem = stateStackFns.addToStack(
        lookupMutableSpriteContainer.props as SpriteBaseProps
      );
      platformRender.startRenderSprite(
        lookupMutableSpriteContainer.props as SpriteBaseProps,
        stackItem
      );
      lookupMutableSpriteContainer.updateSprites();
      platformRender.endRenderSprite(stateStackFns.removeFromStack());
    } else {
      platformRender.renderTexture(stateStackFns.getTopStack(), sprite, null);
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
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  newInputs: () => I,
  stateStackFns: StateStackFns,
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
      getInputs: () =>
        getInputsPlatform(
          stateStackFns.getStack(spriteContainer?.stackIndex || 0)
            .transformationGameCoords,
          spriteContainer?.inputs || newInputs()
        ),
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
    inputs: newInputs(),
    baseProps: getDefaultProps(initProps),
    childContainers: {},
    prevChildIds: [],
    prevChildIdsSet: new Set(),
    prevTime: currentTime,
    currentLag: 0,
    loadFilesPromise,
    stackIndex: null,
    getSprites(
      props,
      stackItem,
      initCreation,
      renderMethod,
      extrapolateFactor,
      contextValues
    ) {
      // Run any updateState from callbacks in other sprites last render
      runUpdateStateCallbacks();

      if (this.stackIndex === null) {
        this.stackIndex = stateStackFns.getStackIndex();
      }

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
          getInputs: () =>
            getInputsPlatform(stackItem.transformationGameCoords, this.inputs),
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
        getInputs: () =>
          getInputsPlatform(stackItem.transformationGameCoords, this.inputs),
        updateState,
        getState,
        getContext,
        extrapolateFactor,
      });

      // Run any updateState from callbacks in render
      runUpdateStateCallbacks();

      return sprites;
    },
    cleanup() {
      spriteObj.cleanup?.({
        state: this.state,
        device: mutDevice,
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

function handleAllMutableContainer<I>(
  container: AllMutableSpriteContainer<I>,
  platformRender: PlatformRender,
  stateStackFns: StateStackFns
) {
  if (container.type === "mutable") {
    container.updateSprite(); // update props
    const stackItem = stateStackFns.addToStack(container.props);
    platformRender.startRenderSprite(container.props, stackItem);
    container.updateSprites();
    platformRender.endRenderSprite(stateStackFns.removeFromStack());
  } else if (container.type === "mutableArray") {
    container.updateSprites();
    for (const key in container.containersArray) {
      const containerEl = container.containersArray[key];
      const stackItem = stateStackFns.addToStack(containerEl.props);
      platformRender.startRenderSprite(containerEl.props, stackItem);
      containerEl.updateSprites();
      platformRender.endRenderSprite(stateStackFns.removeFromStack());
    }
  } else if (container.type === "mutTexture") {
    container.updateTexture();
    platformRender.renderTexture(
      stateStackFns.getTopStack(),
      container.texture,
      container.textureState
    );
  } else if (container.type === "mutArrayTexture") {
    container.updateTextureArray();
    platformRender.renderTexture(
      stateStackFns.getTopStack(),
      container.texture,
      container.textureState
    );
  } else if (container.type === "mutConditional") {
    container.updateConditional();
    container.containers.forEach((container) => {
      handleAllMutableContainer(container, platformRender, stateStackFns);
    });
  } else if (container.type === "mutContext") {
    container.containers.forEach((container) => {
      handleAllMutableContainer(container, platformRender, stateStackFns);
    });
  } else if (container.type === "native") {
    container.updateSprite();
  } else {
    throw Error("TODO");
  }
}

function createMutableSpriteContainer<P, S, I>(
  sprite: AllMutSprite,
  mutDevice: Device,
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I>["getInputs"],
  newInputs: () => I,
  currentTime: number,
  globalId: string,
  contextValues: MutContextValue[],
  platformRender: PlatformRender,
  nativeSpriteSettings: NativeSpriteSettings
): AllMutableSpriteContainer<I> {
  if (sprite.type !== "mutable" && sprite.type !== "mutableArray") {
    if (
      sprite.type === "mutText" ||
      sprite.type === "mutCircle" ||
      sprite.type === "mutRectangle" ||
      sprite.type === "mutImage" ||
      sprite.type === "mutLine" ||
      sprite.type === "mutSpriteSheet"
    ) {
      return {
        type: "mutTexture",
        texture: sprite,
        textureState: getInitTextureState(sprite),
        updateTexture() {
          const update = sprite.update as ((arg: any) => void) | undefined;
          update?.(sprite.props);
        },
        cleanup: () => null,
      };
    }
    if (
      sprite.type === "mutRectangleArray" ||
      sprite.type === "mutImageArray"
    ) {
      return {
        type: "mutArrayTexture",
        texture:
          sprite.type === "mutRectangleArray"
            ? {
                type: "mutRectangleArrayRender",
                props: Array.from({ length: sprite.array.length }).map(() => ({
                  ...sprite.props,
                })),
                mask: null,
              }
            : {
                type: "mutImageArrayRender",
                fileName: sprite.props.fileName,
                props: Array.from({ length: sprite.array.length }).map(() => ({
                  ...sprite.props,
                })),
                mask: null,
              },
        array: sprite.array,
        textureState: getInitTextureState(sprite),
        cleanup: () => null,
        updateTextureArray() {
          const array = this.array();

          const length = array.length;
          const lengthChange = length - this.texture.props.length;

          if (lengthChange > 0) {
            for (let i = 0; i < lengthChange; i++) {
              this.texture.props.push({ ...sprite.props } as any);
            }
          } else if (lengthChange < 0) {
            this.texture.props.length = length;
          }

          this.texture.props.forEach((props: any, index: number) => {
            const update = sprite.update as (
              arg: any,
              itemState: any,
              index: number
            ) => void;
            update(props, array[index], index);
          });
        },
      };
    }
    if (sprite.type === "conditional") {
      const isTrue = sprite.condition();
      return {
        type: "mutConditional",
        condition: sprite.condition,
        isTrue,
        containers: (isTrue
          ? sprite.trueSprites()
          : sprite.falseSprites()
        ).map((sprite, index) =>
          createMutableSpriteContainer(
            sprite,
            mutDevice,
            stateStackFns,
            getInputsPlatform,
            newInputs,
            currentTime,
            `${globalId}--${isTrue}-${index}`,
            contextValues,
            platformRender,
            nativeSpriteSettings
          )
        ),
        updateConditional() {
          if (!this.isTrue && sprite.condition()) {
            this.isTrue = true;
            this.cleanup();
            this.containers = sprite
              .trueSprites()
              .map((sprite, index) =>
                createMutableSpriteContainer(
                  sprite,
                  mutDevice,
                  stateStackFns,
                  getInputsPlatform,
                  newInputs,
                  currentTime,
                  `${globalId}--true-${index}`,
                  contextValues,
                  platformRender,
                  nativeSpriteSettings
                )
              );
          } else if (this.isTrue && !sprite.condition()) {
            this.isTrue = false;
            this.cleanup();
            this.containers = sprite
              .falseSprites()
              .map((sprite, index) =>
                createMutableSpriteContainer(
                  sprite,
                  mutDevice,
                  stateStackFns,
                  getInputsPlatform,
                  newInputs,
                  currentTime,
                  `${globalId}--false-${index}`,
                  contextValues,
                  platformRender,
                  nativeSpriteSettings
                )
              );
          }
        },
        cleanup() {
          this.containers.forEach((container) => {
            container.cleanup();
          });
        },
      };
    }
    if (sprite.type === "mutContext") {
      const newContextValues = [...contextValues, sprite];
      return {
        type: "mutContext",
        containers: sprite.sprites.map((sprite, index) =>
          createMutableSpriteContainer(
            sprite,
            mutDevice,
            stateStackFns,
            getInputsPlatform,
            newInputs,
            currentTime,
            `${globalId}--${index}`,
            newContextValues,
            platformRender,
            nativeSpriteSettings
          )
        ),
        cleanup() {
          this.containers.forEach((container) => {
            container.cleanup();
          });
        },
      };
    } else if (sprite.type === "native") {
      const { nativeSpriteMap, nativeSpriteUtils } = nativeSpriteSettings;

      const nativeSpriteImplementation = nativeSpriteMap[sprite.name];
      if (!nativeSpriteImplementation) {
        throw Error(`Cannot find Native Sprite "${sprite.name}"`);
      }

      const newContainer: NativeSpriteContainer<
        UnknownObject,
        UnknownObject
      > = {
        type: "native",
        props: sprite.props,
        state: nativeSpriteImplementation.create({
          props: sprite.props,
          parentGlobalId: globalId,
          getState: () => newContainer.state,
          updateState: (mergeState) => {
            newContainer.state = {
              ...newContainer.state,
              ...mergeState,
            };
          },
          utils: nativeSpriteUtils,
        }),
        update: sprite.update,
        updateSprite() {
          this.update?.(this.props);

          platformRender.startNativeSprite();

          newContainer.update?.(this.props);

          newContainer.state = nativeSpriteImplementation.loop({
            props: this.props,
            state: newContainer.state,
            parentGlobalId: globalId,
            utils: nativeSpriteUtils,
            spriteToGameCoords: (x, y, out) => {
              const result = m2dMut.multiplyPooled(
                stateStackFns.getTopStack().transformationGameCoords,
                [0, 0, 0, 0, x, y]
              );
              out.x = result[4];
              out.y = result[5];
            },
          });

          platformRender.endNativeSprite();
        },
        cleanup: () => {
          nativeSpriteImplementation.cleanup({
            state: newContainer.state,
            parentGlobalId: globalId,
          });
        },
      };
      return newContainer;
    }
    throw Error("TODO");
  }

  const { spriteObj } = sprite;

  let loadFilesPromise: null | Promise<void> = null;

  function getContext<T>(context: Context<T>): T {
    const contextValue = contextValues.find((c) => c.context === context);
    if (!contextValue) {
      throw Error("No context setup");
    }
    return (contextValue.value as () => T)();
  }

  if (sprite.type === "mutableArray") {
    const newMutSprite = (
      arrayEl: any,
      index: number
    ): MutableSprite<any, any, I> => {
      const props = sprite.props(arrayEl, index);
      mutateBaseProps(props, props);
      return {
        type: "mutable",
        spriteObj,
        props,
      };
    };
    const spriteContainer: MutableSpriteArrayContainer<P, S, I, any> = {
      type: "mutableArray",
      props: sprite.props,
      update: sprite.update,
      filter: sprite.filter,
      array: sprite.array,
      key: sprite.key,
      prevIds: [],
      prevIdsSet: new Set(),
      containersArray: sprite.array().reduce((obj, arrayEl, index) => {
        const id = sprite.key(arrayEl, index);
        return {
          ...obj,
          [id]: createMutableSpriteContainer(
            newMutSprite(arrayEl, index),
            mutDevice,
            stateStackFns,
            getInputsPlatform,
            newInputs,
            currentTime,
            `${globalId}--${id}`,
            contextValues,
            platformRender,
            nativeSpriteSettings
          ) as MutableSpriteContainer<P, S, I>,
        };
      }, {}),
      updateSprites() {
        const array = this.array();

        const unusedIds = this.prevIdsSet;
        const ids = this.prevIds;
        let idIndex = 0;

        array.forEach((arrayEl, index) => {
          if (this.filter?.(arrayEl, index) === false) return;

          const id = sprite.key(arrayEl, index);

          ids[idIndex] = id;
          idIndex++;
          unusedIds.delete(id);

          let container = this.containersArray[id];

          if (!container) {
            container = createMutableSpriteContainer(
              newMutSprite(arrayEl, index),
              mutDevice,
              stateStackFns,
              getInputsPlatform,
              newInputs,
              currentTime,
              `${globalId}--${id}`,
              contextValues,
              platformRender,
              nativeSpriteSettings
            ) as MutableSpriteContainer<P, S, I>;
            this.containersArray[id] = container;
          }

          const update = sprite.update as (
            thisProps: any,
            itemState: any,
            index: number
          ) => void;
          update(container.props, array[index], index);
        });

        if (idIndex < ids.length) {
          ids.length = idIndex;
        }
        unusedIds.forEach((id) => {
          this.containersArray[id].cleanup();
          delete this.containersArray[id];
        });

        this.prevIdsSet.clear();
        ids.forEach((id) => {
          this.prevIdsSet.add(id);
        });

        if (this.prevIdsSet.size < ids.length) {
          const duplicate = ids.find(
            (item, index) => ids.indexOf(item) !== index
          );
          throw Error(`Duplicate key ${duplicate}`);
        }
      },
      cleanup() {
        for (const id in this.containersArray) {
          this.containersArray[id].cleanup();
        }
      },
    };

    return spriteContainer;
  }

  const { props } = sprite;

  mutateBaseProps(props, props);

  let spriteContainer: MutableSpriteContainer<P, S, I> | null = null;

  const state = spriteObj.init?.({
    props,
    device: mutDevice,
    getState: () => {
      if (!spriteContainer) {
        throw Error("Cannot call getState synchronously in init");
      }
      return spriteContainer.state;
    },
    getInputs: () =>
      getInputsPlatform(
        stateStackFns.getStack(spriteContainer?.stackIndex || 0)
          .transformationGameCoords,
        spriteContainer?.inputs || newInputs()
      ),
    getContext,
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
  }) as S;

  const loopObject = {
    props,
    state,
    device: mutDevice,
    getInputs: () =>
      getInputsPlatform(
        stateStackFns.getStack(spriteContainer?.stackIndex || 0)
          .transformationGameCoords,
        spriteContainer?.inputs || newInputs()
      ),
    getContext,
  };

  spriteContainer = {
    type: "mutable",
    props,
    state,
    inputs: newInputs(),
    stackIndex: null,
    childContainers: spriteObj
      .render({
        props,
        state,
        device: mutDevice,
        getInputs: () =>
          getInputsPlatform(
            stateStackFns.getStack(spriteContainer?.stackIndex || 0)
              .transformationGameCoords,
            spriteContainer?.inputs || newInputs()
          ),
        getContext,
      })
      .map((sprite, index) =>
        createMutableSpriteContainer(
          sprite,
          mutDevice,
          stateStackFns,
          getInputsPlatform,
          newInputs,
          currentTime,
          `${globalId}--${index}`,
          contextValues,
          platformRender,
          nativeSpriteSettings
        )
      ),
    updateSprite() {
      sprite.update?.(props, 0);
    },
    updateSprites() {
      if (this.stackIndex === null) {
        this.stackIndex = stateStackFns.getStackIndex();
      }
      // loopObject.getInputs = () =>
      //   getInputsPlatform(
      //     stateStackFns.getStack(spriteContainer?.stackIndex || 0)
      //       .transformationGameCoords,
      //     this.inputs
      //   );
      spriteObj.loop?.(loopObject);

      this.childContainers.forEach((container) => {
        handleAllMutableContainer(container, platformRender, stateStackFns);
      });
    },
    cleanup() {
      this.childContainers.forEach((container) => {
        container.cleanup();
      });

      spriteObj.cleanup?.({
        state: this.state,
        device: mutDevice,
      });

      if (this.loadFilesPromise) {
        this.loadFilesPromise.then(() => {
          // Only cleanup once the initial load is complete
          cleanupFiles(globalId, mutDevice.assetUtils);
        });
      }
    },
    prevTime: currentTime,
    currentLag: 0,
    loadFilesPromise,
  };

  return spriteContainer!;
}

type SpriteContainer<P, S, I> =
  | CustomSpriteContainer<P, S, I>
  | MutableSpriteContainer<P, S, I>
  | PureCustomSpriteContainer<P>
  | NativeSpriteContainer<P, S>;

type MutableTextureContainer = {
  type: "mutTexture";
  texture: MutSingleTexture;
  textureState: any;
  updateTexture: () => void;
  cleanup: () => void;
};
type MutableArrayTextureContainer = {
  type: "mutArrayTexture";
  texture: MutArrayTextureRenderable;
  array: () => any[];
  textureState: any;
  updateTextureArray: () => void;
  cleanup: () => void;
};

type MutableConditionalContainer<I> = {
  type: "mutConditional";
  condition: () => boolean;
  isTrue: boolean;
  containers: AllMutableSpriteContainer<I>[];
  updateConditional: () => void;
  cleanup: () => void;
};

type AllMutableSpriteContainer<I> =
  | MutableSpriteContainer<any, any, I>
  | MutableSpriteArrayContainer<any, any, I, any>
  | MutableTextureContainer
  | MutableConditionalContainer<I>
  | MutableArrayTextureContainer
  | MutableContextContainer<I>
  | NativeSpriteContainer<any, any>;

type CustomSpriteContainer<P, S, I> = {
  type: "custom";
  state: S;
  inputs: I;
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
  stackIndex: null | number;
  getSprites: (
    props: CustomSpriteProps<P>,
    stackItem: StateStackItem,
    initCreation: boolean,
    renderMethod: RenderMethod,
    time: number,
    contextValues: ContextValue[]
  ) => Sprite[];
  cleanup: () => void;
};

type MutableContextContainer<I> = {
  type: "mutContext";
  containers: AllMutableSpriteContainer<I>[];
  cleanup: () => void;
};

type MutableSpriteContainer<P, S, I> = {
  type: "mutable";
  props: P;
  state: S;
  childContainers: AllMutableSpriteContainer<I>[];
  prevTime: number;
  currentLag: number;
  loadFilesPromise: null | Promise<void>;
  stackIndex: null | number;
  inputs: I;
  updateSprite: () => void;
  updateSprites: () => void;
  cleanup: () => void;
};

type MutableSpriteArrayContainer<P, S, I, ItemState> = {
  type: "mutableArray";
  props: (itemState: ItemState, index: number) => P;
  update?: (thisProps: P, itemState: ItemState, index: number) => void;
  array: () => ItemState[];
  filter?: (itemState: ItemState, index: number) => boolean;
  key: (itemState: ItemState, index: number) => string | number;
  containersArray: Record<string | number, MutableSpriteContainer<P, S, I>>;
  updateSprites: () => void;
  cleanup: () => void;
  prevIds: (string | number)[];
  prevIdsSet: Set<string | number>;
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
  cleanup: () => void;
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
    cleanup: () => null,
  };
}

function traversePureCustomSpriteContainer<P>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  spriteProps: CustomSpriteProps<P>,
  stateStackFns: StateStackFns,
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
    traversePureSpriteCache(spritesResult, platformRender, stateStackFns);

    return spritesResult;
  }

  return traversePureCustomSpriteContainerNotCached(
    pureSpriteContainer,
    spritesResult.sprites,
    stateStackFns,
    deviceSize,
    didResize,
    renderMethod,
    platformRender
  );
}

function traversePureCustomSpriteContainerNotCached<P>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  sprites: PureSprite<unknown>[],
  stateStackFns: StateStackFns,
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

  platformRender.startRenderSprite(
    baseProps,
    stateStackFns.addToStack(baseProps)
  );

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
        stateStackFns,
        deviceSize,
        didResize,
        renderMethod,
        platformRender
      );
      cacheItemIndex++;
    } else {
      platformRender.renderTexture(stateStackFns.getTopStack(), sprite, null);

      cacheItems[cacheItemIndex] = sprite;
      cacheItemIndex++;
    }
  }
  if (cacheItemIndex < cacheItems.length) {
    cacheItems.length = cacheItemIndex;
  }

  platformRender.endRenderSprite(stateStackFns.removeFromStack());

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
  platformRender: PlatformRender,
  stateStackFns: StateStackFns
) {
  const stackItem = stateStackFns.addToStack(cache.baseProps);
  platformRender.startRenderSprite(cache.baseProps, stackItem);

  for (let i = 0; i < cache.items.length; i++) {
    const item = cache.items[i];
    if (item.type === "cache") {
      traversePureSpriteCache(item, platformRender, stateStackFns);
    } else {
      platformRender.renderTexture(stackItem, item, null);
    }
  }

  platformRender.endRenderSprite(stateStackFns.removeFromStack());
}

type NativeSpriteContainer<P, S> = {
  type: "native";
  props: P;
  state: S;
  update?: (thisProps: P) => void;
  updateSprite: () => void;
  cleanup: () => void;
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

// TODO: this func from replay-web
function getInitTextureState(texture: MutTexture): null | Record<any, any> {
  switch (texture.type) {
    case "mutImageArray":
      return {
        matrices: new Float32Array(),
        opacities: new Float32Array(),
      };

    case "mutLine":
      return {
        lineCaps: null,
        linePath: new Float32Array(),
        strokePath: new Float32Array(),
      };

    case "mutCircle":
      return {
        points: new Float32Array(),
      };

    case "mutRectangleArray":
      return {
        matrices: new Float32Array(),
        colours: new Float32Array(),
      };

    case "mutRectangle":
    case "mutImage":
    case "mutSpriteSheet":
    case "mutText":
      return null;
  }
}
