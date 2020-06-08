import { makeSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift";

export const PosLogger = makeSprite<{}, undefined, WebInputs | iOSInputs>({
  render({ device }) {
    if (device.inputs.pointer.justPressed) {
      device.log(
        `x: ${device.inputs.pointer.x}, y: ${device.inputs.pointer.y}`
      );
    }
    return [];
  },
});
