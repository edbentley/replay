---
id: sprites
title: Sprites
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Replay is all about Sprites. Sprites are similar to Components in React.

## Custom Sprite

You can create a _custom_ Sprite by passing an object into the `makeSprite` function:

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
import { t, makeSprite } from "@replay/core";

export const Player = makeSprite({
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
import { t, makeSprite } from "@replay/core";

type Props = {
  color: string;
};
export const Player = makeSprite<Props>({
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

The Sprite object passed into `makeSprite` must have a method called `render`. The return value of `render` - an array of Sprites - is what Replay will draw onto the screen. Here we're drawing a circle with the colour set in its `props`.

`props` are values other Sprites can pass into the Sprite - just like arguments of a function. They're **read-only** and should not be mutated.

`t` is used to generate a _Texture_, which is a type of Sprite. The `t.circle` Texture accepts two `props`: `radius` and `color`. We'll cover them in more detail in [Textures](textures.md) next.

Although not required, it's convention to capitalise custom Sprite names (`Player`, not `player`).

## Stateful Sprite

The `Player` Sprite is a pure function of `props`. But we can create an interactive Sprite by adding `state`:

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
import { Player } from "./player";

export const Level = makeSprite({
  init() {
    return { playerX: 0 };
  },

  loop({ state }) {
    return {
      playerX: state.playerX + 1,
    };
  },

  render({ state }) {
    return [
      Player({
        id: "player",
        position: {
          x: state.playerX,
          y: 0,
          rotation: 10,
        },
        color: "red",
      }),
    ];
  },
});

```

</TabItem>
<TabItem value="ts">

```ts
import { makeSprite } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Player } from "./player";

type Props = {};
type State = {
  playerX: number;
};

export const Level = makeSprite<Props, State, WebInputs | iOSInputs>({
  init() {
    return { playerX: 0 };
  },

  loop({ state }) {
    return {
      playerX: state.playerX + 1,
    };
  },

  render({ state }) {
    return [
      Player({
        id: "player",
        position: {
          x: state.playerX,
          y: 0,
          rotation: 10,
        },
        color: "red",
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

This `Level` Sprite has an `init` method which returns the initial state - a value `playerX` for the player's `x` position.

The `loop` method takes the current `state` and returns a new value for `state`. This is where we can write our game logic for interactive things (in this case we're increasing the player's `x` position). `loop` is called by Replay 60 times a second (we'll cover this more in [Game Loop](game-loop.md)).

Just like `props`, **`state` is also read-only**. You should always return a new value of `state` and not mutate it, ensuring the `loop` method remains pure.

Lastly our `render` method takes our existing `state` and returns the `Player` Sprite:

```js
  render({ state }) {
    return [
      Player({
        id: "player",
        position: {
          x: state.playerX,
          y: 0,
          rotation: 10,
        },
        color: "red",
      }),
    ];
  },
```

`Player` (which we created above using `makeSprite`) is just a function we can call with its `props`:

- `id`: Every custom Sprite (not Textures) requires an `id` prop, which is a string of any value you want. The `id` **must be unique within a single render function**, but doesn't need to be unique globally. The unique `id` is how Replay tracks the `state` of different Sprites.
- `position`: Every Sprite (including Textures) has an optional `position` prop. If set, you must include an `x` and `y` value, but the `rotation` (in degrees) is optional.
- `color`: This is the prop defined in the `Player` Sprite itself.

## Anchor Point

When Sprites are positioned, the position is relative the _anchor point_, which is in the middle of the Sprite. [Game Size](game-size.md) covers the coordinate system in more detail.

<img src="/img/anchor-point.png" width="50%" />

## Sprite Methods

`render` is the only _required_ Sprite method. `init` is required if your Sprite has `state`.

### Common Parameters

All Sprite methods have the following parameters:

- `props`: The props passed in by the parent Sprite.
- `device`: The device object, see [Device](device.md).
- `updateState`: A callback to update the `state` of the Sprite. Useful for asynchronous things like timers. Pass a function which takes the existing state and returns a new state. E.g:
   ```js
   updateState((prevState) => ({ ...prevState, playerX: 0 }));
   ```

### `init`

Called on initial load of Sprite. Use this to run anything you need on setup. Returns the initial state.

```js
  init({ props, device, updateState }) {
    return { ... };
  },
```

### `loop`

Called every frame of the game. Put your game logic here. Returns the next frame's state.

```js
  loop({ props, state, device, updateState }) {
    return { ...state, ... };
  },
```

#### Additional Parameters

- `state`: The current state of the Sprite.

### `render`

Called when the device renders to screen. Returns an array of Sprites to render.

```js
  render({ props, state, device, updateState, extrapolateFactor }) {
    return [ ... ];
  },
```

#### Additional Parameters

- `state`: The current state of the Sprite.
- `extrapolateFactor`: A value between 0 and 1 representing how much time has passed before the next frame is scheduled. See [Game Loop](game-loop.md) for more.

### `renderP`

An alternative render method run if the device is in portrait. See [Game Size](game-size.md) for more.

### `renderXL`

An alternative render method run for large screens. See [Game Size](game-size.md) for more.

### `renderPXL`

An alternative render method run for large screens if the device is in portrait. See [Game Size](game-size.md) for more.
