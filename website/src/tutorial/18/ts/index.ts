import { makeSprite, GameProps, t } from "@replay/core";
import { Level } from "./level";
import { Menu } from "./menu";

type GameState = {
  view: "loading" | "menu" | "level";
  attempt: number;
  highScore: number;
};

export const Game = makeSprite<GameProps, GameState>({
  init({ device, preloadFiles, updateState }) {
    Promise.all([
      device.storage.getItem("highScore"),
      preloadFiles({
        imageFileNames: ["bird.png"],
      }),
    ]).then(([highScore]) => {
      updateState((state) => {
        return {
          ...state,
          view: "menu",
          highScore: Number(highScore || "0"),
        };
      });
    });

    return {
      view: "loading",
      attempt: 0,
      highScore: 0,
    };
  },

  render({ state, updateState, device }) {
    if (state.view === "loading") {
      return [
        t.text({
          color: "black",
          text: "Loading...",
        }),
      ];
    }

    const inMenuScreen = state.view === "menu";

    return [
      Level({
        id: `level-${state.attempt}`,
        paused: inMenuScreen,
        gameOver: (score) => {
          updateState((prevState) => {
            let { highScore } = prevState;
            if (score > highScore) {
              highScore = score;
              device.storage.setItem("highScore", String(highScore));
            }
            return {
              ...prevState,
              view: "menu",
              highScore,
            };
          });
        },
      }),
      inMenuScreen
        ? Menu({
            id: "menu",
            highScore: state.highScore,
            start: () => {
              updateState((prevState) => {
                return {
                  ...prevState,
                  view: "level",
                  attempt: prevState.attempt + 1,
                };
              });
            },
          })
        : null,
    ];
  },
});

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 400,
    height: 600,
    maxHeightMargin: 150,
  },
  defaultFont: {
    family: "Helvetica",
    size: 24,
  },
};
