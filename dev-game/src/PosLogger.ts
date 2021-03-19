import { makeSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";

export const PosLogger = makeSprite<{}, undefined, WebInputs | iOSInputs>({
  render({ device, getInputs }) {
    const inputs = getInputs();

    if (inputs.pointer.justPressed) {
      device.log(`x: ${inputs.pointer.x}, y: ${inputs.pointer.y}`);
    }
    return [];
  },
});
