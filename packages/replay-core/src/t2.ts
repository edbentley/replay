import { MaskShape } from "./mask";
import { SpriteBaseProps, mutateBaseProps } from "./props";
import { Gradient, TextureFont } from "./t";

export const t = {
  text: (
    props: Partial<TextProps>,
    update?: (thisProps: TextProps, index: number) => void
  ): MutTextTexture => {
    return {
      type: "mutText",
      props: mutateBaseProps(
        {
          testId: props.testId,
          font: props.font,
          text: props.text || "",
          color: props.color || "black",
          gradient: props.gradient,
          strokeColor: props.strokeColor,
          strokeThickness: props.strokeThickness,
        },
        props
      ),
      update,
    };
  },
  circle: (
    props: Partial<CircleProps>,
    update?: (thisProps: CircleProps) => void
  ): MutCircleTexture => {
    return {
      type: "mutCircle",
      props: mutateBaseProps(
        {
          testId: props.testId,
          radius: props.radius || 10,
          color: props.color || "black",
          gradient: props.gradient,
        },
        props
      ),
      update,
    };
  },
  rectangle: (
    props: Partial<RectangleProps>,
    update?: (thisProps: RectangleProps) => void
  ): MutRectangleTexture => {
    return {
      type: "mutRectangle",
      props: mutateBaseProps(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
          color: props.color || "black",
          gradient: props.gradient,
        },
        props
      ),
      update,
    };
  },
  rectangleArray: <ItemState>({
    props,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    props: Partial<RectangleProps>;
    update: (
      thisProps: Omit<RectangleProps, "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutRectangleArrayTexture<ItemState> => {
    return {
      type: "mutRectangleArray",
      mask: mask || null,
      props: mutateBaseProps(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
          color: props.color || "black",
          gradient: props.gradient,
        },
        props
      ),
      update,
      testId,
      array,
    };
  },
  line: (
    props: Partial<LineProps>,
    update?: (thisProps: LineProps) => void
  ): MutLineTexture => {
    return {
      type: "mutLine",
      props: mutateBaseProps(
        {
          testId: props.testId,
          color: props.color,
          fillColor: props.fillColor,
          thickness: props.thickness ?? 1,
          lineCap: props.lineCap || "butt",
          path: props.path || [],
          gradient: props.gradient,
          fillGradient: props.fillGradient,
        },
        props
      ),
      update,
    };
  },
  image: (
    props: Partial<ImageProps>,
    update?: (thisProps: ImageProps) => void
  ): MutImageTexture => {
    return {
      type: "mutImage",
      props: mutateBaseProps(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
          fileName: props.fileName || "<not set>",
        },
        props
      ),
      update,
    };
  },
  imageArray: <ItemState>({
    props,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    props: Partial<ImageProps>;
    update: (
      thisProps: ImageArrayItemProps,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutImageArrayTexture<ItemState> => {
    return {
      type: "mutImageArray",
      fileName: props.fileName || "<not set>",
      mask: mask || null,
      props: mutateBaseProps<Omit<ImageProps, "fileName">>(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
        },
        props
      ),
      update,
      testId,
      array,
    };
  },
  spriteSheet: (
    props: Partial<SpriteSheetProps>,
    update?: (thisProps: SpriteSheetProps) => void
  ): MutSpriteSheetTexture => {
    return {
      type: "mutSpriteSheet",
      props: mutateBaseProps(
        {
          testId: props.testId,
          fileName: props.fileName || "<not set>",
          columns: props.columns || 1,
          rows: props.rows || 1,
          index: props.index || 0,
          width: props.width || 10,
          height: props.height || 10,
        },
        props
      ),
      update,
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
export type MutSingleTexture =
  | MutTextTexture
  | MutCircleTexture
  | MutRectangleTexture
  | MutImageTexture
  | MutLineTexture
  | MutSpriteSheetTexture;

export type MutTexture = MutSingleTexture | MutArrayTexture;
export type RenderableMutTexture = MutSingleTexture | MutArrayTextureRenderable;

export type MutArrayTexture =
  | MutRectangleArrayTexture<any>
  | MutImageArrayTexture<any>;
export type MutArrayTextureRenderable =
  | MutRectangleArrayTextureRender
  | MutImageArrayTextureRender;

// -- Text
type TextProps = BaseProps & {
  font?: TextureFont;
  text: string;
  color: string;
  gradient?: Gradient;
  strokeColor?: string;
  strokeThickness?: number;
};
export interface MutTextTexture {
  type: "mutText";
  props: TextProps;
  update?: (arg: TextProps, index: number) => void;
}

// -- Circle
type CircleProps = BaseProps & {
  radius: number;
  color: string;
  gradient?: Gradient;
};
export interface MutCircleTexture {
  type: "mutCircle";
  props: CircleProps;
  update?: (arg: CircleProps) => void;
}

// -- Rectangle
type RectangleProps = BaseProps & {
  width: number;
  height: number;
  color: string;
  gradient?: Gradient;
};
export interface MutRectangleTexture {
  type: "mutRectangle";
  props: RectangleProps;
  update?: (thisProps: RectangleProps) => void;
}
export interface MutRectangleArrayTexture<ItemState> {
  type: "mutRectangleArray";
  mask: MaskShape;
  props: RectangleProps;
  update: (
    thisProps: Omit<RectangleProps, "mask">,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
}
export interface MutRectangleArrayTextureRender {
  type: "mutRectangleArrayRender";
  mask: MaskShape;
  props: RectangleProps[];
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
export interface MutLineTexture {
  type: "mutLine";
  props: LineProps;
  update?: (thisProps: LineProps) => void;
}

// -- Image
type ImageProps = BaseProps & {
  fileName: string;
  width: number;
  height: number;
};
export interface MutImageTexture {
  type: "mutImage";
  props: ImageProps;
  update?: (thisProps: ImageProps) => void;
}

type ImageArrayItemProps = Omit<ImageProps, "fileName" | "mask">;

export interface MutImageArrayTexture<ItemState> {
  type: "mutImageArray";
  fileName: string;
  props: ImageArrayItemProps;
  mask: MaskShape;
  update: (
    thisProps: ImageArrayItemProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
}
export interface MutImageArrayTextureRender {
  type: "mutImageArrayRender";
  fileName: string;
  mask: MaskShape;
  props: ImageArrayItemProps[];
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
export interface MutSpriteSheetTexture {
  type: "mutSpriteSheet";
  props: SpriteSheetProps;
  update?: (thisProps: SpriteSheetProps) => void;
}
