import { makeSprite, t } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Bird } from "./bird";

const birdX = 0;

type LevelProps = {
  paused: boolean;
};

type LevelState = {
  birdY: number;
  birdGravity: number;
};

export const Level = makeSprite<LevelProps, LevelState, WebInputs | iOSInputs>({
  init() {
    return {
      birdY: 10,
      birdGravity: -12,
    };
  },

  loop({ props, state, getInputs }) {
    if (props.paused) {
      return state;
    }

    const inputs = getInputs();

    let { birdGravity, birdY } = state;

    birdGravity += 0.8;
    birdY -= birdGravity;

    if (inputs.pointer.justPressed || inputs.keysJustPressed[" "]) {
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
        x: birdX,
        y: state.birdY,
        rotation: Math.max(-30, state.birdGravity * 3 - 30),
      }),
    ];
  },
});
