import { GameProps, t, makeSprite } from "../../packages/replay-core/src";
import { WebInputs, RenderCanvasOptions } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";
import { TextInput, TextInputWeb } from "../../packages/replay-text-input/src";
import { MutPlayStage } from "./MutPlayStage";

interface State {
  stage: GameStage;
  bulletSpeed: number;
  gameOverText: string;
  highScore: number;
  text: string;
}

enum GameStage {
  Loading,
  Play,
  GameOver,
}

const initState: Omit<State, "highScore"> = {
  stage: GameStage.Loading,
  bulletSpeed: 0, // updated in query
  gameOverText: "",
  text: "Hello",
};

export const options: RenderCanvasOptions = {
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
      maxHeightMargin: 500,
    },
  },
  defaultFont: {
    family: "Courier",
    size: 10,
  },
};

export const Game = makeSprite<GameProps, State, WebInputs | iOSInputs>({
  init({ device, updateState }) {
    device.storage.getItem("highScore").then((storedHighScore) => {
      const highScore = storedHighScore ? parseInt(storedHighScore, 10) : 0;

      device.timer.start(() => {
        updateState((state) => ({
          ...state,
          highScore,
          bulletSpeed: 10,
          stage: GameStage.Play,
        }));
      }, 1000);
    });

    return { ...initState, highScore: 0 };
  },

  loop({ state, device, getInputs }) {
    const inputs = getInputs();
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
    switch (state.stage) {
      case GameStage.Loading:
        return [
          t.text({
            color: "red",
            text: "Loading game",
          }),
        ];
      case GameStage.GameOver: {
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
          y: -device.size.height / 2 + 20,
          numberOfLines: 3,
          align: "left",
          color: "red",
        });
        return [
          t.text({
            color: "red",
            text: state.gameOverText,
            scaleX: 0.8,
          }),
          input,
        ];
      }
      case GameStage.Play:
        return [
          MutPlayStage.Single(
            {
              id: "play-stage",
              bulletSpeed: state.bulletSpeed,
              gameOver: function gameOver(score) {
                if (score > state.highScore) {
                  device.storage.setItem("highScore", String(score));
                }
                updateState((currState) => ({
                  ...currState,
                  stage: GameStage.GameOver,
                  highScore: Math.max(score, state.highScore),
                }));
              },
              highScore: state.highScore,
            },
            (thisProps) => {
              thisProps.bulletSpeed = state.bulletSpeed;
            }
          ),
        ];
    }
  },
});
