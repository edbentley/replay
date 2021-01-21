import { makeSprite } from "@replay/core";
import { Level } from "./level";

export const Game = makeSprite({
  init() {
    return { view: "menu" };
  },

  render({ state }) {
    const inMenuScreen = state.view === "menu";

    return [
      Level({
        id: "level",
        paused: inMenuScreen,
      }),
    ];
  },
});

export const gameProps = {
  id: "Game",
  size: {
    width: 400,
    height: 600,
    maxHeightMargin: 150,
  },
  defaultFont: {
    family: "Helvetica",
    size: 24,
  },
};
