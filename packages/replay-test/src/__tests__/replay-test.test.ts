import { makeSprite, t, GameProps, makeNativeSprite } from "@replay/core";
import { testSprite } from "../index";

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
          "align": "center",
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": Object {
            "name": "Arial",
            "size": 12,
          },
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
          "align": "center",
          "anchorX": 0,
          "anchorY": 0,
          "color": "red",
          "font": Object {
            "name": "Arial",
            "size": 12,
          },
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
    ]
  `);
});

test("jumpToFrame, getTexture", () => {
  const { jumpToFrame, getTexture } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      pressed: true,
    },
  });

  jumpToFrame(() => getTexture("player").props.x > 10);

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
  expect(() => getByText("x: 1")).toThrowError();
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

test("timeout", () => {
  const { jumpToFrame, getTexture } = testSprite(Game(gameProps), gameProps, {
    initInputs: {
      testInput: "timeout",
    },
  });

  jumpToFrame(() => getTexture("player").props.x === -10);
});

test("audio", () => {
  const { nextFrame, audio, log, updateInputs } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs: {
        testInput: "audioPlay",
      },
    }
  );

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
  expect(audio.play).toBeCalledWith("sound.wav", 0, true);

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

test("storage", () => {
  const { nextFrame, store, updateInputs } = testSprite(
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
  expect(store).toEqual({ origStore: "origValue", testKey: "hello" });

  updateInputs({ testInput: "storage-remove" });
  nextFrame();
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
  expect(getByText("Hello")).toBeTruthy();
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

test("jumpToFrame throws last error", () => {
  const { jumpToFrame, getTexture } = testSprite(Game(gameProps), gameProps, {
    initInputs: {},
  });

  expect(() => jumpToFrame(() => getTexture("i-dont-exist"))).toThrowError(
    `Timeout of 1000 gameplay seconds reached on jumpToFrame with error:\n\nNo textures found with test id "i-dont-exist"`
  );
});

test("can mock Native Sprites", () => {
  const { getTextures } = testSprite(NativeSpriteGame(gameProps), gameProps, {
    nativeSpriteNames: ["MyNativeSprite"],
  });

  const textures = getTextures();

  expect(textures.length).toBe(0);
});

// --- Mock Game

interface State {
  x: number;
  showEnemy: boolean;
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
  init() {
    return {
      x: 0,
      showEnemy: false,
    };
  },

  loop({ state, device, updateState }) {
    if (device.inputs.pressed) {
      return {
        ...state,
        x: state.x + 1,
      };
    }
    switch (device.inputs.testInput) {
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
      case "timeout":
        device.timeout(() => {
          updateState((prevState) => ({ ...prevState, x: -10 }));
        }, 100);
        break;
      case "audioPlay":
        device.audio("sound.wav").play();
        break;
      case "audioPlayFrom":
        device.audio("sound.wav").play(100);
        break;
      case "audioPlayLoop":
        device.audio("sound.wav").play(0, true);
        break;
      case "audioPause":
        device.audio("sound.wav").pause();
        break;
      case "logAudioPosition":
        device.log(device.audio("sound.wav").getPosition());
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
        device.storage.setStore({ testKey: "hello" });
        break;
      case "storage-remove":
        device.storage.setStore({ testKey: undefined });
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
    ];
  },
});

const Text = makeSprite<{ text: string }, undefined, Inputs>({
  render({ props, device }) {
    if (device.inputs.x) {
      device.log(`x in Text Sprite is ${device.inputs.x}`);
    }
    return [
      t.text({
        text: props.text,
        color: "red",
        font: { name: "Arial", size: 12 },
      }),
    ];
  },
});

/// -- Nested Sprite test

export const NestedSpriteGame = makeSprite<GameProps>({
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

export const NativeSpriteGame = makeSprite<GameProps>({
  render() {
    return [
      MyNativeSprite({
        id: "native",
      }),
    ];
  },
});
const MyNativeSprite = makeNativeSprite("MyNativeSprite");
