import { Device, makeSprite, t, GameProps, DeviceSize, t2 } from "../index";
import { ReplayPlatform, NativeSpriteSettings } from "../core";
import {
  makeNativeSprite,
  NativeSpriteImplementation,
  makePureSprite,
  makeMutableSprite,
  r,
} from "../sprite";
import { mask, MaskShape } from "../mask";
import { Assets } from "../device";
import {
  CircleTexture,
  ImageTexture,
  LineTexture,
  RectangleTexture,
  SingleTexture,
  TextTexture,
} from "../t";
import { makeContext } from "../context";

export const gameProps: GameProps = {
  id: "Game" as const,
  size: {
    portrait: {
      width: 300,
      height: 200,
      minHeightXL: 1000,
    },
    landscape: {
      width: 200,
      height: 300,
      minWidthXL: 1000,
    },
  },
};

interface TestPlatformInputs {
  x: number;
  y: number;
  buttonPressed: {
    move: boolean;
    show: boolean;
    action: boolean;
    log: boolean;
    setRandom: boolean;
    timer: {
      start: boolean;
      pause: string;
      cancel: string;
      resume: string;
    };
    setDate: boolean;
    sound: {
      play: boolean;
      playFromPosition: boolean;
      playLoop: boolean;
      playOverwrite: boolean;
      pause: boolean;
      getPosition: boolean;
      getStatus: boolean;
      getVolume: boolean;
      setVolume: boolean;
      getDuration: boolean;
    };
    network: {
      get: boolean;
      post: boolean;
      put: boolean;
      delete: boolean;
    };
    alert: {
      ok: boolean;
      okCancel: boolean;
    };
    clipboard: {
      copyMessage: string;
    };
    moveWithUpdateState: boolean;
  };
}

function getInitTestPlatformInputs(): TestPlatformInputs {
  return {
    x: 0,
    y: 0,
    buttonPressed: {
      move: false,
      show: true,
      action: false,
      log: false,
      setRandom: false,
      timer: {
        start: false,
        pause: "",
        resume: "",
        cancel: "",
      },
      setDate: false,
      sound: {
        play: false,
        playFromPosition: false,
        playLoop: false,
        playOverwrite: false,
        pause: false,
        getPosition: false,
        getStatus: false,
        getVolume: false,
        setVolume: false,
        getDuration: false,
      },
      network: {
        get: false,
        post: false,
        put: false,
        delete: false,
      },
      alert: {
        ok: false,
        okCancel: false,
      },
      clipboard: {
        copyMessage: "",
      },
      moveWithUpdateState: false,
    },
  };
}

/**
 * A test platform (instead of web, iOS etc) with mocked methods and a simple
 * input.
 */
export function getTestPlatform(customSize?: DeviceSize) {
  const audio = {
    getPosition: jest.fn(() => 50),
    play: jest.fn(),
    pause: jest.fn(),
    getStatus: jest.fn(() => "playing" as const),
    setVolume: jest.fn(),
    getVolume: jest.fn(() => 1),
    getDuration: jest.fn(() => 100),
  };
  const network = {
    get: jest.fn((url: string, callback: (data: unknown) => void) => {
      callback(`GET-${url}`);
    }),
    post: jest.fn((url, body, callback) => {
      callback(`POST-${url}-${body.data}`);
    }),
    put: jest.fn((url, body, callback) => {
      callback(`PUT-${url}-${body.data}`);
    }),
    delete: jest.fn((url, callback) => {
      callback(`DELETE-${url}`);
    }),
  };

  const mutableTestDevice: Device = {
    isTouchScreen: false,
    size: customSize || {
      width: 300,
      height: 200,
      widthMargin: 0,
      heightMargin: 0,
      fullWidth: 300,
      fullHeight: 200,
      deviceWidth: 500,
      deviceHeight: 300,
    },
    log: jest.fn(),
    random: jest.fn(() => 0.5),
    timer: {
      start(callback) {
        setImmediate(callback);
        return "id";
      },
      cancel: jest.fn(),
      resume: jest.fn(),
      pause: jest.fn(),
    },
    now: () => new Date(Date.UTC(1995, 12, 17, 3, 24, 0)),
    audio: () => audio,
    assetUtils: {
      imageElements: {},
      audioElements: {},
      loadImageFile: jest.fn().mockResolvedValue("imageData"),
      loadAudioFile: jest.fn().mockResolvedValue("audioData"),
      cleanupImageFile: jest.fn(),
      cleanupAudioFile: jest.fn(),
    },
    network,
    storage: {
      getItem: jest.fn(() => Promise.resolve("storage")),
      setItem: jest.fn(),
    },
    alert: {
      ok: jest.fn((_, onResponse) => {
        onResponse?.();
      }),
      okCancel: jest.fn((_, onResponse) => {
        onResponse(true);
      }),
    },
    clipboard: {
      copy: jest.fn((message, onComplete) => {
        onComplete(message === "Error" ? new Error("!") : undefined);
      }),
    },
  };

  const mutInputs = { ref: getInitTestPlatformInputs() };

  function resetInputs() {
    mutInputs.ref = getInitTestPlatformInputs();
  }

  type TextureState = null;

  const textures: SingleTexture[] = [];

  const masks: MaskShape[] = [];

  const platform: ReplayPlatform<TestPlatformInputs, TextureState> = {
    getInputs: (matrix, localMutInputs) => {
      localMutInputs.buttonPressed = mutInputs.ref.buttonPressed;
      localMutInputs.x = mutInputs.ref.x;
      localMutInputs.y = mutInputs.ref.y;
      return localMutInputs;
    },
    newInputs: getInitTestPlatformInputs,
    isTestPlatform: true,
    mutDevice: mutableTestDevice,
    render: {
      newFrame: () => {
        textures.length = 0;
        masks.length = 0;
      },
      endFrame: () => null,
      startRenderSprite: (baseProps) => {
        if (baseProps.mask) {
          masks.push(baseProps.mask);
        }
      },
      endRenderSprite: () => null,
      renderTexture: (stateStack, texture) => {
        if (texture.type === "imageArray") {
          masks.push(texture.mask);
          textures.push(
            ...texture.props.map(
              (props): ImageTexture => {
                return {
                  type: "image",
                  props: {
                    ...props,
                    fileName: texture.fileName,
                    mask: texture.mask,
                  },
                };
              }
            )
          );
        } else if (texture.type === "rectangleArray") {
          masks.push(texture.mask);
          textures.push(
            ...texture.props.map(
              (props): RectangleTexture => {
                return {
                  type: "rectangle",
                  props: {
                    mask: texture.mask,
                    ...props,
                  },
                };
              }
            )
          );
        } else if (texture.type === "textArray") {
          masks.push(texture.mask);
          textures.push(
            ...texture.props.map(
              (props): TextTexture => {
                return {
                  type: "text",
                  props: {
                    mask: texture.mask,
                    ...props,
                  },
                };
              }
            )
          );
        } else if (texture.type === "circleArray") {
          masks.push(texture.mask);
          textures.push(
            ...texture.props.map(
              (props): CircleTexture => {
                return {
                  type: "circle",
                  props: {
                    mask: texture.mask,
                    ...props,
                  },
                };
              }
            )
          );
        } else if (texture.type === "lineArray") {
          masks.push(texture.mask);
          textures.push(
            ...texture.props.map(
              (props): LineTexture => {
                return {
                  type: "line",
                  props: {
                    mask: texture.mask,
                    ...props,
                  },
                };
              }
            )
          );
        } else {
          if (texture.props.mask) {
            masks.push(texture.props.mask);
          }
          textures.push(texture);
        }
      },
      startNativeSprite: jest.fn(),
      endNativeSprite: jest.fn(),
      getInitTextureState: () => null,
    },
  };

  return {
    platform,
    resetInputs,
    mutableTestDevice,
    mutInputs,
    textures,
    masks,
  };
}

export const nativeSpriteSettings: NativeSpriteSettings = {
  nativeSpriteMap: {},
  nativeSpriteUtils: {
    isLastFrame: true,
    didResize: false,
    scale: 1,
    gameXToPlatformX: (x) => x,
    gameYToPlatformY: (y) => y,
    size: {
      width: 300,
      height: 200,
      widthMargin: 0,
      heightMargin: 0,
      fullWidth: 300,
      fullHeight: 200,
      deviceWidth: 500,
      deviceHeight: 300,
    },
  },
};

export function waitFrame() {
  return new Promise((res) => setImmediate(res));
}

interface TestGameState {
  position: number;
}

/**
 * A simple 'game' which moves a circle across the screen if an input is
 * pressed.
 */
export const TestGame = makeSprite<
  GameProps,
  TestGameState,
  TestPlatformInputs
>({
  init() {
    return { position: 5 };
  },

  loop({ state, getInputs }) {
    const posInc = getInputs().buttonPressed.move ? 1 : 0;
    return { position: state.position + posInc };
  },

  render({ state }) {
    return [
      t.circle({
        x: state.position,
        y: 50,
        radius: 10,
        color: "#0095DD",
        scaleX: 5,
        anchorY: 0,
      }),
    ];
  },
});

export const TestGameWithSprites = makeSprite<
  GameProps,
  { showSprite: boolean },
  TestPlatformInputs
>({
  init() {
    return { showSprite: true };
  },

  loop({ getInputs }) {
    const showSprite = getInputs().buttonPressed.show;
    return { showSprite };
  },

  render({ state, getInputs }) {
    return state.showSprite && getInputs().buttonPressed.show
      ? [
          TestSprite({
            id: "test",
            x: 50,
            initPos: 50,
            anchorY: 1,
            scaleX: 5,
            opacity: 0.5,
          }),
          MultipleRendersSprite({
            id: "multiple-renders",
            x: 0,
            y: 0,
          }),
        ]
      : [];
  },
});

interface TestSpriteProps {
  initPos: number;
}
const TestSprite = makeSprite<
  TestSpriteProps,
  TestGameState,
  TestPlatformInputs
>({
  init({ props }) {
    return { position: props.initPos };
  },
  loop({ state }) {
    return { position: state.position + 1 };
  },
  render({ state }) {
    return [
      t.circle({
        x: state.position,
        y: 50,
        rotation: 10,
        radius: 10,
        color: "#0095DD",
      }),
    ];
  },
});

const MultipleRendersSprite = makeSprite({
  render() {
    return [
      t.text({
        font: { family: "Arial", size: 12 },
        text: "this is landscape",
        color: "red",
      }),
    ];
  },
  renderP() {
    return [
      t.text({
        font: { family: "Arial", size: 12 },
        text: "this is portrait",
        color: "red",
      }),
    ];
  },
  renderXL() {
    return [
      t.text({
        font: { family: "Arial", size: 12 },
        text: "this is XL landscape",
        color: "red",
      }),
    ];
  },
  renderPXL() {
    return [
      t.text({
        font: { family: "Arial", size: 12 },
        text: "this is XL portrait",
        color: "red",
      }),
    ];
  },
});

interface FullTestGameState {
  position: number;
  testNestedUpdateStateCounter: number;
  testInitUpdateState?: string;
  testRenderUpdateState?: string;
  testRenderUpdateState2?: string;
  testRenderTimeout?: string;
}

/**
 * Same as 'TestGame', but with updateState and all device features
 */
export const FullTestGame = makeSprite<
  GameProps,
  FullTestGameState,
  TestPlatformInputs
>({
  init({ updateState, getState, device }) {
    device.timer.start(() => {
      updateState((state) => ({
        ...state,
        testInitUpdateState: "initialised",
      }));
      device.log(`getState position: ${getState().position}`);
    }, 100);

    return {
      position: 5,
      testNestedUpdateStateCounter: 0,
    };
  },

  loop({ state, device, getInputs, updateState }) {
    const inputs = getInputs();

    const posInc = inputs.buttonPressed.move ? 1 : 0;

    if (inputs.buttonPressed.action) {
      updateState((prevState) => ({
        ...prevState,
        testRenderUpdateState: `render time: ${device.now().toISOString()}`,
      }));
      updateState((prevState) => ({
        ...prevState,
        testRenderUpdateState2: `render time 2: ${device.now().toISOString()}`,
      }));
      device.timer.start(() => {
        updateState((prevState) => ({
          ...prevState,
          testRenderTimeout: "updateState from timeout in render",
        }));
      }, 1000);

      updateState((s1) => {
        updateState((s2) => {
          updateState((s3) => {
            device.log(
              `Third updateState counter val: ${s3.testNestedUpdateStateCounter}`
            );
            return {
              ...s3,
              testNestedUpdateStateCounter: s3.testNestedUpdateStateCounter + 1,
            };
          });
          device.log(
            `Second updateState counter val: ${s2.testNestedUpdateStateCounter}`
          );
          return {
            ...s2,
            testNestedUpdateStateCounter: s2.testNestedUpdateStateCounter + 1,
          };
        });
        device.log(
          `First updateState counter val: ${s1.testNestedUpdateStateCounter}`
        );
        return {
          ...s1,
          testNestedUpdateStateCounter: s1.testNestedUpdateStateCounter + 1,
        };
      });
    }

    if (inputs.buttonPressed.log) {
      device.log("Log Message");
    }

    // Timer
    if (inputs.buttonPressed.timer.start) {
      device.timer.start(() => {
        device.log("timeout complete");
      }, 100);
    }
    const { pause, resume, cancel } = inputs.buttonPressed.timer;
    if (pause) {
      device.timer.pause(pause);
    }
    if (resume) {
      device.timer.resume(resume);
    }
    if (cancel) {
      device.timer.cancel(cancel);
    }

    // Audio
    if (inputs.buttonPressed.sound.play) {
      device.audio("filename").play();
    }
    if (inputs.buttonPressed.sound.playFromPosition) {
      device.audio("filename").play(100);
    }
    if (inputs.buttonPressed.sound.playLoop) {
      device.audio("filename").play({ fromPosition: 0, loop: true });
    }
    if (inputs.buttonPressed.sound.playOverwrite) {
      device.audio("filename").play({ overwrite: true });
    }
    if (inputs.buttonPressed.sound.pause) {
      device.audio("filename").pause();
    }
    if (inputs.buttonPressed.sound.getPosition) {
      device.log(device.audio("filename").getPosition());
    }
    if (inputs.buttonPressed.sound.setVolume) {
      device.audio("filename").setVolume(1);
    }
    if (inputs.buttonPressed.sound.getVolume) {
      device.log(device.audio("filename").getVolume());
    }
    if (inputs.buttonPressed.sound.getStatus) {
      device.log(device.audio("filename").getStatus());
    }
    if (inputs.buttonPressed.sound.getDuration) {
      device.log(device.audio("filename").getDuration());
    }

    // Network
    if (inputs.buttonPressed.network.get) {
      device.network.get("/test", (data) => {
        device.log(data);
      });
    }
    if (inputs.buttonPressed.network.put) {
      device.network.put("/test", { data: "PUT_BODY" }, (data) => {
        device.log(data);
      });
    }
    if (inputs.buttonPressed.network.post) {
      device.network.post("/test", { data: "POST_BODY" }, (data) => {
        device.log(data);
      });
    }
    if (inputs.buttonPressed.network.delete) {
      device.network.delete("/test", (data) => {
        device.log(data);
      });
    }

    if (inputs.buttonPressed.setDate) {
      device.log(device.now().toISOString());
    }

    if (inputs.buttonPressed.setRandom) {
      device.log(device.random());
    }

    if (inputs.buttonPressed.alert.ok) {
      device.alert.ok("Message", () => {
        device.log("Hit ok");
      });
    }
    if (inputs.buttonPressed.alert.okCancel) {
      device.alert.okCancel("Message Confirm", (wasOk) => {
        device.log(`Was ok: ${wasOk}`);
      });
    }

    const { copyMessage } = inputs.buttonPressed.clipboard;
    if (copyMessage) {
      device.clipboard.copy(copyMessage, (error) => {
        if (error) {
          device.log(`Error copying: ${error.message}`);
        } else {
          device.log("Copied");
        }
      });
    }

    if (state.testInitUpdateState) {
      device.log(state.testInitUpdateState);
    }

    if (state.testRenderUpdateState) {
      device.log(state.testRenderUpdateState);
    }

    if (state.testRenderUpdateState2) {
      device.log(state.testRenderUpdateState2);
    }

    if (state.testRenderTimeout) {
      device.log(state.testRenderTimeout);
    }

    if (inputs.buttonPressed.moveWithUpdateState) {
      updateState((s) => ({ ...s, position: s.position + 5 }));
    }

    return {
      position: state.position + posInc,
      testNestedUpdateStateCounter: state.testNestedUpdateStateCounter,
    };
  },

  render({ state }) {
    return [
      t.circle({
        x: state.position,
        y: 50,
        rotation: 0,
        radius: 10,
        color: "#0095DD",
      }),
      t.text({
        text: `updateState Counter: ${state.testNestedUpdateStateCounter}`,
        color: "black",
      }),
    ];
  },
});

/// -- Mask test

export const MaskGame = makeSprite<GameProps>({
  render() {
    return [
      MaskSprite({
        id: "MaskSprite",
        mask: mask.circle({
          radius: 10,
          x: 5,
          y: -5,
        }),
      }),
    ];
  },
});

const MaskSprite = makeSprite({
  render() {
    return [
      t.rectangle({
        width: 100,
        height: 100,
        color: "black",
        mask: mask.circle({
          radius: 5,
          x: 10,
        }),
      }),
      t.rectangle({
        width: 100,
        height: 100,
        color: "black",
        mask: mask.rectangle({
          width: 5,
          height: 5,
          y: 10,
        }),
      }),
      t.rectangle({
        width: 100,
        height: 100,
        color: "black",
        mask: mask.line({
          path: [
            [0, 0],
            [10, 0],
            [10, 10],
          ],
        }),
      }),
    ];
  },
});

const NestedFirstSprite = makeSprite<{}, undefined, TestPlatformInputs>({
  render({ device, getInputs }) {
    const inputs = getInputs();
    if (inputs.x) {
      device.log(
        `NestedFirstSprite x: ${Math.round(inputs.x)}, y: ${Math.round(
          inputs.y
        )}`
      );
    }
    return [
      NestedSecondSprite({
        id: "second",
        x: 50,
        y: 20,
        rotation: -90,
        opacity: 0.8,
      }),
    ];
  },
});

const NestedSecondSprite = makeSprite<{}, undefined, TestPlatformInputs>({
  render({ device, getInputs }) {
    const inputs = getInputs();
    if (inputs.x) {
      device.log(
        `NestedSecondSprite x: ${Math.round(inputs.x)}, y: ${Math.round(
          inputs.y
        )}`
      );
    }
    return [
      t.text({
        text: "nested",
        color: "black",
        x: 10,
        y: 20,
        rotation: 180,
        opacity: 0.8,
      }),
    ];
  },
});

/// -- Test local storage

interface LocalStorageGameState {
  text1: string | null;
  text2: string | null;
}

export const LocalStorageGame = makeSprite<
  GameProps,
  LocalStorageGameState,
  TestPlatformInputs
>({
  init({ device, updateState }) {
    Promise.all([
      device.storage.getItem("text1"),
      device.storage.getItem("text2"),
    ]).then(([text1, text2]) => {
      updateState((s) => ({ ...s, text1, text2 }));
    });
    return { text1: null, text2: null };
  },

  loop({ device, state }) {
    device.storage.setItem("text2", "new-val");

    return state;
  },

  render({ state: { text1, text2 } }) {
    return [
      text1
        ? t.text({
            text: text1,
            color: "red",
          })
        : null,
      text2
        ? t.text({
            text: text2,
            color: "blue",
          })
        : null,
    ];
  },
});

/// -- Callback prop change test

export const CallbackPropGame = makeSprite<
  GameProps,
  { counter: number },
  TestPlatformInputs
>({
  init() {
    return { counter: 0 };
  },

  render({ state, updateState }) {
    return [
      CallbackPropSprite({
        id: "Sprite",
        counter: state.counter,
        updateCounter: (counter) => {
          updateState((s) => ({ ...s, counter }));
        },
      }),
    ];
  },
});

const CallbackPropSprite = makeSprite<{
  counter: number;
  updateCounter: (counter: number) => void;
}>({
  loop({ props, device }) {
    props.updateCounter(props.counter + 1);
    device.log(props.counter + 1);
    return undefined;
  },

  render() {
    return [null];
  },
});

/// -- Assets test

export const AssetsGame = makeSprite<
  GameProps,
  { loading: boolean; show: boolean },
  TestPlatformInputs
>({
  init({ preloadFiles, updateState }) {
    preloadFiles({
      imageFileNames: ["game.png"],
      audioFileNames: ["game.mp3"],
      imageFileNamesScaleNearestPixel: ["pixel.png"],
    }).then(() => {
      updateState((s) => ({ ...s, loading: false }));
    });
    return { loading: true, show: true };
  },

  loop({ state, getInputs }) {
    return { ...state, show: getInputs().buttonPressed.show };
  },

  render({ state }) {
    if (!state.show) {
      return [];
    }
    if (state.loading) {
      return [t.text({ text: "Loading", color: "black" })];
    }
    return [
      AssetsSprite({
        id: "Sprite1",
        assets: { imageFileNames: ["a.png"] },
      }),
    ];
  },
});

const AssetsSprite = makeSprite<{
  assets: Assets;
}>({
  init({ props, preloadFiles }) {
    preloadFiles(props.assets);
    return undefined;
  },

  render({ props }) {
    return [
      NestedAssetsSprite({
        id: "NestedSprite",
        assets: props.assets,
      }),
      NestedFirstSprite({
        id: "NoAssetsNestedSprite",
      }),
    ];
  },

  cleanup({ device }) {
    device.log("cleanup");
  },
});

const NestedAssetsSprite = makeSprite<{
  assets: Assets;
}>({
  init({ props, preloadFiles }) {
    preloadFiles(props.assets);
    return undefined;
  },

  render() {
    return [];
  },
});

export const AssetsUnmountRemountGame = makeSprite<
  GameProps,
  undefined,
  TestPlatformInputs
>({
  render({ getInputs }) {
    const show = getInputs().buttonPressed.show;

    if (show) {
      return [
        AssetsPlaySprite({
          id: "PlaySprite",
        }),
      ];
    }
    return [];
  },
});

const AssetsPlaySprite = makeSprite<{}>({
  init({ preloadFiles, device }) {
    device.log("init");
    preloadFiles({ audioFileNames: ["game.mp3"] }).then(() => {
      device.audio("game.mp3").play();
    });
    return undefined;
  },

  render() {
    return [];
  },
});

/// -- Test getState

export const GetStateGame = makeSprite<GameProps, undefined>({
  init({ getState }) {
    getState();
    return undefined;
  },

  render() {
    return [];
  },
});

/// -- Test Duplicate Sprite IDs

export const DuplicateSpriteIdsGame = makeSprite<GameProps>({
  render() {
    return [
      TestSprite({
        id: "TestSprite",
        initPos: 0,
      }),
      TestSprite({
        id: "TestSprite",
        initPos: 0,
      }),
    ];
  },
});

export const DuplicatePureSpriteIdsGame = makeSprite<GameProps>({
  render() {
    return [
      PureSprite({
        id: "TestSprite",
      }),
    ];
  },
});

const PureSprite = makePureSprite({
  shouldRerender() {
    return false;
  },

  render() {
    return [
      PureSpriteNested({
        id: "TestSprite",
      }),
      PureSpriteNested({
        id: "TestSprite",
      }),
    ];
  },
});

const PureSpriteNested = makePureSprite({
  shouldRerender() {
    return false;
  },

  render() {
    return [
      t.circle({
        radius: 5,
        color: "red",
      }),
    ];
  },
});

/// -- Test Pure Sprites

export const PureSpriteGame = makeSprite<
  GameProps,
  { show: boolean },
  TestPlatformInputs
>({
  init() {
    return { show: true };
  },

  loop({ getInputs }) {
    return { show: getInputs().buttonPressed.show };
  },

  render({ state }) {
    return [
      PureSpriteAlwaysRenders({ id: "Always" }),
      PureSpriteNeverRenders({ id: "Never" }),
      PureSpriteConditionalRenders({
        id: "Conditional",
        showSprite: state.show,
      }),
    ];
  },
});

export const pureSpriteAlwaysRendersFn = jest.fn();
const PureSpriteAlwaysRenders = makePureSprite({
  shouldRerender() {
    return true;
  },

  render() {
    pureSpriteAlwaysRendersFn();
    return [
      t.circle({
        radius: 5,
        color: "red",
      }),
    ];
  },
});

export const pureSpriteNeverRendersFn = jest.fn();
const PureSpriteNeverRenders = makePureSprite({
  shouldRerender() {
    return false;
  },

  render() {
    pureSpriteNeverRendersFn();
    return [
      t.circle({
        radius: 5,
        color: "red",
      }),
    ];
  },
});

export const pureSpriteConditionalRendersFn = jest.fn();
const PureSpriteConditionalRenders = makePureSprite<{ showSprite: boolean }>({
  shouldRerender(prevProps, newProps) {
    return prevProps.showSprite !== newProps.showSprite;
  },

  render({ props }) {
    pureSpriteConditionalRendersFn();
    return props.showSprite
      ? [
          t.circle({
            radius: 5,
            color: "red",
          }),
        ]
      : [];
  },
});

/// -- Test Native Sprites

export const NativeSpriteGame = makeSprite<
  GameProps,
  undefined,
  TestPlatformInputs
>({
  render({ getInputs }) {
    if (getInputs().x === 100) {
      return [];
    }
    return [NestedNativeSprite({ id: "nested" })];
  },
});
const NestedNativeSprite = makeSprite({
  render() {
    return [MyWidget({ id: "widget", text: "hello" })];
  },
});

type MyWidgetProps = {
  id: string;
  text: string;
};
export const MyWidget = makeNativeSprite<MyWidgetProps>("MyWidget");

export const widgetState = {
  text: "",
  x: 0,
  y: 0,
  globalId: "",
  width: 100,
};
export let widgetCallback = () => {
  // Empty
};

// An example platform implementation
export const MyWidgetImplementation: NativeSpriteImplementation<
  MyWidgetProps,
  { text: string; x: number }
> = {
  create: ({ props, parentGlobalId, getState, utils }) => {
    widgetState.text = props.text;
    widgetState.globalId = `${parentGlobalId}--${props.id}`;
    widgetState.x = utils.gameXToPlatformX(0);
    widgetState.y = utils.gameYToPlatformY(0);

    // Double x on callback
    widgetCallback = () => {
      const state = getState();
      state.x *= 2;
    };

    return { text: props.text, x: widgetState.x };
  },
  loop: ({ state, utils }) => {
    widgetState.x = state.x;

    if (utils.didResize) {
      widgetState.width *= utils.scale;
    }

    return state;
  },
  cleanup: () => {
    widgetState.text = "";
  },
};

// -- Test Context

export const TestContextGame = makeSprite<GameProps, { count: number }>({
  init() {
    return { count: 0 };
  },

  loop({ state }) {
    return { count: state.count + 1 };
  },

  render({ state, updateState }) {
    return [
      countContext.Sprite({
        context: {
          count: state.count,
          increaseCountBy10: () => {
            updateState((prevState) => ({
              ...prevState,
              count: prevState.count + 10,
            }));
          },
        },
        sprites: [TestContextNestedSprite({ id: "Nested" })],
      }),
    ];
  },
});

const countContext = makeContext<{
  count: number;
  increaseCountBy10: () => void;
}>();

const TestContextNestedSprite = makeSprite<{}, undefined, TestPlatformInputs>({
  loop({ getInputs, getContext }) {
    if (getInputs().buttonPressed.action) {
      const backendContext = getContext(countContext);
      backendContext.increaseCountBy10();
    }
    return undefined;
  },

  render({ getContext, device }) {
    const backendContext = getContext(countContext);

    device.log(`Count: ${backendContext.count}`);

    return [];
  },
});

export const TestContextErrorGame = makeSprite<GameProps>({
  render() {
    // No context passed in
    return [TestContextNestedSprite({ id: "Nested" })];
  },
});

/// -- Test Mutable Sprites

export const TestMutableGame = makeSprite<GameProps>({
  render() {
    return [MutableGameSprite.Single({ id: "Game" })];
  },
});

export const mutableSpriteRendersFn = jest.fn();
export const mutableSpriteInnerRendersFn = jest.fn();

const MutableGameSprite = makeMutableSprite<
  {},
  { showSprite: boolean },
  TestPlatformInputs
>({
  init() {
    return { showSprite: true };
  },

  loop({ getInputs, state }) {
    state.showSprite = getInputs().buttonPressed.show;
  },

  render({ state, device }) {
    mutableSpriteRendersFn();
    return [
      r.if(
        () => state.showSprite,
        () => [
          TestMutableSprite.Single(
            {
              x: 50,
              initPos: 50,
              anchorY: 1,
              scaleX: 5,
              opacity: 0.5,
            },
            () => {
              mutableSpriteInnerRendersFn();
            }
          ),
        ]
      ),
      r.ifElse(
        () => state.showSprite,
        () => [t2.text({ text: "True" })],
        () => [t2.text({ text: "False" })]
      ),
      r.onChange(
        () => state.showSprite,
        () => [t2.text({ text: String(state.showSprite) })]
      ),
      r.run(() => {
        device.log(`Show: ${state.showSprite}`);
      }),
    ];
  },
});

interface TestMutableSpriteProps {
  initPos: number;
}
const TestMutableSprite = makeMutableSprite<
  TestMutableSpriteProps,
  TestGameState,
  TestPlatformInputs
>({
  init({ props }) {
    return { position: props.initPos };
  },
  loop({ state }) {
    state.position++;
  },
  render({ state }) {
    return [
      t2.circle(
        {
          y: 50,
          rotation: 10,
          radius: 10,
          color: "#0095DD",
        },
        (thisProps) => {
          thisProps.x = state.position;
        }
      ),
    ];
  },
});

export const TestMutableArrayGame = makeSprite<GameProps>({
  render() {
    return [MutableArrayGameSprite.Single({ id: "Game" })];
  },
});

const MutableArrayGameSprite = makeMutableSprite<{}>({
  render() {
    return [
      // 3 Sprites at x = -30, 0, 30
      TestMutableArraySprite.Array({
        props: (itemState) => ({ initX: itemState }),
        array: () => spriteArrayInitX,
        key: (_, index) => index,
      }),
    ];
  },
});

const spriteArrayInitX = [-30, 0, 30];

const TestMutableArraySprite = makeMutableSprite<
  { initX: number },
  TestGameState,
  TestPlatformInputs
>({
  init({ props }) {
    return { position: props.initX };
  },
  loop({ state }) {
    state.position++;
  },
  render({ state }) {
    return [
      // 4 rects and y = 0, 10, 20, 30 and width = 10, 20, 30, 40
      t2.rectangleArray({
        props: (itemState, index) => ({
          color: "#0095DD",
          width: itemState,
          y: index * 10,
        }),
        update: (thisProps) => {
          thisProps.x = state.position;
        },
        array: () => rectArray,
      }),
    ];
  },
});

const rectArray = [10, 20, 30, 40];
