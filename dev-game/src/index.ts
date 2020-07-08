import { GameProps, t, makeSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift";
import { PlayStage } from "./PlayStage";
import { TextInput } from "../../packages/replay-text-input/src";

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
    device.timeout(() => {
      updateState((state) => ({
        ...state,
        bulletSpeed: 10,
        stage: GameStage.Play,
      }));
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
