/* eslint-disable @typescript-eslint/no-explicit-any */

import { GameProps, Texture, Device, DeviceSize, Store } from "@replay/core";
import { replayCore, ReplayPlatform } from "@replay/core/dist/core";
import {
  CustomSprite,
  makeSprite,
  SpriteTextures,
} from "@replay/core/dist/sprite";
import { TextTexture } from "@replay/core/dist/t";
import { getParentCoordsForSprite } from "./coords";
import { NativeSpriteMock } from "./nativeSpriteMock";

interface Timer {
  id: string;
  callback: () => void;
  timeRemainingMs: number;
  isPaused: boolean;
}

interface Options<I> {
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
  initStore?: Store;
  /**
   * Mock responses for url by request type
   */
  networkResponses?: {
    get?: {
      [url: string]: () => object;
    };
    put?: {
      [url: string]: (body: object) => object;
    };
    post?: {
      [url: string]: (body: object) => object;
    };
    delete?: {
      [url: string]: () => object;
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
}

interface TestSpriteUtils<I> {
  nextFrame: () => void;
  jumpToFrame: (condition: () => boolean | Texture) => Promise<void>;
  setRandomNumbers: (numbers: number[]) => void;
  updateInputs: (newInputs: I) => void;
  getTextures: () => Texture[];
  getTexture: (testId: string) => Texture;
  textureExists: (testId: string) => boolean;
  getByText: (text: string) => TextTexture[];
  log: jest.Mock<any, any>;
  audio: {
    getPosition: jest.Mock<number>;
    play: jest.Mock<any, any>;
    pause: jest.Mock<any, any>;
  };
  network: {
    get: jest.Mock<any, [string, (data: unknown) => void]>;
    post: jest.Mock<any, [string, object, (data: unknown) => void]>;
    put: jest.Mock<any, [string, object, (data: unknown) => void]>;
    delete: jest.Mock<any, [string, (data: unknown) => void]>;
  };
  store: Store;
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
  options: Options<I> = {}
): TestSpriteUtils<I> {
  const {
    initInputs = {} as I,
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
  function getInputs(
    globalToLocalCoords: (globalCoords: {
      x: number;
      y: number;
    }) => {
      x: number;
      y: number;
    }
  ) {
    return mapInputCoordinates(globalToLocalCoords, inputs);
  }
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

  const audioFn: Device<I>["audio"] = (filename) => {
    return {
      getPosition: () => audio.getPosition(filename),
      play: (fromPosition, loop) => {
        if (loop !== undefined) {
          audio.play(filename, fromPosition, loop);
        } else if (fromPosition !== undefined) {
          audio.play(filename, fromPosition);
        } else {
          audio.play(filename);
        }
      },
      pause: () => audio.pause(filename),
    };
  };

  const timer: Device<I>["timer"] = {
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
  const storage = {
    getStore() {
      return store;
    },
    setStore(newStore: Record<string, string | undefined>) {
      Object.entries(newStore).forEach(([field, value]) => {
        if (value === undefined) {
          delete store[field];
        } else {
          store[field] = value;
        }
      });
    },
  };

  const textures: Texture[] = [];

  const timers: Timer[] = [];

  const testPlatform: ReplayPlatform<I> = {
    getGetDevice: () => {
      const now = () => {
        return new Date(Date.UTC(2000, 1, 1));
      };
      // called individually by each Sprite
      return (globalToLocalCoords) => ({
        inputs: getInputs(globalToLocalCoords),
        isTouchScreen,
        size,
        log,
        random,
        timer,
        now,
        audio: audioFn,
        network,
        storage,
        alert,
        clipboard,
      });
    },
  };

  const TestContainer = makeSprite<GameProps>({
    render() {
      return [sprite];
    },
  });

  const { initTextures, getNextFrameTextures } = replayCore(
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

  function render(newTextures: SpriteTextures) {
    // Mutably replace textures with new textures
    textures.length = 0;

    type Pos = { x: number; y: number; rotation: number };

    const traverseSpriteTextures = (
      spriteTextures: SpriteTextures | Texture,
      getParentGlobalPos: (localCoords: Pos) => Pos
    ) => {
      if ("type" in spriteTextures) {
        // is a Texture
        const { x, y, rotation } = getParentGlobalPos(spriteTextures.props);

        // Output textures with global coordinates and rotation
        textures.push({
          ...spriteTextures,
          props: {
            ...spriteTextures.props,
            x: Math.round(x),
            y: Math.round(y),
            rotation: Math.round(rotation),
          },
        } as Texture);

        return;
      }

      const { baseProps } = spriteTextures;
      const getParentCoords = getParentCoordsForSprite(baseProps);
      const getGlobalPos = ({ x, y, rotation }: Pos) =>
        getParentGlobalPos({
          ...getParentCoords({ x, y }),
          rotation: rotation + baseProps.rotation,
        });

      spriteTextures.textures.forEach((childSpriteTextures) => {
        traverseSpriteTextures(childSpriteTextures, getGlobalPos);
      });
    };
    traverseSpriteTextures(newTextures, (pos) => pos);
  }

  /**
   * Synchronously progress to the next frame of the game.
   */
  function nextFrame() {
    gameTime += 1000 / 60;
    checkTimers();
    render(getNextFrameTextures(gameTime, jest.fn()));
  }

  /**
   * Asynchronously progress frames of the game until condition is met and no
   * errors are thrown. Condition can also return a Texture (useful for throwing
   * methods like `getTexture`). Rejects if 1000 gameplay seconds (60,000 loops)
   * pass and condition not met / still errors.
   *
   * Note that this will run at almost synchronous speed, but doesn't block the
   * event loop.
   */
  async function jumpToFrame(condition: () => boolean | Texture) {
    let lastErrorMsg: string | null = null;

    await new Promise((res, rej) => {
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
        if (i < 60000) {
          setImmediate(loop);
          return;
        }
        let errMessage =
          "Timeout of 1000 gameplay seconds reached on jumpToFrame";
        if (lastErrorMsg) {
          errMessage += ` with error:\n\n${lastErrorMsg}`;
        }
        rej(Error(errMessage));
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

  // Init render
  render(initTextures);

  return {
    nextFrame,
    jumpToFrame,
    setRandomNumbers,
    updateInputs,
    getTextures,
    getTexture,
    textureExists,
    getByText,
    log,
    audio,
    network,
    store,
    alert,
    updateAlertResponse,
    clipboard,
  };
}
