import { Matrix2D, m2d } from "@replay/core/dist/matrix";

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
    numberPressed: number;
    justPressed: boolean;
    justReleased: boolean;
    x: number;
    y: number;
  };
}

const mutableInputs = newInputs();

let pointerIds: number[] = [];

/**
 * This can be used with @replay/test to map pointer (x, y) coordinates to its
 * relative coordinate within each Sprite
 */
export function mapInputCoordinates<
  I extends { pointer: { x: number; y: number } }
>(matrix: Matrix2D, inputs: I): I {
  const invertMatrix = m2d.invertPooled(matrix);
  if (!invertMatrix) return inputs;

  pooledInputMatrix[4] = inputs.pointer.x;
  pooledInputMatrix[5] = inputs.pointer.y;
  const result = m2d.multiplyPooled(invertMatrix, pooledInputMatrix);

  return {
    ...inputs,
    pointer: { ...inputs.pointer, x: result[4], y: result[5] },
  };
}
const pooledInputMatrix: Matrix2D = [1, 0, 0, 1, 0, 0];

export function getInputsMut(matrix: Matrix2D, localMutInputs: Inputs): Inputs {
  localMutInputs.keysDown = mutableInputs.keysDown;
  localMutInputs.keysJustPressed = mutableInputs.keysJustPressed;
  localMutInputs.pointer.pressed = mutableInputs.pointer.pressed;
  localMutInputs.pointer.numberPressed = mutableInputs.pointer.numberPressed;
  localMutInputs.pointer.justPressed = mutableInputs.pointer.justPressed;
  localMutInputs.pointer.justReleased = mutableInputs.pointer.justReleased;

  const invertMatrix = m2d.invertPooled(matrix);
  if (!invertMatrix) return localMutInputs;

  pooledInputMatrix[4] = mutableInputs.pointer.x;
  pooledInputMatrix[5] = mutableInputs.pointer.y;
  const result = m2d.multiplyPooled(invertMatrix, pooledInputMatrix);

  localMutInputs.pointer.x = result[4];
  localMutInputs.pointer.y = result[5];
  return localMutInputs;
}

export function newInputs(): Inputs {
  return {
    keysDown: {},
    keysJustPressed: {},
    pointer: {
      pressed: false,
      numberPressed: 0,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
  };
}

export function keyDownHandler(e: KeyboardEvent) {
  if (
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key) &&
    // Don't block text inputs
    !(
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement
    )
  ) {
    // avoid scrolling with space and arrow keys
    e.preventDefault();
  }
  mutableInputs.keysDown[e.key] = true;
  mutableInputs.keysJustPressed[e.key] = true;
}

export function keyUpHandler(e: KeyboardEvent) {
  mutableInputs.keysDown[e.key] = undefined;
}

/**
 * Convert browser `clientX` to game's `x` coordinate
 */
export const clientXToGameX = ({
  canvasOffsetLeft,
  scrollX,
  widthMargin,
  scale,
  width,
}: {
  canvasOffsetLeft: number;
  scrollX: number;
  widthMargin: number;
  scale: number;
  width: number;
}) => (clientX: number) =>
  (clientX - canvasOffsetLeft + scrollX) / scale - widthMargin - width / 2;

/**
 * Convert browser `clientY` to game's `y` coordinate
 */
export const clientYToGameY = ({
  canvasOffsetTop,
  scrollY,
  heightMargin,
  scale,
  height,
}: {
  canvasOffsetTop: number;
  scrollY: number;
  heightMargin: number;
  scale: number;
  height: number;
}) => (clientY: number) =>
  -(clientY - canvasOffsetTop + scrollY) / scale + heightMargin + height / 2;

export function pointerDownHandler(x: number, y: number, pointerId: number) {
  if (!pointerIds.includes(pointerId)) {
    pointerIds = [...pointerIds, pointerId];
  }
  mutableInputs.pointer.pressed = true;
  mutableInputs.pointer.numberPressed = pointerIds.length;
  mutableInputs.pointer.justPressed = true;
  mutableInputs.pointer.x = x;
  mutableInputs.pointer.y = y;
}

export function pointerMoveHandler(x: number, y: number) {
  mutableInputs.pointer.x = x;
  mutableInputs.pointer.y = y;
}

export function pointerUpHandler(x: number, y: number, pointerId: number) {
  pointerIds = pointerIds.filter((id) => id !== pointerId);

  if (pointerIds.length === 0) {
    mutableInputs.pointer.justPressed = false;
    mutableInputs.pointer.pressed = false;
  }
  mutableInputs.pointer.numberPressed = pointerIds.length;
  mutableInputs.pointer.justReleased = true;
  mutableInputs.pointer.x = x;
  mutableInputs.pointer.y = y;
}

export function pointerCancelHandler(pointerId: number) {
  pointerIds = pointerIds.filter((id) => id !== pointerId);

  mutableInputs.pointer.numberPressed = pointerIds.length;
  if (pointerIds.length === 0) {
    mutableInputs.pointer.justPressed = false;
    mutableInputs.pointer.pressed = false;
  }
}

export function resetInputs() {
  // Clear just pressed fields
  for (const key in mutableInputs.keysJustPressed) {
    mutableInputs.keysJustPressed[key] = undefined;
  }

  mutableInputs.pointer.justPressed = false;
  mutableInputs.pointer.justReleased = false;
}
