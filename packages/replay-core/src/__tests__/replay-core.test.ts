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
  nativeSpriteSettings,
  NativeSpriteGame,
  MyWidgetImplementation,
  widgetState,
  widgetCallback,
} from "./utils";
import { SpriteTextures, NativeSpriteUtils } from "../sprite";
import { TextTexture, CircleTexture } from "../t";

test("can render simple game and getNextFrameTextures", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const platformSpy = {
    getDevice: jest.spyOn(platform, "getGetDevice"),
  };

  mutableTestDevice.inputs.buttonPressed.move = true;

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  expect(platformSpy.getDevice).toBeCalledTimes(1);
  expect(initTextures).toEqual({
    id: "Game",
    baseProps: {
      opacity: 1,
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      anchorX: 0,
      anchorY: 0,
    },
    textures: [
      {
        type: "circle",
        props: {
          x: 5,
          y: 50,
          opacity: 1,
          rotation: 0,
          radius: 10,
          color: "#0095DD",
          scaleX: 5,
          scaleY: 1,
          anchorX: 0,
          anchorY: 0,
        },
      },
    ],
  });

  let { textures } = getNextFrameTexturesOverTime();

  expect(platformSpy.getDevice).toBeCalledTimes(2);
  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      x: 6,
      y: 50,
      rotation: 0,
      opacity: 1,
      radius: 10,
      color: "#0095DD",
      scaleX: 5,
      scaleY: 1,
      anchorX: 0,
      anchorY: 0,
    },
  });

  mutableTestDevice.inputs.buttonPressed.move = true;
  textures = getNextFrameTexturesOverTime().textures;

  expect(platformSpy.getDevice).toBeCalledTimes(3);
  expect(textures[0]).toEqual({
    type: "circle",
    props: {
      x: 7,
      y: 50,
      rotation: 0,
      opacity: 1,
      radius: 10,
      color: "#0095DD",
      scaleX: 5,
      scaleY: 1,
      anchorX: 0,
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
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  expect(platformSpy.getDevice).toBeCalledTimes(1);

  const initSpriteTextures = initTextures.textures[0] as SpriteTextures;
  expect(initSpriteTextures).toEqual({
    id: "test",
    baseProps: {
      anchorX: 0,
      anchorY: 1,
      opacity: 0.5,
      rotation: 0,
      scaleX: 5,
      scaleY: 1,
      x: 50,
      y: 0,
    },
    textures: [
      {
        type: "circle",
        props: {
          x: 50,
          y: 50,
          rotation: 10,
          color: "#0095DD",
          radius: 10,
          opacity: 1,
          anchorX: 0,
          anchorY: 0,
          scaleX: 1,
          scaleY: 1,
        },
      },
    ],
  });

  let { textures } = getNextFrameTexturesOverTime();
  let spriteTextures = (textures[0] as SpriteTextures).textures;

  expect(platformSpy.getDevice).toBeCalledTimes(2);

  expect(spriteTextures[0]).toEqual({
    type: "circle",
    props: {
      x: 51,
      y: 50,
      rotation: 10,
      color: "#0095DD",
      radius: 10,
      opacity: 1,
      anchorX: 0,
      anchorY: 0,
      scaleX: 1,
      scaleY: 1,
    },
  });

  mutableTestDevice.inputs.buttonPressed.show = false;

  textures = getNextFrameTexturesOverTime().textures;

  expect(textures).toEqual([]);

  mutableTestDevice.inputs.buttonPressed.show = true;

  textures = getNextFrameTexturesOverTime().textures;
  spriteTextures = (textures[0] as SpriteTextures).textures;

  // sprite state reset after removed
  expect(spriteTextures[0]).toEqual({
    type: "circle",
    props: {
      x: 50,
      y: 50,
      rotation: 10,
      color: "#0095DD",
      radius: 10,
      opacity: 1,
      anchorX: 0,
      anchorY: 0,
      scaleX: 1,
      scaleY: 1,
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

  const { initTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  const { text } = ((initTextures.textures[1] as SpriteTextures)
    .textures[0] as TextTexture).props;
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

  const { initTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  const { text } = ((initTextures.textures[1] as SpriteTextures)
    .textures[0] as TextTexture).props;
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

  const { initTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  const { text } = ((initTextures.textures[1] as SpriteTextures)
    .textures[0] as TextTexture).props;
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

  const { initTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  const { text } = ((initTextures.textures[1] as SpriteTextures)
    .textures[0] as TextTexture).props;
  expect(text).toBe("this is XL portrait");
});

test("can log", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  expect((initTextures.textures[0] as CircleTexture).props.x).toEqual(5);

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time);
  };

  mutableTestDevice.inputs.buttonPressed.move = true;
  mutableTestDevice.inputs.buttonPressed.moveWithUpdateState = true;

  const spriteTextures = getNextFrameTexturesOverTime();

  // An extra 5 was added in sync
  expect((spriteTextures.textures[0] as CircleTexture).props.x).toEqual(11);
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
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
    nativeSpriteSettings,
    LocalStorageGame(gameProps)
  );
  expect(storageSpy.getStore).toBeCalled();

  expect(initTextures.textures).toEqual([
    {
      type: "text",
      props: {
        text: "storage",
        color: "red",
        align: "center",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        anchorX: 0,
        anchorY: 0,
        scaleX: 1,
        scaleY: 1,
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
    }).type
  ).toBe("text");

  expect(
    t.circle({
      radius: 5,
      color: "red",
      x: 0,
    }).type
  ).toBe("circle");

  expect(
    t.rectangle({
      width: 5,
      height: 5,
      color: "red",
      x: 0,
      y: 0,
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
    }).type
  ).toBe("line");

  expect(
    t.image({
      fileName: "image.png",
      width: 20,
      height: 20,
    }).type
  ).toBe("image");
});

test("deeply nested sprites and input position", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  mutableTestDevice.inputs.x = 50;
  mutableTestDevice.inputs.y = 50;

  const { initTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    NestedSpriteGame(gameProps)
  );

  // Sprite positions local

  const nestedSpriteGame = initTextures;
  const nestedFirstSprite = initTextures.textures[0] as SpriteTextures;
  const nestedSecondSprite = nestedFirstSprite.textures[0] as SpriteTextures;
  const textTexture = nestedSecondSprite.textures[0] as TextTexture;

  expect(nestedSpriteGame.id).toBe("Game");

  expect(nestedFirstSprite.id).toBe("first");
  expect(nestedFirstSprite.baseProps.x).toBe(20);
  expect(nestedFirstSprite.baseProps.y).toBe(20);
  expect(nestedFirstSprite.baseProps.rotation).toBe(-90);
  expect(nestedFirstSprite.baseProps.opacity).toBe(0.8);

  expect(nestedSecondSprite.id).toBe("second");
  expect(nestedSecondSprite.baseProps.x).toBe(50);
  expect(nestedSecondSprite.baseProps.y).toBe(20);
  expect(nestedSecondSprite.baseProps.rotation).toBe(-90);
  expect(nestedSecondSprite.baseProps.opacity).toBeCloseTo(0.64);

  expect(textTexture).toEqual({
    type: "text",
    props: {
      x: 10,
      y: 20,
      rotation: 180,
      text: "nested",
      align: "center",
      color: "black",
      opacity: 0.8, // texture opacity is multiplied on platform side
      anchorX: 0,
      anchorY: 0,
      scaleX: 1,
      scaleY: 1,
    },
  });

  // Pointer positions global

  expect(logSpy).toBeCalledWith("NestedSpriteGame x: 50, y: 50");
  expect(logSpy).toBeCalledWith("NestedFirstSprite x: 30, y: -30");
  expect(logSpy).toBeCalledWith("NestedSecondSprite x: -50, y: 20");
});

test("supports Native Sprites", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  const mutableNativeSpriteUtils: NativeSpriteUtils = {
    didResize: false,
    gameXToPlatformX: (x) => x + 10,
    gameYToPlatformY: (y) => y - 10,
  };

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    {
      nativeSpriteUtils: mutableNativeSpriteUtils,
      nativeSpriteMap: { MyWidget: MyWidgetImplementation },
    },
    NativeSpriteGame(gameProps)
  );

  // No Textures rendered
  expect((initTextures.textures[0] as SpriteTextures).textures.length).toBe(0);

  expect(widgetState).toEqual({
    // test props
    text: "hello",
    // test gameXToPlatformX
    x: 10,
    // test gameYToPlatformY
    y: -10,
    // test parentGlobalId
    globalId: "Game--nested--widget",
    width: 100,
  });

  getNextFrameTextures(1000 * (1 / 60) + 1);

  // test loop and didResize doubles width
  mutableNativeSpriteUtils.didResize = true;
  getNextFrameTextures(1000 * (1 / 60) + 1);
  expect(widgetState.width).toBe(200);
  mutableNativeSpriteUtils.didResize = false;

  // test getState and updateState in callback
  widgetCallback();
  getNextFrameTextures(1000 * (1 / 60) + 1);
  expect(widgetState.x).toBe(20);

  // test cleanup
  mutableTestDevice.inputs.x = 100;
  getNextFrameTextures(1000 * (1 / 60) + 1);
  expect(widgetState.text).toBe("");
});
