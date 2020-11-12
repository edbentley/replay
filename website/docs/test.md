---
id: test
title: Replay Test
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you've worked on your game for a while, it's a good idea to add some tests to avoid things breaking in the future. It gives you the confidence to keep publishing new updates!

The `@replay/test` package is useful for writing tests in Jest for your Replay game. It provides a test platform, which works the same as any other like [web](web.md) and [iOS](ios.md), but returns helpful utility functions for testing.

## `testSprite(sprite, gameProps, options)`

#### Parameters

- `sprite`: The Sprite you want to test called with its props, e.g. `Player(playerProps)`.
- `gameProps`: The props defined for your top-level `Game`. This sets the device size during tests.
- `options`: (Optional) An object with the following properties:
  - `initInputs`: (Optional) The inputs your `device` returns. Match with the platforms you're targeting.
  - `mapInputCoordinates`: (Optional) A mapping function to adjust an input's (x, y) coordinate to its relative value within a Sprite. The [Web package](web.md) exports this for pointer values.
  - `initRandom`: (Optional) An array of numbers that `random()` will call, starting from index 0 and looping if it reaches the end. Allows for predictable randomness.
  - `size`: (Optional) Set the size parameter passed into Sprites.
  - `initStore`: (Optional) Set the init store for local storage.
  - `networkResponses`: (Optional) Mock network responses by URL, e.g:
  ```js
  {
    get: {
      "/api/score": {
        success: true,
      },
    },
  },
  ```
  - `initAlertResponse`: (Optional) Set which choice is chosen for OK / cancel alerts. Default `true`.
  - `nativeSpriteNames`: (Optional) A list of [Native Sprite](native-sprites.md) names to mock.
  - `isTouchScreen`: (Optional) Set the `isTouchScreen` parameter.

`testSprite` returns an object with the following fields:

### `nextFrame()`

Increment game by one frame.

```js
nextFrame();
```

### `jumpToFrame(condition, maxFrames)`

#### Parameters

- `condition`: A function that can return a boolean or throw an error.
- `maxFrames`: (Optional) Set the maximum number of frames that will run. Default `1800`.

Asynchronously progress frames of the game until condition is met and no errors are thrown. Condition can also return a Texture (useful for throwing methods like `getTexture`). Rejects if 30 gameplay seconds (1800 frames) pass and condition not met / still errors.

Note that this will run at almost synchronous speed, but doesn't block the event loop.

```js
await jumpToFrame(() => props.x > 10);
```

### `loadFiles()`

Synchronously load all files specified by Sprites using [`preloadFiles`](sprites.md#init).

```js
loadFiles();
```

### `setRandomNumbers(array)`

Reset the array of random numbers.

```js
setRandomNumbers([0.2, 0.3, 0.4]);
```

### `updateInputs(inputs)`

Update the input state for the next frame, such as to indicate the pointer is pressed.

```js
updateInputs({
  pointer: {
    pressed: true,
    justPressed: true,
    justReleased: false,
    // Here the pointer position will have the
    // same coordinates in all Sprites unless
    // you set mapInputCoordinates
    x: 0,
    y: 0,
  },
});
```

### `getTextures()`

Returns an array of textures that were just rendered to the screen.

```js
const textures = getTextures();
```

### `getTexture(testId)`

Get a Texture with a matching prop `testId`. Throws if there are no matches.

```js
const player = getTexture("player");
```

### `textureExists(testId)`

Boolean of whether a Texture with a `testId` prop exists.

```js
expect(textureExists("player")).toBe(true);
```

### `getByText(text)`

Get an array of text Textures which include text content. Case insensitive. Returns empty array if no matches found.

```js
const scoreLabel = getByText("Score: 10")[0];
```

### `log`

A Jest mock function to detect if `log` was called by a Sprite.

```js
expect(log).toBeCalledWith("Hello Replay");
```

### `audio`

An object of Jest mock functions for testing audio calls.

```js
expect(audio.play).toBeCalledWith("boop.wav");
```

### `network`

An object of network mock functions for testing network responses.

```js
expect(network.get).toBeCalled();
```

### `store`

A mock local storage store.

```js
expect(store).toEqual({ highScore: 5 });
```

### `alert`

A mock alert object.

```js
expect(alert.okCancel).toBeCalledWith("Ok or cancel?", expect.any(Function));
```

### `updateAlertResponse(isOk)`

Update whether OK / cancel alert chooses OK or cancel.

```js
updateAlertResponse(false);
```

### `clipboard`

A mock clipboard object.

```js
expect(clipboard.copy).toBeCalledWith("ABCDEFG", expect.any(Function));
```

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
import { testSprite } from "@replay/test";
import { Game, gameProps } from "..";

test("Can shoot bullet", () => {
  const initInputs = {
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
  };

  const {
    nextFrame,
    updateInputs,
    getTexture,
    textureExists,
    loadFiles,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs,
  });

  loadFiles();
  nextFrame();

  expect(textureExists("bullet")).toBe(false);

  updateInputs({
    pointer: {
      pressed: true,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
  });
  nextFrame();

  updateInputs(initInputs);
  nextFrame();

  expect(textureExists("bullet")).toBe(true);
  expect(getTexture("bullet").props.y).toBe(100);
});
```

</TabItem>
<TabItem value="ts">

```ts
import { testSprite } from "@replay/test";
import { WebInputs } from "@replay/web";
import { iOSInputs } from "@replay/swift";
import { Game, gameProps } from "..";

test("Can shoot bullet", () => {
  const initInputs: WebInputs | iOSInputs = {
    pointer: {
      pressed: false,
      justPressed: false,
      justReleased: false,
      x: 0,
      y: 0,
    },
  };

  const {
    nextFrame,
    updateInputs,
    getTexture,
    textureExists,
    loadFiles,
  } = testSprite(Game(gameProps), gameProps, {
    initInputs,
  });

  loadFiles();
  nextFrame();

  expect(textureExists("bullet")).toBe(false);

  updateInputs({
    pointer: {
      pressed: true,
      justPressed: true,
      justReleased: false,
      x: 0,
      y: 0,
    },
  });
  nextFrame();

  updateInputs(initInputs);
  nextFrame();

  expect(textureExists("bullet")).toBe(true);
  expect(getTexture("bullet").props.y).toBe(100);
});
```

</TabItem>
</Tabs>
