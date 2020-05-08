import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";

export function isWebInput(input: iOSInputs | WebInputs): input is WebInputs {
  return "keysDown" in input;
}
