/**
 * @jest-environment ./test/global-game-environment
 */

import { replayCore } from "../core";
import { getTestPlatform } from "./utils";

test("replay-core supports game set as global variable", () => {
  const { platform } = getTestPlatform();

  const { getNextFrameTextures } = replayCore(platform); // <-- note no Game passed in
  const spriteTextures = getNextFrameTextures(1000 * (1 / 60) + 1);
  expect(spriteTextures.textures.length).toBe(1);
});
