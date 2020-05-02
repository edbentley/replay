const { toMatchImageSnapshot } = require("jest-image-snapshot");
const fetch = require("node-fetch");

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const fetchMock = require("fetch-mock");

expect.extend({ toMatchImageSnapshot });

fetchMock.config.overwriteRoutes = false;

afterEach(() => {
  // Clean up canvas in DOM
  const canvases = document.getElementsByTagName("canvas");
  if (canvases.length > 0) {
    document.body.removeChild(canvases[0]);
  }
});
