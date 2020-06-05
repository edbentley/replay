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

let mutableInputs: Inputs = {
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

/**
 * This can be used with @replay/test to map pointer (x, y) coordinates to its
 * relative coordinate within each Sprite
 */
export function mapInputCoordinates<
  I extends { pointer: { x: number; y: number } }
>(parentPosition: SpritePosition, inputs: I) {
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

export function getInputs(parentPosition: SpritePosition) {
  return mapInputCoordinates(parentPosition, mutableInputs);
}

export function keyDownHandler(e: KeyboardEvent) {
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)
  ) {
    // avoid scrolling with space and arrow keys
    e.preventDefault();
  }
  mutableInputs.keysDown[e.key] = true;
  mutableInputs.keysJustPressed[e.key] = true;
}

export function keyUpHandler(e: KeyboardEvent) {
  delete mutableInputs.keysDown[e.key];
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
  mutableInputs.pointer = {
    pressed: true,
    justPressed: true,
    justReleased: false,
    x,
    y,
  };
}

export function pointerMoveHandler(x: number, y: number) {
  mutableInputs.pointer.x = x;
  mutableInputs.pointer.y = y;
}

export function pointerUpHandler(x: number, y: number) {
  mutableInputs.pointer.justPressed = false;
  mutableInputs.pointer.pressed = false;
  mutableInputs.pointer.justReleased = true;
  mutableInputs.pointer.x = x;
  mutableInputs.pointer.y = y;
}

export function pointerOutHandler() {
  mutableInputs.pointer.justPressed = false;
  mutableInputs.pointer.pressed = false;
}

export function resetInputs() {
  mutableInputs = {
    keysDown: mutableInputs.keysDown,
    keysJustPressed: {},
    pointer: {
      ...mutableInputs.pointer,
      justPressed: false,
      justReleased: false,
    },
  };
}
