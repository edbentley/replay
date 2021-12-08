---
id: top-level-game
title: Top-Level Game
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Your top-level Sprite is your `Game`. It's a special Sprite that's called by the platform directly. All other Sprites are children of the `Game` Sprite.

You define `Game` (using `makeSprite`) and its `gameProps` separately:

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
import { makeSprite } from "@replay/core";

export const gameProps = {
  id: "Game",
  size: {
    width: 400,
    height: 600,
    maxHeightMargin: 150,
  },
  defaultFont: {
    name: "Courier",
    size: 10,
  },
};

export const Game = makeSprite({
  init({ device }) {
    ...
  },

  render({ state, updateState, device }) {
    ...
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeSprite, GameProps } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 400,
    height: 600,
    maxHeightMargin: 150,
  },
  defaultFont: {
    name: "Courier",
    size: 10,
  },
  backgroundColor: "blue",
};

type GameState = {
  ...
};

export const Game = makeSprite<GameProps, GameState, WebInputs | iOSInputs>({
  init({ device }) {
    ...
  },

  render({ state, updateState, device }) {
    ...
  },
});
```

</TabItem>
</Tabs>

The `Game` Sprite requires two specific props, and some optional props (set in `gameProps`):

1. an `id` prop of value `"Game"`
1. a `size` prop, see [Game Size](game-size.md)
1. (Optional) a `defaultFont` prop that applies to all `t.text` Textures
1. (Optional) a `backgroundColor` prop, must be a [CSS Level 1 color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) or 6 char hex (e.g. `#ff0000`, `green`)
