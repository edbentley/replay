import fetchMock from "fetch-mock";
import { renderCanvas } from "../index";
import {
  TestGame,
  updateMockTime,
  MockTime,
  clickPointer,
  releasePointer,
  TestGameWithAssets,
  testGameProps,
  loadAssets,
} from "./utils";
import { resetInputs } from "../input";
import { AudioData } from "../device";

const mockTime: MockTime = { nextFrame: () => undefined };

// Setup clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: () => undefined,
  },
});

beforeEach(() => {
  console.log = jest.fn();
  resetInputs();
  fetchMock.reset();

  updateMockTime(mockTime);
});

test("Can log a random number", () => {
  renderCanvas(TestGame(testGameProps));
  mockTime.nextFrame();

  clickPointer(102, 0);
  mockTime.nextFrame();
  releasePointer(102, 0);

  const randomNumber = (console as any).log.mock.calls[0][0];

  expect(randomNumber).toBeGreaterThanOrEqual(0);
  expect(randomNumber).toBeLessThanOrEqual(1);
});

describe("timer", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("Can call function after timeout with timer", () => {
    renderCanvas(TestGame(testGameProps));
    mockTime.nextFrame();

    clickPointer(108, 0);
    mockTime.nextFrame();
    releasePointer(108, 0);

    expect(console.log).not.toBeCalled();

    jest.runAllTimers();

    expect(console.log).toBeCalledWith("Timeout");
  });

  test("Can pause and resume timer", () => {
    renderCanvas(TestGame(testGameProps));
    mockTime.nextFrame();

    // New timer
    clickPointer(108, 0);
    mockTime.nextFrame();
    releasePointer(108, 0);

    // Pause timer
    clickPointer(109, 0);
    mockTime.nextFrame();
    releasePointer(109, 0);

    jest.runAllTimers();

    expect(console.log).not.toBeCalled();

    // Resume timer
    clickPointer(110, 0);
    mockTime.nextFrame();
    releasePointer(110, 0);

    jest.runAllTimers();

    expect(console.log).toBeCalledWith("Timeout");
  });

  test("Can cancel timer", () => {
    renderCanvas(TestGame(testGameProps));
    mockTime.nextFrame();

    // New timer
    clickPointer(108, 0);
    mockTime.nextFrame();
    releasePointer(108, 0);

    // Cancel timer
    clickPointer(111, 0);
    mockTime.nextFrame();
    releasePointer(111, 0);

    jest.runAllTimers();

    expect(console.log).not.toBeCalled();

    // Resume timer (should do nothing)
    clickPointer(110, 0);
    mockTime.nextFrame();
    releasePointer(110, 0);

    jest.runAllTimers();

    expect(console.log).not.toBeCalled();
  });

  test("No-op for ID that doesn't exist", () => {
    renderCanvas(TestGame(testGameProps));
    mockTime.nextFrame();

    // cancel ID "doesnt_exist"
    clickPointer(112, 0);
    mockTime.nextFrame();
    releasePointer(112, 0);

    // No errors!
  });
});

test("Can get the current date", () => {
  const testDate = new Date("2000-01-01");
  (global as any).Date = class extends Date {
    constructor() {
      super();
      return testDate;
    }
  };

  renderCanvas(TestGame(testGameProps));
  mockTime.nextFrame();

  clickPointer(101, 0);
  mockTime.nextFrame();
  releasePointer(101, 0);

  expect(console.log).toBeCalledWith("Sat, 01 Jan 2000 00:00:00 GMT");
});

test("Can make network requests with fetch", async () => {
  fetchMock
    .get("/get", { name: "replay" })
    .post("/post", { name: "replay" })
    .put("/put", { name: "replay" })
    .delete("/delete", { name: "replay" });

  renderCanvas(TestGame(testGameProps));
  mockTime.nextFrame();

  clickPointer(103, 0);
  mockTime.nextFrame();
  releasePointer(103, 0);

  expect(fetchMock.calls().length).toBe(4);
  expect(fetchMock.calls()).toMatchInlineSnapshot(`
Array [
  Array [
    "/get",
    undefined,
  ],
  Array [
    "/post",
    Object {
      "body": "{\\"payload\\":\\"post\\"}",
      "method": "POST",
    },
  ],
  Array [
    "/put",
    Object {
      "body": "{\\"payload\\":\\"put\\"}",
      "method": "PUT",
    },
  ],
  Array [
    "/delete",
    Object {
      "method": "DELETE",
    },
  ],
]
`);

  await fetchMock.flush();

  expect(console.log).toBeCalledWith("GET replay");
  expect(console.log).toBeCalledWith("POST replay");
  expect(console.log).toBeCalledWith("PUT replay");
  expect(console.log).toBeCalledWith("DELETE replay");
});

test("Can play audio, pause and get position", async () => {
  fetchMock.getOnce("shoot.wav", { arrayBuffer: jest.fn() });

  const { audioElements, audioContext } = renderCanvas(
    TestGameWithAssets(testGameProps)
  );

  await loadAssets();

  expect("shoot.wav" in audioElements).toBe(true);

  const data = audioElements["shoot.wav"].data as AudioData;

  const nextFrame = () => {
    mockTime.nextFrame();
    const { currentTime } = audioContext;
    Object.defineProperty(audioContext, "currentTime", {
      get: () => currentTime + 0.016,
    });
  };

  nextFrame();

  clickPointer(101, 0);
  nextFrame();
  releasePointer(101, 0);
  nextFrame();

  // Sound plays
  expect(data.playState).toEqual({
    // This is only updated on pause
    alreadyPlayedTime: 0,
    isPaused: false,
    sample: expect.any(Object),
    playTime: 5.016,
    gainNode: expect.any(Object),
  });

  clickPointer(102, 0);
  nextFrame();
  releasePointer(102, 0);
  nextFrame();

  // Sound paused
  expect(data.playState?.isPaused).toBe(true);
  expect(data.playState?.alreadyPlayedTime).toBeCloseTo(0.032);

  clickPointer(103, 0);
  nextFrame();
  releasePointer(103, 0);
  nextFrame();

  // Can get sound's position
  expect(console.log).toBeCalledWith("Current time: 0.032");

  // Resume at half speed
  clickPointer(104, 0);
  nextFrame();
  releasePointer(104, 0);
  nextFrame();

  // Pause
  clickPointer(102, 0);
  nextFrame();
  releasePointer(102, 0);
  nextFrame();

  // Didn't progress as far at half speed
  expect(data.playState?.alreadyPlayedTime).toBeCloseTo(0.048);
});

test("Can show alerts", () => {
  jest.spyOn(window, "alert").mockImplementation(() => null);
  jest.spyOn(window, "confirm").mockImplementation(() => true);

  renderCanvas(TestGame(testGameProps));
  mockTime.nextFrame();

  clickPointer(104, 0);
  mockTime.nextFrame();
  releasePointer(104, 0);
  mockTime.nextFrame();

  expect(window.alert).toBeCalledWith("Ok?");
  expect(console.log).toBeCalledWith("It's ok");

  clickPointer(105, 0);
  mockTime.nextFrame();
  releasePointer(105, 0);
  mockTime.nextFrame();

  expect(window.confirm).toBeCalledWith("Ok or cancel?");
  expect(console.log).toBeCalledWith("Was ok: true");
});

test("Can copy to clipboard", () => {
  jest
    .spyOn(navigator.clipboard, "writeText")
    .mockImplementation(async (message) => {
      if (message === "Error") {
        throw new Error("!");
      }
    });

  renderCanvas(TestGame(testGameProps));
  mockTime.nextFrame();

  clickPointer(106, 0);
  mockTime.nextFrame();
  releasePointer(106, 0);
  mockTime.nextFrame();

  expect(navigator.clipboard.writeText).toBeCalledWith("Hello");

  // log calls not being picked up inside device.clipboard.copy callback?
  // expect(console.log).toBeCalledWith("Copied");

  clickPointer(107, 0);
  mockTime.nextFrame();
  releasePointer(107, 0);
  mockTime.nextFrame();

  expect(navigator.clipboard.writeText).toBeCalledWith("Error");
  // expect(console.log).toBeCalledWith("Error copying: !");
});
