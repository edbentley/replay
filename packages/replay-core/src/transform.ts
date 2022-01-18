import { m2d, m2dMut, Matrix2D } from "./matrix";
import { SpriteBaseProps } from "./props";

export function applyTransform(
  matrix: Matrix2D,
  baseProps: Omit<SpriteBaseProps, "mask">,
  // These are for scaling vertices in image and rect shaders
  withScaleX = 1,
  withScaleY = 1
): Matrix2D {
  return m2d.transform(
    matrix,
    baseProps.x,
    baseProps.y,
    baseProps.scaleX,
    baseProps.scaleY,
    -baseProps.rotation * toRad,
    -baseProps.anchorX,
    -baseProps.anchorY,
    withScaleX,
    withScaleY
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
  m2dMut.transformMut(
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
    transformPool
  );
  return transformPool;
}

export function applyTransformMut(
  matrix: Matrix2D,
  mutOutput: Matrix2D,
  baseProps: Omit<SpriteBaseProps, "mask">,
  // These are for scaling vertices in image and rect shaders
  withScaleX = 1,
  withScaleY = 1
) {
  m2dMut.transformMut(
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

const toRad = Math.PI / 180;
