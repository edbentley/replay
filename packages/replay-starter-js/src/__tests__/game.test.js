import { testGame } from "@replay/test";
import { Game, gameProps } from "..";

test("gameplay", () => {
  const initInputs = {
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
  } = testGame(Game(gameProps), { initInputs });

  expect(getTexture("icon").props.position).toEqual({
    x: 0,
    y: 0,
    rotation: 0,
  });

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

  jumpToFrame(() => getTexture("icon").props.position.x > 99.99);

  expect(getTexture("icon").props.position.y).toBeCloseTo(100);

  expect(audio.play).toHaveBeenCalledTimes(1);
});
