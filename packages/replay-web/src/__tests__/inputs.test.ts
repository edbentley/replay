import { Inputs } from "../input";
import {
  pressKey,
  releaseKey,
  clickPointer,
  movePointer,
  releasePointer,
  testGameProps,
  MockTime,
  updateMockTime,
  resizeWindow,
} from "./utils";
import { makeSprite, GameProps, t } from "@replay/core";
import { renderCanvas } from "../index";

const defaultProps = {
  color: "black",
  position: { x: 0, y: 0 },
};

const mockTime: MockTime = { nextFrame: () => undefined };

beforeEach(() => {
  updateMockTime(mockTime);
});

test("Key events press and release keys", async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  (canvas as any).getContext = () => ctx;
  const textSpy = jest.spyOn(ctx, "fillText");

  const { loadPromise } = renderCanvas(
    KeyboardGame(testGameProps),
    undefined,
    undefined,
    undefined,
    canvas
  );

  await loadPromise;
  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    "isUpKeyPressed: false, isUpKeyJustPressed: false",
    0,
    0
  );

  pressKey("ArrowUp");

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    "isUpKeyPressed: true, isUpKeyJustPressed: true",
    0,
    0
  );

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    "isUpKeyPressed: true, isUpKeyJustPressed: false",
    0,
    0
  );

  releaseKey("ArrowUp");

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    "isUpKeyPressed: false, isUpKeyJustPressed: false",
    0,
    0
  );
});

interface KeyboardState {
  isUpKeyPressed: boolean;
  isUpKeyJustPressed: boolean;
}
const KeyboardGame = makeSprite<GameProps, KeyboardState, Inputs>({
  init() {
    return {
      isUpKeyPressed: false,
      isUpKeyJustPressed: false,
    };
  },
  loop({ device: { inputs } }) {
    return {
      isUpKeyPressed: inputs.keysDown.ArrowUp || false,
      isUpKeyJustPressed: inputs.keysJustPressed.ArrowUp || false,
    };
  },
  render({ state }) {
    return [
      t.text({
        ...defaultProps,
        text: `isUpKeyPressed: ${state.isUpKeyPressed}, isUpKeyJustPressed: ${state.isUpKeyJustPressed}`,
      }),
    ];
  },
});

test("Pointer clicks and move", async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  (canvas as any).getContext = () => ctx;
  const textSpy = jest.spyOn(ctx, "fillText");

  const { loadPromise } = renderCanvas(
    PointerGame(testGameProps),
    undefined,
    undefined,
    undefined,
    canvas
  );

  await loadPromise;
  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: false",
      "pointerJustPressed: false",
      "pointerX: 0",
      "pointerY: 0",
    ].join(),
    0,
    0
  );

  // (200, 200) in browser translates to (100, -100) in game coordinates due to
  // inverted y axis and center (0,0) of game in middle
  clickPointer(200, 200);

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: true",
      "pointerJustPressed: true",
      "pointerX: 100",
      "pointerY: -100",
    ].join(),
    0,
    0
  );

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: true",
      "pointerJustPressed: false",
      "pointerX: 100",
      "pointerY: -100",
    ].join(),
    0,
    0
  );

  movePointer(150, 150);

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: true",
      "pointerJustPressed: false",
      "pointerX: 50",
      "pointerY: -50",
    ].join(),
    0,
    0
  );

  releasePointer(100, 100);

  mockTime.nextFrame();

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: false",
      "pointerJustPressed: false",
      "pointerX: 0",
      "pointerY: 0",
    ].join(),
    0,
    0
  );

  movePointer(500, 500);

  mockTime.nextFrame();

  // Moving outside of game size doesn't register
  expect(textSpy).not.lastCalledWith(
    [
      "pointerPressed: false",
      "pointerJustPressed: false",
      "pointerX: 400",
      "pointerY: -400",
    ].join(),
    0,
    0
  );
});

test("Pointer position within sprite", async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false })!;
  (canvas as any).getContext = () => ctx;
  const translateSpy = jest.spyOn(ctx, "translate");

  const { loadPromise } = renderCanvas(
    PointerGameWithSprite(testGameProps),
    undefined,
    undefined,
    undefined,
    canvas
  );

  await loadPromise;
  mockTime.nextFrame();

  // (100, -100) in game coordinates
  movePointer(200, 200);

  mockTime.nextFrame();

  const expectCircleInGameCoordinates = (x: number, y: number) => {
    // 2nd last call is (x, y) position
    expect(translateSpy).nthCalledWith(
      translateSpy.mock.calls.length - 1,
      x,
      -y
    );
  };

  // circle, which is following pointer within Sprite, stays in same absolute
  // coordinates, even though its position and rotation is changing
  for (let i = 0; i < 36; i++) {
    expectCircleInGameCoordinates(100, -100);
    mockTime.nextFrame();
  }
});

test("Pointer clicks in scaled canvas with margins and canvas offset", async () => {
  const canvas = document.createElement("canvas");
  (window as any).innerWidth = 600;
  (window as any).innerHeight = 400;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  (canvas as any).getContext = () => ctx;
  const textSpy = jest.spyOn(ctx, "fillText");

  // hack to set canvas offsetLeft properly (not needed in browser)
  Object.defineProperty(canvas, "offsetLeft", {
    value: 80,
    configurable: true,
  });

  const props: GameProps = {
    id: "Game",
    size: { width: 200, height: 200, maxWidthMargin: 10, maxHeightMargin: 20 },
  };

  const { loadPromise } = renderCanvas(
    PointerGame(props),
    undefined,
    undefined,
    "scale-up",
    canvas
  );

  await loadPromise;
  mockTime.nextFrame();

  clickPointer(200, 200);

  mockTime.nextFrame();

  // we set up:
  // canvasOffsetLeft = 80
  // canvasOffsetTop = 0
  // widthMargin = 10
  // heightMargin = 0
  // scale = 2
  // width = 200
  // height = 200

  expect(canvas.offsetLeft).toBe(80);

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: true",
      "pointerJustPressed: true",
      "pointerX: -50", // see clientXToGameX for calculation
      "pointerY: 0",
    ].join(),
    0,
    0
  );

  Object.defineProperty(canvas, "offsetLeft", { value: 0 });
  Object.defineProperty(canvas, "offsetTop", { value: 108 });

  resizeWindow(320, 600);

  movePointer(200, 200);

  mockTime.nextFrame();

  // we set up:
  // canvasOffsetLeft = 0
  // canvasOffsetTop = 108
  // widthMargin = 0
  // heightMargin = 20
  // scale = 1.6
  // width = 200
  // height = 200

  expect(textSpy).lastCalledWith(
    [
      "pointerPressed: true",
      "pointerJustPressed: false",
      "pointerX: 25",
      "pointerY: 62.5",
    ].join(),
    0,
    0
  );
});

interface PointerState {
  pointerPressed: boolean;
  pointerJustPressed: boolean;
  pointerX: number;
  pointerY: number;
}
const PointerGame = makeSprite<GameProps, PointerState, Inputs>({
  init() {
    return {
      pointerPressed: false,
      pointerJustPressed: false,
      pointerX: 0,
      pointerY: 0,
    };
  },
  loop({ device: { inputs } }) {
    return {
      pointerPressed: inputs.pointer.pressed,
      pointerJustPressed: inputs.pointer.justPressed,
      pointerX: inputs.pointer.x,
      pointerY: inputs.pointer.y,
    };
  },
  render({ state }) {
    return [
      t.text({
        ...defaultProps,
        text: [
          `pointerPressed: ${state.pointerPressed}`,
          `pointerJustPressed: ${state.pointerJustPressed}`,
          `pointerX: ${state.pointerX}`,
          `pointerY: ${state.pointerY}`,
        ].join(),
      }),
    ];
  },
});

const PointerGameWithSprite = makeSprite<GameProps, { rot: number }, Inputs>({
  init() {
    return {
      rot: 0,
    };
  },
  loop({ state }) {
    return {
      rot: state.rot + 10,
    };
  },
  render({ state }) {
    return [
      PointerSprite({
        id: "pointer-sprite",
        position: {
          x: 20,
          y: 20,
          rotation: state.rot,
        },
      }),
    ];
  },
});

const PointerSprite = makeSprite<{}, PointerState, Inputs>({
  init() {
    return {
      pointerPressed: false,
      pointerJustPressed: false,
      pointerX: 0,
      pointerY: 0,
    };
  },
  loop({ device: { inputs } }) {
    return {
      pointerPressed: inputs.pointer.pressed,
      pointerJustPressed: inputs.pointer.justPressed,
      pointerX: inputs.pointer.x,
      pointerY: inputs.pointer.y,
    };
  },
  render({ state }) {
    return [
      t.circle({
        color: "red",
        radius: 5,
        position: { x: state.pointerX, y: state.pointerY },
      }),
    ];
  },
});
