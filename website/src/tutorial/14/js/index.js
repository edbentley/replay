import { makeSprite } from "@replay/core";
import { Level } from "./level";
import { Menu } from "./menu";

export const Game = makeSprite({
  init() {
    return { view: "menu" };
  },

  render({ state, updateState }) {
    const inMenuScreen = state.view === "menu";

    return [
      Level({
        id: "level",
        paused: inMenuScreen,
      }),
      inMenuScreen
        ? Menu({
            id: "menu",
            start: () => {
              updateState((prevState) => {
                return {
                  ...prevState,
                  view: "level",
                };
              });
            },
          })
        : null,
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
