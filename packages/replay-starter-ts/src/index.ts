import { makeSprite, t, GameProps } from "@replay/core";
import { WebInputs, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "@replay/swift";

export const options: RenderCanvasOptions = {
  dimensions: "scale-up",
};

export const gameProps: GameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 600,
      height: 400,
      maxWidthMargin: 150,
    },
    portrait: {
      width: 400,
      height: 600,
      maxHeightMargin: 150,
    },
  },
  defaultFont: {
    name: "Courier",
    size: 10,
  },
};

type GameState = {
  loaded: boolean;
  posX: number;
  posY: number;
  targetX: number;
  targetY: number;
};

export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init({ updateState, preloadFiles }) {
    preloadFiles({
      audioFileNames: ["boop.wav"],
      imageFileNames: ["icon.png"],
    }).then(() => {
      updateState((state) => ({ ...state, loaded: true }));
    });

    return {
      loaded: false,
      posX: 0,
      posY: 0,
      targetX: 0,
      targetY: 0,
    };
  },

  loop({ state, device }) {
    if (!state.loaded) return state;

    const { pointer } = device.inputs;
    const { posX, posY } = state;
    let { targetX, targetY } = state;

    if (pointer.justPressed) {
      device.audio("boop.wav").play();
      targetX = pointer.x;
      targetY = pointer.y;
    }

    return {
      loaded: true,
      posX: posX + (targetX - posX) / 10,
      posY: posY + (targetY - posY) / 10,
      targetX,
      targetY,
    };
  },

  render({ state }) {
    if (!state.loaded) {
      return [
        t.text({
          text: "Loading...",
          color: "black",
        }),
      ];
    }
    return [
      t.text({
        color: "red",
        text: "Hello Replay! To get started, edit src/index.ts",
        y: 50,
      }),
      t.image({
        testId: "icon",
        x: state.posX,
        y: state.posY,
        fileName: "icon.png",
        width: 50,
        height: 50,
      }),
    ];
  },
});
