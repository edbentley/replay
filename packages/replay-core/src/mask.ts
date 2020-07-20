/**
 * Only render what's within the outline of this shape.
 */
export type MaskShape = CircleMask | RectangleMask | LineMask | null;

type CircleMask = {
  type: "circleMask";
  radius: number;
  x: number;
  y: number;
};
type RectangleMask = {
  type: "rectangleMask";
  width: number;
  height: number;
  x: number;
  y: number;
};
type LineMask = {
  type: "lineMask";
  path: [number, number][];
};

/**
 * `mask` is a util which contains functions to create every type of mask shape.
 */
export const mask = {
  circle: (props: { radius: number; x?: number; y?: number }): MaskShape => {
    return {
      type: "circleMask",
      radius: props.radius,
      x: props.x || 0,
      y: props.y || 0,
    };
  },
  rectangle: (props: {
    width: number;
    height: number;
    x?: number;
    y?: number;
  }): MaskShape => {
    return {
      type: "rectangleMask",
      width: props.width,
      height: props.height,
      x: props.x || 0,
      y: props.y || 0,
    };
  },
  line: (props: { path: [number, number][] }): MaskShape => {
    return {
      type: "lineMask",
      path: props.path,
    };
  },
};
