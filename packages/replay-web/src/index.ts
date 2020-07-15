import { GameProps, Texture, DeviceSize, Store, Device } from "@replay/core";
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
  pointerOutHandler,
} from "./input";
import { drawCanvas } from "./draw";
import { getDeviceSize, setDeviceSize, calculateDeviceSize } from "./size";
import { Dimensions } from "./dimensions";
import { getDefaultProps } from "@replay/core/dist/props";
import { getGameXToWebX, getGameYToWebY } from "./coordinates";

export { Inputs as WebInputs, mapInputCoordinates } from "./input";
export { Dimensions } from "./dimensions";

const DEFAULT_FONT = {
  name: "sans-serif",
  size: 12,
};

/**
 * Render your Replay game to the web canvas. Call this at your game's entry
 * file.
 */
export function renderCanvas<S>(
  gameSprite: CustomSprite<GameProps, S, Inputs>,
  /**
   * What the user sees as the game is loading. Avoid using assets here.
   */
  loadingTextures: Texture[] = [],
  /**
   * These assets will be preloaded before game starts.
   */
  assets: {
    imageFileNames?: string[];
    audioFileNames?: string[];
  } = {},
  /**
   * Preferred method of placing the game in the browser window
   */
  dimensions: Dimensions = "game-coords",
  /**
   * A map of Native Sprite names and their web implementation
   */
  nativeSpriteMap?: NativeSpriteMap,
  userCanvas?: HTMLCanvasElement,
  /**
   * Override the view size, instead of using the window size
   */
  windowSize?: { width: number; height: number }
) {
  const canvas = userCanvas || document.createElement("canvas");
  if (!userCanvas) {
    document.body.appendChild(canvas);
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d", { alpha: false })!;

  let isInFocus = true;

  const keyDownHandler = (e: KeyboardEvent) => {
    if (!isInFocus) return;
    inputKeyDownHandler(e);
  };
  const keyUpHandler = (e: KeyboardEvent) => {
    if (!isInFocus) return;
    inputKeyUpHandler(e);
  };

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  window.addEventListener("resize", updateDeviceSize as () => void, false);

  let prevDeviceSize: DeviceSize | undefined;
  let pointerDown: (e: PointerEvent) => void;
  let pointerMove: (e: PointerEvent) => void;
  let pointerUp: (e: PointerEvent) => void;
  let scale: number;

  const nativeSpriteUtils: NativeSpriteUtils = {
    didResize: false,
    scale: 1,
    gameXToPlatformX: (x) => x,
    gameYToPlatformY: (y) => y,
  };

  function updateDeviceSize(cleanup?: boolean) {
    if (prevDeviceSize) {
      ctx.restore();
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
      document.removeEventListener("pointerout", pointerOutHandler);
      if (cleanup === true) {
        return;
      }
    }

    const deviceSize = setDeviceSize(
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
      width: deviceSize.width,
      widthMargin: deviceSize.widthMargin,
      scale,
    });
    const getY = clientYToGameY({
      canvasOffsetTop: canvas.offsetTop,
      height: deviceSize.height,
      heightMargin: deviceSize.heightMargin,
      scale,
    });

    const isPointerOutsideGame = (x: number, y: number) =>
      x > deviceSize.width / 2 + deviceSize.widthMargin ||
      x < -deviceSize.width / 2 - deviceSize.widthMargin ||
      y > deviceSize.height / 2 + deviceSize.heightMargin ||
      y < -deviceSize.height / 2 - deviceSize.heightMargin;

    pointerDown = (e: PointerEvent) => {
      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        isInFocus = false;
        return;
      }
      isInFocus = true;

      pointerDownHandler(x, y);
    };
    pointerMove = (e: PointerEvent) => {
      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        return;
      }
      pointerMoveHandler(x, y);
    };
    pointerUp = (e: PointerEvent) => {
      const x = getX(e);
      const y = getY(e);
      if (isPointerOutsideGame(x, y)) {
        pointerOutHandler();
        return;
      }
      pointerUpHandler(x, y);
    };
    document.addEventListener("pointerdown", pointerDown, false);
    document.addEventListener("pointermove", pointerMove, false);
    document.addEventListener("pointerup", pointerUp, false);
    document.addEventListener("pointerout", pointerOutHandler, false);

    prevDeviceSize = deviceSize;
  }

  const audioElements: { [fileName: string]: HTMLAudioElement } = {};
  const imageElements: { [fileName: string]: HTMLImageElement } = {};

  const domPlatform: ReplayPlatform<Inputs> = {
    getGetDevice: deviceCreator(
      audioElements,
      calculateDeviceSize(
        windowSize?.width || window.innerWidth,
        windowSize?.height || window.innerHeight,
        dimensions,
        gameSprite.props.size
      )
    ),
  };

  const render: {
    ref: ((textures: SpriteTextures) => void) | null;
  } = { ref: null };

  updateDeviceSize();

  let isCleanedUp = false;

  const preloadFiles = async () => {
    // Get every file load as a promise and wait for all before returning
    const loadPromises: Promise<{}>[] = [];

    (assets.audioFileNames || []).forEach((fileName) => {
      audioElements[fileName] = new Audio(fileName);
      loadPromises.push(
        new Promise((resolve, reject) => {
          audioElements[fileName].addEventListener("canplaythrough", resolve);
          audioElements[fileName].addEventListener("error", reject);
        })
      );
      audioElements[fileName].load();
    });

    (assets.imageFileNames || []).forEach((fileName) => {
      imageElements[fileName] = new Image();
      loadPromises.push(
        new Promise((resolve, reject) => {
          imageElements[fileName].addEventListener("load", resolve);
          imageElements[fileName].addEventListener("error", reject);
          imageElements[fileName].src = fileName;
        })
      );
    });

    await Promise.all(loadPromises);
  };

  // Show initial loading scene
  render.ref?.({
    id: "Loading",
    baseProps: getDefaultProps({}),
    textures: loadingTextures,
  });

  const loadPromise = preloadFiles().then(() => {
    const handleAutoPlay = () => {
      document.removeEventListener("keydown", handleAutoPlay, false);
      document.removeEventListener("pointerdown", handleAutoPlay, false);

      // We need to play all sounds on first interaction for iOS Safari
      // See https://rosswintle.uk/2019/01/skirting-the-ios-safari-audio-auto-play-policy-for-ui-sound-effects/
      Object.values(audioElements).forEach((audioEl) => {
        audioEl.muted = true;
        audioEl.play().then(() => {
          audioEl.pause();
          audioEl.muted = false;
        });
      });
    };

    document.addEventListener("keydown", handleAutoPlay, false);
    document.addEventListener("pointerdown", handleAutoPlay, false);

    const { initTextures, getNextFrameTextures } = replayCore<S, Inputs>(
      domPlatform,
      {
        nativeSpriteMap: nativeSpriteMap || {},
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
        loop(getNextFrameTextures(time - initTime));
        resetInputs();
      });
    }

    loop(initTextures);
  });

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
    window.removeEventListener("resize", updateDeviceSize as () => void, false);
    updateDeviceSize(true);
  }

  return { cleanup, loadPromise, audioElements }; // audioElements exported for testing
}

function deviceCreator(
  audioElements: {
    [filename: string]: HTMLAudioElement;
  },
  defaultSize: DeviceSize
): ReplayPlatform<Inputs>["getGetDevice"] {
  // called once
  const initDevice: Omit<Device<Inputs>, "inputs" | "size" | "now"> = {
    log: console.log,
    random: Math.random,
    timeout: (callback, ms) => setTimeout(callback, ms),
    audio: (filename) => {
      function getAudioElement(play: boolean) {
        let audioElement = audioElements[filename];
        if (!audioElement) {
          throw Error(`Cannot find audio file ${filename}`);
        }
        if (play && !audioElement.paused) {
          // it's being played somewhere else, need a new audio element
          audioElement = new Audio(filename);
        }
        return audioElement;
      }
      return {
        getPosition: () => getAudioElement(false).currentTime,
        play: (fromPosition, loop) => {
          const audioElement = getAudioElement(true);
          audioElement.play();
          if (fromPosition !== undefined) {
            audioElement.currentTime = fromPosition;
          }
          if (loop) {
            audioElement.loop = true;
          }
        },
        pause: () => {
          getAudioElement(false).pause();
        },
      };
    },
    network: {
      get: (url, callback) => {
        fetch(url)
          .then((res) => res.json())
          .then(callback);
      },
      post: (url, body, callback) => {
        fetch(url, {
          method: "POST",
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then(callback);
      },
      put: (url, body, callback) => {
        fetch(url, {
          method: "PUT",
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then(callback);
      },
      delete: (url, callback) => {
        fetch(url, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then(callback);
      },
    },
    storage: {
      getStore: () => {
        const store: Store = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            store[key] = localStorage.getItem(key) ?? undefined;
          }
        }
        return store;
      },
      setStore: (store) => {
        Object.entries(store).forEach(([field, value]) => {
          if (value === undefined) {
            localStorage.removeItem(field);
          } else {
            localStorage.setItem(field, value);
          }
        });
      },
    },
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
