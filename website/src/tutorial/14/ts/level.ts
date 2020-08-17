import { makeSprite, t, Device } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Bird, birdWidth } from "./bird";
import { Pipe, PipeT, pipeWidth, pipeGap } from "./pipe";

const speedX = 2;
const birdX = 0;

type LevelProps = {
  paused: boolean;
};

type LevelState = {
  birdY: number;
  birdGravity: number;
  pipes: PipeT[];
};

export const Level = makeSprite<LevelProps, LevelState, WebInputs | iOSInputs>({
  init({ device }) {
    return {
      birdY: 10,
      birdGravity: -12,
      pipes: [newPipe(device)],
    };
  },

  loop({ props, state, device }) {
    if (props.paused) {
      return state;
    }

    const { inputs } = device;

    let { birdGravity, birdY, pipes } = state;

    birdGravity += 0.8;
    birdY -= birdGravity;

    if (inputs.pointer.justPressed || inputs.keysJustPressed[" "]) {
      birdGravity = -12;
    }

    const lastPipe = pipes[pipes.length - 1];
    if (lastPipe.x < 140) {
      pipes = [...pipes, newPipe(device)]
        // Remove the pipes off screen on left
        .filter(
          (pipe) =>
            pipe.x > -(device.size.width + device.size.widthMargin + pipeWidth)
        );
    }

    // Move pipes to the left
    pipes = pipes.map((pipe) => {
      let passed = pipe.passed;
      if (!passed && pipe.x < birdX - birdWidth / 2 - pipeWidth / 2) {
        // Mark pipe as having passed bird's x position
        passed = true;
      }
      return { ...pipe, passed, x: pipe.x - speedX };
    });

    return {
      birdGravity,
      birdY,
      pipes,
    };
  },

  render({ state, device }) {
    const { size } = device;
    return [
      t.rectangle({
        color: "#add8e6",
        width: size.width + size.widthMargin * 2,
        height: size.height + size.heightMargin * 2,
      }),
      Bird({
        id: "bird",
        x: birdX,
        y: state.birdY,
        rotation: Math.max(-30, state.birdGravity * 3 - 30),
      }),
      ...state.pipes.map((pipe, index) =>
        Pipe({
          id: `pipe-${index}`,
          pipe,
          x: pipe.x,
        })
      ),
    ];
  },
});

function newPipe(device: Device<{}>): PipeT {
  const height = device.size.height + device.size.heightMargin * 2;
  const randomY = (height - pipeGap * 2) * (device.random() - 0.5);

  return {
    x: device.size.width + device.size.widthMargin + 50,
    gapY: randomY,
    passed: false,
  };
}
