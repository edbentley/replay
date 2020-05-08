import { makeSprite, t } from "@replay/core";
import { isWebInput } from "./utils";

export const Menu = makeSprite({
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
        position: { x: 0, y: 100 },
      }),
      t.text({
        text: `High score: ${props.highScore}`,
        font: { name: "Courier", size: 24 },
        color: "white",
        position: { x: 0, y: 150 },
      }),
    ];
  },
});
