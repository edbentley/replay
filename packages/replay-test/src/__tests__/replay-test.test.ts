import {
  makeSprite,
  t,
  GameProps,
  makeNativeSprite,
  mask,
  Texture,
  makeContext,
} from "@replay/core";
import { mockContext, testSprite } from "../index";

test("getTextures, nextFrame", () => {
  const { getTextures, nextFrame } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      pressed: true,
    },
  });

  expect(getTextures()).toMatchInlineSnapshot(`
    Array [
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "blue",
          "gradient": undefined,
          "mask": Object {
            "height": 10,
            "type": "rectangleMask",
            "width": 5,
            "x": 0,
            "y": 0,
          },
          "opacity": 1,
          "radius": 10,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": "player",
          "x": 0,
          "y": 100,
        },
        "type": "circle",
      },
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": Object {
            "family": "Arial",
            "size": 12,
          },
          "gradient": undefined,
          "mask": null,
          "opacity": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": undefined,
          "text": "x: 0",
          "x": 100,
          "y": 0,
        },
        "type": "text",
      },
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": undefined,
          "gradient": undefined,
          "mask": null,
          "opacity": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": undefined,
          "text": "Loading",
          "x": 0,
          "y": 0,
        },
        "type": "text",
      },
    ]
  `);

  nextFrame();

  expect(getTextures()).toMatchInlineSnapshot(`
    Array [
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "blue",
          "gradient": undefined,
          "mask": Object {
            "height": 10,
            "type": "rectangleMask",
            "width": 5,
            "x": 0,
            "y": 0,
          },
          "opacity": 1,
          "radius": 10,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": "player",
          "x": 1,
          "y": 100,
        },
        "type": "circle",
      },
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": Object {
            "family": "Arial",
            "size": 12,
          },
          "gradient": undefined,
          "mask": null,
          "opacity": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": undefined,
          "text": "x: 1",
          "x": 100,
          "y": 0,
        },
        "type": "text",
      },
      Object {
        "props": Object {
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": undefined,
          "gradient": undefined,
          "mask": null,
          "opacity": 1,
          "rotation": 0,
          "scaleX": 1,
          "scaleY": 1,
          "testId": undefined,
          "text": "Loading",
          "x": 0,
          "y": 0,
        },
        "type": "text",
      },
    ]
  `);
});

test("jumpToFrame, getTexture", async () => {
  const { jumpToFrame, getTexture } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      pressed: true,
    },
  });

  await jumpToFrame(() => getTexture("player").props.x > 10);

  expect(getTexture("player").props.x).toBe(11);
});

test("setRandomNumbers, log", () => {
  const { setRandomNumbers, log, nextFrame } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs: {
        testInput: "logRandom",
      },
    }
  );
  expect(log).not.toBeCalled();

  nextFrame();
  expect(log).toBeCalledWith(0.5);

  nextFrame();
  expect(log).toBeCalledWith(0.5);

  setRandomNumbers([0.1, 0.2, 0.3]);
  nextFrame();
  expect(log).toBeCalledWith(0.1);

  nextFrame();
  expect(log).toBeCalledWith(0.2);

  nextFrame();
  expect(log).toBeCalledWith(0.3);

  nextFrame();
  expect(log).toBeCalledWith(0.1);
});

test("initRandom", () => {
  const { log, nextFrame } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      testInput: "logRandom",
    },
    initRandom: [0.7, 0.8],
  });

  nextFrame();
  expect(log).toBeCalledWith(0.7);

  nextFrame();
  expect(log).toBeCalledWith(0.8);

  nextFrame();
  expect(log).toBeCalledWith(0.7);
});

test("textureExists, updateInputs", () => {
  const { textureExists, updateInputs, nextFrame } = testSprite(
    Game(gameProps),
    gameProps
  );
  expect(textureExists("player")).toBe(true);
  expect(textureExists("enemy")).toBe(false);

  updateInputs({ testInput: "showEnemy" });
  nextFrame();
  expect(textureExists("player")).toBe(true);
  expect(textureExists("enemy")).toBe(true);
});

test("getByText", () => {
  const { getByText, nextFrame } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      pressed: true,
    },
  });

  nextFrame();
  expect(getByText("x: 1").length).toBe(1);
  expect(getByText("X: 1")[0].props.x).toBe(100);

  nextFrame();
  expect(getByText("x: 2").length).toBe(1);
  expect(getByText("x: 1").length).toBe(0);
});

test("now", () => {
  const { log, nextFrame } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      testInput: "logNow",
    },
  });
  expect(log).not.toBeCalled();

  nextFrame();
  expect(log).toBeCalledWith("2000-02-01T00:00:00.000Z");
});

describe("timer", () => {
  test("Can call function after timeout with timer", async () => {
    const { log, nextFrame, updateInputs } = testSprite(
      Game(gameProps),
      gameProps,
      {
        initInputs: {
          testInput: "timerStart",
        },
      }
    );
    nextFrame();
    updateInputs({ testInput: undefined });

    nextFrame();
    nextFrame();
    expect(log).not.toBeCalled();
    nextFrame();
    // 50 ms passed
    expect(log).toBeCalledWith("timeout complete");
  });

  test("Can pause and resume timer", async () => {
    const { log, nextFrame, updateInputs } = testSprite(
      Game(gameProps),
      gameProps,
      {
        initInputs: {
          testInput: "timerStart",
        },
      }
    );
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    expect(log).not.toBeCalled();

    // Can pause
    updateInputs({ testInput: "timerPause" });
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    nextFrame();
    nextFrame();
    nextFrame();
    expect(log).not.toBeCalled();

    // Can resume
    updateInputs({ testInput: "timerResume" });
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    expect(log).toBeCalledWith("timeout complete");
  });

  test("Can cancel timer", async () => {
    const { log, nextFrame, updateInputs } = testSprite(
      Game(gameProps),
      gameProps,
      {
        initInputs: {
          testInput: "timerStart",
        },
      }
    );
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    expect(log).not.toBeCalled();

    // Can cancel
    updateInputs({ testInput: "timerCancel" });
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    nextFrame();
    nextFrame();
    nextFrame();
    expect(log).not.toBeCalled();

    // Resume timer (should do nothing)
    updateInputs({ testInput: "timerResume" });
    nextFrame();
    updateInputs({ testInput: undefined });
    nextFrame();
    expect(log).not.toBeCalled();
  });
});

test("audio", async () => {
  const { nextFrame, audio, log, updateInputs, resolvePromises } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs: {
        testInput: "audioPlay",
      },
    }
  );

  await resolvePromises();

  nextFrame();
  expect(audio.play).toBeCalledWith("sound.wav");

  updateInputs({
    testInput: "audioPlayFrom",
  });
  nextFrame();
  expect(audio.play).toBeCalledWith("sound.wav", 100);

  updateInputs({
    testInput: "audioPlayLoop",
  });
  nextFrame();
  expect(audio.play).toBeCalledWith("sound.wav", {
    fromPosition: 0,
    loop: true,
  });

  updateInputs({
    testInput: "audioPause",
  });
  nextFrame();
  expect(audio.pause).toBeCalledWith("sound.wav");

  updateInputs({
    testInput: "logAudioPosition",
  });
  nextFrame();
  expect(audio.getPosition).toBeCalledWith("sound.wav");
  expect(log).toBeCalledWith(120);
});

test("audio additional features", async () => {
  const { nextFrame, audio, updateInputs, resolvePromises } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs: {
        testInput: "audioGetStatus",
      },
    }
  );

  await resolvePromises();

  /*
    getStatus: () => "paused" | "playing";
    getVolume: () => number;
    setVolume: (volume: Volume) => void;
    getDuration: () => number;
  */

  nextFrame();
  expect(audio.play).toBeCalledWith("sound.wav");
  expect(audio.getStatus).toBeCalledWith("sound.wav");

  updateInputs({
    testInput: "audioSetVolume",
  });
  nextFrame();
  expect(audio.setVolume).toBeCalledWith("sound.wav", 0.25);

  updateInputs({
    testInput: "audioGetDuration",
  });
  nextFrame();
  expect(audio.getDuration).toBeCalledWith("sound.wav");
});

test("network", () => {
  const { nextFrame, network, log, updateInputs } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs: {
        testInput: "networkGET",
      },
      networkResponses: {
        get: {
          "/test-get": () => ({ got: "a get" }),
        },
        put: {
          "/test-put": (body: any) => ({ got: body.hi }),
        },
        post: {
          "/test-post": (body: any) => ({ got: body.hi }),
        },
        delete: {
          "/test-delete": () => ({ got: "a delete" }),
        },
      },
    }
  );

  nextFrame();
  expect(network.get).toBeCalled();
  expect(log).toBeCalledWith({ got: "a get" });

  updateInputs({ testInput: "networkPUT" });
  nextFrame();
  expect(network.put).toBeCalled();
  expect(log).toBeCalledWith({ got: "hello put" });

  updateInputs({ testInput: "networkPOST" });
  nextFrame();
  expect(network.post).toBeCalled();
  expect(log).toBeCalledWith({ got: "hello post" });

  updateInputs({ testInput: "networkDELETE" });
  nextFrame();
  expect(network.delete).toBeCalled();
  expect(log).toBeCalledWith({ got: "a delete" });

  updateInputs({ testInput: "networkGET-no-url" });
  expect(() => nextFrame()).toThrowError(
    "No GET response defined for url: /test-get-fail"
  );
});

test("storage", async () => {
  const { nextFrame, store, updateInputs, resolvePromises, log } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initStore: { origStore: "origValue" },
    }
  );

  nextFrame();
  expect(store).toEqual({ origStore: "origValue" });

  updateInputs({ testInput: "storage-set" });
  nextFrame();
  await resolvePromises();
  expect(store).toEqual({ origStore: "origValue", testKey: "hello" });

  updateInputs({ testInput: "storage-get" });
  nextFrame();
  await resolvePromises();
  expect(log).toBeCalledWith("hello");

  updateInputs({ testInput: "storage-remove" });
  nextFrame();
  await resolvePromises();
  expect(store).toEqual({ origStore: "origValue" });
});

test("alerts", () => {
  const {
    nextFrame,
    log,
    alert,
    updateInputs,
    updateAlertResponse,
  } = testSprite(Game(gameProps), gameProps, {
    initAlertResponse: false,
  });
  nextFrame();

  updateInputs({ testInput: "alert-ok" });
  nextFrame();
  expect(alert.ok).toBeCalledWith("Ok?", expect.any(Function));
  expect(log).toBeCalledWith("It's ok");

  updateInputs({ testInput: "alert-ok-cancel" });
  nextFrame();
  expect(alert.okCancel).toBeCalledWith("Ok or cancel?", expect.any(Function));
  expect(log).toBeCalledWith("Was ok: false");

  updateAlertResponse(true);
  nextFrame();
  expect(log).toBeCalledWith("Was ok: true");
});

test("clipboard", () => {
  const { nextFrame, log, clipboard, updateInputs } = testSprite(
    Game(gameProps),
    gameProps
  );
  nextFrame();

  updateInputs({ testInput: "clipboard-copy" });
  nextFrame();
  expect(clipboard.copy).toBeCalledWith("Hello", expect.any(Function));
  expect(log).toBeCalledWith("Copied");
});

test("can test individual Sprites", () => {
  const { getByText, getTextures } = testSprite(
    Text({ id: "Text", text: "Hello" }),
    gameProps
  );

  expect(getTextures().length).toBe(1);
  expect(getByText("Hello").length).toBe(1);
});

test("can map input coordinates to relative coordinates within Sprite", () => {
  const { log } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      x: 20,
    },
    mapInputCoordinates(getLocalCoords, inputs) {
      const { x = 0 } = inputs;
      const localX = getLocalCoords({ x, y: 0 }).x;
      return {
        ...inputs,
        x: localX,
      };
    },
  });

  // x is -100 from input due to mapping function
  expect(log).toBeCalledWith("x in Text Sprite is -80");
});

test("can get global position and rotation of deeply nested textures", () => {
  const { getTextures } = testSprite(NestedSpriteGame(gameProps), gameProps);

  const textures = getTextures();

  expect(textures.length).toBe(1);
  expect(textures[0].props.x).toBe(-10);
  expect(textures[0].props.y).toBe(50);
  expect(textures[0].props.rotation).toBe(0);
});

test("jumpToFrame throws last error", async () => {
  const { jumpToFrame, getTexture } = testSprite(Game(gameProps), gameProps, {
    initInputs: {},
  });

  expect.assertions(4);

  try {
    await jumpToFrame(() => getTexture("i-dont-exist"));
  } catch (e) {
    expect(e.message).toBe(
      `Timeout of 30 gameplay seconds reached on jumpToFrame with error:\n\nNo textures found with test id "i-dont-exist"`
    );
    // First line of stack is the code in this file
    expect(
      e.stack.split("\n")[1].includes("src/__tests__/replay-test.test.ts")
    ).toBe(true);
  }

  // Override max frames
  let frameCount = 0;
  try {
    await jumpToFrame(() => {
      frameCount++;
      return getTexture("i-dont-exist");
    }, 3600);
  } catch (e) {
    expect(e.message).toBe(
      `Timeout of 60 gameplay seconds reached on jumpToFrame with error:\n\nNo textures found with test id "i-dont-exist"`
    );
    expect(frameCount).toBe(3600);
  }
});

test("can mock Native Sprites", () => {
  const { getTextures } = testSprite(NativeSpriteGame(gameProps), gameProps, {
    nativeSpriteNames: ["MyNativeSprite"],
  });

  const textures = getTextures();

  expect(textures.length).toBe(0);
});

test("can load files specified in preloadFiles", async () => {
  const { getTextures, nextFrame, resolvePromises } = testSprite(
    Game(gameProps),
    gameProps
  );

  const isLoading = (textures: Texture[]) =>
    textures.some(
      (texture) => texture.type === "text" && texture.props.text === "Loading"
    );

  expect(isLoading(getTextures())).toBe(true);

  await resolvePromises();
  nextFrame();

  expect(isLoading(getTextures())).toBe(false);
});

test("shows error if file asset not loaded", async () => {
  expect(() => testSprite(ImageErrorGame(gameProps), gameProps)).toThrowError(
    `Image file "unknown.png" was not preloaded`
  );
  expect(() => testSprite(ImageErrorGame2(gameProps), gameProps)).toThrowError(
    `Image file "player.png" did not finish loading before it was used`
  );

  expect(() => testSprite(AudioErrorGame(gameProps), gameProps)).toThrowError(
    `Audio file "unknown.mp3" was not preloaded`
  );
  expect(() => testSprite(AudioErrorGame2(gameProps), gameProps)).toThrowError(
    `Audio file "shoot.wav" did not finish loading before it was used`
  );

  // Doesn't throw error if option is set
  expect(() =>
    testSprite(AudioErrorGame(gameProps), gameProps, {
      throwAssetErrors: false,
    })
  ).not.toThrowError();
  expect(() =>
    testSprite(ImageErrorGame(gameProps), gameProps, {
      throwAssetErrors: false,
    })
  ).not.toThrowError();
});

test("can mock context", () => {
  const { log } = testSprite(TestContextSprite(gameProps), gameProps, {
    contexts: [
      mockContext(testContext1, { val: "test" }),
      mockContext(testContext2, { result: "hello" }),
    ],
  });

  expect(log).toBeCalledWith("Val: test, result: hello");
});

// --- Mock Game

interface State {
  x: number;
  showEnemy: boolean;
  loading: boolean;
  timerId?: string;
}
interface Inputs {
  x?: number;
  pressed?: boolean;
  testInput?: string;
}

const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 500,
    height: 300,
  },
};

const Game = makeSprite<GameProps, State, Inputs>({
  init({ preloadFiles, updateState }) {
    preloadFiles({ audioFileNames: ["sound.wav"] }).then(() => {
      updateState((s) => ({ ...s, loading: false }));
    });
    return {
      x: 0,
      showEnemy: false,
      loading: true,
    };
  },

  loop({ state, device, getInputs, updateState }) {
    const inputs = getInputs();
    if (inputs.pressed) {
      return {
        ...state,
        x: state.x + 1,
      };
    }
    switch (inputs.testInput) {
      case "logRandom":
        device.log(device.random());
        break;
      case "logNow":
        device.log(device.now().toISOString());
        break;
      case "showEnemy":
        return {
          ...state,
          showEnemy: true,
        };
      case "timerStart":
        const id = device.timer.start(() => {
          device.log("timeout complete");
        }, 40);
        updateState((s) => ({ ...s, timerId: id }));
        break;
      case "timerPause":
        device.timer.pause(state.timerId ?? "");
        break;
      case "timerResume":
        device.timer.resume(state.timerId ?? "");
        break;
      case "timerCancel":
        device.timer.cancel(state.timerId ?? "");
        break;
      case "audioPlay":
        device.audio("sound.wav").play();
        break;
      case "audioPlayFrom":
        device.audio("sound.wav").play(100);
        break;
      case "audioPlayLoop":
        device.audio("sound.wav").play({ fromPosition: 0, loop: true });
        break;
      case "audioPause":
        device.audio("sound.wav").pause();
        break;
      case "logAudioPosition":
        device.log(device.audio("sound.wav").getPosition());
        break;
      case "audioGetStatus":
        device.audio("sound.wav").play();
        device.audio("sound.wav").getStatus();
        break;
      case "audioSetVolume":
        device.audio("sound.wav").setVolume(0.25);
        break;
      case "audioGetDuration":
        device.audio("sound.wav").getDuration();
        break;
      case "networkGET":
        device.network.get("/test-get", (response) => {
          device.log(response);
        });
        break;
      case "networkPUT":
        device.network.put("/test-put", { hi: "hello put" }, (response) => {
          device.log(response);
        });
        break;
      case "networkPOST":
        device.network.post("/test-post", { hi: "hello post" }, (response) => {
          device.log(response);
        });
        break;
      case "networkDELETE":
        device.network.delete("/test-delete", (response) => {
          device.log(response);
        });
        break;
      case "networkGET-no-url":
        device.network.get("/test-get-fail", () => null);
        break;
      case "storage-set":
        device.storage.setItem("testKey", "hello");
        break;
      case "storage-get":
        device.storage.getItem("testKey").then((value) => {
          device.log(value);
        });
        break;
      case "storage-remove":
        device.storage.setItem("testKey", null);
        break;
      case "alert-ok":
        device.alert.ok("Ok?", () => {
          device.log("It's ok");
        });
        break;
      case "alert-ok-cancel":
        device.alert.okCancel("Ok or cancel?", (wasOk) => {
          device.log(`Was ok: ${wasOk}`);
        });
        break;
      case "clipboard-copy":
        device.clipboard.copy("Hello", () => {
          device.log("Copied");
        });
        break;

      default:
        break;
    }
    return state;
  },

  render({ state }) {
    return [
      t.circle({
        testId: "player",
        x: state.x,
        y: 100,
        rotation: 0,
        radius: 10,
        color: "blue",
        mask: mask.rectangle({
          width: 5,
          height: 10,
        }),
      }),
      Text({
        id: "Text",
        x: 100,
        y: 0,
        rotation: 0,
        text: `x: ${state.x}`,
      }),
      state.showEnemy
        ? t.circle({
            testId: "enemy",
            x: 100,
            y: 100,
            rotation: 0,
            radius: 10,
            color: "red",
          })
        : null,
      state.loading
        ? t.text({
            text: "Loading",
            color: "red",
          })
        : null,
    ];
  },
});

const Text = makeSprite<{ text: string }, undefined, Inputs>({
  render({ props, device, getInputs }) {
    const inputs = getInputs();
    if (inputs.x) {
      device.log(`x in Text Sprite is ${inputs.x}`);
    }
    return [
      t.text({
        text: props.text,
        color: "red",
        font: { family: "Arial", size: 12 },
      }),
    ];
  },
});

/// -- Nested Sprite test

const NestedSpriteGame = makeSprite<GameProps>({
  render() {
    return [
      NestedFirstSprite({
        id: "first",
        x: 20,
        y: 20,
        rotation: -90,
      }),
    ];
  },
});

const NestedFirstSprite = makeSprite({
  render() {
    return [
      NestedSecondSprite({
        id: "second",
        x: 50,
        y: 20,
        rotation: -90,
      }),
    ];
  },
});

const NestedSecondSprite = makeSprite({
  render() {
    return [
      t.text({
        text: "nested",
        color: "black",
        x: 10,
        y: 20,
        rotation: 180,
      }),
    ];
  },
});

/// -- Mock Native Sprite test

const NativeSpriteGame = makeSprite<GameProps>({
  render() {
    return [
      MyNativeSprite({
        id: "native",
      }),
    ];
  },
});
const MyNativeSprite = makeNativeSprite("MyNativeSprite");

/// -- Loading files error Sprite test

const ImageErrorGame = makeSprite<GameProps>({
  render() {
    return [
      t.image({
        fileName: "unknown.png",
        width: 30,
        height: 30,
      }),
    ];
  },
});

const ImageErrorGame2 = makeSprite<GameProps>({
  init({ preloadFiles }) {
    // Loading file, but not waiting in render
    preloadFiles({ imageFileNames: ["player.png"] });
    return undefined;
  },

  render() {
    return [
      t.image({
        fileName: "player.png",
        width: 30,
        height: 30,
      }),
    ];
  },
});

const AudioErrorGame = makeSprite<GameProps>({
  init({ device }) {
    device.audio("unknown.mp3").play();
    return undefined;
  },

  render() {
    return [];
  },
});

const AudioErrorGame2 = makeSprite<GameProps>({
  init({ device, preloadFiles }) {
    preloadFiles({ audioFileNames: ["shoot.wav"] });
    device.audio("shoot.wav").play();
    return undefined;
  },

  render() {
    return [];
  },
});

const testContext1 = makeContext<{ val: string }>();
const testContext2 = makeContext<{ result: string }>();

const TestContextSprite = makeSprite<{}>({
  render({ getContext, device }) {
    const { val } = getContext(testContext1);
    const { result } = getContext(testContext2);

    device.log(`Val: ${val}, result: ${result}`);

    return [];
  },
});
