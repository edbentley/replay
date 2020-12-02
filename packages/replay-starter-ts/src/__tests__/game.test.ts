import { testSprite } from "@replay/test";
import { WebInputs, mapInputCoordinates } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Game, gameProps } from "..";

test("gameplay", async () => {
  const initInputs: WebInputs | iOSInputs = {
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
    updateInputs,
    getTexture,
    loadFiles,
    audio,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs,
    mapInputCoordinates,
  });

  await loadFiles();
  nextFrame();

  expect(getTexture("icon").props.x).toBe(0);
  expect(getTexture("icon").props.y).toBe(0);
  expect(getTexture("icon").props.rotation).toBe(0);

  updateInputs({
    pointer: {
      pressed: true,
      numberPressed: 1,
      justPressed: true,
      justReleased: false,
      x: 100,
      y: 100,
    },
    keysDown: {},
    keysJustPressed: {},
  });

  nextFrame();

  updateInputs(initInputs);

  expect(audio.play).toBeCalledWith("boop.wav");

  await jumpToFrame(() => getTexture("icon").props.x > 99.99);

  expect(getTexture("icon").props.y).toBeCloseTo(100);

  expect(audio.play).toHaveBeenCalledTimes(1);
});
