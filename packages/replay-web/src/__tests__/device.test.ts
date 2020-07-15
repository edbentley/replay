import fetchMock from "fetch-mock";
import { renderCanvas } from "../index";
import {
  TestGame,
  updateMockTime,
  MockTime,
  clickPointer,
  releasePointer,
  TestGameWithAssets,
  getTestAssets,
  loadAudio,
  testGameProps,
} from "./utils";
import { resetInputs } from "../input";

const mockTime: MockTime = { nextFrame: () => undefined };

jest.useFakeTimers();

jest
  .spyOn(window.HTMLAudioElement.prototype, "load")
  .mockImplementation(() => undefined);

beforeEach(() => {
  console.log = jest.fn();
  resetInputs();
  fetchMock.reset();

  updateMockTime(mockTime);
});

test("Can log a random number", async () => {
  const { loadPromise } = renderCanvas(TestGame(testGameProps));
  await loadPromise;
  mockTime.nextFrame();

  clickPointer(102, 0);
  mockTime.nextFrame();
  releasePointer(102, 0);

  const randomNumber = (console as any).log.mock.calls[0][0];

  expect(randomNumber).toBeGreaterThanOrEqual(0);
  expect(randomNumber).toBeLessThanOrEqual(1);
});

test("Can call function after timeout", async () => {
  const { loadPromise } = renderCanvas(TestGame(testGameProps));
  await loadPromise;
  mockTime.nextFrame();

  clickPointer(100, 0);
  mockTime.nextFrame();
  releasePointer(100, 0);

  expect(console.log).not.toBeCalled();

  jest.runAllTimers();

  expect(console.log).toBeCalledWith("Timeout");
});

test("Can get the current date", async () => {
  const testDate = new Date("2000-01-01");
  (global as any).Date = class extends Date {
    constructor() {
      super();
      return testDate;
    }
  };

  const { loadPromise } = renderCanvas(TestGame(testGameProps));
  await loadPromise;
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

  const { loadPromise } = renderCanvas(TestGame(testGameProps));
  await loadPromise;
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
  const { audioElements, loadPromise } = renderCanvas(
    TestGameWithAssets(testGameProps),
    [],
    getTestAssets()
  );

  audioElements["shoot.wav"].play = jest.fn(() => Promise.resolve());
  audioElements["shoot.wav"].pause = jest.fn();
  audioElements["shoot.wav"].currentTime = 5;

  loadAudio(Object.values(audioElements));

  await loadPromise;
  mockTime.nextFrame();

  clickPointer(101, 0);
  mockTime.nextFrame();
  releasePointer(101, 0);
  mockTime.nextFrame();

  expect(audioElements["shoot.wav"].play).toBeCalled();

  clickPointer(102, 0);
  mockTime.nextFrame();
  releasePointer(102, 0);
  mockTime.nextFrame();

  expect(audioElements["shoot.wav"].pause).toBeCalled();

  clickPointer(103, 0);
  mockTime.nextFrame();
  releasePointer(103, 0);
  mockTime.nextFrame();

  expect(console.log).toBeCalledWith("Current time: 5");
});

test("Can show alerts", async () => {
  jest.spyOn(window, "alert").mockImplementation(() => null);
  jest.spyOn(window, "confirm").mockImplementation(() => true);

  const { loadPromise } = renderCanvas(TestGame(testGameProps));

  await loadPromise;
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
