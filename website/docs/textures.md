---
id: textures
title: Textures
---

Textures are the basic building blocks of things to render on the screen, like a rectangle or image.

> If you're coming from React, think of Textures as DOM elements like `<div>` and `<span>`.

## Common Props

Textures share the same [common props as Sprites](sprites.md#common-props), except for `id` which isn't required. Textures also accept a `testId` prop which is used by [Replay Test](test.md).

## Array Textures

Using Array Textures (e.g. `t.rectangleArray`) enables batch rendering for improved performance. The elements in the `props` arrays share the same [common props as other Textures](#common-props) except for the `mask` prop, which is set once outside of the array.

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
- `color`: A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`).

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
- `color`: A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`).
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).

## Rectangle Array

#### Example

```js
t.rectangleArray({
  props: [
    {
      width: 10,
      height: 20,
      color: "#FF0000",
    },
    {
      width: 50,
      height: 20,
      color: "#0000FF",
      x: 100,
    },
  ],
})
```

#### Props

- `mask`: (Optional) See [Mask](mask.md).
- `props`: An array of the following:
  - `width`: Width of the rectangle in game coordinates.
  - `height`: Height of the rectangle in game coordinates.
  - `color`: A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`).

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

> Make sure one of `color`, `fillColor` or `fillGradient` is set, otherwise nothing will be drawn!

- `color`: (Optional) A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`) of the stroke colour. Default no stroke.
- `fillColor`: (Optional) A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`) to fill in the shape of the path with a colour. Default no fill.
- `fillGradient`: (Optional) Set a fill [gradient](#gradient) instead of using the `fillColor` prop. Default no gradient fill.
- `path`: An array of `[x, y]` coordinates to draw the line.
- `thickness`: (Optional) Line thickness. Default `1`.
- `lineCap`: (Optional) The shape of the line ends. Can be one of:
  - `"butt"`: (Default) The ends of lines are squared off at the endpoints.
  - `"round"`: The ends of lines are rounded.

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
- `color`: A [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`).
- `gradient`: (Optional) Override the `color` prop with a [gradient](#gradient).
- `strokeColor`: (Optional) Apply a stroke to the text, must be a [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex.
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

## Image Array

#### Example

```js
t.imageArray({
  fileName: "enemy.png",
  props: [
    {
      width: 10,
      height: 10,
    },
    {
      width: 10,
      height: 10,
      x: 100,
    },
  ],
})
```

#### Props

- `fileName`: The name of the file to render. Note batching is only available per image file.
- `mask`: (Optional) See [Mask](mask.md).
- `props`: An array of the following:
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

A colour gradient effect can be achieved through the `gradient` props. Pass in one of the following objects:

### Horizontal Gradient

- `type`: `"linearHoriz"`
- `colors`: An array of [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`) colours in left to right order spread evenly.
- `opacities`: (Optional) An array of opacities for each colour in `colors`.
- `width`: Width between first and last colour in game coordinates.

### Vertical Gradient

- `type`: `"linearVert"`
- `colors`: An array of [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`) colours in top to bottom order spread evenly.
- `opacities`: (Optional) An array of opacities for each colour in `colors`.
- `height`: Height between first and last colour in game coordinates.

#### Example

```js
t.rectangle({
  width: 10,
  height: 10,
  color: "white",
  gradient: {
    type: "linearVert",
    colors: ["#FF0000", "#0000FF"],
    opacities: [0.5, 1],
    height: 5,
  },
}),
```
