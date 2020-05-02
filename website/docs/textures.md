---
id: textures
title: Textures
---

Textures are the basic building blocks of things to render on the screen, like a rectangle or image.

> If you're coming from React, think of Textures as DOM elements like `<div>` and `<span>`.

## Common Props

All Textures share common optional `props`:

- `position`: Set the `x` and `y` position, and optionally rotation (in degrees) around the anchor point.
  ```js
  // E.g.
  { x: 5, y: 10}
  // or
  { x: 5, y: 10, rotation: 90 }
  // Default:
  { x: 0, y: 0, rotation: 0 }
  ```
- `opacity`: A number between 0 and 1. Default `1`.
- `scaleX`: Scale the Texture horizontally around the anchor point. Default `1`.
- `scaleY`: Scale the Texture vertically around the anchor point. Default `1`.
- `anchorX`: Move the `x` anchor point. A value of `1` would move it to the right edge, `-1` to the left edge. Default `0`.
- `anchorY`: Move the `y` anchor point. A value of `1` would move it to the top edge, `-1` to the bottom edge. Default `0`.
- `testId`: Used by [Replay Test](test.md).

For example, you could combine `anchorX` and `scaleX` for a health bar effect:

![anchorX and scaleX usage for health bar](/img/anchor-scale.png)

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
  thickness: 1,
  path: [
    [10, 20],
    [10, 30],
    [20, 30],
  ],
})
```

#### Props

- `color`: An RGB hex value (e.g. `#ff0000`) or [CSS Level 1 keyword](https://developer.mozilla.org/docs/Web/CSS/color_value) (e.g. `green`).
- `thickness`: Line thickness.
- `path`: An array of `[x, y]` coordinates to draw the line.

## Text

#### Example

```js
t.text({
  font: { name: "Calibri", size: 16 },
  text: "Hello Replay",
  color: "#ff0000",
})
```
#### Props

- `font`: (Optional) Set the font name and size. If not provided, will use the game's default font (see [Top-Level Game](top-level-game.md)).
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
