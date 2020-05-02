import { SpritePosition } from "./sprite";

export type TextureFont = {
  /**
   * Font name
   */
  name: string;
  /**
   * Size of font in relation to game size
   */
  size: number;
};

/**
 * `t` is a util which contains functions to create every type of Texture.
 */
export const t = {
  text: (props: {
    // we intentionally redefine the props here to show the individual fields in
    // VS code tooltips for easier filling in

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
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "text", props };
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
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "circle", props };
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
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "rectangle", props };
  },
  line: (props: {
    /**
     * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
     */
    color: string;
    opacity?: number;
    scaleX?: number;
    scaleY?: number;
    anchorX?: number;
    anchorY?: number;
    thickness: number;
    /**
     * Coordinates of [x, y] to draw line, first coordinate is where the line
     * starts
     */
    path: [number, number][];
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "line", props };
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
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "image", props };
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
    position?: {
      x: number;
      y: number;
      rotation?: number;
    };
    testId?: string;
  }): Texture => {
    return { type: "spriteSheet", props };
  },
};

interface TestProps {
  testId?: string;
}

interface Properties {
  opacity?: number;
  scaleX?: number;
  scaleY?: number;
  anchorX?: number;
  anchorY?: number;
}

type BaseProps = TestProps & SpritePosition & Properties;

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
  color: string;
  thickness: number;
  path: [number, number][];
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
