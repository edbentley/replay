import { m2d, Matrix2D } from "./matrix";
import { SpriteBaseProps } from "./props";

export function applyTransformMut(
  matrix: Matrix2D,
  mutOutput: Matrix2D,
  baseProps: Omit<SpriteBaseProps, "mask">,
  // These are for scaling vertices in image and rect shaders
  withScaleX = 1,
  withScaleY = 1
) {
  m2d.transformMut(
    matrix,
    baseProps.x,
    baseProps.y,
    baseProps.scaleX,
    baseProps.scaleY,
    -baseProps.rotation * toRad,
    -baseProps.anchorX,
    -baseProps.anchorY,
    withScaleX,
    withScaleY,
    mutOutput
  );
}

const transformPool: Matrix2D = [0, 0, 0, 0, 0, 0];
export function applyTransformPooled(
  matrix: Matrix2D,
  baseProps: Omit<SpriteBaseProps, "mask">,
  // These are for scaling vertices in image and rect shaders
  withScaleX = 1,
  withScaleY = 1
): Matrix2D {
  applyTransformMut(matrix, transformPool, baseProps, withScaleX, withScaleY);
  return transformPool;
}

const toRad = Math.PI / 180;
