import fetchMock from "fetch-mock";
import { renderCanvas } from "../index";
import {
  TestGameWithAssets,
  pressKey,
  releaseKey,
  canvasToImage,
  MockTime,
  updateMockTime,
  testGameProps,
  TestGameWithSprites,
  TestGame,
  resizeWindow,
  TestGameThrowUnknownImageError,
  TestNativeSpriteWeb,
  TestGameWithNativeSprite,
  clickPointer,
  TestGameThrowUnloadedImageError,
  TestGameLayeredSprites,
  TestAssetsGame,
  releasePointer,
  loadAssets,
  TestGameThrowUnloadedAudioError,
  TestGameThrowNotYetLoadedImageError,
  TestGameThrowNotYetLoadedAudioError,
  NestedSpriteGame,
  NestedSpriteGame2,
} from "./utils";
import { GameProps } from "@replay/core";

const mockTime: MockTime = { nextFrame: () => undefined };

beforeEach(() => {
  releasePointer(0, 0);
  updateMockTime(mockTime);
  fetchMock.getOnce("shoot.wav", { arrayBuffer: jest.fn() });
});

// Images not rendering in tests
test.skip("Can render image moving across screen", async () => {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;
  renderCanvas(TestGameWithAssets(testGameProps), {
    dimensions: "game-coords",
    canvas,
  });

  // 1: loading scene
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  await loadAssets();

  mockTime.nextFrame();
  mockTime.nextFrame();

  // 2: renders enemy in start position
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  pressKey("ArrowRight");
  mockTime.nextFrame();

  // 3: enemy moves right + 45 deg rot
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  mockTime.nextFrame();

  // 4: enemy moves right + 90 deg rot
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  releaseKey("ArrowRight");
  mockTime.nextFrame();

  // 5: enemy hasn't moved
  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test.todo("Can batch render images");

test("Canvas elements are drawn in order of sprites passed in", () => {
  const canvas = document.createElement("canvas");
  renderCanvas(TestGameLayeredSprites(testGameProps), {
    dimensions: "game-coords",
    canvas,
  });

  // blue circle on red circle
  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Can render game with Sprites", () => {
  const canvas = document.createElement("canvas");
  renderCanvas(TestGameWithSprites(testGameProps), {
    canvas,
  });

  mockTime.nextFrame();

  // 1: renders player in start position
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  pressKey("ArrowRight");
  mockTime.nextFrame();

  // 2: player moves right (and down from rotation)
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  mockTime.nextFrame();

  // 3: player moves further right-down
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  releaseKey("ArrowRight");
  mockTime.nextFrame();

  // 4: player hasn't moved
  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("Dimension 'game-coords' renders the minimum size", () => {
  const canvas = document.createElement("canvas");

  const props: GameProps = {
    id: "Game",
    size: { width: 200, height: 200, maxWidthMargin: 10, maxHeightMargin: 20 },
  };
  renderCanvas(TestGame(props), { dimensions: "game-coords", canvas });

  expect(canvas.width).toBe(200);
  expect(canvas.height).toBe(200);

  expect(canvas.style.width).toBe("200px");
  expect(canvas.style.height).toBe("200px");
});

test("Dimension 'scale-up' renders up to browser size and resizes", () => {
  const canvas = document.createElement("canvas");
  (window as any).innerWidth = 600;
  (window as any).innerHeight = 400;

  const props: GameProps = {
    id: "Game",
    size: { width: 200, height: 200, maxWidthMargin: 10, maxHeightMargin: 20 },
  };
  renderCanvas(TestGame(props), { dimensions: "scale-up", canvas });

  // the game is square so width scales up to max 400px (scale 2)
  // so a margin of 10 game coordinates allowed on each side = 40px extra width
  expect(canvas.style.width).toBe("440px");
  expect(canvas.style.height).toBe("400px");
  expect(canvas.width).toBe(440);
  expect(canvas.height).toBe(400);

  resizeWindow(300, 600); // scale 1.5

  expect(canvas.style.width).toBe("300px");
  expect(canvas.style.height).toBe("360px");
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(360);

  // Higher DPR
  (window as any).devicePixelRatio = 2;
  resizeWindow(300, 600); // scale 1.5

  expect(canvas.style.width).toBe("300px");
  expect(canvas.style.height).toBe("360px");
  expect(canvas.width).toBe(600);
  expect(canvas.height).toBe(720);

  (window as any).devicePixelRatio = 1;
});

test("Canvas max size limited by image resolution", () => {
  const canvas = document.createElement("canvas");
  (window as any).innerWidth = 400;
  (window as any).innerHeight = 400;

  const props: GameProps = {
    id: "Game",
    size: { width: 200, height: 200, maxWidthMargin: 0, maxHeightMargin: 0 },
  };
  renderCanvas(TestGame(props), {
    dimensions: "scale-up",
    canvas,
    imageResolution: 1.5,
  });

  expect(canvas.style.width).toBe("400px");
  expect(canvas.style.height).toBe("400px");
  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(300);
});

test("Canvas max size limited by max pixels", () => {
  const canvas = document.createElement("canvas");
  (window as any).innerWidth = 400;
  (window as any).innerHeight = 400;

  const props: GameProps = {
    id: "Game",
    size: { width: 200, height: 200, maxWidthMargin: 0, maxHeightMargin: 0 },
  };
  renderCanvas(TestGame(props), {
    dimensions: "scale-up",
    canvas,
    maxPixels: 10000,
  });

  expect(canvas.style.width).toBe("400px");
  expect(canvas.style.height).toBe("400px");
  expect(canvas.width).toBeLessThan(100);
  expect(canvas.height).toBeLessThan(100);
});

// Error "Server responded with 404"
test.skip("Missing image file throws error", async () => {
  let error = "";

  const consoleErrorOriginal = console.error;
  const promiseAllOriginal = Promise.all.bind(Promise);

  // Ignore error thrown by jsdom
  console.error = () => null;

  // Catch error from Promise.all in replay-core
  (Promise.all as any) = (values: any[]) => {
    promiseAllOriginal(values).catch((e: Error) => {
      error = e.message;
    });
    return Promise.resolve();
  };

  renderCanvas(TestGameThrowUnknownImageError(testGameProps));
  await loadAssets();

  expect(error).toBe(`Failed to load image file "unknown.png"`);

  // Cleanup
  console.error = consoleErrorOriginal;
  (Promise.all as any) = promiseAllOriginal;
});

// This is causing "Image given has not completed loading" in later tests
test.skip("Unloaded files throw error", () => {
  expect(() =>
    renderCanvas(TestGameThrowUnloadedImageError(testGameProps))
  ).toThrowError(`Image file "player.png" was not preloaded`);
  expect(() =>
    renderCanvas(TestGameThrowNotYetLoadedImageError(testGameProps))
  ).toThrowError(
    `Image file "enemy.png" did not finish loading before it was used`
  );

  expect(() =>
    renderCanvas(TestGameThrowUnloadedAudioError(testGameProps))
  ).toThrowError(`Audio file "unknown.mp3" was not preloaded`);
  expect(() =>
    renderCanvas(TestGameThrowNotYetLoadedAudioError(testGameProps))
  ).toThrowError(
    `Audio file "shoot.wav" did not finish loading before it was used`
  );
});

test("Supports Native Sprites", () => {
  console.log = jest.fn();

  const canvas = document.createElement("canvas");
  renderCanvas(TestGameWithNativeSprite(testGameProps), {
    nativeSpriteMap: { TestNativeSprite: TestNativeSpriteWeb },
    canvas,
  });

  expect(console.log).toBeCalledWith("Create");

  mockTime.nextFrame();
  expect(console.log).toBeCalledWith("Loop");

  clickPointer(0, 0);
  mockTime.nextFrame();
  expect(console.log).toBeCalledWith("Cleanup");
});

test("Can preload and unload image and audio assets", async () => {
  const result = renderCanvas(TestAssetsGame(testGameProps));

  if (result instanceof Error) throw result;
  const { audioElements, imageElements } = result;

  await loadAssets();

  // Initially only shoot.wav loaded by Game

  expect(Object.keys(imageElements)).toEqual([]);
  expect(Object.keys(audioElements)).toEqual(["shoot.wav"]);
  expect([...audioElements["shoot.wav"].globalSpriteIds]).toEqual(["Game"]);

  fetchMock.getOnce("shoot.wav", { arrayBuffer: jest.fn() });

  mockTime.nextFrame();
  mockTime.nextFrame();
  await loadAssets();

  // Then AssetsSprite also loads shoot.wav and enemy.png

  expect(Object.keys(imageElements)).toEqual(["enemy.png"]);
  expect([...imageElements["enemy.png"].globalSpriteIds]).toEqual([
    "Game--AssetsSprite",
  ]);

  expect(Object.keys(audioElements)).toEqual(["shoot.wav"]);
  expect([...audioElements["shoot.wav"].globalSpriteIds]).toEqual([
    "Game",
    "Game--AssetsSprite",
  ]);

  // Unmount AssetsSprite
  clickPointer(100, 0);
  mockTime.nextFrame();

  // Wait until promise `.then` is called
  await new Promise(setImmediate);

  // enemy.png is cleaned up, shoot.wav remains since Game is using it

  expect(Object.keys(imageElements)).toEqual([]);

  expect(Object.keys(audioElements)).toEqual(["shoot.wav"]);
  expect([...audioElements["shoot.wav"].globalSpriteIds]).toEqual(["Game"]);
});

// Fonts not loading
test.skip("Font properties", async () => {
  const canvas = document.createElement("canvas");
  const props: GameProps = {
    ...testGameProps,
    defaultFont: {
      family: "Courier",
      size: 20,
      weight: "bold",
      style: "italic",
      baseline: "alphabetic",
      align: "left",
    },
  };
  renderCanvas(TestGameWithAssets(props), {
    dimensions: "game-coords",
    canvas,
  });

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});

test("deeply nested input position", () => {
  console.log = jest.fn();

  const canvas = document.createElement("canvas");

  renderCanvas(NestedSpriteGame(testGameProps), { canvas });

  const { width, height } = canvas;

  clickPointer(width / 2 + 50, height / 2 - 50);
  mockTime.nextFrame();
  mockTime.nextFrame();

  // Rendered Sprite position
  // Image should show x: -10, y: 60, rotation: -45, opacity: 0.5125
  expect(canvasToImage(canvas)).toMatchImageSnapshot();

  // Pointer positions global and calculated on platform side

  expect(console.log).toHaveBeenNthCalledWith(
    4,
    "NestedSpriteGame x: 50, y: 50"
  );
  expect(console.log).toHaveBeenNthCalledWith(
    5,
    "NestedFirstSprite x: 30, y: -30"
  );
  expect(console.log).toHaveBeenNthCalledWith(
    6,
    "NestedSecondSprite x: -50, y: 20"
  );
});

test("nested sprites and input position with scale", () => {
  console.log = jest.fn();
  renderCanvas(NestedSpriteGame2(testGameProps));

  const { width, height } = document.getElementsByTagName("canvas")[0];

  clickPointer(width / 2 + 10, height / 2 - 10);

  mockTime.nextFrame();
  mockTime.nextFrame();

  expect(console.log).toBeCalledWith("NestedFirstSprite2 x: -20, y: -10");
});
