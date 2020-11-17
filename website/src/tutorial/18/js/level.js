import { makeSprite, t } from "@replay/core";
import { Bird, birdWidth, birdHeight } from "./bird";
import { Pipe, pipeWidth, pipeGap, getPipeYPositions } from "./pipe";

const speedX = 2;
const birdX = 0;

export const Level = makeSprite({
  init({ device, props }) {
    return {
      birdY: 10,
      birdGravity: -12,
      pipes: props.paused ? [] : [newPipe(device)],
      score: 0,
    };
  },

  loop({ props, state, device }) {
    if (props.paused) {
      return state;
    }

    const { inputs } = device;

    let { birdGravity, birdY, pipes, score } = state;

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

    if (didHitPipe(birdY, device.size, pipes)) {
      props.gameOver(state.score);
    }

    // Move pipes to the left
    pipes = pipes.map((pipe) => {
      let passed = pipe.passed;
      if (!passed && pipe.x < birdX - birdWidth / 2 - pipeWidth / 2) {
        // Mark pipe as having passed bird's x position
        passed = true;
        score++;
      }
      return { ...pipe, passed, x: pipe.x - speedX };
    });

    return {
      birdGravity,
      birdY,
      pipes,
      score,
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
      t.text({
        text: `Score: ${state.score}`,
        color: "white",
        x: -device.size.width / 2 + 10,
        y: device.size.height / 2 + device.size.heightMargin - 80,
        align: "left",
      }),
    ];
  },
});

function newPipe(device) {
  const height = device.size.height + device.size.heightMargin * 2;
  const randomY = (height - pipeGap * 2) * (device.random() - 0.5);

  return {
    x: device.size.width + device.size.widthMargin + 50,
    gapY: randomY,
    passed: false,
  };
}

function didHitPipe(birdY, size, pipes) {
  if (
    birdY - birdHeight / 2 < -(size.height / 2 + size.heightMargin) ||
    birdY + birdHeight / 2 > size.height / 2 + size.heightMargin
  ) {
    // hit bottom or top
    return true;
  }
  for (const pipe of pipes) {
    if (
      pipe.x > birdX + birdWidth / 2 + pipeWidth / 2 ||
      pipe.x < birdX - birdWidth / 2 - pipeWidth / 2
    ) {
      // bird isn't at pipe
      continue;
    }
    const {
      yUpperTop,
      yUpperBottom,
      yLowerTop,
      yLowerBottom,
    } = getPipeYPositions(size, pipe.gapY);
    const topPipeRect = {
      x: pipe.x,
      y: (yUpperTop + yUpperBottom) / 2,
      width: pipeWidth,
      height: yUpperTop - yUpperBottom,
    };
    const bottomPipeRect = {
      x: pipe.x,
      y: (yLowerTop + yLowerBottom) / 2,
      width: pipeWidth,
      height: yLowerTop - yLowerBottom,
    };
    // Check a few points at edges of bird
    const birdPoints = [
      { x: birdX + birdWidth / 2, y: birdY + birdHeight / 2 },
      { x: birdX + birdWidth / 2, y: birdY - birdHeight / 2 },
      { x: birdX, y: birdY + birdHeight / 2 },
      { x: birdX, y: birdY - birdHeight / 2 },
      { x: birdX - birdWidth / 2, y: birdY + birdHeight / 2 },
      { x: birdX - birdWidth / 2, y: birdY - birdHeight / 2 },
    ];
    if (
      birdPoints.some(
        (point) =>
          pointInRect(point, topPipeRect) || pointInRect(point, bottomPipeRect)
      )
    ) {
      // Bird hit a pipe!
      return true;
    }
  }
  return false;
}

function pointInRect(point, rect) {
  return (
    point.x > rect.x - rect.width / 2 &&
    point.x < rect.x + rect.width / 2 &&
    point.y > rect.y - rect.height / 2 &&
    point.y < rect.y + rect.height / 2
  );
}
