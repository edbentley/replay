/* eslint-disable @typescript-eslint/no-explicit-any */

import { GameProps, Texture, Device, DeviceSize, Context } from "@replay/core";
import { replayCore, ReplayPlatform } from "@replay/core/dist/core";
import { CustomSprite, makeSprite, Sprite } from "@replay/core/dist/sprite";
import { TextTexture } from "@replay/core/dist/t";
import { getParentCoordsForSprite } from "./coords";
import { NativeSpriteMock } from "./nativeSpriteMock";
import { AssetMap } from "@replay/core/dist/device";

interface Timer {
  id: string;
  callback: () => void;
  timeRemainingMs: number;
  isPaused: boolean;
}

export interface TestSpriteOptions<I> {
  initInputs?: I;
  /**
   * A mapping function to adjust an input's (x, y) coordinate to its relative
   * value within a Sprite
   */
  mapInputCoordinates?: (
    globalToLocalCoords: (globalCoords: {
      x: number;
      y: number;
    }) => {
      x: number;
      y: number;
    },
    inputs: I
  ) => I;
  /**
   * Array of tuples of context and the value to inject
   */
  contexts?: ContextTuple<any>[];
  /**
   * Same as setRandomNumbers but for init call
   */
  initRandom?: number[];
  /**
   * Set device size
   */
  size?: DeviceSize;
  /**
   * Set initial storage value
   */
  initStore?: Record<string, string | undefined>;
  /**
   * Mock responses for url by request type
   */
  networkResponses?: {
    get?: {
      [url: string]: () => unknown;
    };
    put?: {
      [url: string]: (body: unknown) => unknown;
    };
    post?: {
      [url: string]: (body: unknown) => unknown;
    };
    delete?: {
      [url: string]: () => unknown;
    };
  };
  /**
   * For ok / cancel alert, which choice is chosen. Default true (OK).
   */
  initAlertResponse?: boolean;
  /**
   * A list of Native Sprite names to mock
   */
  nativeSpriteNames?: string[];
  /**
   * Test as a touch screen?
   *
   * @default false
   */
  isTouchScreen?: boolean;
  /**
   * Should errors be thrown if an asset isn't loaded?
   *
   * @default true
   */
  throwAssetErrors?: boolean;
}

interface TestSpriteUtils<I> {
  nextFrame: () => void;
  jumpToFrame: (
    condition: () => boolean | Texture,
    maxFrames?: number
  ) => Promise<void>;
  setRandomNumbers: (numbers: number[]) => void;
  updateInputs: (newInputs: I) => void;
  getTextures: () => Texture[];
  getTexture: (testId: string) => Texture;
  textureExists: (testId: string) => boolean;
  getByText: (text: string) => TextTexture[];
  log: jest.Mock<any, any>;
  resolvePromises: () => Promise<void>;
  audio: {
    getPosition: jest.Mock<number>;
    play: jest.Mock<any, any>;
    pause: jest.Mock<any, any>;
    getStatus: jest.Mock<string>;
    getVolume: jest.Mock<number>;
    setVolume: jest.Mock<any, [string, number]>;
    getDuration: jest.Mock<number>;
  };
  network: {
    get: jest.Mock<any, [string, (data: unknown) => void]>;
    post: jest.Mock<any, [string, unknown, (data: unknown) => void]>;
    put: jest.Mock<any, [string, unknown, (data: unknown) => void]>;
    delete: jest.Mock<any, [string, (data: unknown) => void]>;
  };
  store: Record<string, string | undefined>;
  alert: {
    ok: jest.Mock<any, [string, (() => void) | undefined]>;
    okCancel: jest.Mock<any, [string, (wasOk: boolean) => void]>;
  };
  updateAlertResponse: (isOk: boolean) => void;
  clipboard: {
    copy: jest.Mock<any, [string, (error?: Error | undefined) => void]>;
  };
}

/**
 * `testSprite` provides a way of testing your gameplay with helper functions to
 * play and record the game.
 */
export function testSprite<P, S, I>(
  sprite: CustomSprite<P, S, I>,
  gameProps: GameProps,
  options: TestSpriteOptions<I> = {}
): TestSpriteUtils<I> {
  const {
    initInputs = {} as I,
    contexts: contextTuples = [],
    initRandom = [0.5],
    size = {
      width:
        "width" in gameProps.size
          ? gameProps.size.width
          : gameProps.size.landscape.width,
      height:
        "height" in gameProps.size
          ? gameProps.size.height
          : gameProps.size.landscape.height,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: 1000,
      deviceHeight: 500,
    },
    initStore = {},
    networkResponses = {},
    mapInputCoordinates = (_, inputs) => inputs,
    initAlertResponse = true,
    nativeSpriteNames = [],
    isTouchScreen = false,
    throwAssetErrors = true,
  } = options;
  /**
   * Mock function for device log.
   */
  const log = jest.fn();

  /**
   * Mock functions for audio. Note the test platform will add the audio
   * filename as the first argument, followed by any other arguments to the
   * function.
   */
  const audio = {
    getPosition: jest.fn((_filename: string) => 120),
    play: jest.fn(),
    pause: jest.fn(),
    getStatus: jest.fn((_filename: string) => "playing" as const),
    getVolume: jest.fn(),
    setVolume: jest.fn(),
    getDuration: jest.fn(),
  };

  /**
   * Mock functions for network calls. Pass in the responses as a parameter to
   * testSprite.
   */
  const network: TestSpriteUtils<I>["network"] = {
    get: jest.fn((url, cb) => {
      if (!networkResponses.get || !networkResponses.get[url]) {
        throw Error(`No GET response defined for url: ${url}`);
      }
      return cb(networkResponses.get[url]());
    }),
    put: jest.fn((url, body, cb) => {
      if (!networkResponses.put || !networkResponses.put[url]) {
        throw Error(`No PUT response defined for url: ${url}`);
      }
      return cb(networkResponses.put[url](body));
    }),
    post: jest.fn((url, body, cb) => {
      if (!networkResponses.post || !networkResponses.post[url]) {
        throw Error(`No POST response defined for url: ${url}`);
      }
      return cb(networkResponses.post[url](body));
    }),
    delete: jest.fn((url, cb) => {
      if (!networkResponses.delete || !networkResponses.delete[url]) {
        throw Error(`No DELETE response defined for url: ${url}`);
      }
      return cb(networkResponses.delete[url]());
    }),
  };

  const okCancelValue = { ref: initAlertResponse };

  /**
   * Mock functions for alerts.
   */
  const alert: TestSpriteUtils<I>["alert"] = {
    ok: jest.fn((_, onResponse) => {
      onResponse?.();
    }),
    okCancel: jest.fn((_, onResponse) => {
      onResponse(okCancelValue.ref);
    }),
  };
  /**
   * Update whether okCancel alert chooses ok or cancel
   */
  function updateAlertResponse(isOk: boolean) {
    okCancelValue.ref = isOk;
  }

  /**
   * Mock functions for clipboard.
   */
  const clipboard: TestSpriteUtils<I>["clipboard"] = {
    copy: jest.fn((_, onComplete) => {
      onComplete();
    }),
  };

  let inputs: I = { ...initInputs };
  /**
   * Update the current input state in the game.
   */
  function updateInputs(newInputs: I) {
    inputs = { ...newInputs };
  }

  /**
   * How far game has progressed in milliseconds within tests, calculated by
   * assuming callback is called at 60 FPS.
   */
  let gameTime = 0.01;

  const randomNumbers = initRandom;
  let randomIndex = 0;
  /**
   * An array of random numbers the game will loop through, to ensure
   * predictability in random parts of gameplay. By default, all random numbers
   * will be 0.5.
   */
  function setRandomNumbers(numbers: number[]) {
    randomNumbers.length = 0;
    numbers.forEach((n) => {
      randomNumbers.push(n);
    });
    randomIndex = 0;
  }
  const random = () => {
    const randomNumber = randomNumbers[randomIndex];
    randomIndex += 1;
    if (randomIndex === randomNumbers.length) {
      randomIndex = 0;
    }
    return randomNumber;
  };

  const audioFn: Device["audio"] = (filename) => {
    if (throwAssetErrors) {
      const audioElement = audioElements[filename];
      if (!audioElement) {
        throw Error(`Audio file "${filename}" was not preloaded`);
      }
      const { data } = audioElements[filename];
      if (typeof data === "object") {
        throw Error(
          `Audio file "${filename}" did not finish loading before it was used`
        );
      }
    }
    return {
      getPosition: () => audio.getPosition(filename),
      play: (fromPositionOrSettings) => {
        if (fromPositionOrSettings === undefined) {
          audio.play(filename);
        } else {
          audio.play(filename, fromPositionOrSettings);
        }
      },
      pause: () => audio.pause(filename),
      getStatus: () => audio.getStatus(filename),
      getVolume: () => audio.getVolume(filename),
      setVolume: (volume) => audio.setVolume(filename, volume),
      getDuration: () => audio.getDuration(filename),
    };
  };

  const timer: Device["timer"] = {
    start: (callback, ms) => {
      // Get a unique ID
      let id = "";
      let i = timers.length;
      while (!id || timers.map((t) => t.id).includes(id)) {
        i++;
        id = `ID00${i}`;
      }
      timers.push({
        id,
        callback,
        timeRemainingMs: ms,
        isPaused: false,
      });
      return id;
    },
    pause: (id) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      timer.isPaused = true;
    },
    resume: (id) => {
      const timer = timers.find((t) => t.id === id);
      if (!timer) return;

      timer.isPaused = false;
    },
    cancel: (id) => {
      const timerIndex = timers.findIndex((t) => t.id === id);
      if (timerIndex === -1) return;

      timers.splice(timerIndex, 1);
    },
  };

  const store = { ...initStore };
  const storage: Device["storage"] = {
    getItem(key) {
      return Promise.resolve(store[key] ?? null);
    },
    setItem(key, value) {
      return Promise.resolve().then(() => {
        if (value === null) {
          delete store[key];
          return;
        }
        store[key] = value;
      });
    },
  };

  const textures: Texture[] = [];

  const timers: Timer[] = [];

  /**
   * Resolve promises such as `preloadFiles` and storage.
   */
  const resolvePromises = () => new Promise(setImmediate);

  const audioElements: AssetMap<string> = {};
  const imageElements: AssetMap<string> = {};

  type Pos = { x: number; y: number; rotation: number };
  /**
   * Keep a stack of functions mapping local to global coords
   */
  const getPosStack: ((localCoords: Pos) => Pos)[] = [];

  const testPlatform: ReplayPlatform<I> = {
    getInputs: (globalToLocalCoords) =>
      mapInputCoordinates(globalToLocalCoords, inputs),
    mutDevice: {
      isTouchScreen,
      size,
      log,
      random,
      timer,
      now: () => new Date(Date.UTC(2000, 1, 1)),
      audio: audioFn,
      assetUtils: {
        audioElements,
        imageElements,
        loadAudioFile: (fileName) => {
          return Promise.resolve().then(() => {
            return `audioData-${fileName}`;
          });
        },
        loadImageFile: (fileName) => {
          return Promise.resolve().then(() => {
            return `imageData-${fileName}`;
          });
        },
        cleanupAudioFile: () => null,
        cleanupImageFile: () => null,
      },
      network,
      storage,
      alert,
      clipboard,
    },
    render: {
      newFrame: () => {
        textures.length = 0;
      },
      startRenderSprite: (baseProps) => {
        const getParentCoords = getParentCoordsForSprite(baseProps);

        const getParentPos = ({ x, y, rotation }: Pos) => ({
          ...getParentCoords({ x, y }),
          rotation: rotation + baseProps.rotation,
        });

        getPosStack.unshift(getParentPos);
      },
      endRenderSprite: () => {
        getPosStack.shift();
      },
      renderTexture: (texture) => {
        if (
          throwAssetErrors &&
          (texture.type === "image" || texture.type === "spriteSheet")
        ) {
          const fileName = texture.props.fileName;
          const imageElement = imageElements[fileName];
          if (!imageElement) {
            throw Error(`Image file "${fileName}" was not preloaded`);
          }
          if (typeof imageElement.data === "object") {
            throw Error(
              `Image file "${fileName}" did not finish loading before it was used`
            );
          }
        }

        // Go through all functions mapping position
        const { x, y, rotation } = getPosStack.reduce(
          (pos, posFn) => posFn(pos),
          texture.props as Pos
        );

        textures.push({
          ...texture,
          props: {
            ...texture.props,
            x: Math.round(x),
            y: Math.round(y),
            rotation: Math.round(rotation),
          },
        } as Texture);
      },
    },
  };

  const TestContainer = makeSprite<GameProps>({
    render() {
      return [
        // Wrap sprite with contexts passed in options
        contextTuples.reduce<Sprite>((prevSprite, [context, contextValue]) => {
          return context.Sprite({
            context: contextValue,
            sprites: [prevSprite],
          });
        }, sprite),
      ];
    },
  });

  const { runNextFrame } = replayCore(
    testPlatform,
    {
      // Mock the Native Sprites passed in to avoid errors when looked up
      nativeSpriteMap: nativeSpriteNames.reduce(
        (map, name) => ({ ...map, [name]: NativeSpriteMock }),
        {}
      ),
      nativeSpriteUtils: {
        scale: 1,
        didResize: false,
        gameXToPlatformX: (x) => x,
        gameYToPlatformY: (y) => y,
      },
    },
    TestContainer(gameProps)
  );

  function checkTimers() {
    // remove timer and call callback if its time is reached
    const removeIndexes: number[] = [];
    timers.forEach((timer, i) => {
      if (!timer.isPaused) {
        timer.timeRemainingMs -= 1000 / 60;

        if (timer.timeRemainingMs <= 0) {
          timer.callback();
          removeIndexes.push(i);
        }
      }
    });
    removeIndexes.forEach((i) => {
      timers.splice(i, 1);
    });
  }

  /**
   * Synchronously progress to the next frame of the game.
   */
  function nextFrame() {
    gameTime += 1000 / 60;
    checkTimers();
    runNextFrame(gameTime, jest.fn());
  }

  /**
   * Asynchronously progress frames of the game until condition is met and no
   * errors are thrown. Condition can also return a Texture (useful for throwing
   * methods like `getTexture`). Rejects if 30 gameplay seconds (1800 frames)
   * pass and condition not met / still errors.
   *
   * Note that this will run at almost synchronous speed, but doesn't block the
   * event loop.
   */
  async function jumpToFrame(
    condition: () => boolean | Texture,
    maxFrames = 1800
  ) {
    let lastErrorMsg: string | null = null;

    // Keep this for improved error stack reporting
    const stackObj: Error = {} as Error;
    Error.captureStackTrace(stackObj);

    await new Promise<void>((res, rej) => {
      let i = 0;

      function loop() {
        nextFrame();
        try {
          if (condition()) {
            res();
            return;
          }
        } catch (e) {
          lastErrorMsg = (e as Error)?.message;
          // continue trying
        }
        i++;
        if (i < maxFrames) {
          setImmediate(loop);
          return;
        }
        let errMessage = `Timeout of ${Math.round(
          maxFrames / 60
        )} gameplay seconds reached on jumpToFrame`;
        if (lastErrorMsg) {
          errMessage += ` with error:\n\n${lastErrorMsg}`;
        }
        const error = new Error(errMessage);

        // Only keep stack trace relevant to user's test code
        error.stack = removeStackLines(
          stackObj.stack || "",
          "at jumpToFrame ("
        );
        rej(error);
      }

      loop();
    });
  }

  function getTextures() {
    return textures;
  }

  /**
   * Get a texture with matching test id. If multiple textures found, return the
   * first one. Throws if no matches found.
   */
  function getTexture(testId: string) {
    const match = textures.find((texture) => texture.props.testId === testId);
    if (!match) {
      throw Error(`No textures found with test id "${testId}"`);
    }
    return match;
  }

  /**
   * Test if a texture exists, useful for checking if a texture has spawned or is
   * removed.
   */
  function textureExists(testId: string) {
    try {
      getTexture(testId);
      return true;
    } catch (e) {
      return false;
    }
  }

  function isTextTexture(texture: Texture): texture is TextTexture {
    return texture.type === "text";
  }

  /**
   * Get an array of text textures which include text content. Case insensitive.
   * Returns empty array if no matches found.
   */
  function getByText(text: string) {
    return textures
      .filter(isTextTexture)
      .filter((texture) =>
        texture.props.text.toLowerCase().includes(text.toLowerCase())
      );
  }

  return {
    nextFrame,
    jumpToFrame,
    setRandomNumbers,
    updateInputs,
    getTextures,
    getTexture,
    textureExists,
    getByText,
    resolvePromises,
    log,
    audio,
    network,
    store,
    alert,
    updateAlertResponse,
    clipboard,
  };
}

/**
 * Stack is of format:
 * ```
  Error:
        at jumpToFrame (.../replay/packages/replay-test/src/index.ts:475:11)
        at Object.<anonymous> (.../replay/packages/replay-test/src/__tests__/replay-test.test.ts:506:11)
        ...
   ```

   We only want lines after `at jumpToFrame`
 */
function removeStackLines(stack: string, removeLineContaining: string) {
  const stackLines = stack.split("\n");
  if (!stackLines) return stack;

  const jumpToFrameLine = stackLines.findIndex((line) =>
    line.includes(removeLineContaining)
  );
  if (jumpToFrameLine === -1) return stack;

  return [stackLines[0], ...stackLines.slice(jumpToFrameLine + 1)].join("\n");
}

type ContextTuple<T> = [Context<T>, T];

export function mockContext<T>(
  context: Context<T>,
  mockValue: T
): ContextTuple<T> {
  return [context, mockValue];
}
