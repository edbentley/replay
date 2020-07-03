import { makeNativeSprite } from "@replay/core";
import { TextInputProps } from "./props";

export { TextInputWeb } from "./web";

export const TextInput = makeNativeSprite<TextInputProps>("TextInput");
