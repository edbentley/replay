import { makeSprite, t } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { isWebInput } from "./utils";

type MenuProps = {
  start: () => void;
  highScore: number;
};

export const Menu = makeSprite<MenuProps, undefined, WebInputs | iOSInputs>({
  render({ props, device }) {
    const { inputs } = device;

    if (
      inputs.pointer.justReleased ||
      (isWebInput(inputs) && inputs.keysJustPressed[" "])
    ) {
      props.start();
    }

    return [
      t.text({
        text: isWebInput(inputs)
          ? "Click or Space Bar to Start"
          : "Tap to Start",
        color: "white",
        y: 100,
      }),
      t.text({
        text: `High score: ${props.highScore}`,
        font: { name: "Courier", size: 24 },
        color: "white",
        y: 150,
      }),
    ];
  },
});
