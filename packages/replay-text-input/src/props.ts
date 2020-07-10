export type TextInputProps = {
  /**
   * A locally unique ID
   */
  id: string;
  fontName: string;
  fontSize: number;
  /**
   * The text to show in the input. Users typing will trigger `onChangeText` but
   * will not automatically change the text shown in the input.
   */
  text: string;
  /**
   * Get changes from user, to update the input's state.
   */
  onChangeText: (text: string) => void;
  /**
   * Number of lines text input shows. You should not switch between single and
   * multi-line for the same text input.
   *
   * @default 1
   */
  numberOfLines?: number;
  /**
   * Alignment of text in input field.
   *
   * @default "center"
   */
  align?: "left" | "center" | "right";
  /**
   * An RGB hex value (e.g. `#ff0000`) or CSS Level 1 keyword (e.g. `green`)
   *
   * @default "black"
   */
  color?: string;
  width: number;
  x?: number;
  y?: number;
};
