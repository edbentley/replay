import { GameProps, Texture, Device, DeviceSize, Store } from "@replay/core";
import { replayCore, ReplayPlatform } from "@replay/core/dist/core";
import { CustomSprite } from "@replay/core/dist/sprite";

interface Timer {
  gameTime: number;
  callback: () => void;
}

interface Options<I> {
  initInputs?: I;
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
}

/**
 * `testGame` provides a way of testing your gameplay with helper functions to
 * play and record the game.
 */
export function testGame<S, I>(
  gameSprite: CustomSprite<GameProps, S, I>,
  options: Options<I> = {}
) {
  const {
    initInputs = {} as I,
    initRandom = [0.5],
    size = {
      width:
        "width" in gameSprite.props.size
          ? gameSprite.props.size.width
          : gameSprite.props.size.landscape.width,
      height:
        "height" in gameSprite.props.size
          ? gameSprite.props.size.height
          : gameSprite.props.size.landscape.height,
      widthMargin: 0,
      heightMargin: 0,
      deviceWidth: 1000,
      deviceHeight: 500,
    },
    initStore = {},
    networkResponses = {},
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
   * testGame.
   */
  const network: Device<I>["network"] = {
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

  let inputs: I = { ...initInputs };
  function getInputs() {
    return inputs;
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

  const timeout: Device<I>["timeout"] = (cb, ms) => {
    timers.push({ callback: cb, gameTime: gameTime + ms });
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
      return () => ({
        inputs: getInputs(),
        size,
        log,
        random,
        timeout,
        now,
        audio: audioFn,
        network,
        storage,
      });
    },
  };

  const { initTextures, getNextFrameTextures } = replayCore<S, I>(
    testPlatform,
    gameSprite
  );

  function checkTimers() {
    // remove timer and call callback if its time is reached
    const removeIndexes: number[] = [];
    timers.forEach((timer, i) => {
      if (gameTime < timer.gameTime) {
        return;
      }
      timer.callback();
      removeIndexes.push(i);
    });
    removeIndexes.forEach((i) => {
      timers.splice(i, 1);
    });
  }

  function render(newTextures: Texture[]) {
    // Mutably replace textures with new textures
    textures.length = 0;
    newTextures.forEach((texture) => {
      textures.push(texture);
    });
  }

  /**
   * Synchronously progress to the next frame of the game.
   */
  function nextFrame() {
    gameTime += 1000 / 60;
    checkTimers();
    render(getNextFrameTextures(gameTime));
  }

  /**
   * Synchronously progress frames of the game until condition is met and no
   * errors thrown. Condition can also return a Texture (useful for throwing
   * methods like getByText). Throws if 1000 gameplay seconds (60,000 loops)
   * pass and condition not met / still errors.
   */
  function jumpToFrame(condition: () => boolean | Texture) {
    for (let i = 0; i < 60000; i++) {
      nextFrame();
      try {
        if (condition()) {
          return;
        }
      } catch (e) {
        // continue trying
      }
    }
    throw Error("Timeout of 1000 gameplay seconds reached on jumpToFrame");
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
      throw Error(`No text textures found with test id "${testId}"`);
    }
    const { x, y } = match.props.position || { x: 0, y: 0 };
    return {
      ...match,
      props: {
        ...match.props,
        position: {
          ...match.props.position,
          x,
          y,
        },
      },
    };
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

  /**
   * Get an array of text textures which include text content. Case insensitive.
   * Throws if no matches found.
   */
  function getByText(text: string) {
    const matches = textures.filter(
      (texture) =>
        texture.type === "text" &&
        texture.props.text.toLowerCase().includes(text.toLowerCase())
    );
    if (matches.length === 0) {
      throw Error(`No text textures found with content "${text}"`);
    }
    return matches;
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
  };
}
