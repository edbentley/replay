const { toMatchImageSnapshot } = require("jest-image-snapshot");
const fetch = require("node-fetch");
const { mockDOM } = require("node-canvas-webgl");

mockDOM(window);

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const fetchMock = require("fetch-mock");

expect.extend({ toMatchImageSnapshot });

fetchMock.config.overwriteRoutes = false;

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
    createGain: jest.fn().mockImplementation(() => ({
      connect: jest.fn,
      gain: {
        value: 1,
      },
    })),
  })),
});
Object.defineProperty(window, "AudioBuffer", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({})),
});
// Use pointer events
Object.defineProperty(window, "PointerEvent", {
  value: jest.fn().mockImplementation(() => ({})),
});

afterEach(() => {
  // Clean up canvas in DOM
  const canvases = document.getElementsByTagName("canvas");
  if (canvases.length > 0) {
    document.body.removeChild(canvases[0]);
  }
});
