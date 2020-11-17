import { testSprite } from "@replay/test";
import { Game, gameProps } from "..";
import { pipeGap } from "../pipe";
import { birdHeight } from "../bird";

test("Can reach a score of 2", async () => {
  const initInputs = {
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

  const {
    nextFrame,
    updateInputs,
    getByText,
    getTexture,
    jumpToFrame,
    audio,
    loadFiles,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs,
    // First two pipes will have gap in middle, third pipe lower down
    initRandom: [0.5, 0.5, 0],
  });

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

  // Keeps the bird hovering in the middle to pass the first 2 pipes
  function keepBirdInMiddle() {
    if (getTexture("bird").props.y < -pipeGap / 2 + birdHeight + 20) {
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

      updateInputs(initInputs);
      nextFrame();
    }

    nextFrame();
  }

  await jumpToFrame(() => {
    keepBirdInMiddle();

    // Exit when main menu appears again
    return getByText(mainMenuText).length > 0;
  });

  getByText("Score: 2");
  getByText("High score: 2");

  expect(audio.play).toBeCalledWith("boop.wav");
  expect(audio.play).toBeCalledTimes(1);
});
