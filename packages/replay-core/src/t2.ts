import { SpriteBaseProps, mutateBaseProps } from "./props";
import { Gradient, TextureFont } from "./t";

export const t = {
  text: (
    arg: Partial<TextProps>,
    update?: (thisProps: TextProps, index: number) => void
  ): MutTextTexture => {
    return {
      type: "mutText",
      props: mutateBaseProps(
        {
          text: arg.text || "",
          color: arg.color || "black",
        },
        arg
      ),
      update,
    };
  },
  circle: (
    arg: Partial<CircleProps>,
    update?: (thisProps: CircleProps) => void
  ): MutCircleTexture => {
    return {
      type: "mutCircle",
      props: mutateBaseProps(
        {
          radius: arg.radius || 10,
          color: arg.color || "black",
        },
        arg
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
          width: props.width || 10,
          height: props.height || 10,
          color: props.color || "black",
        },
        props
      ),
      update,
    };
  },
  rectangleArray: <ItemState>({
    props,
    update,
    array,
  }: {
    // mask?: MaskShape;
    props: Partial<RectangleProps>;
    update: (
      thisProps: RectangleProps,
      itemState: ItemState,
      index: number
    ) => void;
    array: ItemState[];
  }): MutRectangleArrayTexture<ItemState> => {
    return {
      type: "mutRectangleArray",
      // mask: arg.mask || null,
      props: mutateBaseProps(
        {
          width: props.width || 10,
          height: props.height || 10,
          color: props.color || "black",
        },
        props
      ),
      update,
      array,
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
    update,
    array,
  }: {
    // mask?: MaskShape;
    props: Partial<ImageProps>;
    update: (
      thisProps: Omit<ImageProps, "fileName" | "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: ItemState[];
  }): MutImageArrayTexture<ItemState> => {
    return {
      type: "mutImageArray",
      // mask: arg.mask || null,
      props: mutateBaseProps(
        {
          width: props.width || 10,
          height: props.height || 10,
          fileName: props.fileName || "<not set>",
        },
        props
      ),
      update,
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
  // mask: MaskShape;
  props: RectangleProps;
  update: (
    thisProps: RectangleProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: ItemState[];
}
export interface MutRectangleArrayTextureRender {
  type: "mutRectangleArrayRender";
  mask: null;
  props: RectangleProps[];
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

export interface MutImageArrayTexture<ItemState> {
  type: "mutImageArray";
  props: ImageProps;
  update: (
    thisProps: Omit<ImageProps, "fileName" | "mask">,
    itemState: ItemState,
    index: number
  ) => void;
  array: ItemState[];
}
export interface MutImageArrayTextureRender {
  type: "mutImageArrayRender";
  fileName: string;
  mask: null;
  props: ImageProps[];
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
