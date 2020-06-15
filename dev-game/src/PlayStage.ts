import { t, makeSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift";
import { bulletX, bulletY } from "./utils";
import { Score } from "./Score";
import { WalkingGreenCapChar } from "./SpriteSheet";
import { PosLogger } from "./PosLogger";

interface State {
  playerRotation: number;
  bullets: Bullet[];
  enemies: Enemy[];
  pointer: {
    x: number;
    y: number;
  };
  score: number;
}

export interface Bullet {
  distance: number;
  rotation: number;
}

interface Enemy {
  x: number;
  y: number;
  speed: number;
}
const initState: State = {
  playerRotation: 90,
  bullets: [],
  enemies: [],
  pointer: { x: 0, y: 0 },
  score: 0,
};

interface Props {
  bulletSpeed: number;
  highScore: number;
  gameOver: (score: number) => void;
}

export const PlayStage = makeSprite<Props, State, WebInputs | iOSInputs>({
  init({ device, updateState }) {
    const spawnEnemy = () => {
      device.timeout(() => {
        updateState((state) => ({
          ...state,
          enemies: state.enemies.concat({
            x: device.random() * device.size.width - device.size.width / 2,
            y: device.size.height / 2 + device.size.heightMargin + 10,
            speed: 2,
          }),
        }));
        spawnEnemy();
      }, device.random() * 2000 + 1000);
    };
    spawnEnemy();

    return initState;
  },

  loop({ state, device, props: { bulletSpeed, gameOver } }) {
    const {
      inputs,
      size: { width, height, heightMargin, widthMargin },
    } = device;
    const fullWidth = width + widthMargin * 2;
    const fullHeight = height + heightMargin * 2;
    let { playerRotation, bullets, enemies, score } = state;

    // player
    playerRotation =
      Math.atan(inputs.pointer.x / (fullHeight / 2 + inputs.pointer.y)) *
        (180 / Math.PI) +
      90;

    // bullets
    bullets = bullets
      .map((b) => ({ ...b, distance: b.distance + bulletSpeed }))
      .filter((b) => {
        const x = bulletX(b);
        const y = bulletY(b, fullHeight / 2);
        return (
          x > -fullWidth / 2 &&
          x < fullWidth / 2 &&
          y > -fullHeight / 2 &&
          y < fullHeight / 2
        );
      });
    if (inputs.pointer.justPressed) {
      bullets.push({
        distance: 0,
        rotation: playerRotation,
      });
      device.audio("shoot.wav").play();
    }

    // enemies
    enemies = enemies
      .map((e) => ({ ...e, y: e.y - e.speed }))
      .filter((e) => {
        let isNotHit = true;
        bullets.forEach((b) => {
          const x = bulletX(b);
          const y = bulletY(b, fullHeight / 2);
          if (x > e.x - 10 && x < e.x + 10 && y > e.y - 10 && y < e.y + 10) {
            score += 1;
            isNotHit = false;
          }
        });
        return isNotHit;
      });
    enemies.forEach((e) => {
      if (e.y < -fullHeight / 2) {
        gameOver(score);
      }
    });

    return {
      playerRotation,
      bullets,
      enemies,
      pointer: {
        x: device.inputs.pointer.x,
        y: device.inputs.pointer.y,
      },
      score,
    };
  },

  render({
    state,
    props: { bulletSpeed, highScore },
    device: {
      size: { height, heightMargin },
    },
    extrapolateFactor,
  }) {
    const fullHeight = height + heightMargin * 2;
    const bullets = state.bullets.map((b, i) =>
      t.circle({
        x: bulletX(b, extrapolateFactor * bulletSpeed),
        y: bulletY(b, fullHeight / 2, extrapolateFactor * bulletSpeed),
        testId: `bullet${i + 1}`,
        radius: 2,
        color: "#0095DD",
        opacity: 0.9,
      })
    );
    const enemies = state.enemies.map((e, i) =>
      t.image({
        x: e.x,
        y: e.y,
        testId: `enemy${i + 1}`,
        fileName: "enemy.png",
        width: 20,
        height: 20,
      })
    );
    return [
      // t.rectangle({
      //   testId: "background",
      //   position: {
      //     x: 0,
      //     y: 0
      //   },
      //   width: fullWidth,
      //   height: fullHeight,
      //   color: "#C8C8C8"
      // }),
      // t.rectangle({
      //   testId: "stage",
      //   position: {
      //     x: 0,
      //     y: 0
      //   },
      //   width,
      //   height,
      //   color: "#D8D8D8"
      // }),
      WalkingGreenCapChar({
        id: "spritesheet",
        x: -100,
        y: 0,
      }),
      t.line({
        x: -100,
        y: 0,
        color: "red",
        opacity: 0.5,
        thickness: 2,
        path: [
          [0, 10],
          [0, -10],
          [-5, -10],
        ],
        scaleX: -1,
      }),
      t.rectangle({
        testId: "player",
        x: 0,
        y: -fullHeight / 2,
        rotation: state.playerRotation,
        width: 50,
        height: 20,
        color: "#0095DD",
        scaleY: 0.5,
      }),
      ...bullets,
      ...enemies,
      t.circle({
        radius: 4,
        color: "green",
        x: state.pointer.x,
        y: state.pointer.y,
      }),
      Score({ score: state.score, id: "score" }),
      Score({
        preText: "High ",
        score: highScore,
        id: "highScore",
        x: 100,
        y: 0,
      }),
      PosLogger({ id: "posLogger", x: 100, y: 200 }),
    ];
  },
});
