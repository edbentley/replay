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

  loop({ state, device }) {
    const { inputs } = device;

    let { birdGravity, birdY } = state;

    birdGravity += 0.8;
    birdY -= birdGravity;

    if (inputs.pointer.justPressed) {
      birdGravity = -12;
    }

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
