import { makeSprite, t } from "@replay/core";
import { Level } from "./level";
import { Menu } from "./menu";

export const Game = makeSprite({
  init({ device, preloadFiles, updateState }) {
    preloadFiles({
      imageFileNames: ["/img/bird.png"],
    }).then(() => {
      updateState((state) => {
        return { ...state, view: "menu" };
      });
    });

    const store = device.storage.getStore();
    return {
      view: "loading",
      attempt: 0,
      highScore: Number(store.highScore || "0"),
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
              device.storage.setStore({ highScore: String(highScore) });
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

export const gameProps = {
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
