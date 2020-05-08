import { makeSprite, GameProps } from "@replay/core";
import { Bird } from "./bird";

export const Game = makeSprite<GameProps>({
  render() {
    return [
      Bird({
        id: "bird",
      }),
    ];
  },
});

export const gameProps: GameProps = {
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
