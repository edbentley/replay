import { testSprite } from "@replay/test";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Game, gameProps } from "..";

test("Can start game", async () => {
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
  const mainMenuText = "Start";

  const { nextFrame, updateInputs, getByText, loadFiles } = testSprite(
    Game(gameProps),
    gameProps,
    {
      initInputs,
    }
  );

  await loadFiles();
  nextFrame();

  expect(getByText(mainMenuText).length).toBe(1);

  updateInputs({
    pointer: {
      pressed: false,
      numberPressed: 1,
      justPressed: false,
      justReleased: true,
      x: 0,
      y: 0,
    },
    keysDown: {},
    keysJustPressed: {},
  });
  nextFrame();

  updateInputs(initInputs);
  nextFrame();

  // Main menu gone, game has started
  expect(getByText(mainMenuText).length).toBe(0);
});
