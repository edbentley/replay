import { makeSprite, t } from "@replay/core";
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

  render({ state, device }) {
    const { size } = device;
    return [
      t.rectangle({
        color: "#add8e6",
        width: size.width + size.widthMargin * 2,
        height: size.height + size.heightMargin * 2,
      }),
      Bird({
        id: "bird",
        position: {
          x: birdX,
          y: state.birdY,
          rotation: Math.max(-30, state.birdGravity * 3 - 30),
        },
      }),
    ];
  },
});
