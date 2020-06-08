---
id: web
title: Web
---

To render a game for the browser use the `@replay/web` package.

### `renderCanvas(game, loadingTextures, assets, dimensions, canvas)`

#### Parameters

- `game`: Your [Top-Level Game](top-level-game.md) Sprite called with its props passed in, e.g. `Game(gameProps)`.
- `loadingTextures`: (Optional) An array of textures to show while the game is loading.
- `assets`: (Optional) An object containing image and audio file names to load.
- `dimensions`: (Optional) A string that is either:
  - `"game-coords"`: (default) Use the game coordinates as pixels in the browser.
  - `"scale-up"`: Scales the game so that it fills up the browser window.
- `canvas`: (Optional) A canvas element to render to. If omitted, Replay will create a canvas in the document.

```js
import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import { Game, gameProps } from "../src";

const loadingTextures = [
  t.text({
    color: "black",
    text: "Loading...",
  }),
];

renderCanvas(
  Game(gameProps),
  loadingTextures,
  {
    imageFileNames: ["player.png"],
    audioFileNames: ["shoot.wav"],
  },
  "scale-up"
);
```

### `mapInputCoordinates(parentPosition, inputs)`

This can be used by [Replay Test](test.md), see the docs there for more info.

## Inputs

The `device.inputs` parameter of Sprite methods is of type:

```ts
type WebInputs = {
  keysDown: KeysPressed;
  keysJustPressed: KeysPressed;
  pointer: {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    x: number;
    y: number;
  };
};

type KeysPressed = {
  [key: string]: true | undefined;
};
```

The keys of `KeysPressed` are based on the `key` value of browser keyboard events. See [keycode.info](https://keycode.info) for values of `event.key`.

`justPressed` is only `true` for one frame after an input is pressed, `justReleased` for one frame after an input is released.

#### Example

```js
  loop({ device, state }) {
    let { x } = state;
    // Move when space bar is down
    if (device.inputs.keysDown[" "]) {
      x += 5;
    }
    return { ...state, x };
  },
```
