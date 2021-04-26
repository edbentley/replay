---
id: context
title: Context
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

If you have a value in a Sprite which is also needed in a very nested Sprite, you need to add that prop to all of the intermediate Sprites.

![props diagram](/img/context-props.png)

Context avoids this by setting up a context value which can be accessed by any nested Sprite, without having to manually pass through props.

![context diagram](/img/context.png)

This can be especially useful for 'global' props you need in many Sprites in your game - e.g. player controller settings or the login state of an online game.

> Context is very much inspired by [React Context](https://reactjs.org/docs/context.html) and works the same way, but the API is slightly different.

You can create a Context with the `makeContext` function:

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
import { makeContext } from "@replay/core";

const themeContext = makeContext();
```

</TabItem>
<TabItem value="ts">

```ts
import { makeContext } from "@replay/core";

type ThemeContext = {
  theme: string;
};
const themeContext = makeContext<ThemeContext>();
```

</TabItem>
</Tabs>

You then return a `context.Sprite` where you want to set this context. Only the Sprites in the `sprites` prop have access to the context:

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

const ThemeSprite = makeSprite({
  render() {
    return [
      themeContext.Sprite({
        context: {
          theme: "red",
        },
        sprites: [
          // Only these sprites (and any nested sprites) have access to the context
          Button({ id: "Button" }),
        ],
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeSprite } from "@replay/core";

const ThemeSprite = makeSprite<{}>({
  render() {
    return [
      themeContext.Sprite({
        context: {
          theme: "red",
        },
        sprites: [
          // Only these sprites (and any nested sprites) have access to the context
          Button({ id: "Button" }),
        ],
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

The Context value can be read in nested Sprites using the `getContext` Sprite method:

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

const Button = makeSprite({
  render({ getContext }) {
    const { theme } = getContext(countContext);

    return [
      t.text({
        text: "Test",
        color: theme,
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { t, makeSprite } from "@replay/core";

const Button = makeSprite<{}>({
  render({ getContext }) {
    const { theme } = getContext(countContext);

    return [
      t.text({
        text: "Test",
        color: theme,
      }),
    ];
  },
});
```

</TabItem>
</Tabs>

You can pass any values you want into the `context` prop. You can even pass in state with callbacks for your nested Sprites:

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
const counterContext = makeContext();

const Game = makeSprite({
  init() {
    return { count: 0 };
  },

  render({ state, updateState }) {
    return [
      counterContext.Sprite({
        context: {
          count: state.count,
          increaseCount: () => {
            updateState((prevState) => ({
              ...prevState,
              count: prevState.count + 1,
            }));
          },
        },
        sprites: [Button({ id: "Button" })],
      }),
    ];
  },
});

const Button = makeSprite({
  loop({ getInputs, getContext }) {
    if (getInputs().pointer.justPressed) {
      const { increaseCount } = getContext(counterContext);
      increaseCount();
    }
  },

  render({ getContext }) {
    const { count } = getContext(counterContext);
    return [
      t.text({
        text: `Count: ${count}`,
        color: "black",
      }),
    ];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
type CounterContext = {
  count: number;
  increaseCount: () => void;
};
const counterContext = makeContext<CounterContext>();

const Game = makeSprite<GameProps, { count: number }>({
  init() {
    return { count: 0 };
  },

  render({ state, updateState }) {
    return [
      counterContext.Sprite({
        context: {
          count: state.count,
          increaseCount: () => {
            updateState((prevState) => ({
              ...prevState,
              count: prevState.count + 1,
            }));
          },
        },
        sprites: [Button({ id: "Button" })],
      }),
    ];
  },
});

const Button = makeSprite<{}, undefined, WebInputs>({
  loop({ getInputs, getContext }) {
    if (getInputs().pointer.justPressed) {
      const { increaseCount } = getContext(counterContext);
      increaseCount();
    }
    return undefined;
  },

  render({ getContext }) {
    const { count } = getContext(counterContext);
    return [
      t.text({
        text: `Count: ${count}`,
        color: "black",
      }),
    ];
  },
});
```

</TabItem>
</Tabs>
