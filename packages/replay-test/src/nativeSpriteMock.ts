import { NativeSpriteImplementation } from "@replay/core";

/**
 * A mock Native Sprite to provide an implementation of Native Sprites on the
 * replay-test platform.
 */
export const NativeSpriteMock: NativeSpriteImplementation<{}, {}> = {
  init: () => {
    return {};
  },
  loop: ({ state }) => {
    return state;
  },
  cleanup: () => {
    return;
  },
};
