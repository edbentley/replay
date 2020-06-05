import { makeSprite, t, GameProps } from "@replay/core";
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
          "color": "blue",
          "position": Object {
            "rotation": 0,
            "x": 0,
            "y": 100,
          },
          "radius": 10,
          "testId": "player",
        },
        "type": "circle",
      },
      Object {
        "props": Object {
          "color": "red",
          "font": Object {
            "name": "Arial",
            "size": 12,
          },
          "position": Object {
            "rotation": 0,
            "x": 100,
            "y": 0,
          },
          "text": "x: 0",
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
          "color": "blue",
          "position": Object {
            "rotation": 0,
            "x": 1,
            "y": 100,
          },
          "radius": 10,
          "testId": "player",
        },
        "type": "circle",
      },
      Object {
        "props": Object {
          "color": "red",
          "font": Object {
            "name": "Arial",
            "size": 12,
          },
          "position": Object {
            "rotation": 0,
            "x": 100,
            "y": 0,
          },
          "text": "x: 1",
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

  jumpToFrame(() => getTexture("player").props.position.x > 10);

  expect(getTexture("player").props.position.x).toBe(11);
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
  expect(getByText("X: 1")[0].props.position!.x).toBe(100);

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

  jumpToFrame(() => getTexture("player").props.position.x === -10);
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
    mapInputCoordinates(parentPos, inputs) {
      if (!parentPos || !inputs.x) return inputs;
      return {
        ...inputs,
        x: inputs.x - parentPos.x,
      };
    },
  });

  // x is -100 from input due to mapping function
  expect(log).toBeCalledWith("x in Text Sprite is -80");
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
      default:
        break;
    }
    return state;
  },

  render({ state }) {
    return [
      t.circle({
        testId: "player",
        position: {
          x: state.x,
          y: 100,
          rotation: 0,
        },
        radius: 10,
        color: "blue",
      }),
      Text({
        id: "Text",
        position: {
          x: 100,
          y: 0,
          rotation: 0,
        },
        text: `x: ${state.x}`,
      }),
      state.showEnemy
        ? t.circle({
            testId: "enemy",
            position: {
              x: 100,
              y: 100,
              rotation: 0,
            },
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
