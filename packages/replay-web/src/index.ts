import { GameProps, DeviceSize, Device } from "@replay/core";
import {
  replayCore,
  ReplayPlatform,
  NativeSpriteMap,
} from "@replay/core/dist/core";
import {
  CustomSprite,
  SpriteTextures,
  NativeSpriteUtils,
} from "@replay/core/dist/sprite";
import { AssetUtils, AssetMap } from "@replay/core/dist/device";
import {
  getInputs,
  keyUpHandler as inputKeyUpHandler,
  keyDownHandler as inputKeyDownHandler,
  resetInputs,
  Inputs,
  pointerUpHandler,
  pointerDownHandler,
  pointerMoveHandler,
  clientXToGameX,
  clientYToGameY,
  pointerCancelHandler,
} from "./input";
import { drawCanvas } from "./draw";
import { getDeviceSize, setDeviceSize, calculateDeviceSize } from "./size";
import { Dimensions } from "./dimensions";
import { getGameXToWebX, getGameYToWebY } from "./coordinates";
import { getTimer } from "./timer";
import {
  getAudio,
  getNetwork,
  getStorage,
  getFileBuffer,
  AudioData,
  ImageFileData,
} from "./device";
import { isTouchDevice } from "./isTouchDevice";

export { Inputs as WebInputs, mapInputCoordinates } from "./input";
export { Dimensions } from "./dimensions";

const DEFAULT_FONT = {
  name: "sans-serif",
  size: 12,
};

interface AudioContextWindow extends Window {
  webkitAudioContext: globalThis.AudioContext;
}
declare let window: AudioContextWindow & typeof globalThis;

export type RenderCanvasOptions = {
  /**
   * Preferred method of placing the game in the browser window
   *
   * @default "game-coords"
   */
  dimensions?: Dimensions;
  /**
   * A map of Native Sprite names and their web implementation
   */
  nativeSpriteMap?: NativeSpriteMap;
  /**
   * Supply a canvas element to render to. Will create a new one if not
   * provided.
   */
  canvas?: HTMLCanvasElement;
  /**
   * Override the view size, instead of using the window size
   */
  windowSize?: { width: number; height: number };
};

/**
 * Render your Replay game to the web canvas. Call this at your game's entry
 * file.
 */
export function renderCanvas<S>(
  gameSprite: CustomSprite<GameProps, S, Inputs>,
  options?: RenderCanvasOptions
) {
  const {
    dimensions = "game-coords",
    canvas: userCanvas,
    nativeSpriteMap = {},
    windowSize,
  } = options || {};

  const canvas = userCanvas || document.createElement("canvas");
  if (!userCanvas) {
    document.body.appendChild(canvas);
  }

  // Support on mobile browsers that don't support this
  const pointerDownEv = window.PointerEvent ? "pointerdown" : "touchstart";
  const pointerMoveEv = window.PointerEvent ? "pointermove" : "touchmove";
  const pointerUpEv = window.PointerEvent ? "pointerup" : "touchend";
  const pointerCancelEv = window.PointerEvent ? "pointercancel" : "touchcancel";

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d", { alpha: false })!;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  let isInFocus = true;

  // Visibility vars
  let isPageVisible = true;
  let lastTimeValue = 0;
  let needsToUpdateNotVisibleTime = false;
  let lastPageNotVisibleTime = 0;
  let totalPageNotVisibleTime = 0;

  const keyDownHandler = (e: KeyboardEvent) => {
    if (!isInFocus) return;
    inputKeyDownHandler(e);
  };
  const keyUpHandler = (e: KeyboardEvent) => {
    if (!isInFocus) return;
    inputKeyUpHandler(e);
  };

  const handlePageVisible = () => {
    if (document.hidden && isPageVisible) {
      // out of visibility
      lastPageNotVisibleTime = lastTimeValue;
      audioContext.suspend();
    }
    if (!document.hidden && !isPageVisible) {
      // visible again
      needsToUpdateNotVisibleTime = true;

      // There's a strange bug on mobile iOS that won't restart the audio unless
      // you suspend and resume again with a small delay in between.
      setTimeout(() => {
        audioContext.suspend();
        setTimeout(() => {
          audioContext.resume();
        }, 75);
      }, 75);
    }
    isPageVisible = !document.hidden;
  };

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  document.addEventListener("visibilitychange", handlePageVisible, false);

  window.addEventListener("resize", updateDeviceSize, false);

  const updateScroll = () => updateDeviceSize({ didScroll: true });
  window.addEventListener("scroll", updateScroll, false);

  // Disable right click
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  let prevDeviceSize: DeviceSize | undefined;
  let pointerDown: (e: PointerEvent | TouchEvent) => void;
  let pointerMove: (e: PointerEvent | TouchEvent) => void;
  let pointerUp: (e: PointerEvent | TouchEvent) => void;
  let pointerCancel: (e: PointerEvent | TouchEvent) => void;
  let scale: number;

  const nativeSpriteUtils: NativeSpriteUtils = {
    didResize: false,
    scale: 1,
    gameXToPlatformX: (x) => x,
    gameYToPlatformY: (y) => y,
  };

  function updateDeviceSize(
    opts?: { cleanup?: boolean; didScroll?: boolean } | Event
  ) {
    const cleanup = Boolean(opts && "cleanup" in opts && opts.cleanup);
    const didScroll = Boolean(opts && "didScroll" in opts && opts.didScroll);

    if (prevDeviceSize) {
      ctx.restore();
      document.removeEventListener(pointerDownEv, pointerDown);
      document.removeEventListener(pointerMoveEv, pointerMove);
      document.removeEventListener(pointerUpEv, pointerUp);
      document.removeEventListener(pointerCancelEv, pointerCancel);
      if (cleanup) {
        return;
      }
    }

    // Don't update device size on scroll as window gets smaller
    const deviceSize =
      didScroll && prevDeviceSize
        ? prevDeviceSize
        : setDeviceSize(
            windowSize?.width || window.innerWidth,
            windowSize?.height || window.innerHeight,
            dimensions,
            gameSprite.props.size
          );
    canvas.width = deviceSize.deviceWidth;
    canvas.height = deviceSize.deviceHeight;

    const defaultFont = gameSprite.props.defaultFont || DEFAULT_FONT;

    // also update render with new size
    const renderCanvasResult = drawCanvas(
      ctx,
      deviceSize,
      imageElements,
      defaultFont
    );
    scale = renderCanvasResult.scale;
    render.ref = renderCanvasResult.render;

    nativeSpriteUtils.gameXToPlatformX = getGameXToWebX({
      canvasOffsetLeft: canvas.offsetLeft,
      width: deviceSize.width,
      widthMargin: deviceSize.widthMargin,
      scale,
    });

    nativeSpriteUtils.gameYToPlatformY = getGameYToWebY({
      canvasOffsetTop: canvas.offsetTop,
      height: deviceSize.height,
      heightMargin: deviceSize.heightMargin,
      scale,
    });

    nativeSpriteUtils.didResize = true;
    nativeSpriteUtils.scale = scale;

    const getX = clientXToGameX({
      canvasOffsetLeft: canvas.offsetLeft,
      scrollX: window.scrollX,
      width: deviceSize.width,
      widthMargin: deviceSize.widthMargin,
      scale,
    });
    const getY = clientYToGameY({
      canvasOffsetTop: canvas.offsetTop,
      scrollY: window.scrollY,
      height: deviceSize.height,
      heightMargin: deviceSize.heightMargin,
      scale,
    });

    const isPointerOutsideGame = (x: number, y: number) =>
      x > deviceSize.width / 2 + deviceSize.widthMargin ||
      x < -deviceSize.width / 2 - deviceSize.widthMargin ||
      y > deviceSize.height / 2 + deviceSize.heightMargin ||
      y < -deviceSize.height / 2 - deviceSize.heightMargin;

    pointerDown = (e: PointerEvent | TouchEvent) => {
      if ("changedTouches" in e) {
        isInFocus = false;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const x = getX({ clientX: touch.screenX });
          const y = getY({ clientY: touch.screenY });
          if (isPointerOutsideGame(x, y)) {
            continue;
          }
          isInFocus = true;
          pointerDownHandler(x, y, touch.identifier);
        }
        return;
      }

      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        isInFocus = false;
        return;
      }
      isInFocus = true;
      pointerDownHandler(x, y, e.pointerId);
    };
    pointerMove = (e: PointerEvent | TouchEvent) => {
      if ("changedTouches" in e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const x = getX({ clientX: touch.screenX });
          const y = getY({ clientY: touch.screenY });
          if (isPointerOutsideGame(x, y)) {
            continue;
          }
          pointerMoveHandler(x, y);
        }
        return;
      }

      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        return;
      }
      pointerMoveHandler(x, y);
    };
    pointerUp = (e: PointerEvent | TouchEvent) => {
      if ("changedTouches" in e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const x = getX({ clientX: touch.screenX });
          const y = getY({ clientY: touch.screenY });
          if (isPointerOutsideGame(x, y)) {
            pointerCancelHandler(touch.identifier);
            continue;
          }
          pointerUpHandler(x, y, touch.identifier);
        }
        return;
      }

      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        pointerCancelHandler(e.pointerId);
        return;
      }
      pointerUpHandler(x, y, e.pointerId);
    };
    pointerCancel = (e: PointerEvent | TouchEvent) => {
      if ("changedTouches" in e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
          pointerCancelHandler(e.changedTouches[i].identifier);
        }
        return;
      }
      pointerCancelHandler(e.pointerId);
    };
    document.addEventListener(pointerDownEv, pointerDown, false);
    document.addEventListener(pointerMoveEv, pointerMove, false);
    document.addEventListener(pointerUpEv, pointerUp, false);
    document.addEventListener(pointerCancelEv, pointerCancel, false);

    prevDeviceSize = deviceSize;
  }

  const audioElements: AssetMap<AudioData> = {};
  const imageElements: AssetMap<ImageFileData> = {};

  const noFileError = (fileType: "audio" | "image", fileName: string) => () => {
    throw Error(`Failed to load ${fileType} file "${fileName}"`);
  };

  const assetUtils: AssetUtils<AudioData, ImageFileData> = {
    audioElements,
    imageElements,
    loadAudioFile: (fileName) => {
      return getFileBuffer(audioContext, fileName)
        .then((buffer) => ({ buffer }))
        .catch(noFileError("audio", fileName));
    },
    loadImageFile: (fileName) => {
      return new Promise<ImageFileData>((resolve, reject) => {
        const image = new Image();

        image.addEventListener("load", () => {
          resolve(image);
        });
        image.addEventListener("error", reject);
        image.src = fileName;
      }).catch(noFileError("image", fileName));
    },
    cleanupAudioFile: (fileName) => {
      const { data } = audioElements[fileName];
      if ("then" in data || !data.playState) return;
      // Additional steps required to free up memory: https://stackoverflow.com/a/32568948/2637899
      data.playState.sample.onended = null;
      data.playState.sample.disconnect();
      data.playState.sample.buffer = null;
    },
    cleanupImageFile: () => null,
  };

  const domPlatform: ReplayPlatform<Inputs> = {
    getGetDevice: deviceCreator(
      audioContext,
      calculateDeviceSize(
        windowSize?.width || window.innerWidth,
        windowSize?.height || window.innerHeight,
        dimensions,
        gameSprite.props.size
      ),
      assetUtils
    ),
  };

  const render: {
    ref: ((textures: SpriteTextures) => void) | null;
  } = { ref: null };

  updateDeviceSize();

  let isCleanedUp = false;

  const onFirstInteraction = () => {
    document.removeEventListener("keydown", onFirstInteraction, false);
    document.removeEventListener(pointerDownEv, onFirstInteraction, false);

    // check if context is in suspended state (autoplay policy)
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  };

  document.addEventListener("keydown", onFirstInteraction, false);
  document.addEventListener(pointerDownEv, onFirstInteraction, false);

  const { initTextures, getNextFrameTextures } = replayCore<S, Inputs>(
    domPlatform,
    {
      nativeSpriteMap,
      nativeSpriteUtils,
    },
    gameSprite
  );

  let initTime: number | null = null;

  function loop(textures: SpriteTextures) {
    render.ref?.(textures);
    window.requestAnimationFrame((time) => {
      if (isCleanedUp) {
        return;
      }
      if (initTime === null) {
        initTime = time - 1 / 60;
      }
      if (needsToUpdateNotVisibleTime) {
        needsToUpdateNotVisibleTime = false;
        totalPageNotVisibleTime += time - lastPageNotVisibleTime;
      }
      lastTimeValue = time;
      loop(
        getNextFrameTextures(
          time - initTime - totalPageNotVisibleTime,
          resetInputs
        )
      );
    });
  }

  loop(initTextures);

  /**
   * Unloads the game and removes all loops and event listeners
   */
  function cleanup() {
    // hack to remove canvas content
    canvas.width = canvas.width;

    // Remove if we created canvas
    if (!userCanvas) {
      document.body.removeChild(canvas);
    }

    isCleanedUp = true;
    document.removeEventListener("keydown", inputKeyDownHandler, false);
    document.removeEventListener("keyup", inputKeyUpHandler, false);
    document.removeEventListener("visibilitychange", handlePageVisible, false);
    window.removeEventListener("resize", updateDeviceSize, false);
    window.removeEventListener("scroll", updateScroll, false);
    updateDeviceSize({ cleanup: true });
  }

  return {
    cleanup,
    // elements exported for testing
    audioElements,
    imageElements,
    audioContext,
  };
}

function deviceCreator(
  audioContext: AudioContext,
  defaultSize: DeviceSize,
  assetUtils: AssetUtils<AudioData, ImageFileData>
): ReplayPlatform<Inputs>["getGetDevice"] {
  // called once
  const initDevice: Omit<Device<Inputs>, "inputs" | "size" | "now"> = {
    isTouchScreen: isTouchDevice(),
    log: console.log,
    random: Math.random,
    timer: getTimer(),
    audio: getAudio(audioContext, assetUtils.audioElements),
    assetUtils: assetUtils as AssetUtils<unknown, unknown>,
    network: getNetwork(),
    storage: getStorage(),
    alert: {
      ok: (message, onResponse) => {
        alert(message);
        onResponse?.();
      },
      okCancel: (message, onResponse) => {
        const wasOk = confirm(message);
        onResponse(wasOk);
      },
    },
    clipboard: {
      copy: (text, onComplete) => {
        // Currently not working on iOS, it may work in iOS 14?
        if (!navigator.clipboard) {
          onComplete(
            new Error(
              window.isSecureContext
                ? "Couldn't access clipboard"
                : "Clipboard only available on HTTPS or localhost"
            )
          );
          return;
        }
        navigator.clipboard
          .writeText(text)
          .then(() => {
            onComplete();
          })
          .catch((error: Error) => {
            onComplete(error);
          });
      },
    },
  };

  return () => {
    // called every frame
    const device: Omit<Device<Inputs>, "inputs"> = {
      ...initDevice,
      size: getDeviceSize() || defaultSize,
      now: () => new Date(),
    };

    // called individually by each Sprite to get inputs relative to position
    return (getLocalCoords) => ({
      ...device,
      inputs: getInputs(getLocalCoords),
    });
  };
}
