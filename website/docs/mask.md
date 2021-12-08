---
id: mask
title: Mask
---

Adding a mask to a Sprite or Texture ensures it only renders what's within the outline of the mask shape.

:::tip Important
Nested masks (using a mask within a Sprite which already has a mask) are currently not supported.
:::

## Circle Mask

#### Example

```js {7-10}
import { t, mask } from "@replay/core";

t.rectangle({
  width: 100,
  height: 100,
  color: "black",
  x: 50,
  mask: mask.circle({
    radius: 5,
    x: 10,
  }),
}),
```

> Masks are drawn relative to the `x` and `y` props of the texture / Sprite applied to. In this case, the mask would have an `x` of 60 in the parent Sprite's coordinates.

#### Props

- `radius`: Radius of the circle in game coordinates.
- `x`: (Optional) x coordinate of circle. Default `0`.
- `y`: (Optional) y coordinate of circle. Default `0`.

## Rectangle Mask

#### Example

```js {5-9}
import { mask } from "@replay/core";

MySprite({
  id: "MySprite",
  mask: mask.rectangle({
    width: 5,
    height: 5,
    y: 10,
  }),
}),
```

#### Props

- `width`: Width of the rectangle in game coordinates.
- `height`: Height of the rectangle in game coordinates.
- `x`: (Optional) x coordinate of rectangle. Default `0`.
- `y`: (Optional) y coordinate of rectangle. Default `0`.

## Line Mask

#### Example

```js {7-13}
import { t, mask } from "@replay/core";

t.rectangle({
  width: 100,
  height: 100,
  color: "black",
  mask: mask.line({
    path: [
      [0, 0],
      [10, 0],
      [10, 10],
    ],
  }),
}),
```

#### Props

- `path`: An array of `[x, y]` coordinates to draw the mask shape outline.
- `x`: (Optional) x coordinate of line. Default `0`.
- `y`: (Optional) y coordinate of line. Default `0`.
