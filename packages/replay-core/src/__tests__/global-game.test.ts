/**
 * @jest-environment ./test/global-game-environment
 */

import { replayCore } from "../core";
import { getTestPlatform, nativeSpriteSettings } from "./utils";

test("replay-core supports game set as global variable", () => {
  const { platform } = getTestPlatform();

  const { getNextFrameTextures } = replayCore(platform, nativeSpriteSettings); // <-- note no Game passed in
  const spriteTextures = getNextFrameTextures(1000 * (1 / 60) + 1, jest.fn());
  expect(spriteTextures.textures.length).toBe(1);
});
