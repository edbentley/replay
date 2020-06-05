import { testSprite } from "@replay/test";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Game, gameProps } from "..";

test("Can start game", () => {
  const initInputs: WebInputs | iOSInputs = {
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
      // Note that the pointer position has the same coordinates in all Sprites
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
