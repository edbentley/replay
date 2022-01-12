import { t } from "../../packages/replay-core/src/t2";
import { makeMutableSprite } from "../../packages/replay-core/src/sprite";

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
        { x: 40, y: 0, id: "1" },
        { x: 10, y: 20, id: "2" },
      ],
    };
  },

  loop({ state }) {
    if (state.score < 100) {
      state.score++;
    }

    if (state.score === 50) {
      state.enemies.unshift({ x: -50, y: 0, id: "3" });
    }

    let indexToRemove = -1;
    state.enemies.forEach((enemy, index) => {
      enemy.x++;
      if (enemy.x > 75) {
        indexToRemove = index;
      }
    });

    if (indexToRemove >= 0) {
      state.enemies.splice(indexToRemove, 1);
    }
  },

  render({ state }) {
    return [
      t.text({ color: "black", y: 25 }, (arg) => {
        arg.text = `Score: ${state.score}`;
      }),

      // r.if(() => state.score > props.highScore, [
      //   t.text({ text: "High score!", color: "black" }),
      // ]),

      t.circle({ radius: 3, color: "red" }, (arg) => {
        arg.x++;
      }),

      t.rectangle({ color: "red" }, (arg) => {
        arg.x--;
      }),

      // t.rectangleArray({
      //   props: { color: "red", height: 25 },
      //   update: (thisProps, itemState) => {
      //     thisProps.x = itemState.x;
      //     thisProps.y = itemState.y;
      //   },
      //   array: state.enemies,
      // }),

      Enemy.Array({
        props: {},
        update: (thisProps, itemState) => {
          thisProps.x = itemState.x;
          thisProps.y = itemState.y;
        },
        array: state.enemies,
        key: "id",
      }),

      MyMutNestedSprite.Single({ index: -1 }),

      MyMutNestedSprite.Single({ index: 20, y: -20 }, (thisProps) => {
        if (thisProps.index > -100) {
          thisProps.index--;
        }
      }),

      MyMutNestedSprite.Array({
        props: { index: -1 },
        update: (thisProps, itemState, index) => {
          thisProps.index = index;
          thisProps.y = index * 30 + 50;
        },
        array: Array.from({ length: 5 }).map((_, index) => ({
          index,
        })),
        key: "index",
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

type EnemyProps = {};
type EnemyState = {
  size: number;
};
const Enemy = makeMutableSprite<EnemyProps, EnemyState>({
  init() {
    return {
      size: 1,
    };
  },
  loop({ state }) {
    state.size++;
  },
  render({ state }) {
    return [
      t.rectangle({ color: "blue" }, (thisProps) => {
        thisProps.width = state.size;
        thisProps.height = state.size;
      }),
    ];
  },
});
