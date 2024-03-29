import { renderCanvas } from "@replay/web";
import { Game, gameProps } from "./game";
import { TextInputWeb } from "../web";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { mockDOM } = require("node-canvas-webgl");

mockDOM(window);

const mockTime: MockTime = { nextFrame: () => undefined };

// https://jestjs.io/docs/en/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Web Audio API mocks
Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    decodeAudioData: jest.fn((_, res) => res(new ArrayBuffer(0))),
    currentTime: 5,
    createBufferSource: jest.fn(() => ({
      buffer: {},
      connect: jest.fn(),
      playbackRate: { value: 1 },
      start: jest.fn(),
      stop: jest.fn(),
      loop: false,
      onended: jest.fn(),
    })),
    destination: {},
  })),
});
Object.defineProperty(window, "AudioBuffer", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({})),
});
Object.defineProperty(window, "PointerEvent", {
  value: jest.fn().mockImplementation(() => ({})),
});

window.fetch = jest.fn();

beforeEach(() => {
  // Clean up DOM
  document.body.childNodes.forEach((node) => document.body.removeChild(node));

  updateMockTime(mockTime);
});

afterEach(() => {
  document.body.childNodes.forEach((node) => document.body.removeChild(node));
});

test("can update single-line text input", async () => {
  expect(document.body.childNodes.length).toBe(0);

  renderCanvas(Game(gameProps), {
    nativeSpriteMap: {
      TextInput: TextInputWeb,
    },
  });

  mockTime.nextFrame();

  // 1 canvas + 1 input
  expect(document.body.childNodes.length).toBe(2);

  const input = document.body.childNodes[1] as HTMLInputElement;

  expect(input.nodeName).toBe("INPUT");
  expect(input.value).toBe("Hello");

  typeString(input, " there");
  mockTime.nextFrame();

  expect(input.value).toBe("Hello there");
});

test("can destroy text input", async () => {
  expect(document.body.childNodes.length).toBe(0);

  renderCanvas(Game(gameProps), {
    nativeSpriteMap: {
      TextInput: TextInputWeb,
    },
  });

  expect(document.body.childNodes.length).toBe(2);

  mockTime.nextFrame();

  // Switch to none
  clickPointer(100 + 250, 0);

  mockTime.nextFrame();

  // input has been removed
  expect(document.body.childNodes.length).toBe(1);
});

test("can update multi-line text input", async () => {
  expect(document.body.childNodes.length).toBe(0);

  renderCanvas(Game(gameProps), {
    nativeSpriteMap: {
      TextInput: TextInputWeb,
    },
  });

  mockTime.nextFrame();

  // Switch to multi-line
  clickPointer(102 + 250, 0);

  mockTime.nextFrame();

  expect(document.body.childNodes.length).toBe(2);

  const input = document.body.childNodes[1] as HTMLTextAreaElement;

  expect(input.nodeName).toBe("TEXTAREA");
  expect(input.value).toBe("Hello");

  typeString(input, " there");
  mockTime.nextFrame();

  expect(input.value).toBe("Hello there");
});

test("can handle five inputs", async () => {
  renderCanvas(Game(gameProps), {
    nativeSpriteMap: {
      TextInput: TextInputWeb,
    },
  });

  mockTime.nextFrame();

  // Switch to five-inputs
  clickPointer(103 + 250, 0);

  mockTime.nextFrame();

  // All are created
  expect(document.body.childNodes.length).toBe(6);

  // Switch to none
  clickPointer(100 + 250, 0);

  mockTime.nextFrame();

  // All are removed
  expect(document.body.childNodes.length).toBe(1);
});

test("can handle fixed value input", async () => {
  renderCanvas(Game(gameProps), {
    nativeSpriteMap: {
      TextInput: TextInputWeb,
    },
  });

  mockTime.nextFrame();

  // Switch to fixed-value
  clickPointer(104 + 250, 0);

  mockTime.nextFrame();

  const input = document.body.childNodes[1] as HTMLInputElement;

  expect(input.value).toBe("Fixed");

  typeString(input, " there");
  mockTime.nextFrame();

  expect(input.value).toBe("Fixed");
});

function typeString(
  input: HTMLInputElement | HTMLTextAreaElement,
  string: string
) {
  // Set the value like the DOM would
  input.value += string;
  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
}

function clickPointer(clientX: number, clientY: number) {
  document.dispatchEvent(
    new MouseEvent("pointerdown", {
      clientX,
      clientY,
    })
  );
}

type MockTime = { nextFrame: () => void };
/**
 * Wait one frame
 */
function updateMockTime(mockTime: MockTime) {
  let frame = 0;

  window.requestAnimationFrame = (callback: (time: number) => void) => {
    mockTime.nextFrame = () => {
      frame += 1;
      callback(frame * (1000 / 60));
    };
    return 0;
  };
}
