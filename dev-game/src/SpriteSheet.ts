import { t, makeSprite } from "../../packages/replay-core/src";

interface State {
  frame: number;
  timeElapsed: number;
}

export const WalkingGreenCapChar = makeSprite<{}, State>({
  init() {
    return { frame: 0, timeElapsed: 0 };
  },

  loop({ state }) {
    let { frame, timeElapsed } = state;

    timeElapsed++;
    if (timeElapsed > 15) {
      // 4 fps
      timeElapsed = 0;
      frame++;
    }
    if (frame > 11) {
      frame = 0;
    }

    return { frame, timeElapsed };
  },

  render({ state }) {
    return [
      t.spriteSheet({
        fileName: "spritesheet.png",
        columns: 3,
        rows: 4,
        index: state.frame,
        width: 48,
        height: 54,
        scaleX: -1,
        anchorX: -1,
      }),
    ];
  },
});
