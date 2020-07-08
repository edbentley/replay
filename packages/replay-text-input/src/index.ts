import { makeNativeSprite } from "@replay/core";
import { TextInputProps } from "./props";

export { TextInputWeb } from "./web";

/**
 * Native Sprite for Text Inputs. Will always be on top of other Sprites,
 * regardless of its ordering.
 */
export const TextInput = makeNativeSprite<TextInputProps>("TextInput");
