import { t, makeSprite, GameProps } from "@replay/core";
import { WebInputs as Inputs } from "..";

export const testGameProps: GameProps = {
  id: "Game",
  size: {
    width: 200,
    height: 200,
  },
};

interface Data {
  name: string;
}

/**
 * A simple 'game' which moves an enemy across the screen
 */
export const TestGame = makeSprite<GameProps, TestGameState, Inputs>({
  init() {
    return { position: 0 };
  },

  loop({ state, device }) {
    const posInc = device.inputs.keysDown.ArrowRight ? 10 : 0;

    const { pointer } = device.inputs;
    if (pointer.justPressed) {
      if (pointer.x === 0) {
        device.timeout(() => {
          device.log("Timeout");
        }, 30);
      } else if (pointer.x === 1) {
        device.log(device.now().toUTCString());
      } else if (pointer.x === 2) {
        device.log(device.random());
      } else if (pointer.x === 3) {
        device.network.get("/get", (data) => {
          const dataCast = data as Data;
          device.log(`GET ${dataCast.name}`);
        });
        device.network.post("/post", { payload: "post" }, (data) => {
          const dataCast = data as Data;
          device.log(`POST ${dataCast.name}`);
        });
        device.network.put("/put", { payload: "put" }, (data) => {
          const dataCast = data as Data;
          device.log(`PUT ${dataCast.name}`);
        });
        device.network.delete("/delete", (data) => {
          const dataCast = data as Data;
          device.log(`DELETE ${dataCast.name}`);
        });
      }
    }

    return { position: state.position + posInc };
  },

  render({ state }) {
    return [
      t.circle({
        position: {
          x: state.position,
          y: 100,
          rotation: 0,
        },
        radius: 50,
        color: "red",
      }),
    ];
  },
});

export const TestGameWithSprites = makeSprite<GameProps, undefined, Inputs>({
  render() {
    return [
      TestSprite({
        id: "player",
        position: {
          x: 0,
          y: 10,
          rotation: 45,
        },
        color: "red",
      }),
    ];
  },
});

const TestSprite = makeSprite<TestGameProps, TestGameState, Inputs>({
  init() {
    return { position: 0 };
  },

  loop({ state, device }) {
    const posInc = device.inputs.keysDown.ArrowRight ? 10 : 0;
    return { position: state.position + posInc };
  },

  render({ state, props }) {
    return [
      t.circle({
        position: {
          x: state.position,
          y: 0,
          rotation: 0,
        },
        radius: 10,
        color: props.color,
      }),
    ];
  },
});

interface TestGameState {
  position: number;
}

interface TestGameProps {
  color: string;
}

/**
 * Simple 'game' which loads image and audio assets
 */
export const TestGameWithAssets = makeSprite<
  GameProps,
  TestGameState & { rotation: number },
  Inputs
>({
  init() {
    return { position: 0, rotation: 0 };
  },

  loop({ state, device }) {
    const posInc = device.inputs.keysDown.ArrowRight ? 10 : 0;
    const rotInc = device.inputs.keysDown.ArrowRight ? 45 : 0;

    const { pointer } = device.inputs;
    if (pointer.justPressed) {
      if (pointer.x === 1) {
        device.audio("shoot.wav").play();
      } else if (pointer.x === 2) {
        device.audio("shoot.wav").pause();
      } else if (pointer.x === 3) {
        device.log(`Current time: ${device.audio("shoot.wav").getPosition()}`);
      }
    }

    return {
      position: state.position + posInc,
      rotation: state.rotation + rotInc,
    };
  },

  render({ state }) {
    return [
      t.image({
        position: {
          x: state.position,
          y: 0,
          rotation: state.rotation,
        },
        fileName: "enemy.png",
        width: 50,
        height: 50,
      }),
    ];
  },
});

export const TestGameThrowImageError = makeSprite<GameProps>({
  render() {
    return [
      t.image({
        fileName: "unknown.png",
        width: 50,
        height: 50,
      }),
    ];
  },
});

/**
 * Assets used for test game
 */
export function getTestAssets() {
  return {
    imageFileNames: ["enemy.png"],
    audioFileNames: ["shoot.wav"],
  };
}

export function pressKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

export function releaseKey(key: string) {
  document.dispatchEvent(new KeyboardEvent("keyup", { key }));
}

export function clickPointer(clientX: number, clientY: number) {
  document.dispatchEvent(
    new MouseEvent("pointerdown", {
      clientX,
      clientY,
    })
  );
}

export function movePointer(clientX: number, clientY: number) {
  document.dispatchEvent(
    new MouseEvent("pointermove", {
      clientX,
      clientY,
    })
  );
}

export function releasePointer(x: number, y: number) {
  document.dispatchEvent(
    new MouseEvent("pointerup", { clientX: x, clientY: y })
  );
}

export function resizeWindow(width: number, height: number) {
  (window as any).innerWidth = width;
  (window as any).innerHeight = height;
  window.dispatchEvent(new Event("resize"));
}

export function canvasToImage(canvas: HTMLCanvasElement) {
  return Buffer.from(canvas.toDataURL("image/png").split(",")[1], "base64");
}

export type MockTime = { nextFrame: () => void };
/**
 * Wait one frame
 */
export function updateMockTime(mockTime: MockTime) {
  let frame = 0;

  window.requestAnimationFrame = (callback: (time: number) => void) => {
    mockTime.nextFrame = () => {
      frame += 1;
      callback(frame * (1000 / 60));
    };
    return 0;
  };
}

/**
 * Audio does not load in jsdom so need to manually mock load
 */
export function loadAudio(elements: HTMLAudioElement[]) {
  elements.forEach((el) => {
    el.dispatchEvent(new Event("canplaythrough"));
  });
}
