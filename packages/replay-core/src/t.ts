import { SpriteBaseProps, mutateBaseProps } from "./props";
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
  align?: "left" | "center" | "right";
};

export type Gradient =
  | {
      type: "linearHoriz";
      /**
       * Colours in left to right order spread evenly
       */
      colors: string[];
      /**
       * Array of opacity of each colour, from 0 - 1
       */
      opacities?: number[];
      /**
       * Width between first and last colour in game coordinates
       */
      width: number;
    }
  | {
      type: "linearVert";
      /**
       * Colours in top to bottom order spread evenly
       */
      colors: string[];
      /**
       * Array of opacity of each colour, from 0 - 1
       */
      opacities?: number[];
      /**
       * Height between first and last colour in game coordinates
       */
      height: number;
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
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
     */
    strokeColor?: string;
    strokeThickness?: number;
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
  }): TextTexture => {
    return {
      type: "text",
      props: mutateBaseProps(
        {
          testId: props.testId,
          font: props.font,
          text: props.text,
          color: props.color,
          gradient: props.gradient,
          strokeColor: props.strokeColor,
          strokeThickness: props.strokeThickness,
        },
        props
      ),
    };
  },
  circle: (props: {
    radius: number;
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`)
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
  }): CircleTexture => {
    return {
      type: "circle",
      props: mutateBaseProps(
        {
          testId: props.testId,
          radius: props.radius,
          color: props.color,
        },
        props
      ),
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
  }): RectangleTexture => {
    return {
      type: "rectangle",
      props: mutateBaseProps(
        {
          testId: props.testId,
          width: props.width,
          height: props.height,
          color: props.color,
          gradient: props.gradient,
        },
        props
      ),
    };
  },
  rectangleArray: (arg: {
    mask?: MaskShape;
    props: {
      width: number;
      height: number;
      color: string;
      opacity?: number;
      scaleX?: number;
      scaleY?: number;
      anchorX?: number;
      anchorY?: number;
      x?: number;
      y?: number;
      rotation?: number;
      testId?: string;
    }[];
  }): RectangleArrayTexture => {
    return {
      type: "rectangleArray",
      mask: arg.mask || null,
      props: arg.props.map((props) =>
        mutateBaseProps<RectangleProps>(
          {
            testId: props.testId,
            width: props.width,
            height: props.height,
            color: props.color,
          },
          props
        )
      ),
    };
  },
  line: (props: {
    /**
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`) of the stroke
     * colour. Default no stroke.
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
     * A CSS colour (e.g. `#ff0000`, `rgba(0, 0, 0, 0)`, `green`) to fill in the
     * shape of the path with a colour. Default no fill.
     */
    fillColor?: string;
    fillGradient?: Gradient;
    /**
     * The shape of the line ends.
     * @default "butt"
     */
    lineCap?: "butt" | "round";
    x?: number;
    y?: number;
    rotation?: number;
    testId?: string;
  }): LineTexture => {
    return {
      type: "line",
      props: mutateBaseProps(
        {
          testId: props.testId,
          color: props.color,
          fillColor: props.fillColor,
          thickness: props.thickness ?? 1,
          lineCap: props.lineCap || "butt",
          path: props.path,
          fillGradient: props.fillGradient,
        },
        props
      ),
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
  }): ImageTexture => {
    return {
      type: "image",
      props: mutateBaseProps(
        {
          testId: props.testId,
          fileName: props.fileName,
          width: props.width,
          height: props.height,
        },
        props
      ),
    };
  },
  imageArray: (arg: {
    fileName: string;
    mask?: MaskShape;
    props: {
      width: number;
      height: number;
      opacity?: number;
      scaleX?: number;
      scaleY?: number;
      anchorX?: number;
      anchorY?: number;
      x?: number;
      y?: number;
      rotation?: number;
      testId?: string;
    }[];
  }): ImageArrayTexture => {
    return {
      type: "imageArray",
      fileName: arg.fileName,
      mask: arg.mask || null,
      props: arg.props.map((props) =>
        mutateBaseProps<Omit<ImageProps, "fileName">>(
          {
            testId: props.testId,
            width: props.width,
            height: props.height,
          },
          props
        )
      ),
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
  }): SpriteSheetTexture => {
    return {
      type: "spriteSheet",
      props: mutateBaseProps(
        {
          testId: props.testId,
          fileName: props.fileName,
          columns: props.columns,
          rows: props.rows,
          index: props.index,
          width: props.width,
          height: props.height,
        },
        props
      ),
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
export type SingleTexture =
  | TextTexture
  | CircleTexture
  | RectangleTexture
  | LineTexture
  | ImageTexture
  | SpriteSheetTexture;

export type Texture = SingleTexture | RectangleArrayTexture | ImageArrayTexture;

// -- Text
export type TextProps = BaseProps & {
  font?: TextureFont;
  text: string;
  color: string;
  gradient?: Gradient;
  strokeColor?: string;
  strokeThickness?: number;
};
export interface TextTexture {
  type: "text";
  props: TextProps;
}
export type TextArrayProps = Omit<TextProps, "mask">;
export interface TextArrayTexture {
  type: "textArray";
  mask: MaskShape;
  props: TextArrayProps[];
}

// -- Circle
export type CircleProps = BaseProps & {
  radius: number;
  color: string;
  gradient?: Gradient;
};
export interface CircleTexture {
  type: "circle";
  props: CircleProps;
}
export type CircleArrayProps = Omit<CircleProps, "mask">;
export interface CircleArrayTexture {
  type: "circleArray";
  mask: MaskShape;
  props: CircleArrayProps[];
}

// -- Rectangle
export type RectangleProps = BaseProps & {
  width: number;
  height: number;
  color: string;
  gradient?: Gradient;
};
export interface RectangleTexture {
  type: "rectangle";
  props: RectangleProps;
}
export type RectangleArrayProps = Omit<RectangleProps, "mask" | "gradient">;
export interface RectangleArrayTexture {
  type: "rectangleArray";
  mask: MaskShape;
  props: RectangleArrayProps[];
}

// -- Line
export type LineProps = BaseProps & {
  color?: string;
  thickness: number;
  path: [number, number][];
  fillColor?: string;
  lineCap: "butt" | "round";
  gradient?: Gradient;
  fillGradient?: Gradient;
};
export interface LineTexture {
  type: "line";
  props: LineProps;
}
export type LineArrayProps = Omit<LineProps, "mask">;
export interface LineArrayTexture {
  type: "lineArray";
  mask: MaskShape;
  props: LineArrayProps[];
}

// -- Image
export type ImageProps = BaseProps & {
  fileName: string;
  width: number;
  height: number;
};
export interface ImageTexture {
  type: "image";
  props: ImageProps;
}
export type ImageArrayProps = Omit<ImageProps, "fileName" | "mask">;
export interface ImageArrayTexture {
  type: "imageArray";
  fileName: string;
  mask: MaskShape;
  props: ImageArrayProps[];
}

// -- SpriteSheet
export type SpriteSheetProps = BaseProps & {
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
