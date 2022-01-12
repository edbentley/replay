import { t } from "../../packages/replay-core/src/t2";
import { makeMutableSprite, r } from "../../packages/replay-core/src/sprite";

type Props = {
  highScore: number;
};
type State = {
  score: number;
  enemies: { x: number; y: number }[];
};

export const MyMutSprite = makeMutableSprite<Props, State>({
  init() {
    return {
      score: 0,
      enemies: [
        { x: 10, y: 0 },
        { x: 40, y: 20 },
      ],
    };
  },

  loop({ state }) {
    if (state.score < 10) {
      state.score++;
    }

    state.enemies.forEach((enemy) => {
      enemy.x++;
    });
  },

  render({ state, props }) {
    return [
      t.text({ text: "Score: 0", color: "black", y: 50 }, (arg) => {
        arg.text = `Score: ${state.score}`;
      }),

      // r.if(() => state.score > props.highScore, [
      //   t.text({ text: "High score!", color: "black" }),
      // ]),

      // r.array({
      //   item: t.circle({ radius: 3, color: "red" }, (arg, index) => {
      //     arg.x = state.enemies[index].x;
      //     arg.y = state.enemies[index].y;
      //   }),
      //   length: () => state.enemies.length,
      // }),

      MyMutNestedSprite({ index: -1 }),

      MyMutNestedSprite({ index: 20, y: -20 }, (arg) => {
        if (arg.index > -100) {
          arg.index--;
        }
      }),

      // r.array({
      //   item: MyMutNestedSprite({ index: -1 }, (arg, index) => {
      //     arg.index = index;
      //   }),
      //   length: () => 5,
      // }),
    ];
  },
});

type NestedProps = {
  index: number;
};
const MyMutNestedSprite = makeMutableSprite<NestedProps>({
  render({ props }) {
    return [
      t.text({ text: "", color: "black" }, (arg) => {
        arg.text = `Nested index: ${props.index}`;
      }),
    ];
  },
});
