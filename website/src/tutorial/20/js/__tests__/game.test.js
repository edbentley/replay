import { testSprite } from "@replay/test";
import { Game, gameProps } from "..";

test("Can start game", () => {
  const initInputs = {
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
  };
  const mainMenuText = "Start";

  const { nextFrame, updateInputs, getByText } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs,
    }
  );

  expect(getByText(mainMenuText)).toBeDefined();

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

  updateInputs(initInputs);
  nextFrame();

  // Main menu gone, game has started
  expect(() => getByText(mainMenuText)).toThrowError();
});
