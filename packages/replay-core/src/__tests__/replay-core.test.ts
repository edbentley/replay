import { t } from "../index";
import { replayCore } from "../core";
import {
  TestGame,
  getTestPlatform,
  FullTestGame,
  TestGameWithSprites,
  gameProps,
  NestedSpriteGame,
  LocalStorageGame,
} from "./utils";

test("can render simple game and getNextFrameTextures", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const platformSpy = {
    getDevice: jest.spyOn(platform, "getGetDevice"),
  };

  mutableTestDevice.inputs.buttonPressed.move = true;

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    TestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  expect(platformSpy.getDevice).toBeCalledTimes(1);
  expect(initTextures).toEqual([
    {
      type: "circle",
      props: {
        position: {
          x: 5,
          y: 50,
          rotation: 0,
        },
        radius: 10,
        color: "#0095DD",
        scaleX: 5,
        anchorY: 0,
      },
    },
  ]);

  let textures = getNextFrameTexturesOverTime();

  expect(platformSpy.getDevice).toBeCalledTimes(2);
  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      position: {
        x: 6,
        y: 50,
        rotation: 0,
      },
      radius: 10,
      color: "#0095DD",
      scaleX: 5,
      anchorY: 0,
    },
  });

  mutableTestDevice.inputs.buttonPressed.move = true;
  textures = getNextFrameTexturesOverTime();

  expect(platformSpy.getDevice).toBeCalledTimes(3);
  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      position: {
        x: 7,
        y: 50,
        rotation: 0,
      },
      radius: 10,
      color: "#0095DD",
      scaleX: 5,
      anchorY: 0,
    },
  });
});

test("can render simple game with sprites", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const platformSpy = {
    getDevice: jest.spyOn(platform, "getGetDevice"),
  };

  mutableTestDevice.inputs.buttonPressed.move = true;

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    TestGameWithSprites(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  expect(platformSpy.getDevice).toBeCalledTimes(1);

  expect(initTextures[0]).toEqual({
    type: "circle",
    props: {
      position: {
        x: 100,
        y: 50,
        rotation: 10,
      },
      color: "#0095DD",
      radius: 10,
    },
  });

  let textures = getNextFrameTexturesOverTime();

  expect(platformSpy.getDevice).toBeCalledTimes(2);

  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      position: {
        x: 101,
        y: 50,
        rotation: 10,
      },
      color: "#0095DD",
      radius: 10,
    },
  });

  mutableTestDevice.inputs.buttonPressed.show = false;

  textures = getNextFrameTexturesOverTime();

  expect(textures).toEqual([]);

  mutableTestDevice.inputs.buttonPressed.show = true;

  textures = getNextFrameTexturesOverTime();

  // sprite state reset after removed
  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      position: {
        x: 100,
        y: 50,
        rotation: 10,
      },
      color: "#0095DD",
      radius: 10,
    },
  });
});

test("Can render simple game with sprites in landscape", () => {
  const { platform } = getTestPlatform({
    width: 500,
    height: 300,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 500,
    deviceHeight: 300,
  });

  const { initTextures } = replayCore(platform, TestGameWithSprites(gameProps));

  const { text } = (initTextures[1] as any).props;
  expect(text).toBe("this is landscape");
});

test("Can render simple game with sprites in portrait", () => {
  const { platform } = getTestPlatform({
    width: 300,
    height: 500,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 300,
    deviceHeight: 500,
  });

  const { initTextures } = replayCore(platform, TestGameWithSprites(gameProps));

  const { text } = (initTextures[1] as any).props;
  expect(text).toBe("this is portrait");
});

test("Can render simple game with sprites in XL landscape", () => {
  const { platform } = getTestPlatform({
    width: 500,
    height: 300,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 1500,
    deviceHeight: 900,
  });

  const { initTextures } = replayCore(platform, TestGameWithSprites(gameProps));

  const { text } = (initTextures[1] as any).props;
  expect(text).toBe("this is XL landscape");
});

test("Can render simple game with sprites in XL portrait", () => {
  const { platform } = getTestPlatform({
    width: 300,
    height: 500,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 900,
    deviceHeight: 1500,
  });

  const { initTextures } = replayCore(platform, TestGameWithSprites(gameProps));

  const { text } = (initTextures[1] as any).props;
  expect(text).toBe("this is XL portrait");
});

test("can log", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  mutableTestDevice.inputs.buttonPressed.log = true;
  getNextFrameTexturesOverTime();

  expect(logSpy).toBeCalledWith("Log Message");
});

test("can provide a random number", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const randomSpy = jest.spyOn(mutableTestDevice, "random");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  mutableTestDevice.inputs.buttonPressed.setRandom = true;
  getNextFrameTextures(1000 * (1 / 60) + 1);

  expect(logSpy).toBeCalledWith(0.5);
  expect(randomSpy).toBeCalledTimes(1);
});

test("supports timeout", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const timeoutSpy = jest.spyOn(mutableTestDevice, "timeout");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  mutableTestDevice.inputs.buttonPressed.startTimer = true;
  getNextFrameTextures(1000 * (1 / 60) + 1);

  expect(logSpy).toBeCalledWith("timeout complete");
  expect(timeoutSpy).toBeCalledTimes(2); // once in init
});

test("supports getting date now", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const setDateSpy = jest.spyOn(mutableTestDevice, "now");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  mutableTestDevice.inputs.buttonPressed.setDate = true;
  getNextFrameTextures(1000 * (1 / 60) + 1);

  expect(logSpy).toBeCalledWith("1996-01-17T03:24:00.000Z");
  expect(setDateSpy).toBeCalledTimes(1);
});

test("supports updateState", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  getNextFrameTexturesOverTime();
  expect(logSpy).toBeCalledWith("initialised");

  mutableTestDevice.inputs.buttonPressed.action = true;
  getNextFrameTexturesOverTime();
  getNextFrameTexturesOverTime(); // log called on state change in next loop

  expect(logSpy).toBeCalledWith("render time: 1996-01-17T03:24:00.000Z");
  expect(logSpy).toBeCalledWith("render time 2: 1996-01-17T03:24:00.000Z");
  expect(logSpy).toBeCalledWith("updateState from timeout in render");
});

test("updateState in loop will update state in next render", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  expect(initTextures[0].props.position!.x).toEqual(5);

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  mutableTestDevice.inputs.buttonPressed.move = true;
  mutableTestDevice.inputs.buttonPressed.moveWithUpdateState = true;

  const textures = getNextFrameTexturesOverTime();

  // An extra 5 was added in sync
  expect(textures[0].props.position!.x).toEqual(11);
});

test("supports playing audio", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const audio = mutableTestDevice.audio("filename");
  const audioSpy = {
    play: jest.spyOn(audio, "play"),
    getPosition: jest.spyOn(audio, "getPosition"),
    pause: jest.spyOn(audio, "pause"),
  };

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  mutableTestDevice.inputs.buttonPressed.sound.play = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith();

  mutableTestDevice.inputs.buttonPressed.sound.playFromPosition = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith(100);

  mutableTestDevice.inputs.buttonPressed.sound.playLoop = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith(0, true);

  mutableTestDevice.inputs.buttonPressed.sound.pause = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.pause).toBeCalledWith();

  mutableTestDevice.inputs.buttonPressed.sound.getPosition = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.getPosition).toBeCalledWith();
  expect(logSpy).toBeCalledWith(50);
});

test("supports network calls", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { network } = mutableTestDevice;
  const networkSpy = {
    get: jest.spyOn(network, "get"),
    post: jest.spyOn(network, "post"),
    put: jest.spyOn(network, "put"),
    delete: jest.spyOn(network, "delete"),
  };

  const { getNextFrameTextures } = replayCore(
    platform,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  mutableTestDevice.inputs.buttonPressed.network.get = true;
  getNextFrameTexturesOverTime();
  expect(networkSpy.get).toBeCalled();
  expect(logSpy).toBeCalledWith("GET-/test");

  mutableTestDevice.inputs.buttonPressed.network.put = true;
  getNextFrameTexturesOverTime();
  expect(networkSpy.put).toBeCalled();
  expect(logSpy).toBeCalledWith("PUT-/test-PUT_BODY");

  mutableTestDevice.inputs.buttonPressed.network.post = true;
  getNextFrameTexturesOverTime();
  expect(networkSpy.post).toBeCalled();
  expect(logSpy).toBeCalledWith("POST-/test-POST_BODY");

  mutableTestDevice.inputs.buttonPressed.network.delete = true;
  getNextFrameTexturesOverTime();
  expect(networkSpy.delete).toBeCalled();
  expect(logSpy).toBeCalledWith("DELETE-/test");
});

test("supports local storage", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  const { storage } = mutableTestDevice;
  const storageSpy = {
    getStore: jest.spyOn(storage, "getStore"),
    setStore: jest.spyOn(storage, "setStore"),
  };

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    LocalStorageGame(gameProps)
  );
  expect(storageSpy.getStore).toBeCalled();

  expect(initTextures).toEqual([
    {
      type: "text",
      props: {
        position: { rotation: 0, x: 0, y: 0 },
        text: "storage",
        color: "red",
      },
    },
  ]);

  getNextFrameTextures(1000 * (1 / 60) + 1);

  expect(storageSpy.setStore).toBeCalledWith({ text2: "new-val" });
});

test("can define various texture shapes", () => {
  expect(
    t.text({
      font: { name: "Arial", size: 12 },
      text: "Hello",
      color: "red",
      position: { x: 0, y: 0 },
    }).type
  ).toBe("text");

  expect(
    t.circle({
      radius: 5,
      color: "red",
      position: { x: 0, y: 0 },
    }).type
  ).toBe("circle");

  expect(
    t.rectangle({
      width: 5,
      height: 5,
      color: "red",
      position: { x: 0, y: 0 },
    }).type
  ).toBe("rectangle");

  expect(
    t.line({
      thickness: 5,
      color: "red",
      path: [
        [10, 10],
        [15, 10],
        [20, 20],
      ],
      position: { x: 0, y: 0 },
    }).type
  ).toBe("line");

  expect(
    t.image({
      fileName: "image.png",
      width: 20,
      height: 20,
      position: { x: 0, y: 0 },
    }).type
  ).toBe("image");
});

test("resolves position and rotation of deeply nested sprites", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  mutableTestDevice.inputs.buttonPressed.move = true;

  const { initTextures } = replayCore(platform, NestedSpriteGame(gameProps));

  expect(initTextures).toEqual([
    {
      type: "text",
      props: {
        position: {
          x: -10,
          y: 50,
          rotation: 45,
        },
        text: "nested",
        color: "black",
      },
    },
  ]);
});
