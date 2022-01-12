import { t2, mask, r, makeMutableSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";
import { bulletX, bulletY } from "./utils";
import { MutScore } from "./MutScore";
import { MutWalkingGreenCapChar } from "./MutSpriteSheet";
import { MutPosLogger } from "./MutPosLogger";
// import { MutClickable } from "./MutClickable";

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

export const MutPlayStage = makeMutableSprite<
  Props,
  State,
  WebInputs | iOSInputs
>({
  init({ device, getState, preloadFiles }) {
    preloadFiles({
      imageFileNames: ["enemy.png"],
      audioFileNames: ["shoot.wav"],
    }).then(() => {
      const state = getState();
      function spawnEnemy() {
        device.log("Spawn");
        const timerId = device.timer.start(() => {
          const newId = spawnEnemy();
          state.enemies.push({
            x: device.random() * device.size.width - device.size.width / 2,
            y: device.size.height / 2 + device.size.heightMargin + 10,
            speed: 2,
          });
          state.spawnEnemyTimerId = newId;
        }, device.random() * 2000 + 1000);
        return timerId;
      }
      const timerId = spawnEnemy();
      state.spawnEnemyTimerId = timerId;
      state.loading = false;
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
    if (state.paused || state.loading) return;

    const inputs = getInputs();

    const {
      size: { width, height, heightMargin, widthMargin },
    } = device;
    const fullWidth = width + widthMargin * 2;
    const fullHeight = height + heightMargin * 2;

    // player
    state.playerRotation =
      Math.atan(inputs.pointer.x / (fullHeight / 2 + inputs.pointer.y)) *
        (180 / Math.PI) +
      90;

    // bullets
    state.bullets.forEach((bullet, index) => {
      bullet.distance += bulletSpeed;

      const x = bulletX(bullet);
      const y = bulletY(bullet, fullHeight / 2);
      const isInBounds =
        x > -fullWidth / 2 &&
        x < fullWidth / 2 &&
        y > -fullHeight / 2 &&
        y < fullHeight / 2;
      if (!isInBounds) {
        state.bullets.splice(index, 1);
      }
    });
    if (inputs.pointer.justPressed) {
      state.bullets.push({
        distance: 0,
        rotation: state.playerRotation,
      });
      device.audio("shoot.wav").play();
    }

    // enemies
    state.enemies.forEach((e, index) => {
      e.y -= e.speed;
      let isHit = false;
      state.bullets.forEach((b) => {
        const x = bulletX(b);
        const y = bulletY(b, fullHeight / 2);
        if (x > e.x - 10 && x < e.x + 10 && y > e.y - 10 && y < e.y + 10) {
          state.score += 1;
          isHit = true;
        }
      });
      if (isHit) {
        state.enemies.splice(index, 1);
      }
      if (e.y < -fullHeight / 2) {
        device.timer.cancel(state.spawnEnemyTimerId);
        gameOver(state.score);
      }
    });

    state.pointer.x = inputs.pointer.x;
    state.pointer.y = inputs.pointer.y;
  },

  render({
    state,
    props,
    device: {
      timer,
      size: { height, heightMargin, width, widthMargin },
    },
  }) {
    const extrapolateFactor = 1;
    const fullHeight = height + heightMargin * 2;
    const fullWidth = width + widthMargin * 2;

    return [
      // TODO: else loading
      r.if(() => state.loading, [
        t2.text({ text: "Loading level", color: "black" }),
      ]),
      r.if(() => !state.loading, [
        MutWalkingGreenCapChar.Single({
          x: -100,
          y: 0,
          // mask: mask.circle({
          //   radius: 20,
          //   x: -24,
          // }),
        }),
        // t.line({
        //   path: [
        //     [-30, -30],
        //     [0, -60],
        //     [30, -30],
        //   ],
        //   thickness: 3,
        //   fillColor: "#000000",
        //   color: "#FF0000",
        // }),
        t2.text({
          text: "test",
          color: "",
          gradient: {
            type: "linearVert",
            colors: ["#FF0000", "#0000FF"],
            opacities: [0, 1],
            height: 5,
          },
        }),

        t2.text({
          text: "test-left",
          color: "#FF0000",
          y: 20,
          font: { align: "left" },
        }),
        t2.text({
          text: "test-right",
          color: "#FF0000",
          y: 40,
          font: { align: "right" },
        }),
        t2.rectangle({
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
        t2.rectangle({
          x: 100,
          color: "#0000FF",
          width: 50,
          height: 100,
        }),
        t2.rectangle({
          x: 100,
          color: "#FF0000",
          width: 30,
          height: 100,
          opacity: 0,
        }),
        // t.line({
        //   x: -150,
        //   y: 0,
        //   opacity: 0.5,
        //   fillGradient: {
        //     type: "linearVert",
        //     colors: ["#FF0000", "#0000FF"],
        //     opacities: [0, 1],
        //     height: 100,
        //   },
        //   path: [
        //     [-30, -50],
        //     [50, -50],
        //     [50, 50],
        //     [-50, 50],
        //   ],
        //   scaleX: -1,
        // }),
        t2.rectangle(
          {
            testId: "player",
            x: 0,
            y: -fullHeight / 2,
            width: 50,
            height: 20,
            color: "#0095DD",
            scaleY: 0.5,
          },
          (thisProps) => {
            thisProps.rotation = state.playerRotation;
          }
        ),
        t2.rectangleArray({
          props: { width: 4, height: 4, color: "#0095DD", opacity: 0.9 },
          array: state.bullets,
          update: (thisProps, bullet) => {
            thisProps.x = bulletX(
              bullet,
              extrapolateFactor * props.bulletSpeed
            );
            thisProps.y = bulletY(
              bullet,
              fullHeight / 2,
              extrapolateFactor * props.bulletSpeed
            );
          },
        }),
        t2.rectangleArray({
          props: { width: 20, height: 20, color: "red" },
          array: state.enemies,
          update: (thisProps, enemy) => {
            thisProps.x = enemy.x;
            thisProps.y = enemy.y;
          },
        }),
        t2.circle(
          {
            radius: 4,
            color: "green",
          },
          (thisProps) => {
            thisProps.x = state.pointer.x;
            thisProps.y = state.pointer.y;
          }
        ),
        MutScore.Single({ score: state.score }, (thisProps) => {
          thisProps.score = state.score;
        }),
        MutScore.Single(
          {
            preText: "High ",
            score: props.highScore,
            x: 100,
            y: 0,
          },
          (thisProps) => {
            thisProps.score = props.highScore;
          }
        ),
        MutPosLogger.Single({ x: 100, y: 200 }),
        r.if(() => state.paused, [
          t2.text({
            text: "Paused",
            color: "red",
          }),
        ]),
        // TODO
        // MutClickable({
        //   id: "PauseButton",
        //   sprites: function clickableSprites() {
        //     return [
        //       t.rectangle({
        //         width: 100,
        //         height: 20,
        //         color: "black",
        //         opacity: 0.2,
        //       }),
        //       t.text({
        //         text: state.paused ? "Resume" : "Pause",
        //         color: "purple",
        //       }),
        //     ];
        //   },
        //   onPress: function clickableOnPress() {
        //     updateState((s) => {
        //       if (s.paused) {
        //         timer.resume(s.spawnEnemyTimerId);
        //       } else {
        //         timer.pause(s.spawnEnemyTimerId);
        //       }
        //       return { ...s, paused: !s.paused };
        //     });
        //   },
        //   width: 100,
        //   height: 20,
        //   y: fullHeight / 2 - 15,
        //   x: fullWidth / 2 - 55,
        // }),
      ]),
    ];
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
  },
});
