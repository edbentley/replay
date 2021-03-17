import {
  GameProps,
  NativeSpriteSettings,
  replayCore,
  ReplayPlatform,
} from "../core";
import { Device } from "../device";
import { CustomSprite, CustomSpriteProps } from "../sprite";

export type SuiteArg = {
  onFrameStart: (frame: number) => void;
  onFrameEnd: (frame: number) => void;
};

export function runGame(
  Game: (
    props: CustomSpriteProps<GameProps>
  ) => CustomSprite<GameProps, any, Inputs>,
  arg: SuiteArg
) {
  const platform = getBenchmarkPlatform();

  const { runNextFrame } = replayCore(
    platform,
    getNativeSpriteSettings(),
    Game(gameProps)
  );

  const oneFrameMs = 1000 / 60;
  const resetInputs = () => null;

  // Run 1000 frames
  for (let i = 1; i <= 1000; i++) {
    arg.onFrameStart(i);
    runNextFrame(i * oneFrameMs, resetInputs);
    arg.onFrameEnd(i);
  }
}

export type Inputs = {
  x: number;
  y: number;
  clicked: boolean;
};

const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 300,
    height: 200,
  },
};

function getBenchmarkPlatform() {
  const inputs: Inputs = {
    x: 0,
    y: 0,
    clicked: false,
  };

  const mutableTestDevice: Device<Inputs> = {
    inputs,
    isTouchScreen: false,
    size: {
      width: 300,
      height: 200,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: 500,
      deviceHeight: 300,
    },
    log: console.log,
    random: Math.random,
    timer: {
      start(callback) {
        setImmediate(callback);
        return "id";
      },
      cancel: () => null,
      resume: () => null,
      pause: () => null,
    },
    now: () => new Date(Date.UTC(1995, 12, 17, 3, 24, 0)),
    audio: () => ({
      getPosition: () => 50,
      play: () => null,
      pause: () => null,
    }),
    assetUtils: {
      imageElements: {},
      audioElements: {},
      loadImageFile: () => Promise.resolve("imageData"),
      loadAudioFile: () => Promise.resolve("audioData"),
      cleanupImageFile: () => null,
      cleanupAudioFile: () => null,
    },
    network: {
      get: (url, callback) => {
        callback(`GET-${url}`);
      },
      post: (url, body, callback) => {
        callback(`POST-${url}-${body}`);
      },
      put: (url, body, callback) => {
        callback(`PUT-${url}-${body}`);
      },
      delete: (url, callback) => {
        callback(`DELETE-${url}`);
      },
    },
    storage: {
      getItem: () => Promise.resolve("storage"),
      setItem: () => Promise.resolve(),
    },
    alert: {
      ok: (_, onResponse) => {
        onResponse?.();
      },
      okCancel: (_, onResponse) => {
        onResponse(true);
      },
    },
    clipboard: {
      copy: (_, onComplete) => {
        onComplete();
      },
    },
  };

  const platform: ReplayPlatform<Inputs> = {
    getGetDevice: () => {
      return (getLocalCoords) => {
        const local = getLocalCoords(inputs);
        return {
          ...mutableTestDevice,
          inputs: { ...inputs, x: local.x, y: local.y },
        };
      };
    },
    render: {
      newFrame: () => null,
      startRenderSprite: () => null,
      endRenderSprite: () => null,
      renderTexture: () => null,
    },
  };

  return platform;
}

function getNativeSpriteSettings(): NativeSpriteSettings {
  return {
    nativeSpriteMap: {},
    nativeSpriteUtils: {
      didResize: false,
      scale: 1,
      gameXToPlatformX: (x) => x,
      gameYToPlatformY: (y) => y,
    },
  };
}
