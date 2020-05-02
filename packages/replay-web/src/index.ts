import { GameProps, Texture, DeviceSize, Store } from "@replay/core";
import { replayCore, ReplayPlatform } from "@replay/core/dist/core";
import {
  CustomSprite,
  SpritePosition as SpritePositionObj,
} from "@replay/core/dist/sprite";
import {
  getInputs,
  keyUpHandler,
  keyDownHandler,
  resetInputs,
  Inputs,
  pointerUpHandler,
  pointerDownHandler,
  pointerMoveHandler,
  clientXToGameX,
  clientYToGameY,
} from "./input";
import { drawCanvas, revertCanvasScale } from "./draw";
import { getDeviceSize, setDeviceSize, calculateDeviceSize } from "./size";
import { Dimensions } from "./dimensions";

type SpritePosition = SpritePositionObj["position"];

export { Inputs as WebInputs } from "./input";
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
  canvas = document.body.appendChild(document.createElement("canvas"))
) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ctx = canvas.getContext("2d", { alpha: false })!;

  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  window.addEventListener("resize", updateDeviceSize, false);

  let prevDeviceSize: DeviceSize | undefined;
  let pointerDown: (e: PointerEvent) => void;
  let pointerMove: (e: PointerEvent) => void;
  let pointerUp: (e: PointerEvent) => void;
  let scale: number;

  function updateDeviceSize() {
    if (prevDeviceSize) {
      revertCanvasScale(ctx, prevDeviceSize, scale);
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointerup", pointerUp);
    }

    const deviceSize = setDeviceSize(
      window.innerWidth,
      window.innerHeight,
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

    pointerDown = (e: PointerEvent) => {
      pointerDownHandler(getX(e), getY(e));
    };
    pointerMove = (e: PointerEvent) => {
      pointerMoveHandler(getX(e), getY(e));
    };
    pointerUp = (e: PointerEvent) => {
      pointerUpHandler(getX(e), getY(e));
    };
    document.addEventListener("pointerdown", pointerDown, false);
    document.addEventListener("pointermove", pointerMove, false);
    document.addEventListener("pointerup", pointerUp, false);

    prevDeviceSize = deviceSize;
  }

  const audioElements: { [fileName: string]: HTMLAudioElement } = {};
  const imageElements: { [fileName: string]: HTMLImageElement } = {};

  const domPlatform: ReplayPlatform<Inputs> = {
    getGetDevice: deviceCreator(
      audioElements,
      calculateDeviceSize(
        window.innerWidth,
        window.innerHeight,
        dimensions,
        gameSprite.props.size
      )
    ),
  };

  const render: {
    ref: ((textures: Texture[]) => void) | null;
  } = { ref: null };

  updateDeviceSize();

  const { initTextures, getNextFrameTextures } = replayCore<S, Inputs>(
    domPlatform,
    gameSprite
  );

  let initTime: number | null = null;

  function loop(textures: Texture[]) {
    render.ref?.(textures);
    window.requestAnimationFrame((time) => {
      if (initTime === null) {
        initTime = time - 1 / 60;
      }
      loop(getNextFrameTextures(time - initTime));
      resetInputs();
    });
  }

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
  render.ref?.(loadingTextures);

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

    loop(initTextures);
  });

  return { loadPromise, audioElements }; // audioElements exported for testing
}

function deviceCreator(
  audioElements: {
    [filename: string]: HTMLAudioElement;
  },
  defaultSize: DeviceSize
) {
  // called once
  const initDevice = {
    log: console.log,
    random: Math.random,
    timeout: (callback: () => void, ms: number) => setTimeout(callback, ms),
    audio: (filename: string) => {
      function getAudioElement(play: boolean) {
        let audioElement = audioElements[filename];
        if (!audioElement) {
          throw Error(`Cannot find audio file ${filename}`);
        }
        if (
          play &&
          audioElement.currentTime > 0 &&
          audioElement.currentTime < audioElement.duration
        ) {
          // it's being played somewhere else, need a new audio element
          audioElement = new Audio(filename);
        }
        return audioElement;
      }
      return {
        getPosition: () => getAudioElement(false).currentTime,
        play: (fromPosition?: number, loop?: boolean) => {
          const audioElement = getAudioElement(true);
          audioElement.play();
          if (fromPosition) {
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
      get: (url: string, callback: (data: unknown) => void) => {
        fetch(url)
          .then((res) => res.json())
          .then(callback);
      },
      post: (url: string, body: object, callback: (data: unknown) => void) => {
        fetch(url, {
          method: "POST",
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then(callback);
      },
      put: (url: string, body: object, callback: (data: unknown) => void) => {
        fetch(url, {
          method: "PUT",
          body: JSON.stringify(body),
        })
          .then((res) => res.json())
          .then(callback);
      },
      delete: (url: string, callback: (data: unknown) => void) => {
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
      setStore: (store: Store) => {
        Object.entries(store).forEach(([field, value]) => {
          if (value === undefined) {
            localStorage.removeItem(field);
          } else {
            localStorage.setItem(field, value);
          }
        });
      },
    },
  };

  return () => {
    // called every frame
    const device = {
      ...initDevice,
      size: getDeviceSize() || defaultSize,
      now: () => new Date(),
    };

    // called individually by each Sprite with their parent's absolute position
    return (parentPosition: SpritePosition) => ({
      ...device,
      inputs: getInputs(parentPosition),
    });
  };
}
