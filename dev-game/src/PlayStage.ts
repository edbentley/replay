import { t, makeSprite, mask } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";
import { bulletX, bulletY } from "./utils";
import { Score } from "./Score";
import { WalkingGreenCapChar } from "./SpriteSheet";
import { PosLogger } from "./PosLogger";
import { Clickable } from "./Clickable";

interface State {
  loading: boolean;
  playerRotation: number;
  bullets: Bullet[];
  enemies: Enemy[];
  pointer: {
    x: number;
    y: number;
  };
  score: number;
  spawnEnemyTimerId: string;
  paused: boolean;
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

interface Props {
  bulletSpeed: number;
  highScore: number;
  gameOver: (score: number) => void;
}

export const PlayStage = makeSprite<Props, State, WebInputs | iOSInputs>({
  init({ device, updateState, preloadFiles }) {
    preloadFiles({
      imageFileNames: ["enemy.png"],
      audioFileNames: ["shoot.wav"],
    }).then(() => {
      function spawnEnemy() {
        device.log("Spawn");
        const timerId = device.timer.start(() => {
          const newId = spawnEnemy();
          updateState((state) => ({
            ...state,
            enemies: state.enemies.concat({
              x: device.random() * device.size.width - device.size.width / 2,
              y: device.size.height / 2 + device.size.heightMargin + 10,
              speed: 2,
            }),
            spawnEnemyTimerId: newId,
          }));
        }, device.random() * 2000 + 1000);
        return timerId;
      }
      const timerId = spawnEnemy();
      updateState((s) => ({
        ...s,
        spawnEnemyTimerId: timerId,
        loading: false,
      }));
    });

    return {
      loading: true,
      playerRotation: 90,
      bullets: [],
      enemies: [],
      pointer: { x: 0, y: 0 },
      score: 0,
      spawnEnemyTimerId: "",
      paused: false,
    };
  },

  loop({ state, device, getInputs, props: { bulletSpeed, gameOver } }) {
    if (state.paused || state.loading) return state;

    const inputs = getInputs();

    const {
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
      .map(function mapBullet(b) {
        return { ...b, distance: b.distance + bulletSpeed };
      })
      .filter(function filterBullet(b) {
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
      .map(function mapEnemy(e) {
        return { ...e, y: e.y - e.speed };
      })
      .filter(function filterEnemy(e) {
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
    enemies.forEach(function forEachEnemy(e) {
      if (e.y < -fullHeight / 2) {
        device.timer.cancel(state.spawnEnemyTimerId);
        gameOver(score);
      }
    });

    return {
      ...state,
      playerRotation,
      bullets,
      enemies,
      pointer: {
        x: inputs.pointer.x,
        y: inputs.pointer.y,
      },
      score,
      spawnEnemyTimerId: state.spawnEnemyTimerId,
      paused: false,
    };
  },

  render({
    state,
    props: { bulletSpeed, highScore },
    device: {
      timer,
      size: { height, heightMargin, width, widthMargin },
    },
    extrapolateFactor,
    updateState,
  }) {
    if (state.loading) {
      return [t.text({ text: "Loading level", color: "black" })];
    }
    const fullHeight = height + heightMargin * 2;
    const fullWidth = width + widthMargin * 2;
    const bullets = state.bullets.map(function bulletsMapTexture(b, i) {
      return t.circle({
        x: bulletX(b, extrapolateFactor * bulletSpeed),
        y: bulletY(b, fullHeight / 2, extrapolateFactor * bulletSpeed),
        testId: `bullet${i + 1}`,
        radius: 2,
        color: "#0095DD",
        opacity: 0.9,
      });
    });
    const enemies = t.imageArray({
      fileName: "enemy.png",
      props: state.enemies.map(function enemiesMapTexture(e, i) {
        return {
          x: e.x,
          y: e.y,
          testId: `enemy${i + 1}`,
          fileName: "enemy.png",
          width: 20,
          height: 20,
        };
      }),
    });
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
        mask: mask.circle({
          radius: 20,
          x: -24,
        }),
      }),
      t.line({
        path: [
          [-30, -30],
          [0, -60],
          [30, -30],
        ],
        thickness: 3,
        fillColor: "#000000",
        color: "#FF0000",
      }),
      t.text({
        text: "test",
        color: "",
        gradient: {
          type: "linearVert",
          colors: ["#FF0000", "#0000FF"],
          opacities: [0, 1],
          height: 5,
        },
      }),
      t.text({
        text: "test-left",
        color: "#FF0000",
        y: 20,
        font: { align: "left" },
      }),
      t.text({
        text: "test-right",
        color: "#FF0000",
        y: 40,
        font: { align: "right" },
      }),
      t.rectangle({
        x: 50,
        color: "#FF0000",
        gradient: {
          type: "linearVert",
          colors: ["#FF0000", "#0000FF"],
          opacities: [0.5, 1],
          height: 100,
        },
        width: 30,
        height: 100,
      }),
      t.rectangle({
        x: 100,
        color: "#0000FF",
        width: 50,
        height: 100,
      }),
      t.rectangle({
        x: 100,
        color: "#FF0000",
        width: 30,
        height: 100,
        opacity: 0,
      }),
      t.line({
        x: -150,
        y: 0,
        opacity: 0.5,
        fillGradient: {
          type: "linearVert",
          colors: ["#FF0000", "#0000FF"],
          opacities: [0, 1],
          height: 100,
        },
        path: [
          [-30, -50],
          [50, -50],
          [50, 50],
          [-50, 50],
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
      enemies,
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
      state.paused
        ? t.text({
            text: "Paused",
            color: "red",
          })
        : null,
      Clickable({
        id: "PauseButton",
        sprites: function clickableSprites() {
          return [
            t.rectangle({
              width: 100,
              height: 20,
              color: "black",
              opacity: 0.2,
            }),
            t.text({
              text: state.paused ? "Resume" : "Pause",
              color: "purple",
            }),
          ];
        },
        onPress: function clickableOnPress() {
          updateState((s) => {
            if (s.paused) {
              timer.resume(s.spawnEnemyTimerId);
            } else {
              timer.pause(s.spawnEnemyTimerId);
            }
            return { ...s, paused: !s.paused };
          });
        },
        width: 100,
        height: 20,
        y: fullHeight / 2 - 15,
        x: fullWidth / 2 - 55,
      }),
    ];
  },
});
