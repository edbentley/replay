import { GameProps, t, makeSprite } from "../../packages/replay-core/src";
import { WebInputs, RenderCanvasOptions } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";
import { PlayStage } from "./PlayStage";
import { TextInput, TextInputWeb } from "../../packages/replay-text-input/src";

interface State {
  stage: GameStage;
  bulletSpeed: number;
  gameOverText: string;
  highScore: number;
  text: string;
}

enum GameStage {
  Query,
  Play,
  GameOver,
}

const initState: Omit<State, "highScore"> = {
  stage: GameStage.Query,
  bulletSpeed: 0, // updated in query
  gameOverText: "",
  text: "Hello",
};

// defined in webpack
declare const ASSET_NAMES: {};

export const options: RenderCanvasOptions = {
  loadingTextures: [
    t.text({
      color: "black",
      text: "Loading...",
    }),
  ],
  assets: ASSET_NAMES,
  dimensions: "scale-up",
  nativeSpriteMap: { TextInput: TextInputWeb },
};

export const gameProps: GameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 500,
      height: 300,
      maxWidthMargin: 100,
    },
    portrait: {
      width: 350,
      height: 500,
      maxWidthMargin: 50,
    },
  },
  defaultFont: {
    name: "Courier",
    size: 10,
  },
};

export const Game = makeSprite<GameProps, State, WebInputs | iOSInputs>({
  init({ device, updateState }) {
    const storedHighScore = device.storage.getStore().highScore;
    const highScore = storedHighScore ? parseInt(storedHighScore, 10) : 0;
    // device.network.get(
    //   "https://jsonplaceholder.typicode.com/posts/1",
    //   data => {
    //     const speed = data.id * 5;
    //     send({
    //       type: "SetBulletSpeed",
    //       speed
    //     });
    //   }
    // );
    device.timer.start(() => {
      updateState((state) => ({
        ...state,
        bulletSpeed: 10,
        stage: GameStage.Play,
      }));

      // Uncomment below to test alerts and clipboard
      // device.clipboard.copy("Hello", (error) => {
      //   if (error) {
      //     device.alert.ok(`Error copying to clipboard: ${error.message}`);
      //   } else {
      //     device.alert.okCancel(
      //       `Just copied "Hello" to your clipboard. Game is about to start`,
      //       (wasOk) => {
      //         if (wasOk) {
      //           updateState((state) => ({
      //             ...state,
      //             bulletSpeed: 10,
      //             stage: GameStage.Play,
      //           }));
      //         }
      //       }
      //     );
      //   }
      // });
    }, 1000);

    return { ...initState, highScore };
  },

  loop({ state, device }) {
    const { inputs } = device;
    const { stage } = state;

    // stage
    if (stage === GameStage.GameOver && inputs.pointer.justPressed) {
      return {
        ...initState,
        stage: GameStage.Play,
        bulletSpeed: state.bulletSpeed,
        highScore: state.highScore,
        text: state.text,
      };
    }

    return {
      ...state,
      stage,
      bulletSpeed: state.bulletSpeed,
      gameOverText: `Game Over - click / tap to continue. Date ${device
        .now()
        .toLocaleDateString()}`,
    };
  },

  render({ state, updateState, device }) {
    const input = TextInput({
      id: "TestInput",
      fontName: "Calibri",
      fontSize: 20,
      text: state.text,
      onChangeText: (text) => {
        if (state.stage === GameStage.Play) {
          updateState((s) => ({ ...s, text }));
        }
      },
      width: 100,
      x: -device.size.width / 2 + 100,
      y: device.size.height / 2 - 20,
      numberOfLines: 3,
      align: "left",
      color: "red",
    });
    switch (state.stage) {
      case GameStage.Query:
        return [
          t.text({
            color: "red",
            text: "Loading",
          }),
        ];
      case GameStage.GameOver:
        return [
          t.text({
            color: "red",
            text: state.gameOverText,
            scaleX: 0.8,
          }),
          input,
        ];
      case GameStage.Play:
        return [
          PlayStage({
            id: "play-stage",
            bulletSpeed: state.bulletSpeed,
            gameOver: (score) => {
              if (score > state.highScore) {
                device.storage.setStore({ highScore: String(score) });
              }

              updateState((currState) => ({
                ...currState,
                stage: GameStage.GameOver,
                highScore: Math.max(score, state.highScore),
              }));
            },
            highScore: state.highScore,
          }),
          input,
        ];
    }
  },
});
