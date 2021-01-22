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
} from "./utils";
import { GameProps } from "@replay/core";

const mockTime: MockTime = { nextFrame: () => undefined };

beforeEach(() => {
  releasePointer(0, 0);
  updateMockTime(mockTime);
  fetchMock.getOnce("shoot.wav", { arrayBuffer: jest.fn() });
});

test("Can render image moving across screen", async () => {
  const canvas = document.createElement("canvas");
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
  expect(canvas.width).toBe(440);
  expect(canvas.height).toBe(400);

  resizeWindow(300, 600); // scale 1.5

  expect(canvas.width).toBe(300);
  expect(canvas.height).toBe(360);
});

test("Missing image file throws error", async () => {
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

test("Unloaded files throw error", () => {
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
  const { audioElements, imageElements } = renderCanvas(
    TestAssetsGame(testGameProps)
  );

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

test("Font properties", async () => {
  const canvas = document.createElement("canvas");
  const props = {
    ...testGameProps,
    defaultFont: {
      family: "Courier",
      size: 20,
      weight: "bold",
      style: "italic",
      baseline: "alphabetic",
      align: "start",
    },
  };
  renderCanvas(TestGameWithAssets(props), {
    dimensions: "game-coords",
    canvas,
  });

  expect(canvasToImage(canvas)).toMatchImageSnapshot();
});
