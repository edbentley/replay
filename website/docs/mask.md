---
id: mask
title: Mask
---

Adding a mask to a Sprite or Texture ensures it only renders what's within the outline of the mask shape.

## Circle Mask

#### Example

```js {7-10}
import { t, mask } from "@replay/core";

t.rectangle({
  width: 100,
  height: 100,
  color: "black",
  mask: mask.circle({
    radius: 5,
    x: 10,
  }),
}),
```

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
