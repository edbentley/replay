import { SpritePosition as SpritePositionObj } from "@replay/core/dist/sprite";

type SpritePosition = SpritePositionObj["position"];

/**
 * Keys pressed based on the `key` value of browser keyboard events.
 *
 * See https://keycode.info for values of `event.key`.
 */
type KeysPressed = { [x: string]: true | undefined };

/**
 * Inputs available on the web platform.
 */
export interface Inputs {
  keysDown: KeysPressed;
  keysJustPressed: KeysPressed;
  pointer: {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    x: number;
    y: number;
  };
}

let inputs: Inputs = {
  keysDown: {},
  keysJustPressed: {},
  pointer: {
    pressed: false,
    justPressed: false,
    justReleased: false,
    x: 0,
    y: 0,
  },
};

export function getInputs(parentPosition: SpritePosition) {
  if (!parentPosition) return inputs;

  // Need to convert point from absolute coordinates to sprite coordinates.
  // This explains the equation: https://www.youtube.com/watch?v=AAx8JON4KeQ
  const h = parentPosition.x;
  const k = parentPosition.y;
  const { x, y } = inputs.pointer;
  const toRad = Math.PI / 180;
  const rotation = -(parentPosition.rotation || 0) * toRad;
  return {
    ...inputs,
    pointer: {
      ...inputs.pointer,
      x: (x - h) * Math.cos(rotation) + (y - k) * Math.sin(rotation),
      y: -(x - h) * Math.sin(rotation) + (y - k) * Math.cos(rotation),
    },
  };
}

export function keyDownHandler(e: KeyboardEvent) {
  inputs.keysDown[e.key] = true;
  inputs.keysJustPressed[e.key] = true;
}

export function keyUpHandler(e: KeyboardEvent) {
  delete inputs.keysDown[e.key];
}

/**
 * Convert browser `clientX` to game's `x` coordinate
 */
export const clientXToGameX = ({
  canvasOffsetLeft,
  widthMargin,
  scale,
  width,
}: {
  canvasOffsetLeft: number;
  widthMargin: number;
  scale: number;
  width: number;
}) => (e: PointerEvent) =>
  (e.clientX - canvasOffsetLeft) / scale - widthMargin - width / 2;

/**
 * Convert browser `clientY` to game's `y` coordinate
 */
export const clientYToGameY = ({
  canvasOffsetTop,
  heightMargin,
  scale,
  height,
}: {
  canvasOffsetTop: number;
  heightMargin: number;
  scale: number;
  height: number;
}) => (e: PointerEvent) =>
  -(e.clientY - canvasOffsetTop) / scale + heightMargin + height / 2;

export function pointerDownHandler(x: number, y: number) {
  inputs.pointer = {
    pressed: true,
    justPressed: true,
    justReleased: false,
    x,
    y,
  };
}

export function pointerMoveHandler(x: number, y: number) {
  inputs.pointer.x = x;
  inputs.pointer.y = y;
}

export function pointerUpHandler(x: number, y: number) {
  inputs.pointer.justPressed = false;
  inputs.pointer.pressed = false;
  inputs.pointer.justReleased = true;
  inputs.pointer.x = x;
  inputs.pointer.y = y;
}

export function resetInputs() {
  inputs = {
    keysDown: inputs.keysDown,
    keysJustPressed: {},
    pointer: {
      ...inputs.pointer,
      justPressed: false,
      justReleased: false,
    },
  };
}
