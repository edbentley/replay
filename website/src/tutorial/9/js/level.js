import { makeSprite } from "@replay/core";
import { Bird } from "./bird";
import { isWebInput } from "./utils";

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

    if (
      inputs.pointer.justPressed ||
      (isWebInput(inputs) && inputs.keysJustPressed[" "])
    ) {
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
        x: birdX,
        y: state.birdY,
      }),
    ];
  },
});
