---
id: native-sprites
title: Native Sprites
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Native Sprites are a way to add platform-specific features to your game which aren't supported in Replay itself.

For example, Replay has no text input. If you need a text input, you can use the [TextInput](text-input.md) Native Sprite.

## Create a Native Sprite

To create your own Native Sprite you can use the `makeNativeSprite` function from `@replay/core`:

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
import { makeNativeSprite } from "@replay/core";

export const MyWidget = makeNativeSprite("MyWidget");
```

</TabItem>
<TabItem value="ts">

```ts
import { makeNativeSprite } from "@replay/core";

type MyWidgetProps = {
  id: string;
  value: number;
};
export const MyWidget = makeNativeSprite<MyWidgetProps>("MyWidget");
```

</TabItem>
</Tabs>

We've registered our `MyWidget` Native Sprite with a `"MyWidget"` name. This name will be used later on to lookup the platform-specific implementation.

:::tip Important
All Native Sprites must define an `id` prop.
:::

You can then call your Native Sprite within other Custom Sprites:

```js
import { MyWidget } from "./my-widget";

const MySprite = makeSprite({
  render() {
    return [
      MyWidget({
        id: "widget",
        value: 100,
      }),
    ];
  },
});
```

## Platform implementation

After creating a Native Sprite, its implementation must be defined separately for each platform you want to support.

Native Sprite implementations are an object with a `create`, `loop` and `destroy` method.

### `create`

Called on initial creation of Sprite. Use this to run anything you need on setup. Returns the initial `state`.

```js
  create({ props, parentGlobalId, getState, updateState, utils }) {
    return { ... };
  },
```

#### Parameters

- `props`: The props passed in by the parent Sprite.
- `parentGlobalId`: A globally unique ID for the parent Sprite.
- `getState`: A function which returns the current state of the Sprite.
- `updateState`: A callback to update the `state` of the Sprite. Pass an object which will be merged into the existing `state`. E.g:
   ```js
   updateState({ shoot: true });
   ```
- `utils`: An object with fields:
  - `didResize`: A boolean to check if the device was just resized.
  - `scale`: Ratio of the game and platform's screen size.
  - `gameXToPlatformX`: Function to convert a local game `x` coordinate to platform `x` coordinate.
  - `gameYToPlatformY`: Function to convert a local game `y` coordinate to platform `y` coordinate.
  - `size`: Device size, see [Game Size](game-size.md).

### `loop`

Called 60 times a second. Returns the next frame's `state`.

```js
  loop({ props, state, parentGlobalId, utils }) {
    return { ... };
  },
```

#### Parameters

- `props`: The props passed in by the parent Sprite.
- `state`: The current state of the Sprite.
- `parentGlobalId`: A globally unique ID for the parent Sprite.
- `parentX`: The parent Sprite's `x` game coordinate (assumes no rotations / scaling).
- `parentY`: The parent Sprite's `y` game coordinate (assumes no rotations / scaling).
- `utils`: An object with fields:
  - `didResize`: A boolean to check if the device was just resized.
  - `scale`: Ratio of the game and platform's screen size.
  - `gameXToPlatformX`: Function to convert a local game `x` coordinate to platform `x` coordinate.
  - `gameYToPlatformY`: Function to convert a local game `y` coordinate to platform `y` coordinate.
  - `size`: Device size, see [Game Size](game-size.md).
  - `isLastFrame`: A boolean indicating if this call of `loop` was the last one before rendering.

### `cleanup`

Called when Sprite is removed. Use this to clean up anything related to the Sprite.

```js
  cleanup({ state, parentGlobalId }) {
    // Cleanup
  },
```

#### Parameters

- `state`: The current state of the Sprite.
- `parentGlobalId`: A globally unique ID for the parent Sprite.

### Web example

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
export const MyWidgetWeb = {
  create({ props, parentGlobalId, getState, updateState, utils }) {
    // Setup code

    // Use parentGlobalId to obtain a globally unique ID
    const uniqueId = `${parentGlobalId}--${props.id}`;

    // Return the initial state
    return { someNumber: 0 };
  },
  loop({ props, state, parentGlobalId, utils }) {
    // Loop code

    // Return next frame's state
    return { someNumber: state.someNumber + 1 };
  },
  cleanup({ state, parentGlobalId }) {
    // Cleanup code
  },
};
```

</TabItem>
<TabItem value="ts">

```ts
import { NativeSpriteImplementation } from "@replay/core";

type MyWidgetState = {
  someNumber: number;
};

export const MyWidgetWeb: NativeSpriteImplementation<
  MyWidgetProps,
  MyWidgetState
> = {
  create({ props, parentGlobalId, getState, updateState, utils }) {
    // Setup code

    // Use parentGlobalId to obtain a globally unique ID
    const uniqueId = `${parentGlobalId}--${props.id}`;

    // Return the initial state
    return { someNumber: 0 };
  },
  loop({ props, state, parentGlobalId, utils }) {
    // Loop code

    // Return next frame's state
    return { someNumber: state.someNumber + 1 };
  },
  cleanup({ state, parentGlobalId }) {
    // Cleanup code
  },
};
```

</TabItem>
</Tabs>

## Platform usage

You must import each Native Sprite implementation into its respective platform. See the `nativeSpriteMap` field in the [Web](web.md) platform.

:::tip Important
Since the [iOS](ios.md) and [Android](android.md) platforms use a web view, you can also use the web native sprite with them.
:::


For example:

```js
import { renderCanvas } from "@replay/web";
import { MyWidgetWeb } from "./my-widget-web";

const nativeSpriteMap = {
  // The key "MyWidget" here must match the name passed into makeNativeSprite
  MyWidget: MyWidgetWeb,
};

renderCanvas(Game(gameProps), {
  dimensions: "scale-up",
  nativeSpriteMap,
});
```
