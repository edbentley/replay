---
id: thinking-in-replay
title: Thinking in Replay
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

There's an excellent article in the React docs called [Thinking in React](https://reactjs.org/docs/thinking-in-react.html), which is well worth a read. Here we'll show how some of those ideas apply to Replay, and why building games with it is a refreshing take on how you might have done them before.

![Diagram of player and platform](/img/player-platform.png)

In this game we need to do 2 things:

1. Have the player jump
3. Handle the player landing on the platform

Many game engines will represent the player in a `class`. We might have something like:

```js
class Player {
  loop() {
    if (this.jump) {
      this.position.y += 4;
    }
  }
}
```

Next we need to check if the player is touching the platform. Let's imagine we have some parent class to handle this:

```js
class Level {
  player = new Player();
  platform = new Platform();

  loop() {
    if (this.player.hits(this.platform)) {
      this.player.position.y = this.platform.position.y + this.platform.height;
    }
  }
}
```

Our player's position is being read and mutated in 2 different classes. When you scale this up to a large game, it can be confusing which classes are changing what values.

Replay uses a one-way data flow approach. We model our player's position as _state_, and the state only lives in one place. Other Sprites can read the state (through their props), but only the Sprite which owns the state is allowed to change it. What's more, the state is changed through pure functions - no mutation required.

If multiple Sprites need to access some state, we need to lift the state to a common parent Sprite. That parent Sprite is then responsible for managing the state.

![State flow diagram](/img/state-flow.png)

Here we've lifted the player's position state to the `Level` Sprite, not the `Player` Sprite. If `Player` needs to update the position, it does so through a _callback_ prop, e.g:

<Tabs
  defaultValue="js"
  groupId="code"
  values={[
    { label: 'JavaScript', value: 'js', },
    { label: 'TypeScript', value: 'ts', },
  ]
}>
<TabItem value="js">

```js {10-14} title="level.js"
const Level = makeSprite({
  init() {
    return { playerX: 0 };
  },

  render({ updateState }) {
    return [
      Player({
        id: "player",
        increaseX: () => {
          updateState((prevState) => ({
            ...prevState,
            playerX: prevState.playerX + 5,
          }));
        },
      }),
    ];
  },
});
```

```js {4} title="player.js"
const Player = makeSprite({

  loop({ props }) {
    props.increaseX();
  },

});
```

</TabItem>
<TabItem value="ts">

```ts {10-14} title="level.ts"
const Level = makeSprite<{}, { playerX: number }>({
  init() {
    return { playerX: 0 };
  },

  render({ updateState }) {
    return [
      Player({
        id: "player",
        increaseX: () => {
          updateState((prevState) => ({
            ...prevState,
            playerX: prevState.playerX + 5,
          }));
        },
      }),
    ];
  },
});
```

```ts {4} title="player.ts"
const Player = makeSprite<{ increaseX: () => void }>({

  loop({ props }) {
    props.increaseX();
  },

});
```

</TabItem>
</Tabs>

This is certainly more verbose than before, but it's arguably easier to understand how your code works since only `Level` is able to directly change its own state - it manages how its state changes through callbacks.

This single way of building your game helps to keep game architecture both modular and consistent as your project scales in size.
