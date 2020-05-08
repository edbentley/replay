import { makeSprite } from "@replay/core";
import { Level } from "./level";

export const Game = makeSprite({
  render() {
    return [
      Level({
        id: "level",
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
    name: "Helvetica",
    size: 24,
  },
};
