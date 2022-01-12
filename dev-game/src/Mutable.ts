import { t } from "../../packages/replay-core/src/t2";
import { makeMutableSprite, r } from "../../packages/replay-core/src/sprite";

type Props = {
  highScore: number;
};
type State = {
  score: number;
  enemies: { x: number; y: number; id: string }[];
};

export const MyMutSprite = makeMutableSprite<Props, State>({
  init() {
    return {
      score: 0,
      enemies: [
        { x: 10, y: 0, id: "1" },
        { x: 40, y: 20, id: "2" },
      ],
    };
  },

  loop({ state }) {
    if (state.score < 100) {
      state.score++;
    }

    if (state.score === 50) {
      state.enemies.push({ x: -50, y: 0, id: "3" });
    }

    state.enemies.forEach((enemy) => {
      enemy.x++;
    });
  },

  render({ state }) {
    return [
      t.text({ color: "black", y: 25 }, (arg) => {
        arg.text = `Score: ${state.score}`;
      }),

      // r.if(() => state.score > props.highScore, [
      //   t.text({ text: "High score!", color: "black" }),
      // ]),

      r.array({
        item: t.circle({ radius: 3, color: "red" }, (arg, index) => {
          arg.x = state.enemies[index].x;
          arg.y = state.enemies[index].y;
        }),
        // id: (index) => state.enemies[index].id,
        length: () => state.enemies.length,
      }),

      MyMutNestedSprite({ index: -1 }),

      MyMutNestedSprite({ index: 20, y: -20 }, (arg) => {
        if (arg.index > -100) {
          arg.index--;
        }
      }),

      r.array({
        item: MyMutNestedSprite({ index: -1 }, (arg, index) => {
          arg.index = index;
          arg.y = index * 30 + 50;
        }),
        length: () => 5,
      }),
    ];
  },
});

type NestedProps = {
  index: number;
};
const MyMutNestedSprite = makeMutableSprite<NestedProps>({
  render({ props }) {
    return [
      t.text({ color: "black" }, (arg) => {
        arg.text = `Nested index: ${props.index}`;
      }),
    ];
  },
});
