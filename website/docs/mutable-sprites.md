---
id: mutable-sprites
title: Mutable Sprites
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Intro

_Mutable Sprites_ are an alternative API for Sprites and Textures which drastically reduce the amount of Garbage Collection (GC) required by the JavaScript engine. This can result in big performance improvements, especially in dropped frames due to regular GC. To do this they rely on mutating state and props instead of always returning new objects.

A Custom Sprite may contain a Mutable Sprite, but not vice versa. The [Top-Level Game](top-level-game.md) Sprite also cannot be Mutable.

You can create a Mutable Sprite with the `makeMutableSprite` function, which is similar to a [Sprite](sprites.md) but with a few differences:

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
import { makeMutableSprite, t2 } from "@replay/core";
import { Player } from "./player";

export const Level = makeMutableSprite({
  init() {
    return { playerX: 0 };
  },

  loop({ state }) {
    state.playerX++;
  },

  render({ state }) {
    return [
      t2.circle(
        {
          radius: 20,
          color: "purple",
        },
        (thisProps) => {
          thisProps.x = state.playerX;
        }
      ),
      Player.Single(
        {
          rotation: 10,
          color: "red",
        },
        (thisProps) => {
          thisProps.x = state.playerX;
        }
      ),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeMutableSprite, t2 } from "@replay/core";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Player } from "./player";

type Props = {};
type State = {
  playerX: number;
};

export const Level = makeMutableSprite<Props, State, WebInputs | iOSInputs>({
  init() {
    return { playerX: 0 };
  },

  loop({ state }) {
    state.playerX++;
  },

  render({ state }) {
    return [
      t2.circle(
        {
          radius: 20,
          color: "purple",
        },
        (thisProps) => {
          thisProps.x = state.playerX;
        }
      ),
      Player.Single(
        {
          rotation: 10,
          color: "red",
        },
        (thisProps) => {
          thisProps.x = state.playerX;
        }
      ),
    ];
  },
});
```

</TabItem>
</Tabs>

The `loop` method of the `Level` Mutable Sprite no longer needs to return a new state, instead you can mutate the `state` object directly.

The `render` function is returning a `circle` Mutable Texture and a single `Player` Mutable Sprite. Use `t2` instead of `t` for Mutable Textures. Instead of taking a single props argument, the 1st argument is the initial props, and the 2nd argument is an update callback which is run every frame. `thisProps` can be mutated to update the props being passed to `circle` or `Player`.

:::tip Important
The `render` function is only called once after `init`. All updates are applied through update callbacks like the 2nd argument of `Player.Single`.
:::

To call a Mutable Sprite from a Custom Sprite, make sure an `id` prop is passed in (they're not required within Mutable Sprites):

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
import { Item } from "./item";

export const Player = makeSprite({
  render({ props }) {
    return [
      Item.Single({
        id: "Item",
        item: props.item,
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeSprite } from "@replay/core";
import { Item } from "./item";

type Props = {
  item: string;
};
export const Player = makeSprite<Props>({
  render({ props }) {
    return [
      Item.Single({
        id: "Item",
        item: props.item,
      }),
    ];
  },
});
```

The 2nd argument of `Item.Single` (the update callback) won't be used since `render` will run every frame in the `Player` Custom Sprite. To reduce GC it's best to avoid this as much as possible by nesting multiple Mutable Sprites within one Mutable Sprite.

</TabItem>
</Tabs>

## API

### MySprite.Single(props, update)

Render a single Mutable Sprite.

#### Arguments

1. `props`: The initial props for the Sprite.
2. `update(thisProps)`: (Optional) Callback to mutate the Sprite's props.

### MySprite.Array({ props, array, key, update, updateAll, filter })

Render an array of Mutable Sprites.

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning Sprite's props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `key(itemState, index)`: (Optional) A function returning a unique (within the array) id `string` or `number`. You can just return `index` to avoid creating strings every frame if you don't need to preserve state.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the Sprite's props.
- `updateAll(thisProps)`: (Optional) Callback to mutate props for all Sprites in the array. This can avoid repeated calculations for every Sprite.
- `filter(itemState, index)`: (Optional) A function returning whether to render an element (`true`) or not (`false`).

### t2.text(props, update)

#### Arguments

1. `props`: Partial of text [Texture](textures.md#text) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### t2.textArray({ props, array, update, mask, testId })

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning partial of text [Texture](textures.md#text) props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the texture's props.
- `mask`: (Optional) A [Mask](mask.md) for all elements.
- `testId(itemState, index)`: (Optional) A function returning a unique test id string, used by [Replay Test](test.md).

### t2.circle(props, update)

#### Arguments

1. `props`: Partial of circle [Texture](textures.md#circle) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### t2.circleArray({ props, array, update, mask, testId })

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning partial of circle [Texture](textures.md#circle) props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the texture's props.
- `mask`: (Optional) A [Mask](mask.md) for all elements.
- `testId(itemState, index)`: (Optional) A function returning a unique test id string, used by [Replay Test](test.md).

### t2.rectangle(props, update)

#### Arguments

1. `props`: Partial of rectangle [Texture](textures.md#rectangle) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### t2.rectangleArray({ props, array, update, mask, testId })

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning partial of rectangle array [Texture](textures.md#rectangle-array) props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the texture's props.
- `mask`: (Optional) A [Mask](mask.md) for all elements.
- `testId(itemState, index)`: (Optional) A function returning a unique test id string, used by [Replay Test](test.md).

### t2.line(props, update)

#### Arguments

1. `props`: Partial of line [Texture](textures.md#line) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### t2.lineArray({ props, array, update, mask, testId })

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning partial of line [Texture](textures.md#line) props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the texture's props.
- `mask`: (Optional) A [Mask](mask.md) for all elements.
- `testId(itemState, index)`: (Optional) A function returning a unique test id string, used by [Replay Test](test.md).

### t2.image(props, update)

#### Arguments

1. `props`: Partial of image [Texture](textures.md#image) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### t2.imageArray({ props, array, update, mask, testId })

#### Arguments

An object with the following properties:

- `props(itemState, index)`: A function returning partial of image array [Texture](textures.md#image-array) props. This is called for each new element in the array with the element's value `itemState` and its position in the array `index`.
- `array()`: A function returning the array data to render.
- `update(thisProps, itemState, index)`: (Optional) Callback to mutate the texture's props.
- `mask`: (Optional) A [Mask](mask.md) for all elements.
- `testId(itemState, index)`: (Optional) A function returning a unique test id string, used by [Replay Test](test.md).

### t2.spriteSheet(props, update)

#### Arguments

1. `props`: Partial of sprite sheet [Texture](textures.md#sprite-sheet) props.
2. `update(thisProps)`: (Optional) Callback to mutate the texture's props.

### r.if(condition, sprites)

#### Arguments

1. `condition()`: A function that returns a `boolean`.
2. `sprites()`: A function returning an array of Mutable Sprites to render only if the 1st argument returns `true`.

### r.ifElse(condition, trueSprites, falseSprites)

#### Arguments

1. `condition()`: A function that returns a `boolean`.
2. `trueSprites()`: A function returning an array of Mutable Sprites to render only if the 1st argument returns `true`.
3. `falseSprites()`: A function returning an array of Mutable Sprites to render only if the 1st argument returns `false`.

### r.onChange(value, sprites)

#### Arguments

1. `value()`: A function that returns a value to watch.
2. `sprites()`: A function returning an array of Mutable Sprites. This will re-render whenever the `value` returned changes (`prev !== new`). (This will cause Sprites to unmount and remount, which will reset their state.)

### r.run(fn)

#### Arguments

1. `fn()`: A function that runs every frame.

## Example

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
import { t2, r, makeMutableSprite } from "@replay/core";

export const MyMutSprite = makeMutableSprite({
  init() {
    return {
      score: 0,
      enemies: [
        { x: 40, y: 0, id: "1" },
        { x: 10, y: 20, id: "2" },
      ],
    };
  },

  loop({ state }) {
    // Mutate state directly here, no need to return it

    if (state.score < 100) {
      state.score++;
    }

    if (state.score === 50) {
      state.enemies.unshift({ x: -50, y: 0, id: "3" });
    }

    let indexToRemove = -1;
    state.enemies.forEach((enemy, index) => {
      enemy.x++;
      if (enemy.x > 75) {
        indexToRemove = index;
      }
    });

    if (indexToRemove >= 0) {
      state.enemies.splice(indexToRemove, 1);
    }
  },

  render({ state, props }) {
    // This function is only called once
    return [
      // Use t2 instead of t
      t2.text(
        // First parameter is the initial props (which don't need to update)
        { color: "black", y: 25 },
        // Second parameter is the update function which is called every frame.
        // Use this to update the text Texture's props (thisProps).
        (thisProps) => {
          thisProps.text = `Score: ${state.score}`;
        }
      ),

      // A Mutable Sprite util to change the Sprites rendered.
      r.if(
        // This will be called every frame
        () => state.score > props.highScore,
        // This will only be called when the return value of the first argument changes.
        () => [t2.text({ text: "High score!", color: "black", x: -100 })]
      ),

      t2.circle({ radius: 3, color: "red" }, (thisProps) => {
        thisProps.x++;
      }),

      // To render an array of Textures linked to an array
      t2.rectangleArray({
        // The default props
        props: (itemState, index) => ({
          width: 50,
          height: 50,
          color: "red",
        }),
        update: (thisProps) => {
          thisProps.x++;
        },
        // The array to link to. Element values will be `itemState` in other functions
        array: () => lengthFiveArray,
        // Set a test id for rectangles in an array
        testId: (itemState, index) => `Rect${index}`,
      }),

      // Use MyMutNestedSprite.Single(...) instead of calling MyMutNestedSprite(...)
      MyMutNestedSprite.Single(
        // Initial props which won't update
        { index: -1 }
      ),

      MyMutNestedSprite.Single(
        { index: 20, y: -20 },
        // Update function to update MyMutNestedSprite's props (thisProps)
        (thisProps) => {
          if (thisProps.index > -100) {
            thisProps.index--;
          }
        }
      ),

      // Use .Array to render an array of Sprites, linked to an array.
      MyMutNestedSprite.Array({
        // The default props
        props: (itemState, index) => ({ index: -1 }),
        update: (thisProps, itemState, index) => {
          thisProps.index = index;
          thisProps.y = index * 30 + 50;
        },
        // The array to link to. Element values will be `itemState` in other functions
        array: () => lengthFiveArray,
        // Need a unique key
        key: (_, index) => index,
      }),

      Enemy.Array({
        props: () => ({}),
        update: (thisProps, itemState) => {
          thisProps.x = itemState.x;
          thisProps.y = itemState.y;
        },
        array: () => state.enemies,
        key: (enemy) => enemy.id,
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { t2, r, makeMutableSprite } from "@replay/core";

type Props = {
  highScore: number;
};
type State = {
  score: number;
  enemies: { x: number; y: number; id: string }[];
};

export const MyMutSprite = makeMutableSprite<Props, State>({
  init() {
    return {
      score: 0,
      enemies: [
        { x: 40, y: 0, id: "1" },
        { x: 10, y: 20, id: "2" },
      ],
    };
  },

  loop({ state }) {
    // Mutate state directly here, no need to return it

    if (state.score < 100) {
      state.score++;
    }

    if (state.score === 50) {
      state.enemies.unshift({ x: -50, y: 0, id: "3" });
    }

    let indexToRemove = -1;
    state.enemies.forEach((enemy, index) => {
      enemy.x++;
      if (enemy.x > 75) {
        indexToRemove = index;
      }
    });

    if (indexToRemove >= 0) {
      state.enemies.splice(indexToRemove, 1);
    }
  },

  render({ state, props }) {
    // This function is only called once
    return [
      // Use t2 instead of t
      t2.text(
        // First parameter is the initial props (which don't need to update)
        { color: "black", y: 25 },
        // Second parameter is the update function which is called every frame.
        // Use this to update the text Texture's props (thisProps).
        (thisProps) => {
          thisProps.text = `Score: ${state.score}`;
        }
      ),

      // A Mutable Sprite util to change the Sprites rendered.
      r.if(
        // This will be called every frame
        () => state.score > props.highScore,
        // This will only be called when the return value of the first argument changes.
        () => [t2.text({ text: "High score!", color: "black", x: -100 })]
      ),

      t2.circle({ radius: 3, color: "red" }, (thisProps) => {
        thisProps.x++;
      }),

      // To render an array of Textures linked to an array
      t2.rectangleArray({
        // The default props
        props: (itemState, index) => ({
          width: 50,
          height: 50,
          color: "red",
        }),
        update: (thisProps) => {
          thisProps.x++;
        },
        // The array to link to. Element values will be `itemState` in other functions
        array: () => lengthFiveArray,
        // Set a test id for rectangles in an array
        testId: (itemState, index) => `Rect${index}`,
      }),

      // Use MyMutNestedSprite.Single(...) instead of calling MyMutNestedSprite(...)
      MyMutNestedSprite.Single(
        // Initial props which won't update
        { index: -1 }
      ),

      MyMutNestedSprite.Single(
        { index: 20, y: -20 },
        // Update function to update MyMutNestedSprite's props (thisProps)
        (thisProps) => {
          if (thisProps.index > -100) {
            thisProps.index--;
          }
        }
      ),

      // Use .Array to render an array of Sprites, linked to an array.
      MyMutNestedSprite.Array({
        // The default props
        props: (itemState, index) => ({ index: -1 }),
        update: (thisProps, itemState, index) => {
          thisProps.index = index;
          thisProps.y = index * 30 + 50;
        },
        // The array to link to. Element values will be `itemState` in other functions
        array: () => lengthFiveArray,
        // Need a unique key
        key: (_, index) => index,
      }),

      Enemy.Array({
        props: () => ({}),
        update: (thisProps, itemState) => {
          thisProps.x = itemState.x;
          thisProps.y = itemState.y;
        },
        array: () => state.enemies,
        key: (enemy) => enemy.id,
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

## Context

A Mutable Sprite cannot use a [Context](context.md) from a non-Mutable Sprite. Create a Context in the normal way but use `context.Single`. The `context` prop is a function which is updated every frame to avoid stale values.

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
import { makeMutableSprite } from "@replay/core";

const ThemeSprite = makeMutableSprite({
  render({ props }) {
    return [
      themeContext.Single({
        context: () => props.theme,
        sprites: [Button.Single({})],
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeMutableSprite } from "@replay/core";

const ThemeSprite = makeMutableSprite<{ theme: string }>({
  render({ props }) {
    return [
      themeContext.Single({
        context: () => props.theme,
        sprites: [Button.Single({})],
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

Be aware that values returned with `getContext` may not update unless they're mutated, so it can be worth calling `getContext` in your update callbacks rather than in the body of `render`.

## Native Sprites

Native Sprites also have an optional 2nd argument, which is used when nested in Mutable Sprites to update their props:

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
import { makeMutableSprite } from "@replay/core";
import { MyWidget } from "./widget";

const MySprite = makeMutableSprite({
  render({ props }) {
    return [
      MyWidget(
        {
          id: "MyWidget",
          score: props.score,
        },
        (thisProps) => {
          thisProps.score = props.score;
        }
      ),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeMutableSprite } from "@replay/core";
import { MyWidget } from "./widget";

const MySprite = makeMutableSprite<{ score: number }>({
  render({ props }) {
    return [
      MyWidget(
        {
          id: "MyWidget",
          score: props.score,
        },
        (thisProps) => {
          thisProps.score = props.score;
        }
      ),
    ];
  },
});
```

</TabItem>
</Tabs>
