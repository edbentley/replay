---
id: textures
title: Textures
---

Textures are the basic building blocks of things to render on the screen, like a rectangle or image.

> If you're coming from React, think of Textures as DOM elements like `<div>` and `<span>`.

## Common Props

Textures share the same [common props as Sprites](sprites.md#common-props), except for `id` which isn't required. Textures also accept a `testId` prop which is used by [Replay Test](test.md).

## Circle

#### Example

```js
t.circle({
  radius: 5,
  color: "#ff0000",
})
```

#### Props

- `radius`: Radius of the circle in game coordinates.
- `color`: An RGB hex value (e.g. `#ff0000`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `green`).

## Rectangle

#### Example

```js
t.rectangle({
  width: 10,
  height: 20,
  color: "#ff0000",
})
```

#### Props

- `width`: Width of the rectangle in game coordinates.
- `height`: Height of the rectangle in game coordinates.
- `color`: An RGB hex value (e.g. `#ff0000`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `green`).

## Line

#### Example

```js
t.line({
  color: "#ff0000",
  thickness: 2,
  path: [
    [10, 20],
    [10, 30],
    [20, 30],
  ],
})
```

#### Props

- `color`: An RGB hex value (e.g. `#ff0000`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `green`).
- `path`: An array of `[x, y]` coordinates to draw the line.
- `thickness`: (Optional) Line thickness. Default `1`.
- `rounded`: (Optional) Set if the ends of the line should be rounded or not. Default `false`.

## Text

#### Example

```js
t.text({
  font: { name: "Calibri", size: 16 },
  align: "left",
  text: "Hello Replay",
  color: "#ff0000",
})
```
#### Props

- `font`: (Optional) Set the font name and size. If not provided, will use the game's default font (see [Top-Level Game](top-level-game.md)).
- `align`: (Optional) Alignment of text around x position, can be `"left"`, `"center"` or `"right"`. `"left"` will put the left edge of the text at the Texture's x position. Default `"center"`.
- `text`: A string to display.
- `color`: An RGB hex value (e.g. `#ff0000`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `green`).

## Image

#### Example

```js
t.image({
  fileName: "player.png",
  width: 30,
  height: 80,
})
```

#### Props

- `fileName`: The name of the file to render.
- `width`: Scale the image to this width in game coordinates.
- `height`: Scale the image to this height in game coordinates.

## Sprite Sheet

The sprite sheet Texture provides a way to render a section of an image. Iterate through the `index` over time to achieve an animation effect. All tiles should be of equal width and height.

#### Example

```js
t.spriteSheet({
  fileName: "player-tiles.png",
  columns: 3,
  rows: 6,
  index: state.frame,
  width: 50,
  height: 60,
})
```

#### Props

- `fileName`: The name of the sprite sheet file to render.
- `columns`: The number of columns of tiles in the sprite sheet.
- `rows`: The number of rows of tiles in the sprite sheet.
- `index`: The tile to display. An index of `0` will be the top-left tile, moves left to right then top to bottom. An index greater than the number of tiles will loop back to an index of `0`.
- `width`: Scale the displayed tile to this width in game coordinates.
- `height`: Scale the displayed tile to this height in game coordinates.

<img src="/img/sprite-sheet-index.png" width="50%" />
