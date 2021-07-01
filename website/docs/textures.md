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
- `color`: A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`).
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).

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
- `color`: A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`).
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).

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

> Make sure one of `color`, `gradient`, `fillColor` or `fillGradient` is set, otherwise nothing will be drawn!

- `color`: (Optional) A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`) of the stroke colour. Default no stroke.
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).
- `fillColor`: (Optional) A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`) to fill in the shape of the path with a colour. Default no fill.
- `fillGradient`: (Optional) Override the `fillColor` prop with a [gradient](#gradient).
- `path`: An array of `[x, y]` coordinates to draw the line.
- `thickness`: (Optional) Line thickness. Default `1`.
- `lineCap`: (Optional) The shape of the line ends. Can be one of:
  - `"butt"`: (Default) The ends of lines are squared off at the endpoints.
  - `"round"`: The ends of lines are rounded.
  - `"square"`: The ends of lines are squared off by adding a box with an equal width and half the height of the line's thickness.

## Text

#### Example

```js
t.text({
  font: { family: "Calibri", size: 16, align: "left", },
  text: "Hello Replay",
  color: "#ff0000",
})
```
#### Props

- `text`: A string to display.
- `color`: A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`).
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).
- `strokeColor`: (Optional) Apply a stroke to the text, must be a [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
- `strokeThickness`: (Optional) Thickness of stroke. Default `1`.
- `font`: (Optional) Set the font family, size, etc. If any properties are not provided, will cascade from the game's default font (see [Top-Level Game](top-level-game.md)).
  - `family`: (Optional) Font family, e.g. `"Helvetica"`
  - `size`: (Optional) Font size, e.g. `20`
  - `weight`: (Optional) Font weight, e.g. `"bold"`, `500`
  - `style`: (Optional) Font style, typically either `"normal"` (default) or `"italic"`
  - `baseline`: (Optional) Alignment of text around y position, can be `"top"`, `"hanging"`, `"middle"` (default), `"alphabetic"`, `"ideographic"`, `"bottom"`
  - `align`: (Optional) Alignment of text around x position, can be `"left"`, `"center"` or `"right"`. `"left"` will put the left edge of the text at the Texture's x position. Default `"center"`.

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

- `fileName`: The name of the file to render. Note that this file must be loaded using [`preloadFiles`](sprites.md#init) before you render the Texture.
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

- `fileName`: The name of the sprite sheet file to render. Note that this file must be loaded using [`preloadFiles`](sprites.md#init) before you render the Texture.
- `columns`: The number of columns of tiles in the sprite sheet.
- `rows`: The number of rows of tiles in the sprite sheet.
- `index`: The tile to display. An index of `0` will be the top-left tile, moves left to right then top to bottom. An index greater than the number of tiles will loop back to an index of `0`.
- `width`: Scale the displayed tile to this width in game coordinates.
- `height`: Scale the displayed tile to this height in game coordinates.

<img src="/img/sprite-sheet-index.png" width="50%" />

## Gradient

A colour gradient effect can be achieved through the `gradient` prop. Pass in an object with the following fields:

- `type`: Must be `"linear"`.
- `path`: A tuple of start and end `[x, y]` coordinates to draw the gradient line.
- `colors`: An array of objects with fields:
  - `color`: A [CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) (e.g. `#ff0000`, `green`).
  - `offset`: Distance of `color` along gradient line, must be between 0 - 1.

#### Example

```js
t.rectangle({
  width: 10,
  height: 10,
  color: "white",
  gradient: {
    type: "linear",
    path: [
      [-5, 0],
      [5, 0],
    ],
    colors: [
      { offset: 0, color: "black" },
      { offset: 0.5, color: "white" },
      { offset: 1, color: "black" },
    ],
  },
}),
```
