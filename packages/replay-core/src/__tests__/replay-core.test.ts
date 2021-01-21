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
  MaskGame,
  CallbackPropGame,
  NestedSpriteGame2,
  PureSpriteGame,
  pureSpriteAlwaysRendersFn,
  pureSpriteNeverRendersFn,
  pureSpriteConditionalRendersFn,
  waitFrame,
  GetStateGame,
  AssetsGame,
  DuplicateSpriteIdsGame,
} from "./utils";
import { SpriteTextures, NativeSpriteUtils } from "../sprite";
import { TextTexture, CircleTexture, RectangleTexture } from "../t";

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
    return getNextFrameTextures(time, jest.fn());
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
      mask: null,
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
          mask: null,
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
      mask: null,
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
      mask: null,
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
    return getNextFrameTextures(time, jest.fn());
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
      mask: null,
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
          mask: null,
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
      mask: null,
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
      mask: null,
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
    return getNextFrameTextures(time, jest.fn());
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
  getNextFrameTextures(1000 * (1 / 60) + 1, jest.fn());

  expect(logSpy).toBeCalledWith(0.5);
  expect(randomSpy).toBeCalledTimes(1);
});

test("supports timer", async () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const startSpy = jest.spyOn(mutableTestDevice.timer, "start");
  const cancelSpy = jest.spyOn(mutableTestDevice.timer, "cancel");
  const pauseSpy = jest.spyOn(mutableTestDevice.timer, "pause");
  const resumeSpy = jest.spyOn(mutableTestDevice.timer, "resume");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  mutableTestDevice.inputs.buttonPressed.timer.start = true;
  getNextFrameTexturesOverTime();

  await waitFrame();

  expect(logSpy).toBeCalledWith("timeout complete");
  expect(startSpy).toBeCalledTimes(2); // once in init

  mutableTestDevice.inputs.buttonPressed.timer.start = false;
  mutableTestDevice.inputs.buttonPressed.timer.pause = "abc";
  getNextFrameTexturesOverTime();
  expect(pauseSpy).toBeCalledTimes(1);
  expect(pauseSpy).toBeCalledWith("abc");

  mutableTestDevice.inputs.buttonPressed.timer.pause = "";
  mutableTestDevice.inputs.buttonPressed.timer.resume = "abc";
  getNextFrameTexturesOverTime();
  expect(resumeSpy).toBeCalledTimes(1);
  expect(resumeSpy).toBeCalledWith("abc");

  mutableTestDevice.inputs.buttonPressed.timer.resume = "";
  mutableTestDevice.inputs.buttonPressed.timer.cancel = "abc";
  getNextFrameTexturesOverTime();
  expect(cancelSpy).toBeCalledTimes(1);
  expect(cancelSpy).toBeCalledWith("abc");
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
  getNextFrameTextures(1000 * (1 / 60) + 1, jest.fn());

  expect(logSpy).toBeCalledWith("1996-01-17T03:24:00.000Z");
  expect(setDateSpy).toBeCalledTimes(1);
});

test("supports updateState", async () => {
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
    return getNextFrameTextures(time, jest.fn());
  };

  await waitFrame();

  getNextFrameTexturesOverTime();
  expect(logSpy).toBeCalledWith("initialised");

  mutableTestDevice.inputs.buttonPressed.action = true;
  getNextFrameTexturesOverTime();
  await waitFrame();
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
    return getNextFrameTextures(time, jest.fn());
  };

  mutableTestDevice.inputs.buttonPressed.move = true;
  mutableTestDevice.inputs.buttonPressed.moveWithUpdateState = true;

  const spriteTextures = getNextFrameTexturesOverTime();

  // An extra 5 was added in sync
  expect((spriteTextures.textures[0] as CircleTexture).props.x).toEqual(11);
});

test("supports getState", async () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  mutableTestDevice.inputs.buttonPressed.move = true;

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  getNextFrameTexturesOverTime();
  await waitFrame();

  expect(logSpy).toBeCalledWith("getState position: 6");
});

test("getState will throw error if called synchronously", () => {
  const { platform } = getTestPlatform();

  expect(() =>
    replayCore(platform, nativeSpriteSettings, GetStateGame(gameProps))
  ).toThrowError("Cannot call getState synchronously in init");
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
    return getNextFrameTextures(time, jest.fn());
  };

  mutableTestDevice.inputs.buttonPressed.sound.play = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith();

  mutableTestDevice.inputs.buttonPressed.sound.playFromPosition = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith(100);

  mutableTestDevice.inputs.buttonPressed.sound.playLoop = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith({ fromPosition: 0, loop: true });

  mutableTestDevice.inputs.buttonPressed.sound.playOverwrite = true;
  getNextFrameTexturesOverTime();
  expect(audioSpy.play).toBeCalledWith({ overwrite: true });

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
    return getNextFrameTextures(time, jest.fn());
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
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        anchorX: 0,
        anchorY: 0,
        scaleX: 1,
        scaleY: 1,
        mask: null,
        font: undefined,
      },
    },
  ]);

  getNextFrameTextures(1000 * (1 / 60) + 1, jest.fn());

  expect(storageSpy.setStore).toBeCalledWith({ text2: "new-val" });
});

test("supports alerts", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { alert } = mutableTestDevice;
  const alertSpy = {
    ok: jest.spyOn(alert, "ok"),
    okCancel: jest.spyOn(alert, "okCancel"),
  };

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  mutableTestDevice.inputs.buttonPressed.alert.ok = true;
  getNextFrameTexturesOverTime();
  expect(alertSpy.ok).toBeCalled();
  expect(logSpy).toBeCalledWith("Hit ok");

  mutableTestDevice.inputs.buttonPressed.alert.okCancel = true;
  getNextFrameTexturesOverTime();
  expect(alertSpy.okCancel).toBeCalled();
  expect(logSpy).toBeCalledWith("Was ok: true");
});

test("can copy to clipboard", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { clipboard } = mutableTestDevice;
  const clipboardSpy = {
    copy: jest.spyOn(clipboard, "copy"),
  };

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  expect(clipboardSpy.copy).not.toHaveBeenCalled();

  mutableTestDevice.inputs.buttonPressed.clipboard.copyMessage =
    "Hello clipboard";
  getNextFrameTexturesOverTime();
  expect(clipboardSpy.copy).toBeCalledWith(
    "Hello clipboard",
    expect.any(Function)
  );
  expect(logSpy).toBeCalledWith("Copied");

  mutableTestDevice.inputs.buttonPressed.clipboard.copyMessage = "Error";
  getNextFrameTexturesOverTime();
  expect(clipboardSpy.copy).toBeCalledWith("Error", expect.any(Function));
  expect(logSpy).toBeCalledWith("Error copying: !");
});

test("can define various texture shapes", () => {
  expect(
    t.text({
      font: { family: "Arial", size: 12 },
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

test("supports masks on Sprites", () => {
  const { initTextures } = replayCore(
    getTestPlatform().platform,
    nativeSpriteSettings,
    MaskGame(gameProps)
  );

  const initSpriteTextures = initTextures.textures[0] as SpriteTextures;

  expect(initSpriteTextures.baseProps.mask).toEqual({
    type: "circleMask",
    x: 5,
    y: -5,
    radius: 10,
  });

  const circleMaskRect = initSpriteTextures.textures[0] as RectangleTexture;
  const rectMaskRect = initSpriteTextures.textures[1] as RectangleTexture;
  const lineMaskRect = initSpriteTextures.textures[2] as RectangleTexture;

  expect(circleMaskRect.props.mask).toEqual({
    type: "circleMask",
    x: 10,
    y: 0,
    radius: 5,
  });
  expect(rectMaskRect.props.mask).toEqual({
    type: "rectangleMask",
    x: 0,
    y: 10,
    width: 5,
    height: 5,
  });
  expect(lineMaskRect.props.mask).toEqual({
    type: "lineMask",
    path: [
      [0, 0],
      [10, 0],
      [10, 10],
    ],
  });
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
      color: "black",
      opacity: 0.8, // texture opacity is multiplied on platform side
      anchorX: 0,
      anchorY: 0,
      scaleX: 1,
      scaleY: 1,
      mask: null,
      font: undefined,
    },
  });

  // Pointer positions global

  expect(logSpy).toBeCalledWith("NestedSpriteGame x: 50, y: 50");
  expect(logSpy).toBeCalledWith("NestedFirstSprite x: 30, y: -30");
  expect(logSpy).toBeCalledWith("NestedSecondSprite x: -50, y: 20");
});

test("nested sprites and input position with scale", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  mutableTestDevice.inputs.x = 10;
  mutableTestDevice.inputs.y = 10;

  replayCore(platform, nativeSpriteSettings, NestedSpriteGame2(gameProps));

  expect(logSpy).toBeCalledWith("NestedFirstSprite2 x: -20, y: -10");
});

test("loop and render order for callback prop change on low render FPS", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const resetInputs = jest.fn();

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    CallbackPropGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    // note time skips 3 frames here
    time += 1000 * (3 / 60);
    return getNextFrameTextures(time, resetInputs);
  };

  expect(mutableTestDevice.log).not.toHaveBeenCalled();

  getNextFrameTexturesOverTime();
  expect(mutableTestDevice.log).toBeCalledTimes(3); // loop called 3 times
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(1, 1);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(2, 2);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(3, 3);
  expect(resetInputs).toBeCalledTimes(3);

  getNextFrameTexturesOverTime();
  expect(mutableTestDevice.log).toBeCalledTimes(6);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(4, 4);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(5, 5);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(6, 6);
  expect(resetInputs).toBeCalledTimes(6);

  getNextFrameTexturesOverTime();
  expect(mutableTestDevice.log).toBeCalledTimes(9);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(7, 7);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(8, 8);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(9, 9);
  expect(resetInputs).toBeCalledTimes(9);
});

test("can preload and clear file assets", async () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const resetInputs = jest.fn();

  const { initTextures, getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    AssetsGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, resetInputs);
  };

  expect(initTextures.textures.length).toBe(1);
  expect((initTextures.textures[0] as TextTexture).props.text).toBe("Loading");

  expect(mutableTestDevice.assetUtils.loadAudioFile).toHaveBeenCalledTimes(1);
  expect(mutableTestDevice.assetUtils.loadAudioFile).toHaveBeenCalledWith(
    "game.mp3"
  );
  expect(mutableTestDevice.assetUtils.loadImageFile).toHaveBeenCalledTimes(1);
  expect(mutableTestDevice.assetUtils.loadImageFile).toHaveBeenCalledWith(
    "game.png"
  );

  expect(mutableTestDevice.assetUtils.audioElements).toEqual({
    "game.mp3": {
      globalSpriteIds: new Set(["Game"]),
      // Loading Promise
      data: expect.not.stringMatching("audioData"),
    },
  });
  expect(mutableTestDevice.assetUtils.imageElements).toEqual({
    "game.png": {
      globalSpriteIds: new Set(["Game"]),
      // Loading Promise
      data: expect.not.stringMatching("imageData"),
    },
  });

  // Wait for callback on next frame
  await waitFrame();

  expect(mutableTestDevice.assetUtils.audioElements).toEqual({
    "game.mp3": {
      globalSpriteIds: new Set(["Game"]),
      data: "audioData",
    },
  });
  expect(mutableTestDevice.assetUtils.imageElements).toEqual({
    "game.png": {
      globalSpriteIds: new Set(["Game"]),
      data: "imageData",
    },
  });

  const textures = getNextFrameTexturesOverTime();

  // No longer loading
  expect((textures.textures[0] as any).type).not.toBe("text");

  // Sprite & nested sprite start loading - but no duplicate parallel loads
  // (called 2 not 3 times)
  expect(mutableTestDevice.assetUtils.loadImageFile).toHaveBeenCalledTimes(2);

  // Wait for sprites to load
  await waitFrame();

  expect(mutableTestDevice.assetUtils.imageElements).toEqual({
    "game.png": {
      globalSpriteIds: new Set(["Game"]),
      data: "imageData",
    },
    "a.png": {
      globalSpriteIds: new Set([
        "Game--Sprite1",
        "Game--Sprite1--NestedSprite",
      ]),
      data: "imageData",
    },
  });

  // Unmount Sprites
  mutableTestDevice.inputs.buttonPressed.show = false;
  getNextFrameTexturesOverTime();

  // Need resolved promise to be called
  await waitFrame();

  // a.png removed
  expect("a.png" in mutableTestDevice.assetUtils.imageElements).toBe(false);
  expect(mutableTestDevice.assetUtils.cleanupImageFile).toHaveBeenCalledTimes(
    1
  );
});

test("Sprite unmounted before it loads", async () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const resetInputs = jest.fn();

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    AssetsGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, resetInputs);
  };

  // Load initial assets
  await waitFrame();
  getNextFrameTexturesOverTime();

  // Sprites have started loading
  expect(mutableTestDevice.assetUtils.loadImageFile).toHaveBeenCalledTimes(2);

  // Unmount Sprites before they finish loading
  mutableTestDevice.inputs.buttonPressed.show = false;
  getNextFrameTexturesOverTime();

  // Wait for promises to load
  await waitFrame();

  // Image not in memory
  expect("a.png" in mutableTestDevice.assetUtils.imageElements).toBe(false);
});

test("throws error on duplicate Sprites", () => {
  const { platform } = getTestPlatform();

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    DuplicateSpriteIdsGame(gameProps)
  );

  expect(() => {
    getNextFrameTextures(1000 / 60, jest.fn());
  }).toThrowError("Duplicate Sprite id TestSprite");
});

test("supports Pure Sprites", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  const { getNextFrameTextures } = replayCore(
    platform,
    nativeSpriteSettings,
    PureSpriteGame(gameProps)
  );

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(1);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(1);

  getNextFrameTexturesOverTime();

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(2);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(1);

  mutableTestDevice.inputs.buttonPressed.show = false;
  getNextFrameTexturesOverTime();

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(3);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(2);
});

test("supports Native Sprites", () => {
  const { platform, mutableTestDevice } = getTestPlatform();

  const mutableNativeSpriteUtils: NativeSpriteUtils = {
    didResize: false,
    scale: 3,
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

  let time = 1;
  const getNextFrameTexturesOverTime = () => {
    time += 1000 * (1 / 60);
    return getNextFrameTextures(time, jest.fn());
  };

  getNextFrameTexturesOverTime();

  // test loop and didResize doubles width
  mutableNativeSpriteUtils.didResize = true;
  getNextFrameTexturesOverTime();
  expect(widgetState.width).toBe(300); // scale x3
  mutableNativeSpriteUtils.didResize = false;

  // test getState and updateState in callback
  widgetCallback();
  getNextFrameTexturesOverTime();
  expect(widgetState.x).toBe(20);

  // test cleanup
  mutableTestDevice.inputs.x = 100;
  getNextFrameTexturesOverTime();
  expect(widgetState.text).toBe("");
});
