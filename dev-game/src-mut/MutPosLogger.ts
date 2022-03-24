import { makeMutableSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";

export const MutPosLogger = makeMutableSprite<
  {},
  undefined,
  WebInputs | iOSInputs
>({
  loop({ getInputs, device }) {
    const inputs = getInputs();

    if (inputs.pointer.justPressed) {
      device.log(`x: ${inputs.pointer.x}, y: ${inputs.pointer.y}`);
    }
  },
  render() {
    return [];
  },
});
