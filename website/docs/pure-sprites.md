---
id: pure-sprites
title: Pure Sprites
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

If your game has so many Sprites and Textures it can't run at a smooth 60 frames per second, you can use Replay's _Pure Sprites_ to improve performance.

:::caution note
Only use Pure Sprites if you're having performance issues. They add additional complexity to your game and the potential for more bugs. Regular Sprites are still really fast!
:::

You can create a Pure Sprite by passing an object into the `makePureSprite` function:

<Tabs
  defaultValue="js"
  groupId="code"
  values={[
    { label: 'JavaScript', value: 'js', },
    { label: 'TypeScript', value: 'ts', },
  ]
}>
<TabItem value="js">

```js
import { t, makePureSprite } from "@replay/core";

export const Player = makePureSprite({
  shouldRerender(prevProps, newProps) {
    return prevProps.color !== newProps.color;
  },

  render({ props }) {
    return [
      t.circle({
        radius: 10,
        color: props.color,
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { t, makePureSprite } from "@replay/core";

type Props = {
  color: string;
};
export const Player = makePureSprite<Props>({
  shouldRerender(prevProps, newProps) {
    return prevProps.color !== newProps.color;
  },

  render({ props }) {
    return [
      t.circle({
        radius: 10,
        color: props.color,
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

The Sprite object passed into `makePureSprite` must have the methods `render` and `shouldRerender` defined. `render` is similar to a regular Sprite, but with only a `props` and `size` parameter, and **can only return [Textures](textures.md) or other Pure Sprites**. Pure Sprites do not have state or access to the `device` parameter.

`shouldRerender` is how Replay optimises your Sprite. Based on the last frame's props and the current frame's props, you must return a `boolean` of whether the Sprite needs to be redrawn. In our example above, if the `color` prop doesn't change, we don't need to call `render` again (since the return value will be the same). This caching can save time over many renders and improve your game's performance.

## Common Props

Pure Sprites share the same [common props as Sprites](sprites.md#common-props).

## Sprite Methods

### `shouldRerender`

Returns whether the render function needs to be called again based on the change of props. Reducing the number of renders can boost performance.

```js
  shouldRerender(prevProps, newProps) {
    return boolean;
  },
```

#### Parameters

- `prevProps`: Last frame's props.
- `newProps`: Current frame's props.

### `render`

Returns an array of Pure Sprites or Textures to render.

```js
  render({ props, size }) {
    return [ ... ];
  },
```

#### Parameters

- `props`: The props passed in by the parent Sprite.
- `size`: The `size` field of the [Device](device.md) object.

### `renderP`

An alternative render method run if the device is in portrait. See [Game Size](game-size.md) for more.

### `renderXL`

An alternative render method run for large screens. See [Game Size](game-size.md) for more.

### `renderPXL`

An alternative render method run for large screens if the device is in portrait. See [Game Size](game-size.md) for more.
