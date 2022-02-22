import { makeMutableSprite, r, t2 } from "../../packages/replay-core/src";

interface State {
  loading: boolean;
  frame: number;
  timeElapsed: number;
}

export const MutWalkingGreenCapChar = makeMutableSprite<{}, State>({
  init({ preloadFiles, getState }) {
    preloadFiles({ imageFileNames: ["spritesheet.png"] }).then(() => {
      getState().loading = false;
    });
    return { loading: true, frame: 0, timeElapsed: 0 };
  },

  loop({ state }) {
    if (state.loading) return;

    state.timeElapsed++;
    if (state.timeElapsed > 15) {
      // 4 fps
      state.timeElapsed = 0;
      state.frame++;
    }
    if (state.frame > 11) {
      state.frame = 0;
    }
  },

  render({ state }) {
    return [
      r.if(
        () => !state.loading,
        () => [
          t2.spriteSheet(
            {
              fileName: "spritesheet.png",
              columns: 3,
              rows: 4,
              index: state.frame,
              width: 48,
              height: 54,
              scaleX: -1,
              anchorX: -24,
            },
            (thisProps) => {
              thisProps.index = state.frame;
            }
          ),
        ]
      ),
    ];
  },
});
