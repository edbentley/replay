import { NativeSpriteImplementation, NativeSpriteUtils } from "@replay/core";
import { TextInputProps } from "./props";

type TextInputState = {
  domId: string;
  storedProps: TextInputProps;
  selectionEnd: number | null;
};

/**
 * Text input for the web. Note that it will always be on top of other Sprites,
 * regardless of its ordering. It can also appear outside of canvas area.
 */
export const TextInputWeb: NativeSpriteImplementation<
  TextInputProps,
  TextInputState
> = {
  create: ({ props, parentGlobalId, getState, updateState, utils }) => {
    const domId = `${parentGlobalId}--${props.id}`;

    let inputElement;
    if (!props.numberOfLines || props.numberOfLines <= 1) {
      inputElement = document.createElement("input");
      inputElement.type = "text";
    } else {
      inputElement = document.createElement("textarea");
      inputElement.style.resize = "none";
    }
    inputElement.id = domId;
    inputElement.style.padding = `${padding}px`;
    inputElement.style.borderWidth = `${border}px`;
    inputElement.style.position = "absolute";

    updateInput(inputElement, props, null, utils);

    inputElement.addEventListener("input", (e) => {
      const thisInput = e.currentTarget as
        | HTMLInputElement
        | HTMLTextAreaElement;

      const selectionEnd = thisInput.selectionEnd;

      // Store previous cursor position
      updateState({ selectionEnd });

      const state = getState();

      state.storedProps.onChangeText(thisInput.value);

      // Reset the value so that the input is controlled by props
      thisInput.value = state.storedProps.text;

      // Reapply previous cursor position, otherwise it jumps to the end
      thisInput.selectionEnd = selectionEnd ? selectionEnd - 1 : null;
    });

    document.body.appendChild(inputElement);

    return { domId, storedProps: props, selectionEnd: null };
  },
  loop: ({ props, state, utils }) => {
    const domId = state.domId;

    let didUpdateProps = false;
    for (const [propKey, propValue] of Object.entries(props)) {
      for (const [stateKey, stateValue] of Object.entries(state.storedProps)) {
        // Check if props updated
        if (
          propKey === stateKey &&
          propValue !== stateValue &&
          !propsThatDontUpdate.includes(propKey)
        ) {
          didUpdateProps = true;
          break;
        }
      }
      if (didUpdateProps) {
        break;
      }
    }

    if (utils.didResize || didUpdateProps) {
      const inputElement = document.getElementById(domId);
      if (!inputElement) {
        throw Error(`No input found with id ${domId}`);
      }
      updateInput(
        inputElement as HTMLInputElement | HTMLTextAreaElement,
        props,
        state.selectionEnd,
        utils
      );
    }

    return { domId, storedProps: props, selectionEnd: state.selectionEnd };
  },
  cleanup: ({ state }) => {
    const domId = state.domId;
    const inputElement = document.getElementById(domId);
    if (!inputElement) {
      throw Error(`No input found with id ${domId}`);
    }
    document.body.removeChild(inputElement);
  },
};

const propsThatDontUpdate = ["id", "onChangeText"];

const padding = 2;
const border = 1;

function updateInput(
  inputElement: HTMLInputElement | HTMLTextAreaElement,
  props: TextInputProps,
  selectionEnd: number | null,
  utils: NativeSpriteUtils
) {
  // Text value
  inputElement.value = props.text;
  if (selectionEnd !== null) {
    // Reapply stored cursor position, otherwise it jumps to the end
    inputElement.selectionEnd = selectionEnd;
  }

  // Font
  inputElement.style.font = `${props.fontSize}px ${props.fontName}`;

  // Text align
  inputElement.style.textAlign = props.align || "center";

  // Colour
  inputElement.style.color = props.color || "black";

  // Width
  inputElement.style.width = `${props.width}px`;

  // Height
  inputElement.style.lineHeight = `${props.fontSize}px`;
  const height =
    props.fontSize * (props.numberOfLines || 1) + padding * 2 + border * 2;
  inputElement.style.height = `${height}px`;

  // Positioning
  const leftX = utils.gameXToPlatformX(props.x || 0) - props.width / 2;
  inputElement.style.left = `${leftX}px`;

  const topY = utils.gameYToPlatformY(props.y || 0) - height / 2;
  inputElement.style.top = `${topY}px`;
}
