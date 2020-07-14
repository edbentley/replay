import { makeSprite, t, GameProps, makeNativeSprite } from "@replay/core";
import { iOSInputs } from "../../index";

interface State {
  playerX: number;
  enemiesX: number[];
}

interface Data {
  x: number;
}

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 500,
    height: 300,
    maxWidthMargin: 50,
    maxHeightMargin: 50,
  },
  defaultFont: { name: "Arial", size: 16 },
};

export const Game = makeSprite<GameProps, State, iOSInputs>({
  init() {
    return {
      playerX: 100,
      enemiesX: [],
    };
  },

  loop({ state, device, updateState }) {
    const { pointer } = device.inputs;

    const spawnEnemy = (x: number) => {
      updateState((prevState) => ({
        ...prevState,
        enemiesX: prevState.enemiesX.concat(x),
      }));
    };

    if (pointer.justPressed) {
      if (pointer.x === 100) {
        device.timeout(() => {
          spawnEnemy(100);
        }, 50);
      } else if (pointer.x === 101) {
        spawnEnemy(device.random() * 1000);
      } else if (pointer.x === 102) {
        device.network.get("/test", (res) => {
          spawnEnemy((res as Data).x);
        });
        device.network.post("/test", { x: 100 }, (res) => {
          spawnEnemy((res as Data).x);
        });
        device.network.put("/test", { x: 100 }, (res) => {
          spawnEnemy((res as Data).x);
        });
        device.network.delete("/test", (res) => {
          spawnEnemy((res as Data).x);
        });
      } else if (pointer.x === 103) {
        spawnEnemy(device.now().getSeconds());
      } else if (pointer.x === 104) {
        device.audio("sound.wav").play();
      } else if (pointer.x === 105) {
        device.audio("sound.wav").play(20);
      } else if (pointer.x === 106) {
        device.audio("sound.wav").play(0, true);
      } else if (pointer.x === 107) {
        device.audio("sound.wav").pause();
      } else if (pointer.x === 108) {
        spawnEnemy(device.audio("sound.wav").getPosition());
      } else if (pointer.x === 109) {
        device.log("Hello Replay!");
      } else if (pointer.x === 110) {
        device.log(device.storage.getStore().testKey);
      } else if (pointer.x === 111) {
        device.storage.setStore({ testKey: "testValue" });
      }
    }
    return {
      ...state,
      playerX: state.playerX + (device.inputs.pointer.pressed ? 1 : 0),
    };
  },

  render({ state, device }) {
    return [
      device.inputs.pointer.pressed ? null : NativeSprite({ id: "native" }),
      t.text({
        x: -100,
        font: { name: "serif", size: 22 },
        color: "red",
        text: "Test text",
      }),
      t.circle({
        x: state.playerX,
        radius: 10,
        color: "#0095DD",
      }),
      ...state.enemiesX.map((x) =>
        t.circle({
          x,
          radius: 10,
          color: "#0095DD",
        })
      ),
    ];
  },
});

const NativeSprite = makeNativeSprite("NativeSprite");
