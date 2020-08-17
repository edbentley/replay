const { toMatchImageSnapshot } = require("jest-image-snapshot");
const fetch = require("node-fetch");

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

afterEach(() => {
  // Clean up canvas in DOM
  const canvases = document.getElementsByTagName("canvas");
  if (canvases.length > 0) {
    document.body.removeChild(canvases[0]);
  }
});
