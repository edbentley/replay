import { t, makeSprite } from "../../packages/replay-core/src";

interface State {
  loading: boolean;
  frame: number;
  timeElapsed: number;
}

export const WalkingGreenCapChar = makeSprite<{}, State>({
  init({ preloadFiles, updateState }) {
    preloadFiles({ imageFileNames: ["spritesheet.png"] }, () =>
      updateState((s) => ({ ...s, loading: false }))
    );
    return { loading: true, frame: 0, timeElapsed: 0 };
  },

  loop({ state }) {
    if (state.loading) return state;

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

    return { ...state, frame, timeElapsed };
  },

  render({ state }) {
    if (state.loading) {
      return [];
    }
    return [
      t.spriteSheet({
        fileName: "spritesheet.png",
        columns: 3,
        rows: 4,
        index: state.frame,
        width: 48,
        height: 54,
        scaleX: -1,
        anchorX: -24,
      }),
    ];
  },
});
