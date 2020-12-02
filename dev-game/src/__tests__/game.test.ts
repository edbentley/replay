import {
  WebInputs,
  mapInputCoordinates,
} from "../../../packages/replay-web/src";
import { iOSInputs } from "../../../packages/replay-swift/src";
import { testSprite } from "../../../packages/replay-test/src";
import { Game, gameProps } from "..";

test("gameplay", async () => {
  const inputs: WebInputs | iOSInputs = {
    pointer: {
      pressed: false,
      numberPressed: 0,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  };

  const {
    nextFrame,
    jumpToFrame,
    setRandomNumbers,
    updateInputs,
    getTexture,
    textureExists,
    getByText,
    audio,
    store,
    log,
    loadFiles,
    // alert,
    // clipboard,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs: inputs,
    mapInputCoordinates,
    initRandom: [0.5],
    networkResponses: {
      get: {
        "https://jsonplaceholder.typicode.com/posts/1": () => ({
          id: 1,
        }),
      },
    },
    nativeSpriteNames: ["TextInput"],
  });

  expect(getByText("Loading game").length).toBe(1);

  // Wait for initial timeout of 1000 ms
  for (let i = 0; i <= 60; i++) {
    nextFrame();
  }

  expect(getByText("Loading game").length).toBe(0);
  expect(getByText("Loading level").length).toBe(1);

  // Load PlayStage files
  await loadFiles();
  nextFrame();

  expect(getByText("Loading level").length).toBe(0);

  await jumpToFrame(() => textureExists("player"));
  expect(getTexture("player").props.x).toBe(0);
  expect(getTexture("player").props.y).toBe(-150);

  // Uncomment in game to test
  // expect(clipboard.copy).toHaveBeenCalledWith("Hello", expect.any(Function));
  // expect(alert.okCancel).toHaveBeenCalledWith(
  //   `Just copied "Hello" to your clipboard. Game is about to start`,
  //   expect.any(Function)
  // );

  // enemy spawns in middle

  await jumpToFrame(() => textureExists("enemy1"));
  expect(getTexture("enemy1").props.x).toBe(0);
  expect(getTexture("enemy1").props.y).toBe(158);
  expect(getTexture("enemy1").props.rotation).toBe(0);

  updateInputs({
    pointer: {
      pressed: true,
      numberPressed: 1,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  });
  nextFrame();

  // fire bullet towards enemy

  expect(getTexture("bullet1").props.x).toBe(0);
  expect(getTexture("bullet1").props.y).toBe(-150);
  expect(audio.play).toBeCalledWith("shoot.wav");

  updateInputs({
    pointer: {
      pressed: false,
      numberPressed: 0,
      justPressed: false,
      justReleased: true,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  });
  nextFrame();

  expect(getTexture("bullet1").props.x).toBe(0);
  expect(getTexture("bullet1").props.y).toBe(-140);

  // enemy gets hit!

  await jumpToFrame(() => !textureExists("enemy1"));

  expect(getTexture("bullet1").props.x).toBe(0);
  expect(getTexture("bullet1").props.y).toBe(100);

  setRandomNumbers([0.2]);

  // enemy spawns to left

  await jumpToFrame(() => textureExists("enemy1"));
  expect(getTexture("enemy1").props.x).toBe(-150);

  // fire in the middle again

  updateInputs({
    pointer: {
      pressed: true,
      numberPressed: 1,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  });
  nextFrame();

  expect(textureExists("bullet1")).toBe(true);

  updateInputs({
    pointer: {
      pressed: false,
      numberPressed: 0,
      justPressed: false,
      justReleased: true,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  });

  // bullet misses enemy and game over!

  await jumpToFrame(() => getByText("Game Over").length > 0);

  expect(store).toEqual({ highScore: "1" });

  // check mapper function works
  expect(log).toBeCalledWith("x: -100, y: -200");
});
