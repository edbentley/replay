import { makeSprite } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Bird } from "./bird";

const birdX = 0;

type LevelState = {
  birdY: number;
  birdGravity: number;
};

export const Level = makeSprite<{}, LevelState, WebInputs | iOSInputs>({
  init() {
    return {
      birdY: 10,
      birdGravity: -12,
    };
  },

  render({ state }) {
    return [
      Bird({
        id: "bird",
        x: birdX,
        y: state.birdY,
      }),
    ];
  },
});
