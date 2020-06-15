import { testSprite } from "@replay/test";
import { WebInputs, mapInputCoordinates } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Game, gameProps } from "..";

test("gameplay", () => {
  const initInputs: WebInputs | iOSInputs = {
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
    updateInputs,
    getTexture,
    audio,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs,
    mapInputCoordinates,
  });

  expect(getTexture("icon").props.x).toBe(0);
  expect(getTexture("icon").props.y).toBe(0);
  expect(getTexture("icon").props.rotation).toBe(0);

  updateInputs({
    pointer: {
      pressed: true,
      justPressed: true,
      justReleased: false,
      x: 100,
      y: 100,
    },
  });

  nextFrame();

  updateInputs(initInputs);

  expect(audio.play).toBeCalledWith("boop.wav");

  jumpToFrame(() => getTexture("icon").props.x > 99.99);

  expect(getTexture("icon").props.y).toBeCloseTo(100);

  expect(audio.play).toHaveBeenCalledTimes(1);
});
