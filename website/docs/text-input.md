---
id: text-input
title: TextInput
---

To add a text input to your game, use the `@replay/text-input` package.

#### Example

```js title="my-sprite.js"
import { TextInput } from "@replay/text-input";

const MySprite = makeSprite({
  render({ state }) {
    return [
      TextInput({
        id: "MyInput",
        fontName: "Calibri",
        fontSize: 20,
        // We control the text in the input through our state.text field
        text: state.text,
        onChangeText: (text) => {
          // Update our state.text field with new value when typing occurs
          updateState((s) => ({ ...s, text }));
        },
        width: 100,
      }),
    ];
  },
});
```

```js {1,6} title="src/index.js"
import { TextInputWeb } from "@replay/text-input";

export const options = {
  { TextInput: TextInputWeb }
};
```

#### Props

- `id`: (Required) Identifier, must be unique within a single render function.
- `fontName`: (Required) Name of the font to use.
- `fontSize`: (Required) Size of the font in game coordinates.
- `text`: (Required) The text to show in the input. Users typing will trigger `onChangeText` but will not automatically change the text shown in the input.
- `onChangeText`: (Required) A callback with the updated text value when the player types.
- `width`: (Required) Width of the text input in game coordinates.
- `numberOfLines`: Number of lines text input shows. You should not switch between single and multi-line for the same text input. Default `1`.
- `align`: Alignment of text in input field, can be `"left"`, `"right"` or `"center"`. Default `"center"`.
- `x`: x coordinate of input. Default `0`.
- `y`: y coordinate of input. Default `0`.
- `color`: An RGB hex value (e.g. `"#ff0000"`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `"green"`). Default `"black"`.
