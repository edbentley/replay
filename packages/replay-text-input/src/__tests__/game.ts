import { makeSprite, GameProps } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { TextInput } from "..";

interface State {
  view: "none" | "single-line" | "multi-line" | "five-inputs" | "fixed-value";
  textValue: string;
}

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 500,
    height: 300,
    maxWidthMargin: 50,
    maxHeightMargin: 50,
  },
};

export const Game = makeSprite<GameProps, State, iOSInputs | WebInputs>({
  init({ getInputs }) {
    const { pointer } = getInputs();
    return {
      view: getViewFromPointer(pointer.x),
      textValue: "Hello",
    };
  },

  loop({ state, getInputs, updateState }) {
    const { pointer } = getInputs();

    if (pointer.justPressed) {
      updateState((s) => ({ ...s, view: getViewFromPointer(pointer.x) }));
    }

    return state;
  },

  render({ state, updateState }) {
    switch (state.view) {
      case "none":
        return [];

      case "single-line":
        return [
          TextInput({
            id: "input",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
        ];

      case "multi-line":
        return [
          TextInput({
            id: "multiline-input",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            numberOfLines: 2,
            width: 100,
          }),
        ];

      case "fixed-value":
        return [
          TextInput({
            id: "input",
            fontName: "sans-serif",
            fontSize: 12,
            text: "Fixed",
            onChangeText: () => null,
            width: 100,
          }),
        ];

      case "five-inputs":
        return [
          TextInput({
            id: "input1",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
          TextInput({
            id: "input2",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
          TextInput({
            id: "input3",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
          TextInput({
            id: "input4",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
          TextInput({
            id: "input5",
            fontName: "sans-serif",
            fontSize: 12,
            text: state.textValue,
            onChangeText: (text) => {
              updateState((s) => ({ ...s, textValue: text }));
            },
            width: 100,
          }),
        ];
    }
  },
});

function getViewFromPointer(x: number): State["view"] {
  switch (x) {
    case 100:
      return "none";
    case 101:
      return "single-line";
    case 102:
      return "multi-line";
    case 103:
      return "five-inputs";
    case 104:
      return "fixed-value";
    default:
      return "single-line";
  }
}
