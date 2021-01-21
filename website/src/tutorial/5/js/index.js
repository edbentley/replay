import { makeSprite } from "@replay/core";
import { Bird } from "./bird";

export const Game = makeSprite({
  render() {
    return [
      Bird({
        id: "bird",
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
