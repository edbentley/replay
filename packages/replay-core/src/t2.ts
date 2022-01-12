import { SpriteBaseProps, mutateBaseProps } from "./props";
import { Gradient, TextureFont } from "./t";

export const t = {
  text: (
    arg: Partial<TextProps>,
    update?: (arg: TextProps, index: number) => void
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
    update?: (arg: CircleProps, index: number) => void
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
};

interface TestProps {
  testId?: string;
}

type BaseProps = TestProps & SpriteBaseProps;

/**
 * A Replay texture
 */
export type MutSingleTexture = MutTextTexture | MutCircleTexture;

export type MutTexture = MutSingleTexture;

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
  update?: (arg: CircleProps, index: number) => void;
}
