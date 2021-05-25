import { SpriteBaseProps, getDefaultProps } from "./props";
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

export type Gradient = {
  type: "linear";
  /**
   * A tuple of start and end `[x, y]` coordinates to draw the gradient line
   */
  path: [[number, number], [number, number]];
  colors: {
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
     */
    color: string;
    /**
     * Distance of `color` along gradient line, must be between 0 - 1
     */
    offset: number;
  }[];
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
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
     */
    color: string;
    gradient?: Gradient;
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
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        font: props.font,
        text: props.text,
        color: props.color,
        gradient: props.gradient,
      },
    };
  },
  circle: (props: {
    radius: number;
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
     */
    color: string;
    gradient?: Gradient;
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
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        radius: props.radius,
        color: props.color,
        gradient: props.gradient,
      },
    };
  },
  rectangle: (props: {
    width: number;
    height: number;
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
     */
    color: string;
    gradient?: Gradient;
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
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        width: props.width,
        height: props.height,
        color: props.color,
        gradient: props.gradient,
      },
    };
  },
  line: (props: {
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`) of the stroke
     * colour. Default no stroke.
     */
    color?: string;
    gradient?: Gradient;
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
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`) to fill in the
     * shape of the path with a colour. Default no fill.
     */
    fillColor?: string;
    fillGradient?: Gradient;
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
    return {
      type: "line",
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        color: props.color,
        fillColor: props.fillColor,
        thickness: props.thickness ?? 1,
        lineCap: props.lineCap || "butt",
        path: props.path,
        gradient: props.gradient,
        fillGradient: props.fillGradient,
      },
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
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        fileName: props.fileName,
        width: props.width,
        height: props.height,
      },
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
      props: {
        testId: props.testId,
        ...getDefaultProps(props),
        fileName: props.fileName,
        columns: props.columns,
        rows: props.rows,
        index: props.index,
        width: props.width,
        height: props.height,
      },
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
  gradient?: Gradient;
};
export interface TextTexture {
  type: "text";
  props: TextProps;
}

// -- Circle
type CircleProps = BaseProps & {
  radius: number;
  color: string;
  gradient?: Gradient;
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
  gradient?: Gradient;
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
  gradient?: Gradient;
  fillGradient?: Gradient;
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
