import { Sprite, makeSprite } from "../../packages/replay-core/src";
import { WebInputs } from "../../packages/replay-web/src";
import { iOSInputs } from "../../packages/replay-swift/index";

type ClickableProps = {
  sprites: (isPressed: boolean) => Sprite[];
  width: number;
  height: number;
  onPress: () => void;
  onPressOutside?: () => void;
};
export const Clickable = makeSprite<
  ClickableProps,
  undefined,
  WebInputs | iOSInputs
>({
  render({
    props: { sprites, width, height, onPress, onPressOutside },
    device,
  }) {
    const { x, y, justReleased, pressed } = device.inputs.pointer;

    const isOnButton =
      x <= width / 2 && x >= -width / 2 && y <= height / 2 && y >= -height / 2;

    const isPressed = pressed && isOnButton;

    if (justReleased && isOnButton) {
      onPress();
    } else if (justReleased && onPressOutside) {
      onPressOutside();
    }

    return sprites(isPressed);
  },
});
