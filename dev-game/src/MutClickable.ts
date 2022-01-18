import { makeMutableSprite, r } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/src";
import { AllMutSprite } from "../../packages/replay-core/src/sprite";

type ClickableProps = {
  spritesPressed: AllMutSprite[];
  spritesNotPressed?: AllMutSprite[];
  width: number;
  height: number;
  onPress: () => void;
  onPressOutside?: () => void;
};
export const MutClickable = makeMutableSprite<
  ClickableProps,
  { isPressed: boolean },
  WebInputs | iOSInputs
>({
  init() {
    return { isPressed: false };
  },

  loop({ state, props, getInputs }) {
    const inputs = getInputs();
    const { x, y, justReleased, pressed } = inputs.pointer;
    const { width, height, onPress, onPressOutside } = props;

    const isOnButton =
      x <= width / 2 && x >= -width / 2 && y <= height / 2 && y >= -height / 2;

    state.isPressed = pressed && isOnButton;

    if (justReleased && isOnButton) {
      onPress();
    } else if (justReleased && onPressOutside) {
      onPressOutside();
    }
  },

  render({ state, props }) {
    return [
      r.ifElse(
        () => state.isPressed,
        () => props.spritesPressed,
        () => props.spritesNotPressed || props.spritesPressed
      ),
    ];
  },
});
