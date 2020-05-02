import { WebInputs } from "../../../packages/replay-web/src";
import { iOSInputs } from "../../../packages/replay-swift";
import { testGame } from "../../../packages/replay-test/src";
import { Game, gameProps } from "..";

test("gameplay", () => {
  const inputs: WebInputs | iOSInputs = {
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
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
  } = testGame(Game(gameProps), {
    initInputs: inputs,
    initRandom: [0.5],
    networkResponses: {
      get: {
        "https://jsonplaceholder.typicode.com/posts/1": () => ({
          id: 1,
        }),
      },
    },
  });

  getByText("Loading");

  jumpToFrame(() => textureExists("player"));
  expect(getTexture("player").props.position.x).toBe(0);
  expect(getTexture("player").props.position.y).toBe(-150);

  // enemy spawns in middle

  jumpToFrame(() => textureExists("enemy1"));
  expect(getTexture("enemy1").props.position).toEqual({
    rotation: 0,
    x: 0,
    y: 158,
  });

  updateInputs({
    pointer: {
      pressed: true,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
  });
  nextFrame();

  // fire bullet towards enemy

  expect(getTexture("bullet1").props.position.x).toBe(0);
  expect(getTexture("bullet1").props.position.y).toBe(-140);
  expect(audio.play).toBeCalledWith("shoot.wav");

  updateInputs({
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: true,
      x: 0,
      y: 0,
    },
  });
  nextFrame();

  expect(getTexture("bullet1").props.position.x).toBe(0);
  expect(getTexture("bullet1").props.position.y).toBe(-130);

  // enemy gets hit!

  jumpToFrame(() => !textureExists("enemy1"));

  expect(getTexture("bullet1").props.position.x).toBe(0);
  expect(getTexture("bullet1").props.position.y).toBe(110);

  setRandomNumbers([0.2]);

  // enemy spawns to left

  jumpToFrame(() => textureExists("enemy1"));
  expect(getTexture("enemy1").props.position.x).toBe(-150);

  // fire in the middle again

  updateInputs({
    pointer: {
      pressed: true,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
  });
  nextFrame();

  expect(textureExists("bullet1")).toBe(true);

  updateInputs({
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: true,
      x: 0,
      y: 0,
    },
  });

  // bullet misses enemy and game over!

  jumpToFrame(() => getByText("Game Over")[0]);

  expect(store).toEqual({ highScore: "1" });
});
