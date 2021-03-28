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
import { NativeSpriteUtils } from "../sprite";
import { TextTexture, CircleTexture } from "../t";

test("can render simple game and runNextFrame", () => {
  const { platform, mutInputs, textures } = getTestPlatform();
  const platformSpy = {
    getInputs: jest.spyOn(platform, "getInputs"),
  };

  mutInputs.ref.buttonPressed.move = true;

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  expect(platformSpy.getInputs).toBeCalledTimes(0);
  expect(textures).toEqual([
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
  ]);

  nextFrame();

  expect(platformSpy.getInputs).toBeCalledTimes(1);
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

  mutInputs.ref.buttonPressed.move = true;
  nextFrame();

  expect(platformSpy.getInputs).toBeCalledTimes(2);
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
  const { platform, mutInputs, textures } = getTestPlatform();
  const platformSpy = {
    getInputs: jest.spyOn(platform, "getInputs"),
  };

  mutInputs.ref.buttonPressed.move = true;

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    TestGameWithSprites(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  expect(platformSpy.getInputs).toBeCalledTimes(1);

  expect(textures[0]).toEqual({
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

  nextFrame();

  expect(platformSpy.getInputs).toBeCalledTimes(2);

  expect(textures[0]).toEqual({
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

  mutInputs.ref.buttonPressed.show = false;

  nextFrame();

  expect(textures).toEqual([]);

  mutInputs.ref.buttonPressed.show = true;

  nextFrame();

  // sprite state reset after removed
  expect(textures[0]).toEqual({
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
  const { platform, textures } = getTestPlatform({
    width: 500,
    height: 300,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 500,
    deviceHeight: 300,
  });

  replayCore(platform, nativeSpriteSettings, TestGameWithSprites(gameProps));

  const { text } = (textures[1] as TextTexture).props;
  expect(text).toBe("this is landscape");
});

test("Can render simple game with sprites in portrait", () => {
  const { platform, textures } = getTestPlatform({
    width: 300,
    height: 500,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 300,
    deviceHeight: 500,
  });

  replayCore(platform, nativeSpriteSettings, TestGameWithSprites(gameProps));

  const { text } = (textures[1] as TextTexture).props;
  expect(text).toBe("this is portrait");
});

test("Can render simple game with sprites in XL landscape", () => {
  const { platform, textures } = getTestPlatform({
    width: 500,
    height: 300,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 1500,
    deviceHeight: 900,
  });

  replayCore(platform, nativeSpriteSettings, TestGameWithSprites(gameProps));

  const { text } = (textures[1] as TextTexture).props;
  expect(text).toBe("this is XL landscape");
});

test("Can render simple game with sprites in XL portrait", () => {
  const { platform, textures } = getTestPlatform({
    width: 300,
    height: 500,
    widthMargin: 0,
    heightMargin: 0,
    deviceWidth: 900,
    deviceHeight: 1500,
  });

  replayCore(platform, nativeSpriteSettings, TestGameWithSprites(gameProps));

  const { text } = (textures[1] as TextTexture).props;
  expect(text).toBe("this is XL portrait");
});

test("can log", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.log = true;
  nextFrame();

  expect(logSpy).toBeCalledWith("Log Message");
});

test("can provide a random number", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const randomSpy = jest.spyOn(mutableTestDevice, "random");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  mutInputs.ref.buttonPressed.setRandom = true;
  runNextFrame(1000 * (1 / 60) + 1, jest.fn());

  expect(logSpy).toBeCalledWith(0.5);
  expect(randomSpy).toBeCalledTimes(1);
});

test("supports timer", async () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const startSpy = jest.spyOn(mutableTestDevice.timer, "start");
  const cancelSpy = jest.spyOn(mutableTestDevice.timer, "cancel");
  const pauseSpy = jest.spyOn(mutableTestDevice.timer, "pause");
  const resumeSpy = jest.spyOn(mutableTestDevice.timer, "resume");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.timer.start = true;
  nextFrame();

  await waitFrame();

  expect(logSpy).toBeCalledWith("timeout complete");
  expect(startSpy).toBeCalledTimes(2); // once in init

  mutInputs.ref.buttonPressed.timer.start = false;
  mutInputs.ref.buttonPressed.timer.pause = "abc";
  nextFrame();
  expect(pauseSpy).toBeCalledTimes(1);
  expect(pauseSpy).toBeCalledWith("abc");

  mutInputs.ref.buttonPressed.timer.pause = "";
  mutInputs.ref.buttonPressed.timer.resume = "abc";
  nextFrame();
  expect(resumeSpy).toBeCalledTimes(1);
  expect(resumeSpy).toBeCalledWith("abc");

  mutInputs.ref.buttonPressed.timer.resume = "";
  mutInputs.ref.buttonPressed.timer.cancel = "abc";
  nextFrame();
  expect(cancelSpy).toBeCalledTimes(1);
  expect(cancelSpy).toBeCalledWith("abc");
});

test("supports getting date now", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const setDateSpy = jest.spyOn(mutableTestDevice, "now");
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  mutInputs.ref.buttonPressed.setDate = true;
  runNextFrame(1000 * (1 / 60) + 1, jest.fn());

  expect(logSpy).toBeCalledWith("1996-01-17T03:24:00.000Z");
  expect(setDateSpy).toBeCalledTimes(1);
});

test("supports updateState", async () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  await waitFrame();

  nextFrame();
  expect(logSpy).toBeCalledWith("initialised");

  mutInputs.ref.buttonPressed.action = true;
  nextFrame();
  await waitFrame();
  nextFrame(); // log called on state change in next loop

  expect(logSpy).toBeCalledWith("render time: 1996-01-17T03:24:00.000Z");
  expect(logSpy).toBeCalledWith("render time 2: 1996-01-17T03:24:00.000Z");
  expect(logSpy).toBeCalledWith("updateState from timeout in render");
});

test("updateState in loop will update state in next render", () => {
  const { platform, mutInputs, textures } = getTestPlatform();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  expect((textures[0] as CircleTexture).props.x).toEqual(5);

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.move = true;
  mutInputs.ref.buttonPressed.moveWithUpdateState = true;

  nextFrame();

  // An extra 5 was added in sync
  expect((textures[0] as CircleTexture).props.x).toEqual(11);
});

test("can call updateState within an updateState", async () => {
  const {
    platform,
    mutableTestDevice,
    mutInputs,
    textures,
  } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  mutInputs.ref.buttonPressed.action = true;

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  expect((textures[1] as TextTexture).props.text).toBe(
    "updateState Counter: 0"
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  nextFrame();

  expect((textures[1] as TextTexture).props.text).toBe(
    "updateState Counter: 3"
  );

  expect(logSpy).toBeCalledWith("First updateState counter val: 0");
  expect(logSpy).toBeCalledWith("Second updateState counter val: 1");
  expect(logSpy).toBeCalledWith("Third updateState counter val: 2");
});

test("supports getState", async () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  mutInputs.ref.buttonPressed.move = true;

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  nextFrame();
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
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const audio = mutableTestDevice.audio("filename");
  const audioSpy = {
    play: jest.spyOn(audio, "play"),
    getPosition: jest.spyOn(audio, "getPosition"),
    pause: jest.spyOn(audio, "pause"),
    getVolume: jest.spyOn(audio, "getVolume"),
    setVolume: jest.spyOn(audio, "setVolume"),
    getStatus: jest.spyOn(audio, "getStatus"),
    getDuration: jest.spyOn(audio, "getDuration"),
  };

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.sound.play = true;
  nextFrame();
  expect(audioSpy.play).toBeCalledWith();

  mutInputs.ref.buttonPressed.sound.playFromPosition = true;
  nextFrame();
  expect(audioSpy.play).toBeCalledWith(100);

  mutInputs.ref.buttonPressed.sound.playLoop = true;
  nextFrame();
  expect(audioSpy.play).toBeCalledWith({ fromPosition: 0, loop: true });

  mutInputs.ref.buttonPressed.sound.playOverwrite = true;
  nextFrame();
  expect(audioSpy.play).toBeCalledWith({ overwrite: true });

  mutInputs.ref.buttonPressed.sound.pause = true;
  nextFrame();
  expect(audioSpy.pause).toBeCalledWith();

  mutInputs.ref.buttonPressed.sound.getPosition = true;
  nextFrame();
  expect(audioSpy.getPosition).toBeCalledWith();
  expect(logSpy).toBeCalledWith(50);

  mutInputs.ref.buttonPressed.sound.getVolume = true;
  nextFrame();
  expect(audioSpy.getVolume).toBeCalledWith();
  expect(logSpy).toBeCalledWith(1);

  mutInputs.ref.buttonPressed.sound.setVolume = true;
  nextFrame();
  expect(audioSpy.setVolume).toBeCalledWith(1);

  mutInputs.ref.buttonPressed.sound.getStatus = true;
  nextFrame();
  expect(audioSpy.getStatus).toBeCalledWith();
  expect(logSpy).toBeCalledWith("playing");

  mutInputs.ref.buttonPressed.sound.getDuration = true;
  nextFrame();
  expect(audioSpy.getDuration).toBeCalledWith();
  expect(logSpy).toBeCalledWith(100);
});

test("supports network calls", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { network } = mutableTestDevice;
  const networkSpy = {
    get: jest.spyOn(network, "get"),
    post: jest.spyOn(network, "post"),
    put: jest.spyOn(network, "put"),
    delete: jest.spyOn(network, "delete"),
  };

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.network.get = true;
  nextFrame();
  expect(networkSpy.get).toBeCalled();
  expect(logSpy).toBeCalledWith("GET-/test");

  mutInputs.ref.buttonPressed.network.put = true;
  nextFrame();
  expect(networkSpy.put).toBeCalled();
  expect(logSpy).toBeCalledWith("PUT-/test-PUT_BODY");

  mutInputs.ref.buttonPressed.network.post = true;
  nextFrame();
  expect(networkSpy.post).toBeCalled();
  expect(logSpy).toBeCalledWith("POST-/test-POST_BODY");

  mutInputs.ref.buttonPressed.network.delete = true;
  nextFrame();
  expect(networkSpy.delete).toBeCalled();
  expect(logSpy).toBeCalledWith("DELETE-/test");
});

test("supports local storage", async () => {
  const { platform, mutableTestDevice, textures } = getTestPlatform();

  const { storage } = mutableTestDevice;
  const storageSpy = {
    getItem: jest.spyOn(storage, "getItem"),
    setItem: jest.spyOn(storage, "setItem"),
  };

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    LocalStorageGame(gameProps)
  );
  expect(storageSpy.getItem).toBeCalledWith("text1");
  expect(storageSpy.getItem).toBeCalledWith("text2");

  expect(textures).toEqual([]);

  // Wait for promises to resolve
  await waitFrame();

  runNextFrame(1000 * (1 / 60) + 1, jest.fn());

  expect(textures).toEqual([
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
    {
      type: "text",
      props: {
        text: "storage",
        color: "blue",
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        anchorX: 0,
        anchorY: 0,
        scaleX: 1,
        scaleY: 1,
        mask: null,
      },
    },
  ]);

  expect(storageSpy.setItem).toBeCalledWith("text2", "new-val");
});

test("supports alerts", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { alert } = mutableTestDevice;
  const alertSpy = {
    ok: jest.spyOn(alert, "ok"),
    okCancel: jest.spyOn(alert, "okCancel"),
  };

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  mutInputs.ref.buttonPressed.alert.ok = true;
  nextFrame();
  expect(alertSpy.ok).toBeCalled();
  expect(logSpy).toBeCalledWith("Hit ok");

  mutInputs.ref.buttonPressed.alert.okCancel = true;
  nextFrame();
  expect(alertSpy.okCancel).toBeCalled();
  expect(logSpy).toBeCalledWith("Was ok: true");
});

test("can copy to clipboard", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  const { clipboard } = mutableTestDevice;
  const clipboardSpy = {
    copy: jest.spyOn(clipboard, "copy"),
  };

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    FullTestGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  expect(clipboardSpy.copy).not.toHaveBeenCalled();

  mutInputs.ref.buttonPressed.clipboard.copyMessage = "Hello clipboard";
  nextFrame();
  expect(clipboardSpy.copy).toBeCalledWith(
    "Hello clipboard",
    expect.any(Function)
  );
  expect(logSpy).toBeCalledWith("Copied");

  mutInputs.ref.buttonPressed.clipboard.copyMessage = "Error";
  nextFrame();
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
  const { platform, masks } = getTestPlatform();
  replayCore(platform, nativeSpriteSettings, MaskGame(gameProps));

  expect(masks[0]).toEqual({
    type: "circleMask",
    x: 5,
    y: -5,
    radius: 10,
  });

  const circleMask = masks[1];
  const rectMask = masks[2];
  const lineMask = masks[3];

  expect(circleMask).toEqual({
    type: "circleMask",
    x: 10,
    y: 0,
    radius: 5,
  });
  expect(rectMask).toEqual({
    type: "rectangleMask",
    x: 0,
    y: 10,
    width: 5,
    height: 5,
  });
  expect(lineMask).toEqual({
    type: "lineMask",
    path: [
      [0, 0],
      [10, 0],
      [10, 10],
    ],
  });
});

test("deeply nested input position", () => {
  // Note: deeply nested sprite positions are handled by the platforms (there's
  // a test case for this in replay-test)

  const {
    platform,
    mutableTestDevice,
    mutInputs,
    textures,
  } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  mutInputs.ref.x = 50;
  mutInputs.ref.y = 50;

  replayCore(platform, nativeSpriteSettings, NestedSpriteGame(gameProps));

  // Sprite positions local

  const nested = textures[0];

  // These props are local to sprite and calculated on platform side
  expect(nested.props.x).toBe(10);
  expect(nested.props.y).toBe(20);
  expect(nested.props.rotation).toBe(180);
  expect(nested.props.opacity).toBe(0.8);

  // Pointer positions global

  expect(logSpy).toBeCalledWith("NestedSpriteGame x: 50, y: 50");
  expect(logSpy).toBeCalledWith("NestedFirstSprite x: 30, y: -30");
  expect(logSpy).toBeCalledWith("NestedSecondSprite x: -50, y: 20");
});

test("nested sprites and input position with scale", () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const logSpy = jest.spyOn(mutableTestDevice, "log");

  mutInputs.ref.x = 10;
  mutInputs.ref.y = 10;

  replayCore(platform, nativeSpriteSettings, NestedSpriteGame2(gameProps));

  expect(logSpy).toBeCalledWith("NestedFirstSprite2 x: -20, y: -10");
});

test("loop and render order for callback prop change on low render FPS", () => {
  const { platform, mutableTestDevice } = getTestPlatform();
  const resetInputs = jest.fn();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    CallbackPropGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    // note time skips 3 frames here
    time += 1000 * (3 / 60);
    runNextFrame(time, resetInputs);
  };

  expect(mutableTestDevice.log).not.toHaveBeenCalled();

  nextFrame();
  expect(mutableTestDevice.log).toBeCalledTimes(3); // loop called 3 times
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(1, 1);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(2, 2);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(3, 3);
  expect(resetInputs).toBeCalledTimes(3);

  nextFrame();
  expect(mutableTestDevice.log).toBeCalledTimes(6);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(4, 4);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(5, 5);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(6, 6);
  expect(resetInputs).toBeCalledTimes(6);

  nextFrame();
  expect(mutableTestDevice.log).toBeCalledTimes(9);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(7, 7);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(8, 8);
  expect(mutableTestDevice.log).toHaveBeenNthCalledWith(9, 9);
  expect(resetInputs).toBeCalledTimes(9);
});

test("can preload and clear file assets", async () => {
  const {
    platform,
    mutableTestDevice,
    mutInputs,
    textures,
  } = getTestPlatform();
  const resetInputs = jest.fn();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    AssetsGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, resetInputs);
  };

  expect(textures.length).toBe(1);
  expect((textures[0] as TextTexture).props.text).toBe("Loading");

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

  nextFrame();

  // No longer loading
  expect(
    textures[0].type !== "text" || textures[0].props.text !== "Loading"
  ).toBe(true);

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
  mutInputs.ref.buttonPressed.show = false;
  nextFrame();

  // Need resolved promise to be called
  await waitFrame();

  // a.png removed
  expect("a.png" in mutableTestDevice.assetUtils.imageElements).toBe(false);
  expect(mutableTestDevice.assetUtils.cleanupImageFile).toHaveBeenCalledTimes(
    1
  );
});

test("Sprite unmounted before it loads", async () => {
  const { platform, mutableTestDevice, mutInputs } = getTestPlatform();
  const resetInputs = jest.fn();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    AssetsGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, resetInputs);
  };

  // Load initial assets
  await waitFrame();
  nextFrame();

  // Sprites have started loading
  expect(mutableTestDevice.assetUtils.loadImageFile).toHaveBeenCalledTimes(2);

  // Unmount Sprites before they finish loading
  mutInputs.ref.buttonPressed.show = false;
  nextFrame();

  // Wait for promises to load
  await waitFrame();

  // Image not in memory
  expect("a.png" in mutableTestDevice.assetUtils.imageElements).toBe(false);
});

test("throws error on duplicate Sprites", () => {
  const { platform } = getTestPlatform();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    DuplicateSpriteIdsGame(gameProps)
  );

  expect(() => {
    runNextFrame(1000 / 60, jest.fn());
  }).toThrowError("Duplicate Sprite id TestSprite");
});

test("supports Pure Sprites", () => {
  const { platform, mutInputs } = getTestPlatform();

  const { runNextFrame } = replayCore(
    platform,
    nativeSpriteSettings,
    PureSpriteGame(gameProps)
  );

  let time = 1;
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(1);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(1);

  nextFrame();

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(2);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(1);

  mutInputs.ref.buttonPressed.show = false;
  nextFrame();

  expect(pureSpriteAlwaysRendersFn).toBeCalledTimes(3);
  expect(pureSpriteNeverRendersFn).toBeCalledTimes(1);
  expect(pureSpriteConditionalRendersFn).toBeCalledTimes(2);
});

test("supports Native Sprites", () => {
  const { platform, mutInputs, textures } = getTestPlatform();

  const mutableNativeSpriteUtils: NativeSpriteUtils = {
    didResize: false,
    scale: 3,
    gameXToPlatformX: (x) => x + 10,
    gameYToPlatformY: (y) => y - 10,
  };

  const { runNextFrame } = replayCore(
    platform,
    {
      nativeSpriteUtils: mutableNativeSpriteUtils,
      nativeSpriteMap: { MyWidget: MyWidgetImplementation },
    },
    NativeSpriteGame(gameProps)
  );

  // No Textures rendered
  expect(textures.length).toBe(0);

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
  const nextFrame = () => {
    time += 1000 * (1 / 60);
    runNextFrame(time, jest.fn());
  };

  nextFrame();

  // test loop and didResize doubles width
  mutableNativeSpriteUtils.didResize = true;
  nextFrame();
  expect(widgetState.width).toBe(300); // scale x3
  mutableNativeSpriteUtils.didResize = false;

  // test getState and updateState in callback
  widgetCallback();
  nextFrame();
  expect(widgetState.x).toBe(20);

  // test cleanup
  mutInputs.ref.x = 100;
  nextFrame();
  expect(widgetState.text).toBe("");
});
