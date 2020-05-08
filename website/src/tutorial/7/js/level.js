import { makeSprite } from "@replay/core";
import { Bird } from "./bird";

const birdX = 0;

export const Level = makeSprite({
  init() {
    return {
      birdY: 10,
      birdGravity: -12,
    };
  },

  loop({ state }) {
    let { birdGravity, birdY } = state;

    birdGravity += 0.8;
    birdY -= birdGravity;

    return {
      birdGravity,
      birdY,
    };
  },

  render({ state }) {
    return [
      Bird({
        id: "bird",
        position: {
          x: birdX,
          y: state.birdY,
        },
      }),
    ];
  },
});
