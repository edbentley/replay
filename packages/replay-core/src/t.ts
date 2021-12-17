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
  }): Texture => {
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
  }): Texture => {
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
  }): Texture => {
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
  }): Texture => {
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
  }): Texture => {
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
  }): Texture => {
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
type TextProps = BaseProps & {
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

export interface RectangleArrayTexture {
  type: "rectangleArray";
  mask: MaskShape;
  props: Omit<RectangleProps, "mask" | "gradient">[];
}

// -- Line
type LineProps = BaseProps & {
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

export interface ImageArrayTexture {
  type: "imageArray";
  fileName: string;
  mask: MaskShape;
  props: Omit<ImageProps, "fileName" | "mask">[];
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
