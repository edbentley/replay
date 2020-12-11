import { Device, makeSprite, t, GameProps, DeviceSize } from "../index";
import { ReplayPlatform, NativeSpriteSettings } from "../core";
import {
  makeNativeSprite,
  NativeSpriteImplementation,
  makePureSprite,
} from "../sprite";
import { mask } from "../mask";
import { Assets } from "../device";

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
      pause: boolean;
      getPosition: boolean;
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
        pause: false,
        getPosition: false,
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

  const mutableTestDevice: Device<TestPlatformInputs> = {
    inputs: getInitTestPlatformInputs(),
    isTouchScreen: false,
    size: customSize || {
      width: 300,
      height: 200,
      widthMargin: 0,
      heightMargin: 0,
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
      getStore: jest.fn(() => ({ text1: "storage" })),
      setStore: jest.fn(),
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

  function resetInputs() {
    mutableTestDevice.inputs = getInitTestPlatformInputs();
  }

  return {
    platform: {
      getGetDevice() {
        return (globalToLocalCoords) => {
          const local = globalToLocalCoords(mutableTestDevice.inputs);
          return {
            ...mutableTestDevice,
            inputs: { ...mutableTestDevice.inputs, x: local.x, y: local.y },
          };
        };
      },
    } as ReplayPlatform<TestPlatformInputs>,
    resetInputs,
    mutableTestDevice,
  };
}

export const nativeSpriteSettings: NativeSpriteSettings = {
  nativeSpriteMap: {},
  nativeSpriteUtils: {
    didResize: false,
    scale: 1,
    gameXToPlatformX: (x) => x,
    gameYToPlatformY: (y) => y,
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

  loop({ state, device }) {
    const posInc = device.inputs.buttonPressed.move ? 1 : 0;
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

  loop({ device }) {
    const showSprite = device.inputs.buttonPressed.show;
    return { showSprite };
  },

  render({ state }) {
    return state.showSprite
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
        font: { name: "Arial", size: 12 },
        text: "this is landscape",
        color: "red",
      }),
    ];
  },
  renderP() {
    return [
      t.text({
        font: { name: "Arial", size: 12 },
        text: "this is portrait",
        color: "red",
      }),
    ];
  },
  renderXL() {
    return [
      t.text({
        font: { name: "Arial", size: 12 },
        text: "this is XL landscape",
        color: "red",
      }),
    ];
  },
  renderPXL() {
    return [
      t.text({
        font: { name: "Arial", size: 12 },
        text: "this is XL portrait",
        color: "red",
      }),
    ];
  },
});

interface FullTestGameState {
  position: number;
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
    };
  },

  loop({ state, device, updateState }) {
    const posInc = device.inputs.buttonPressed.move ? 1 : 0;

    if (device.inputs.buttonPressed.action) {
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
    }

    if (device.inputs.buttonPressed.log) {
      device.log("Log Message");
    }

    // Timer
    if (device.inputs.buttonPressed.timer.start) {
      device.timer.start(() => {
        device.log("timeout complete");
      }, 100);
    }
    const { pause, resume, cancel } = device.inputs.buttonPressed.timer;
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
    if (device.inputs.buttonPressed.sound.play) {
      device.audio("filename").play();
    }
    if (device.inputs.buttonPressed.sound.playFromPosition) {
      device.audio("filename").play(100);
    }
    if (device.inputs.buttonPressed.sound.playLoop) {
      device.audio("filename").play(0, true);
    }
    if (device.inputs.buttonPressed.sound.pause) {
      device.audio("filename").pause();
    }
    if (device.inputs.buttonPressed.sound.getPosition) {
      device.log(device.audio("filename").getPosition());
    }

    // Network
    if (device.inputs.buttonPressed.network.get) {
      device.network.get("/test", (data) => {
        device.log(data);
      });
    }
    if (device.inputs.buttonPressed.network.put) {
      device.network.put("/test", { data: "PUT_BODY" }, (data) => {
        device.log(data);
      });
    }
    if (device.inputs.buttonPressed.network.post) {
      device.network.post("/test", { data: "POST_BODY" }, (data) => {
        device.log(data);
      });
    }
    if (device.inputs.buttonPressed.network.delete) {
      device.network.delete("/test", (data) => {
        device.log(data);
      });
    }

    if (device.inputs.buttonPressed.setDate) {
      device.log(device.now().toISOString());
    }

    if (device.inputs.buttonPressed.setRandom) {
      device.log(device.random());
    }

    if (device.inputs.buttonPressed.alert.ok) {
      device.alert.ok("Message", () => {
        device.log("Hit ok");
      });
    }
    if (device.inputs.buttonPressed.alert.okCancel) {
      device.alert.okCancel("Message Confirm", (wasOk) => {
        device.log(`Was ok: ${wasOk}`);
      });
    }

    const { copyMessage } = device.inputs.buttonPressed.clipboard;
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

    if (device.inputs.buttonPressed.moveWithUpdateState) {
      updateState((s) => ({ ...s, position: s.position + 5 }));
    }

    return {
      position: state.position + posInc,
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

/// -- Nested Sprite test

export const NestedSpriteGame = makeSprite<
  GameProps,
  undefined,
  TestPlatformInputs
>({
  render({ device }) {
    if (device.inputs.x) {
      device.log(
        `NestedSpriteGame x: ${device.inputs.x}, y: ${device.inputs.y}`
      );
    }
    return [
      NestedFirstSprite({
        id: "first",
        x: 20,
        y: 20,
        rotation: -90,
        opacity: 0.8,
      }),
    ];
  },
});

const NestedFirstSprite = makeSprite<{}, undefined, TestPlatformInputs>({
  render({ device }) {
    if (device.inputs.x) {
      device.log(
        `NestedFirstSprite x: ${Math.round(device.inputs.x)}, y: ${Math.round(
          device.inputs.y
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
  render({ device }) {
    if (device.inputs.x) {
      device.log(
        `NestedSecondSprite x: ${Math.round(device.inputs.x)}, y: ${Math.round(
          device.inputs.y
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

/// -- Nested Sprite for testing scale bug

export const NestedSpriteGame2 = makeSprite<
  GameProps,
  undefined,
  TestPlatformInputs
>({
  render() {
    return [
      NestedFirstSprite2({
        id: "first",
        x: 20,
        y: 20,
        scaleX: 0.5,
      }),
    ];
  },
});

const NestedFirstSprite2 = makeSprite<{}, undefined, TestPlatformInputs>({
  render({ device }) {
    if (device.inputs.x) {
      device.log(
        `NestedFirstSprite2 x: ${Math.round(device.inputs.x)}, y: ${Math.round(
          device.inputs.y
        )}`
      );
    }
    return [];
  },
});

/// -- Test local storage

interface LocalStorageGameState {
  text1?: string;
  text2?: string;
}

export const LocalStorageGame = makeSprite<
  GameProps,
  LocalStorageGameState,
  TestPlatformInputs
>({
  init({ device }) {
    const store = device.storage.getStore();
    return {
      text1: store.text1,
      text2: store.text2,
    };
  },

  loop({ device, state }) {
    device.storage.setStore({ text2: "new-val" });

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
    }).then(() => {
      updateState((s) => ({ ...s, loading: false }));
    });
    return { loading: true, show: true };
  },

  loop({ state, device }) {
    return { ...state, show: device.inputs.buttonPressed.show };
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

/// -- Test Pure Sprites

export const PureSpriteGame = makeSprite<
  GameProps,
  { show: boolean },
  TestPlatformInputs
>({
  init() {
    return { show: true };
  },

  loop({ device }) {
    return { show: device.inputs.buttonPressed.show };
  },

  render({ state }) {
    return [
      PureSpriteAlwaysRenders({ id: "Always" }),
      PureSpriteNeverRenders({ id: "Never" }),
      PureSpriteConditionalRenders({ id: "Conditional", show: state.show }),
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
const PureSpriteConditionalRenders = makePureSprite<{ show: boolean }>({
  shouldRerender(prevProps, newProps) {
    return prevProps.show !== newProps.show;
  },

  render({ props }) {
    pureSpriteConditionalRendersFn();
    return props.show
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
  render({ device }) {
    if (device.inputs.x === 100) {
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
  create: ({ props, parentGlobalId, getState, updateState, utils }) => {
    widgetState.text = props.text;
    widgetState.globalId = `${parentGlobalId}--${props.id}`;
    widgetState.x = utils.gameXToPlatformX(0);
    widgetState.y = utils.gameYToPlatformY(0);

    // Double x on callback
    widgetCallback = () => {
      const state = getState();
      updateState({ x: state.x * 2 });
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
