import { MaskShape } from "./mask";
import { mutateBaseProps, SpriteBaseProps } from "./props";
import {
  ImageArrayTexture,
  ImageArrayProps,
  ImageTexture,
  ImageProps,
  SpriteSheetTexture,
  SpriteSheetProps,
  LineTexture,
  LineProps,
  RectangleArrayTexture,
  RectangleArrayProps,
  LineArrayProps,
  TextArrayProps,
  TextTexture,
  TextProps,
  TextArrayTexture,
  CircleProps,
  RectangleProps,
  RectangleTexture,
  CircleTexture,
  CircleArrayTexture,
  LineArrayTexture,
} from "./t";

export const t = {
  text: (
    props: Partial<TextProps>,
    update?: (thisProps: TextProps) => void
  ): MutTextTexture => {
    return {
      type: "text",
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
      isMut: true,
    };
  },
  textArray: <ItemState>({
    props,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    props: (itemState: ItemState, index: number) => Partial<TextProps>;
    update?: (
      thisProps: Omit<TextProps, "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutTextArrayTexture<ItemState> => {
    return {
      type: "textArray",
      mask: mask || null,
      props: [],
      newProps: props,
      update,
      testId,
      array,
      isMut: true,
    };
  },
  circle: (
    props: Partial<CircleProps>,
    update?: (thisProps: CircleProps) => void
  ): MutCircleTexture => {
    return {
      type: "circle",
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
      isMut: true,
    };
  },
  circleArray: <ItemState>({
    props,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    props: (itemState: ItemState, index: number) => Partial<CircleProps>;
    update?: (
      thisProps: Omit<CircleProps, "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutCircleArrayTexture<ItemState> => {
    return {
      type: "circleArray",
      mask: mask || null,
      props: [],
      newProps: props,
      update,
      testId,
      array,
      isMut: true,
    };
  },
  rectangle: (
    props: Partial<RectangleProps>,
    update?: (thisProps: RectangleProps) => void
  ): MutRectangleTexture => {
    return {
      type: "rectangle",
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
      isMut: true,
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
    props: (itemState: ItemState, index: number) => Partial<RectangleProps>;
    update?: (
      thisProps: Omit<RectangleProps, "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutRectangleArrayTexture<ItemState> => {
    return {
      type: "rectangleArray",
      mask: mask || null,
      props: [],
      newProps: props,
      update,
      testId,
      array,
      isMut: true,
    };
  },
  line: (
    props: Partial<LineProps>,
    update?: (thisProps: LineProps) => void
  ): MutLineTexture => {
    return {
      type: "line",
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
      isMut: true,
    };
  },
  lineArray: <ItemState>({
    props,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    props: (itemState: ItemState, index: number) => Partial<LineProps>;
    update?: (
      thisProps: Omit<LineProps, "mask">,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutLineArrayTexture<ItemState> => {
    return {
      type: "lineArray",
      mask: mask || null,
      props: [],
      newProps: props,
      update,
      testId,
      array,
      isMut: true,
    };
  },
  image: (
    props: Partial<ImageProps>,
    update?: (thisProps: ImageProps) => void
  ): MutImageTexture => {
    return {
      type: "image",
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
      isMut: true,
    };
  },
  imageArray: <ItemState>({
    props,
    fileName,
    mask,
    update,
    array,
    testId,
  }: {
    mask?: MaskShape;
    fileName: string;
    props: (itemState: ItemState, index: number) => Partial<ImageProps>;
    update?: (
      thisProps: ImageArrayProps,
      itemState: ItemState,
      index: number
    ) => void;
    array: () => ItemState[];
    testId?: (itemState: ItemState, index: number) => string;
  }): MutImageArrayTexture<ItemState> => {
    return {
      type: "imageArray",
      mask: mask || null,
      props: [],
      fileName,
      newProps: props,
      update,
      testId,
      array,
      isMut: true,
    };
  },
  spriteSheet: (
    props: Partial<SpriteSheetProps>,
    update?: (thisProps: SpriteSheetProps) => void
  ): MutSpriteSheetTexture => {
    return {
      type: "spriteSheet",
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
      isMut: true,
    };
  },
};

export type MutableTexture = MutableSingleTexture | MutableArrayTexture;

export type MutableSingleTexture =
  | MutTextTexture
  | MutCircleTexture
  | MutRectangleTexture
  | MutImageTexture
  | MutLineTexture
  | MutSpriteSheetTexture;

export type MutableArrayTexture =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | MutRectangleArrayTexture<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | MutTextArrayTexture<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | MutCircleArrayTexture<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | MutLineArrayTexture<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | MutImageArrayTexture<any>;

// -- Text
export type MutTextTexture = TextTexture & {
  update?: (arg: TextProps) => void;
  isMut: true;
};
export type MutTextArrayTexture<ItemState> = TextArrayTexture & {
  newProps: (itemState: ItemState, index: number) => Partial<TextProps>;
  update?: (
    thisProps: TextArrayProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
  isMut: true;
};

// -- Circle
export type MutCircleTexture = CircleTexture & {
  update?: (arg: CircleProps) => void;
  isMut: true;
};
export type MutCircleArrayTexture<ItemState> = CircleArrayTexture & {
  newProps: (itemState: ItemState, index: number) => Partial<CircleProps>;
  update?: (
    thisProps: Omit<CircleProps, "mask">,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
  isMut: true;
};

// -- Rectangle
export type MutRectangleTexture = RectangleTexture & {
  update?: (thisProps: RectangleProps) => void;
  isMut: true;
};
export type MutRectangleArrayTexture<ItemState> = RectangleArrayTexture & {
  newProps: (itemState: ItemState, index: number) => Partial<RectangleProps>;
  update?: (
    thisProps: RectangleArrayProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
  isMut: true;
};

// -- Line
export type MutLineTexture = LineTexture & {
  update?: (thisProps: LineProps) => void;
  isMut: true;
};
export type MutLineArrayTexture<ItemState> = LineArrayTexture & {
  newProps: (itemState: ItemState, index: number) => Partial<LineProps>;
  update?: (
    thisProps: LineArrayProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
  isMut: true;
};

// -- Image
export type MutImageTexture = ImageTexture & {
  update?: (thisProps: ImageProps) => void;
  isMut: true;
};

export type MutImageArrayTexture<ItemState> = ImageArrayTexture & {
  newProps: (itemState: ItemState, index: number) => Partial<ImageProps>;
  update?: (
    thisProps: ImageArrayProps,
    itemState: ItemState,
    index: number
  ) => void;
  array: () => ItemState[];
  testId?: (itemState: ItemState, index: number) => string;
  isMut: true;
};

// -- SpriteSheet
export type MutSpriteSheetTexture = SpriteSheetTexture & {
  update?: (thisProps: SpriteSheetProps) => void;
  isMut: true;
};

export function newArrayProps(
  texture: MutableArrayTexture,
  textureProps: Partial<MutableArrayTexture["props"][0]>
): SpriteBaseProps {
  switch (texture.type) {
    case "rectangleArray": {
      const props = textureProps as Partial<typeof texture.props[0]>;
      return mutateBaseProps(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
          color: props.color || "black",
        },
        props
      );
    }
    case "textArray": {
      const props = textureProps as Partial<typeof texture.props[0]>;
      return mutateBaseProps(
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
      );
    }
    case "circleArray": {
      const props = textureProps as Partial<typeof texture.props[0]>;
      return mutateBaseProps(
        {
          testId: props.testId,
          radius: props.radius || 10,
          color: props.color || "black",
          gradient: props.gradient,
        },
        props
      );
    }
    case "lineArray": {
      const props = textureProps as Partial<typeof texture.props[0]>;
      return mutateBaseProps(
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
      );
    }
    case "imageArray": {
      const props = textureProps as Partial<typeof texture.props[0]>;
      return mutateBaseProps(
        {
          testId: props.testId,
          width: props.width || 10,
          height: props.height || 10,
        },
        props
      );
    }
  }
}
