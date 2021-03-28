import { GameProps } from "../core";
import { makePureSprite, makeSprite, Sprite } from "../sprite";
import { t } from "../t";
import { Inputs, runGame, SuiteArg } from "./utils";

export function runSimple(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return [
        t.circle({
          radius: 4,
          color: "red",
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function runNested(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return [Sprite({ id: "Sprite" })];
    },
  });

  const Sprite = makeSprite({
    render() {
      return [
        t.circle({
          radius: 4,
          color: "red",
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function runPure(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return [Sprite({ id: "Sprite", move: false })];
    },
  });

  const Sprite = makePureSprite<{ move: boolean }>({
    shouldRerender(prevProps, props) {
      return prevProps.move !== props.move;
    },

    render() {
      return [
        t.circle({
          radius: 4,
          color: "red",
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function runMovingSprite(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return [Sprite({ id: "Sprite" })];
    },
  });

  const Sprite = makeSprite<{}, { x: number }>({
    init() {
      return { x: -500 };
    },
    loop({ state }) {
      return { ...state, x: state.x + 1 };
    },
    render({ state }) {
      return [
        t.circle({
          radius: 4,
          color: "red",
          x: state.x,
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function runInputSprite(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return [Sprite({ id: "Sprite" })];
    },
  });

  const Sprite = makeSprite<{}, { x: number }, Inputs>({
    init() {
      return { x: 0 };
    },
    loop({ state, getInputs }) {
      if (getInputs().clicked) {
        return { ...state, x: state.x + 1 };
      }
      return state;
    },
    render({ state }) {
      return [
        t.circle({
          radius: 4,
          color: "red",
          x: state.x,
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function runRemovedSprites(arg: SuiteArg) {
  const Game = makeSprite<
    GameProps,
    { sprites: { id: string }[]; frame: number },
    Inputs
  >({
    init() {
      return { sprites: [], frame: 0 };
    },

    loop({ state }) {
      if (state.sprites.length > 10) {
        return {
          ...state,
          sprites: state.sprites.slice(1),
          frame: state.frame + 1,
        };
      }
      if (state.frame % 100 === 0) {
        return {
          ...state,
          sprites: [...state.sprites, { id: `Sprite-${state.frame}` }],
          frame: state.frame + 1,
        };
      }
      return { ...state, frame: state.frame + 1 };
    },

    render({ state }) {
      return [...state.sprites.map((s) => Sprite({ id: s.id }))];
    },
  });

  const Sprite = makeSprite<{}, { x: number }, Inputs>({
    init() {
      return { x: 0 };
    },

    loop({ state, getInputs }) {
      if (getInputs().clicked) {
        return state;
      }
      return { ...state, x: state.x + 1 };
    },

    render({ state }) {
      return [
        t.circle({
          radius: 4,
          color: "red",
          x: state.x,
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function run1000Textures(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return Array.from({ length: 1000 }).map(() =>
        t.circle({
          radius: 4,
          color: "red",
        })
      );
    },
  });

  runGame(Game, arg);
}

export function run1000Sprites(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return Array.from({ length: 1000 }).map((_, index) =>
        Sprite({ id: `Sprite-${index}` })
      );
    },
  });

  const Sprite = makeSprite({
    render() {
      return [
        t.circle({
          radius: 4,
          color: "red",
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function run1000Pure(arg: SuiteArg) {
  const Game = makeSprite<GameProps, undefined, Inputs>({
    render() {
      return Array.from({ length: 1000 }).map((_, index) =>
        Sprite({ id: `Sprite-${index}`, move: false })
      );
    },
  });

  const Sprite = makePureSprite<{ move: boolean }>({
    shouldRerender(prevProps, props) {
      return prevProps.move !== props.move;
    },

    render() {
      return [
        t.circle({
          radius: 4,
          color: "red",
        }),
      ];
    },
  });

  runGame(Game, arg);
}

export function run200Nested(arg: SuiteArg) {
  const Game = makeSprite<GameProps>({
    render() {
      return Array.from({ length: 200 }).reduce<Sprite[]>(
        (sprites) => [Sprite({ id: "Sprite", sprites })],
        [t.circle({ radius: 4, color: "red" })]
      );
    },
  });

  const Sprite = makeSprite<{ sprites: Sprite[] }>({
    render({ props }) {
      return props.sprites;
    },
  });

  runGame(Game, arg);
}
