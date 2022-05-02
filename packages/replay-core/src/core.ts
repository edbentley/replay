import { TextureFont, Texture } from "./t";
import {
  CustomSprite,
  MutableCustomSprite,
  MutableSprite,
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
import { ContextValue, MutableContextValue } from "./context";
import {
  MutableTexture,
  MutableSingleTexture,
  MutableArrayTexture,
  newArrayProps,
} from "./t2";
import { m2d, Matrix2D } from "./matrix";
import { applyTransformMut } from "./transform";
import { MaskShape } from "./mask";

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
export interface ReplayPlatform<I, T, M> {
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

  render: PlatformRender<T, M>;

  isTestPlatform: boolean;
}

export type PlatformRender<T, M> = {
  newFrame: () => void;
  endFrame: () => void;
  startRenderSprite: (
    baseProps: SpriteBaseProps,
    stateStackItem: StateStackItem,
    maskState: M | null
  ) => void;
  endRenderSprite: (stateStackItem: StateStackItem) => void;
  renderTexture: (
    stateStackItem: StateStackItem,
    texture: Texture | MutableTexture,
    textureState: T,
    maskState: M | null
  ) => void;
  startNativeSprite: () => void;
  endNativeSprite: () => void;
  getInitTextureState: (texture: Texture | MutableTexture) => T;
  getInitMaskState: (mask: MaskShape) => M;
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

export function replayCore<S, I, T, M>(
  platform: ReplayPlatform<I, T, M>,
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
  const {
    mutDevice,
    getInputs: getInputsPlatform,
    newInputs,
    isTestPlatform,
  } = platform;

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

  const gameContainer = createCustomSpriteContainer<GameProps, S, I, T, M>(
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

  const mutPlatformRender: PlatformRender<T, M> & { isEmpty: boolean } = {
    isEmpty: false,
    newFrame: platform.render.newFrame,
    endFrame: platform.render.endFrame,
    startRenderSprite: platform.render.startRenderSprite,
    endRenderSprite: platform.render.endRenderSprite,
    renderTexture: platform.render.renderTexture,
    startNativeSprite: platform.render.startNativeSprite,
    endNativeSprite: platform.render.endNativeSprite,
    getInitTextureState: platform.render.getInitTextureState,
    getInitMaskState: platform.render.getInitMaskState,
  };

  mutPlatformRender.newFrame();

  traverseCustomSpriteContainer<GameProps, I, T, M>(
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
    isTestPlatform,
    []
  );

  mutPlatformRender.endFrame();

  const emptyRender: PlatformRender<T, M> = {
    newFrame: () => null,
    endFrame: () => null,
    startRenderSprite: () => null,
    endRenderSprite: () => null,
    renderTexture: () => null,
    startNativeSprite: () => null,
    endNativeSprite: () => null,
    getInitTextureState: platform.render.getInitTextureState,
    getInitMaskState: platform.render.getInitMaskState,
  };

  return {
    runNextFrame(time, resetInputs) {
      const timeSinceLastCall = time - prevTime;
      prevTime = time;
      currentLag += timeSinceLastCall;

      let framesToCatchup = Math.round(currentLag / REPLAY_TIME_PER_UPDATE_MS);

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

        traverseCustomSpriteContainer<GameProps, I, T, M>(
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
          isTestPlatform,
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
function traverseCustomSpriteContainer<P, I, T, M>(
  customSpriteContainer: CustomSpriteContainer<P, unknown, I, T, M>,
  spriteProps: CustomSpriteProps<P>,
  mutDevice: Device,
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I, T, M>["getInputs"],
  newInputs: () => I,
  initCreation: boolean,
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings,
  platformRender: PlatformRender<T, M>,
  isTestPlatform: boolean,
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

  platformRender.startRenderSprite(baseProps, stackItem, null);

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
    isTestPlatform,
    contextValues,
    addChildId
  );

  platformRender.endRenderSprite(stateStackFns.removeFromStack());

  if (childIdIndex < childIds.length) {
    childIds.length = childIdIndex;
  }

  for (const id of unusedChildIds) {
    const spriteContainer = customSpriteContainer.childContainers[id];
    recursiveSpriteCleanup(
      { [id]: spriteContainer },
      parentGlobalId,
      mutDevice
    );

    delete customSpriteContainer.childContainers[id];
  }

  customSpriteContainer.prevChildIdsSet.clear();
  for (const id of childIds) {
    customSpriteContainer.prevChildIdsSet.add(id);
  }

  if (customSpriteContainer.prevChildIdsSet.size < childIds.length) {
    const duplicate = childIds.find(
      (item, index) => childIds.indexOf(item) !== index
    );
    throw Error(`Duplicate Sprite id ${duplicate}`);
  }
}

// Run cleanup of Sprites on all the removed child containers
function recursiveSpriteCleanup<I, T, M>(
  containers: { [id: string]: SpriteContainer<unknown, unknown, I, T, M> },
  containerParentGlobalId: string,
  mutDevice: Device
) {
  for (const containerId in containers) {
    const container = containers[containerId];

    if (container.type === "custom") {
      const containerGlobalId = `${containerParentGlobalId}--${containerId}`;

      recursiveSpriteCleanup(
        container.childContainers,
        containerGlobalId,
        mutDevice
      );

      if (container.loadFilesPromise) {
        container.loadFilesPromise.then(() => {
          // Only cleanup once the initial load is complete
          cleanupFiles(containerGlobalId, mutDevice.assetUtils);
        });
      }
    }
    container.cleanup();
  }
}

function handleSprites<P, I, T, M>(
  sprites: Sprite[],
  customSpriteContainer: CustomSpriteContainer<P, unknown, I, T, M>,
  mutDevice: Device,
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I, T, M>["getInputs"],
  newInputs: () => I,
  renderMethod: RenderMethod,
  extrapolateFactor: number,
  parentGlobalId: string,
  nativeSpriteSettings: NativeSpriteSettings,
  platformRender: PlatformRender<T, M>,
  isTestPlatform: boolean,
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
        isTestPlatform,
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
            utils: nativeSpriteUtils,
          }),
          updateSprite() {
            platformRender.startNativeSprite();

            nativeSpriteImplementation.loop({
              props: newContainer.props,
              state: newContainer.state,
              parentGlobalId,
              utils: nativeSpriteUtils,
              spriteToGameCoords: (x, y, out) => {
                const result = m2d.multiplyPooled(
                  stateStackFns.getTopStack().transformationGameCoords,
                  m2d.getTranslateMatrixPooled(x, y)
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

      lookupNativeSpriteContainer.props = sprite.props;

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
        isTestPlatform,
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

      let spriteInitCreation = false;

      if (
        !lookupMutableSpriteContainer ||
        lookupMutableSpriteContainer.type !== "mutable"
      ) {
        spriteInitCreation = true;
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
          isTestPlatform,
          nativeSpriteSettings
        ) as MutableSpriteContainer<SpriteBaseProps, unknown, I, T, M>;
        if (lookupMutableSpriteContainer.type !== "mutable") {
          throw Error("Can only render mutable Sprite");
        }
        customSpriteContainer.childContainers[
          sprite.props.id
        ] = lookupMutableSpriteContainer;
      }

      for (const key in sprite.props) {
        (lookupMutableSpriteContainer.props as UnknownObject)[key] =
          sprite.props[key];
      }

      const stackItem = stateStackFns.addToStack(
        lookupMutableSpriteContainer.props as SpriteBaseProps
      );
      platformRender.startRenderSprite(
        lookupMutableSpriteContainer.props as SpriteBaseProps,
        stackItem,
        lookupMutableSpriteContainer.maskState
      );
      lookupMutableSpriteContainer.updateSprites(spriteInitCreation);
      platformRender.endRenderSprite(stateStackFns.removeFromStack());
    } else {
      platformRender.renderTexture(
        stateStackFns.getTopStack(),
        sprite,
        platformRender.getInitTextureState(sprite),
        null
      );
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
function createCustomSpriteContainer<P, S, I, T, M>(
  sprite: CustomSprite<P, S, I>,
  mutDevice: Device,
  getInputsPlatform: ReplayPlatform<I, T, M>["getInputs"],
  newInputs: () => I,
  stateStackFns: StateStackFns,
  currentTime: number,
  globalId: string,
  contextValues: ContextValue[]
): CustomSpriteContainer<P, S, I, T, M> {
  const { spriteObj, props: initProps } = sprite;

  // Use a queue so state is updated after rendering
  const updateStateQueue: ((state: S) => S)[] = [];

  const updateState = (update: (state: S) => S) => {
    updateStateQueue.push(update);
  };

  let spriteContainer: null | CustomSpriteContainer<P, S, I, T, M> = null;
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

function handleAllMutableContainer<I, T, M>(
  container: AllMutableSpriteContainer<I, T, M>,
  platformRender: PlatformRender<T, M>,
  stateStackFns: StateStackFns,
  initCreation: boolean
) {
  switch (container.type) {
    case "mutable":
      container.updateSelf(); // update props
      const stackItem = stateStackFns.addToStack(container.props);
      platformRender.startRenderSprite(
        container.props,
        stackItem,
        container.maskState
      );
      container.updateSprites(initCreation);
      platformRender.endRenderSprite(stateStackFns.removeFromStack());
      break;

    case "mutableArray":
      container.updateSprites();
      for (const key in container.containersArray) {
        const containerEl = container.containersArray[key];
        const stackItem = stateStackFns.addToStack(containerEl.props);
        platformRender.startRenderSprite(
          containerEl.props,
          stackItem,
          containerEl.maskState
        );
        containerEl.updateSprites(initCreation);
        platformRender.endRenderSprite(stateStackFns.removeFromStack());
      }
      break;

    case "mutTexture":
      container.updateTexture();
      platformRender.renderTexture(
        stateStackFns.getTopStack(),
        container.texture,
        container.textureState,
        container.maskState
      );
      break;

    case "mutOnChange":
      initCreation = initCreation || container.updateOnChange();
      for (const childContainer of container.containers) {
        handleAllMutableContainer(
          childContainer,
          platformRender,
          stateStackFns,
          initCreation
        );
      }
      break;

    case "mutArrayTexture":
      container.updateTextureArray();
      platformRender.renderTexture(
        stateStackFns.getTopStack(),
        container.texture,
        container.textureState,
        container.maskState
      );
      break;

    case "mutRun":
      container.updateRun();
      break;

    case "mutContext":
      for (const childContainer of container.containers) {
        handleAllMutableContainer(
          childContainer,
          platformRender,
          stateStackFns,
          initCreation
        );
      }
      break;

    case "native":
      container.updateSprite();
      break;

    default:
      assertUnreachable(container);
  }
}

function createMutableSpriteContainer<S, I, T, M>(
  sprite: MutableSprite,
  mutDevice: Device,
  stateStackFns: StateStackFns,
  getInputsPlatform: ReplayPlatform<I, T, M>["getInputs"],
  newInputs: () => I,
  currentTime: number,
  globalId: string,
  contextValues: MutableContextValue[],
  platformRender: PlatformRender<T, M>,
  isTestPlatform: boolean,
  nativeSpriteSettings: NativeSpriteSettings
): AllMutableSpriteContainer<I, T, M> | null {
  if (sprite === null) return null;

  switch (sprite.type) {
    case "text":
    case "circle":
    case "rectangle":
    case "image":
    case "line":
    case "spriteSheet": {
      const initProps = sprite.props;
      const update = sprite.update as
        | ((arg: typeof initProps) => void)
        | undefined;

      update?.(initProps);

      return {
        type: "mutTexture",
        texture: sprite,
        textureState: platformRender.getInitTextureState(sprite),
        maskState: platformRender.getInitMaskState(sprite.props.mask),
        updateTexture() {
          update?.(this.texture.props);
        },
        cleanup: () => null,
      };
    }

    case "rectangleArray":
    case "textArray":
    case "circleArray":
    case "lineArray":
    case "imageArray": {
      const initArray = sprite.array();

      type PropsArrayType = typeof sprite.props;
      type PropsType = PropsArrayType[0];

      const update = sprite.update as
        | ((arg: PropsType, itemState: unknown, index: number) => void)
        | undefined;

      sprite.props = Array.from({ length: initArray.length }).map(
        (_, index) => {
          const props = (newArrayProps(
            sprite,
            sprite.newProps(initArray[index], index)
          ) as unknown) as PropsType;
          update?.(props, initArray[index], index);
          return props;
        }
      ) as PropsArrayType;

      return {
        type: "mutArrayTexture",
        texture: sprite,
        array: sprite.array,
        textureState: platformRender.getInitTextureState(sprite),
        maskState: platformRender.getInitMaskState(sprite.mask),
        cleanup: () => null,
        pooledProps: [],
        updateTextureArray() {
          const newArray = this.array();

          const newLength = newArray.length;
          const currLength = this.texture.props.length;
          const lengthChange = newLength - currLength;

          if (lengthChange > 0) {
            for (let i = 0; i < lengthChange; i++) {
              if (this.pooledProps.length > 0) {
                // Can't get types to match for this.texture.props.push(...)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.texture.props.push(this.pooledProps.pop() as any);
              } else {
                const newProps = newArrayProps(
                  sprite,
                  sprite.newProps(newArray[currLength + i], currLength + i)
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.texture.props.push(newProps as any);
              }
            }
          } else if (lengthChange < 0) {
            let toRemove = -lengthChange;
            while (toRemove > 0) {
              toRemove--;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              this.pooledProps.push(this.texture.props.pop() as any);
            }
          }

          for (let index = 0; index < this.texture.props.length; index++) {
            const props = this.texture.props[index];

            update?.(props, newArray[index], index);

            if (isTestPlatform && sprite.testId) {
              props.testId = sprite.testId(newArray[index], index);
            }
          }
        },
      };
    }

    case "onChange": {
      const initValue = sprite.value();
      return {
        type: "mutOnChange",
        value: initValue,
        containers: sprite
          .sprites()
          .map((sprite, index) =>
            createMutableSpriteContainer(
              sprite,
              mutDevice,
              stateStackFns,
              getInputsPlatform,
              newInputs,
              currentTime,
              `${globalId}--${initValue}-${index}`,
              contextValues,
              platformRender,
              isTestPlatform,
              nativeSpriteSettings
            )
          )
          .filter(isNotNull),
        updateOnChange() {
          const newValue = sprite.value();
          if (this.value !== newValue) {
            this.value = newValue;
            this.cleanup();
            this.containers = sprite
              .sprites()
              .map((sprite, index) =>
                createMutableSpriteContainer(
                  sprite,
                  mutDevice,
                  stateStackFns,
                  getInputsPlatform,
                  newInputs,
                  currentTime,
                  `${globalId}--${newValue}-${index}`,
                  contextValues,
                  platformRender,
                  isTestPlatform,
                  nativeSpriteSettings
                )
              )
              .filter(isNotNull);
            return true;
          }
          return false;
        },
        cleanup() {
          for (const container of this.containers) {
            container.cleanup();
          }
        },
      };
    }

    case "run":
      return {
        type: "mutRun",
        updateRun: () => {
          sprite.fn();
        },
        cleanup: () => null,
      };

    case "conditional": {
      const initIsTrue = sprite.condition();
      return {
        type: "mutOnChange",
        value: initIsTrue,
        containers: (initIsTrue ? sprite.trueSprites() : sprite.falseSprites())
          .map((sprite, index) =>
            createMutableSpriteContainer(
              sprite,
              mutDevice,
              stateStackFns,
              getInputsPlatform,
              newInputs,
              currentTime,
              `${globalId}--${initIsTrue}-${index}`,
              contextValues,
              platformRender,
              isTestPlatform,
              nativeSpriteSettings
            )
          )
          .filter(isNotNull),
        updateOnChange() {
          const newValue = sprite.condition();

          if (!this.value && newValue) {
            this.value = true;
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
                  isTestPlatform,
                  nativeSpriteSettings
                )
              )
              .filter(isNotNull);
            return true;
          }
          if (this.value && !newValue) {
            this.value = false;
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
                  isTestPlatform,
                  nativeSpriteSettings
                )
              )
              .filter(isNotNull);
            return true;
          }
          return false;
        },
        cleanup() {
          for (const container of this.containers) {
            container.cleanup();
          }
        },
      };
    }

    case "mutContext": {
      const newContextValues = [...contextValues, sprite];
      return {
        type: "mutContext",
        containers: sprite.sprites
          .map((sprite, index) =>
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
              isTestPlatform,
              nativeSpriteSettings
            )
          )
          .filter(isNotNull),
        cleanup() {
          for (const container of this.containers) {
            container.cleanup();
          }
        },
      };
    }

    case "native": {
      const { nativeSpriteMap, nativeSpriteUtils } = nativeSpriteSettings;

      const nativeSpriteImplementation = nativeSpriteMap[sprite.name];
      if (!nativeSpriteImplementation) {
        throw Error(`Cannot find Native Sprite "${sprite.name}"`);
      }

      const state = nativeSpriteImplementation.create({
        props: sprite.props,
        parentGlobalId: globalId,
        getState: () => newContainer.state,
        utils: nativeSpriteUtils,
      });

      const loopObject: Parameters<
        NativeSpriteImplementation<unknown, unknown>["loop"]
      >[0] = {
        props: sprite.props,
        state,
        parentGlobalId: globalId,
        utils: nativeSpriteUtils,
        spriteToGameCoords: (x, y, out) => {
          const result = m2d.multiplyPooled(
            stateStackFns.getTopStack().transformationGameCoords,
            m2d.getTranslateMatrixPooled(x, y)
          );
          out.x = result[4];
          out.y = result[5];
        },
      };

      const newContainer: NativeSpriteContainer<
        SpriteBaseProps,
        UnknownObject
      > = {
        type: "native",
        props: sprite.props,
        state,
        updateSprite() {
          platformRender.startNativeSprite();

          sprite.update?.(this.props);

          nativeSpriteImplementation.loop(loopObject);

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

    case "mutableArray": {
      const { spriteObj } = sprite;

      const update = sprite.update as
        | ((
            thisProps: SpriteBaseProps,
            itemState: unknown,
            index: number
          ) => void)
        | undefined;

      const newMutSprite = <P, S, V>(
        arrayEl: V,
        index: number
      ): MutableCustomSprite<P, S, I> => {
        const props = sprite.props(arrayEl, index);
        mutateBaseProps(props, props);
        sprite.update?.(props, arrayEl, index);
        sprite.updateAll?.(props);
        return {
          type: "mutable",
          spriteObj: spriteObj as MutableCustomSprite<P, S, I>["spriteObj"],
          props,
        };
      };
      const prevIds: string[] = [];
      const spriteContainer: MutableSpriteArrayContainer<
        SpriteBaseProps,
        I,
        unknown,
        T,
        M
      > = {
        type: "mutableArray",
        props: sprite.props,
        update: sprite.update,
        filter: sprite.filter,
        array: sprite.array,
        key: sprite.key,
        prevIdsA: prevIds, // initially share a ref with B
        prevIdsB: prevIds,
        isOnSamePrevIdRef: true,
        onPrevIdA: true,
        containersArray: sprite
          .array()
          .map((arrayEl, index) => {
            if (sprite.filter === undefined || sprite.filter(arrayEl, index)) {
              return arrayEl;
            } else {
              return null;
            }
          })
          .reduce((obj, arrayEl, index) => {
            if (arrayEl === null) return obj;
            const id = sprite.key(arrayEl, index);

            obj[id] = createMutableSpriteContainer(
              newMutSprite(arrayEl, index),
              mutDevice,
              stateStackFns,
              getInputsPlatform,
              newInputs,
              currentTime,
              `${globalId}--${id}`,
              contextValues,
              platformRender,
              isTestPlatform,
              nativeSpriteSettings
            ) as MutableSpriteContainer<SpriteBaseProps, unknown, I, T, M>;

            return obj;
          }, {}),
        updateSprites() {
          const array = this.array();

          const ids = this.onPrevIdA ? this.prevIdsA : this.prevIdsB;
          const prevIds = this.onPrevIdA ? this.prevIdsB : this.prevIdsA;
          let idIndex = 0;

          let newSprites = 0;

          for (let index = 0; index < array.length; index++) {
            const arrayEl = array[index];
            if (this.filter?.(arrayEl, index) === false) continue;

            const id = sprite.key(arrayEl, index);

            ids[idIndex] = id;
            idIndex++;

            let container = this.containersArray[id];

            if (!container) {
              newSprites++;
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
                isTestPlatform,
                nativeSpriteSettings
              ) as typeof container;
              this.containersArray[id] = container;
            }

            sprite.updateAll?.(container.props);

            update?.(container.props, array[index], index);
          }

          if (idIndex < ids.length) {
            ids.length = idIndex;
          }

          const newLength = ids.length;
          const predictedLength = prevIds.length + newSprites;

          if (newLength > predictedLength) {
            // Check for duplicates
            const duplicate = ids.find(
              (item, index) => ids.indexOf(item) !== index
            );
            throw Error(`Duplicate key ${duplicate}`);
          } else if (newLength < predictedLength) {
            // Some were removed
            const unusedIdsSet = new Set(prevIds);
            for (const id of ids) {
              unusedIdsSet.delete(id);
            }
            for (const id of unusedIdsSet) {
              this.containersArray[id].cleanup();
              delete this.containersArray[id];
            }
          }

          // Alternate
          this.onPrevIdA = !this.onPrevIdA;

          if (this.isOnSamePrevIdRef) {
            this.isOnSamePrevIdRef = false;
            // Separate refs
            this.prevIdsB = [...this.prevIdsB];
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

    case "mutable": {
      const { spriteObj } = sprite;

      let loadFilesPromise: null | Promise<void> = null;

      function getContext<T>(context: Context<T>): T {
        const contextValue = contextValues.find((c) => c.context === context);
        if (!contextValue) {
          throw Error("No context setup");
        }
        return (contextValue.value as () => T)();
      }

      const { props } = sprite;

      mutateBaseProps(props, props);
      sprite.update?.(props);

      let spriteContainer: MutableSpriteContainer<
        SpriteBaseProps,
        S,
        I,
        T,
        M
      > | null = null;

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
          const loadFiles = preloadFiles(
            globalId,
            assets,
            mutDevice.assetUtils
          );
          if (spriteContainer) {
            spriteContainer.loadFilesPromise = loadFiles;
          } else {
            // Was called synchronously
            loadFilesPromise = loadFiles;
          }
          await loadFiles;
        },
      });

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
        maskState: platformRender.getInitMaskState(sprite.props.mask),
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
              isTestPlatform,
              nativeSpriteSettings
            )
          )
          .filter(isNotNull),
        updateSelf() {
          sprite.update?.(props);
        },
        updateSprites(initCreation) {
          if (this.stackIndex === null) {
            this.stackIndex = stateStackFns.getStackIndex();
          }

          if (!initCreation) {
            // Don't run loop on first frame
            spriteObj.loop?.(loopObject);
          }

          for (const childContainer of this.childContainers) {
            handleAllMutableContainer(
              childContainer,
              platformRender,
              stateStackFns,
              initCreation
            );
          }
        },
        cleanup() {
          for (const childContainer of this.childContainers) {
            childContainer.cleanup();
          }

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
        loadFilesPromise,
      };

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return spriteContainer!;
    }
  }
}

type SpriteContainer<P, S, I, T, M> =
  | CustomSpriteContainer<P, S, I, T, M>
  | MutableSpriteContainer<P, S, I, T, M>
  | PureCustomSpriteContainer<P>
  | NativeSpriteContainer<P, S>;

type MutableTextureContainer<T, M> = {
  type: "mutTexture";
  texture: MutableSingleTexture;
  textureState: T;
  maskState: M;
  updateTexture: () => void;
  cleanup: () => void;
};
type MutableArrayTextureContainer<T, A, M> = {
  type: "mutArrayTexture";
  texture: MutableArrayTexture;
  array: () => A[];
  textureState: T;
  maskState: M;
  pooledProps: MutableArrayTexture["props"];
  updateTextureArray: () => void;
  cleanup: () => void;
};

type MutableOnChangeContainer<I, V, T, M> = {
  type: "mutOnChange";
  value: V;
  containers: AllMutableSpriteContainer<I, T, M>[];
  updateOnChange: () => boolean;
  cleanup: () => void;
};

type MutableRunContainer = {
  type: "mutRun";
  updateRun: () => void;
  cleanup: () => void;
};

type AllMutableSpriteContainer<I, T, M> =
  | MutableSpriteContainer<SpriteBaseProps, unknown, I, T, M>
  | MutableSpriteArrayContainer<SpriteBaseProps, I, unknown, T, M>
  | MutableTextureContainer<T, M>
  | MutableOnChangeContainer<I, unknown, T, M>
  | MutableRunContainer
  | MutableArrayTextureContainer<T, unknown, M>
  | MutableContextContainer<I, T, M>
  | NativeSpriteContainer<SpriteBaseProps, unknown>;

type CustomSpriteContainer<P, S, I, T, M> = {
  type: "custom";
  state: S;
  inputs: I;
  childContainers: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: SpriteContainer<unknown, any, I, T, M>;
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

type MutableContextContainer<I, T, M> = {
  type: "mutContext";
  containers: AllMutableSpriteContainer<I, T, M>[];
  cleanup: () => void;
};

type MutableSpriteContainer<P, S, I, T, M> = {
  type: "mutable";
  props: P;
  state: S;
  maskState: M;
  childContainers: AllMutableSpriteContainer<I, T, M>[];
  loadFilesPromise: null | Promise<void>;
  stackIndex: null | number;
  inputs: I;
  updateSelf: () => void;
  updateSprites: (initCreation: boolean) => void;
  cleanup: () => void;
};

type MutableSpriteArrayContainer<P, I, ItemState, T, M> = {
  type: "mutableArray";
  props: (itemState: ItemState, index: number) => P;
  update?: (thisProps: P, itemState: ItemState, index: number) => void;
  array: () => ItemState[];
  filter?: (itemState: ItemState, index: number) => boolean;
  key: (itemState: ItemState, index: number) => string | number;
  containersArray: Record<
    string | number,
    MutableSpriteContainer<SpriteBaseProps, unknown, I, T, M>
  >;
  updateSprites: () => void;
  cleanup: () => void;
  // Two arrays to alternate and avoid GC
  prevIdsA: (string | number)[];
  prevIdsB: (string | number)[];
  onPrevIdA: boolean;
  isOnSamePrevIdRef: boolean;
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

function traversePureCustomSpriteContainer<P, T, M>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  spriteProps: CustomSpriteProps<P>,
  stateStackFns: StateStackFns,
  deviceSize: DeviceSize,
  didResize: boolean,
  renderMethod: RenderMethod,
  platformRender: PlatformRender<T, M>
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

function traversePureCustomSpriteContainerNotCached<P, T, M>(
  pureSpriteContainer: PureCustomSpriteContainer<P>,
  sprites: PureSprite<unknown>[],
  stateStackFns: StateStackFns,
  deviceSize: DeviceSize,
  didResize: boolean,
  renderMethod: RenderMethod,
  platformRender: PlatformRender<T, M>
): PureSpriteCache {
  const { baseProps } = pureSpriteContainer;

  const unusedChildIds = pureSpriteContainer.prevChildIdsSet;

  // Mutate original to reduce GC
  const childIds = pureSpriteContainer.prevChildIds;
  let childIdIndex = 0;

  platformRender.startRenderSprite(
    baseProps,
    stateStackFns.addToStack(baseProps),
    null
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
      platformRender.renderTexture(
        stateStackFns.getTopStack(),
        sprite,
        platformRender.getInitTextureState(sprite),
        null
      );

      cacheItems[cacheItemIndex] = sprite;
      cacheItemIndex++;
    }
  }
  if (cacheItemIndex < cacheItems.length) {
    cacheItems.length = cacheItemIndex;
  }

  platformRender.endRenderSprite(stateStackFns.removeFromStack());

  for (const id of unusedChildIds) {
    delete pureSpriteContainer.childContainers[id];
  }

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

function traversePureSpriteCache<T, M>(
  cache: PureSpriteCache,
  platformRender: PlatformRender<T, M>,
  stateStackFns: StateStackFns
) {
  const stackItem = stateStackFns.addToStack(cache.baseProps);
  platformRender.startRenderSprite(cache.baseProps, stackItem, null);

  for (let i = 0; i < cache.items.length; i++) {
    const sprite = cache.items[i];
    if (sprite.type === "cache") {
      traversePureSpriteCache(sprite, platformRender, stateStackFns);
    } else {
      platformRender.renderTexture(
        stackItem,
        sprite,
        platformRender.getInitTextureState(sprite),
        null
      );
    }
  }

  platformRender.endRenderSprite(stateStackFns.removeFromStack());
}

type NativeSpriteContainer<P, S> = {
  type: "native";
  props: P;
  state: S;
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

type UnknownObject = Record<string, unknown>;

function isNotNull<T>(it: T): it is NonNullable<T> {
  return it != null;
}

function assertUnreachable(_: never): never {
  throw new Error("Replay unreachable error");
}
