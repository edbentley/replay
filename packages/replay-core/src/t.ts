import { SpriteBaseProps, mutatePropsAddBaseProps } from "./props";
import { MaskShape } from "./mask";

export type TextureFont = {
  /**
   * Font name
   */
  family?: string;
  /**
   * Size of font in relation to game size
   */
  size?: number;
  /**
   * Font weight, either a string like `"bold"` or a number like `500`
   */
  weight?: number | string;
  /**
   * Font style, typically either `"normal"` or `"italic"`
   *
   * @default "normal"
   */
  style?: "normal" | "italic" | "oblique" | "inherit";
  /**
   * Alignment of text around y position.
   *
   * @default "middle"
   */
  baseline?:
    | "top"
    | "hanging"
    | "middle"
    | "alphabetic"
    | "ideographic"
    | "bottom";
  /**
   * Alignment of text around x position. `"left"` will put the left edge of
   * the text at the x position.
   *
   * @default "center"
   */
  align?: "left" | "center" | "right" | "start" | "end";
};

/**
 * `t` is a util which contains functions to create every type of Texture.
 */
export const t = {
  text: (props: {
    // we intentionally redefine the props here to show the individual fields in
    // VS code tooltips

    font?: TextureFont;
    text: string;
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     */
    color: string;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    return {
      type: "text",
      props: mutatePropsAddBaseProps(props),
    };
  },
  circle: (props: {
    radius: number;
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     */
    color: string;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    return {
      type: "circle",
      props: mutatePropsAddBaseProps(props),
    };
  },
  rectangle: (props: {
    width: number;
    height: number;
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     */
    color: string;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    return {
      type: "rectangle",
      props: mutatePropsAddBaseProps(props),
    };
  },
  line: (props: {
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     * of the stroke colour. Default no stroke.
     */
    color?: string;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    /**
     * Thickness of line.
     * @default 1
     */
    thickness?: number;
    /**
     * Coordinates of [x, y] to draw line, first coordinate is where the line
     * starts
     */
    path: [number, number][];
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     * to fill in the shape of the path with a colour. Default no fill.
     */
    fillColor?: string;
    /**
     * The shape of the line ends. `"square"` adds a box sticking out with half
     * the line thickness.
     * @default "butt"
     */
    lineCap?: "butt" | "round" | "square";
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    props.thickness = props.thickness ?? 1;
    props.lineCap = props.lineCap || "butt";
    return {
      type: "line",
      props: mutatePropsAddBaseProps(props as LineProps),
    };
  },
  image: (props: {
    /**
     * Check each platform for supported file types. PNG is preferred on iOS
     */
    fileName: string;
    width: number;
    height: number;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    return {
      type: "image",
      props: mutatePropsAddBaseProps(props),
    };
  },
  spriteSheet: (props: {
    /**
     * Check each platform for supported file types. PNG is preferred on iOS
     */
    fileName: string;
    columns: number;
    rows: number;
    index: number;
    width: number;
    height: number;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    mask?: MaskShape;
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): Texture => {
    return {
      type: "spriteSheet",
      props: mutatePropsAddBaseProps(props),
    };
  },
};

interface TestProps {
  testId?: string;
}

type BaseProps = TestProps & SpriteBaseProps;

/**
 * A Replay texture
 */
export type Texture =
  | TextTexture
  | CircleTexture
  | RectangleTexture
  | LineTexture
  | ImageTexture
  | SpriteSheetTexture;

// -- Text
type TextProps = BaseProps & {
  font?: TextureFont;
  text: string;
  color: string;
};
export interface TextTexture {
  type: "text";
  props: TextProps;
}

// -- Circle
type CircleProps = BaseProps & {
  radius: number;
  color: string;
};
export interface CircleTexture {
  type: "circle";
  props: CircleProps;
}

// -- Rectangle
type RectangleProps = BaseProps & {
  width: number;
  height: number;
  color: string;
};
export interface RectangleTexture {
  type: "rectangle";
  props: RectangleProps;
}

// -- Line
type LineProps = BaseProps & {
  color?: string;
  thickness: number;
  path: [number, number][];
  fillColor?: string;
  lineCap: "butt" | "round" | "square";
};
export interface LineTexture {
  type: "line";
  props: LineProps;
}

// -- Image
type ImageProps = BaseProps & {
  fileName: string;
  width: number;
  height: number;
};
export interface ImageTexture {
  type: "image";
  props: ImageProps;
}

// -- SpriteSheet
type SpriteSheetProps = BaseProps & {
  fileName: string;
  columns: number;
  rows: number;
  index: number;
  width: number;
  height: number;
};
export interface SpriteSheetTexture {
  type: "spriteSheet";
  props: SpriteSheetProps;
}
