---
id: device
title: Device
---

The `device` parameter of the Sprite methods can be used to interact with the platform, like reading inputs and playing sound effects.

```js
  loop({ device }) {
    const {
      inputs,
      size,
      log,
      random,
      timer,
      now,
      audio,
      network,
      storage,
      alert,
      clipboard,
      isTouchScreen,
    } = device;

    ...
  },
```

:::tip Important
Functions like `log` and `random` replace `console.log` and `Math.random`. Using these ensures the game works across all platforms and tests (plus it keeps your Sprite methods pure).
:::

### `inputs`

An object of the device's input state. **The value depends on the platform your game is running on**. See [Platforms](web.md) for the values available.

Platforms share similar input object shapes. For example, both the web and iOS platforms have a `pointer` field (relative to the Sprite's position):

```js
const hitX = inputs.pointer.x;
```

:::tip Important
The pointer is relative to the Sprite's position and rotation. If your Sprite has an `x` position of `100`, and you click at an `x` position of `50`, the value of `inputs.pointer.x` in the Sprite will be translated to `-50`. To do this translation in [Replay Test](test.md) you can pass in a `mapInputCoordinates` function.
:::

### `size`

An object of the device's size. See [Game Size](game-size.md) for info on this.

### `log`

A platform independent way of logging messages. Replaces `console.log`.

```js
log("debug message");
```

### `random`

Returns a random number between 0 - 1. Replaces `Math.random`.

```js
const spawnY = random() * 500;
```

### `timer`

Run, pause and cancel timers.

#### `start(callback, ms)`

Run a callback after a time in milliseconds, returns an `id` string. Replaces `setTimeout`.

```js
const timerId = device.timer.start(() => {
  // Do stuff
}, 500);
```

#### `pause(id)`

Pause a timer using its ID.

```js
device.timer.pause(timerId);
```

#### `resume(id)`

Resume a paused timer using its ID.

```js
device.timer.resume(timerId);
```

#### `cancel(id)`

Cancel a timer using its ID. It will not be possible to resume the timer, but the callback is cleaned up.

```js
device.timer.cancel(timerId);
```

### `now`

Get the current time and date as a Date object. Replaces `new Date()`.

```js
const date = now();
```

### `audio`

Play audio files in your game.

```js
const mySound = audio("sound.wav");
```

The returned object has the following methods:

#### `play`

Play the sound file. `position` and `loop` arguments are optional.

```js
mySound.play(position = 0, loop = false);
```

#### `pause`

Pause the sound file.

```js
mySound.pause();
```

#### `getPosition`

Get the current play position of the sound in seconds.

```js
mySound.getPosition();
```

### `network`

Make platform-independent networks calls. Returns and sends data as a JSON object.

```js
network.get(url, callback);
network.post(url, body, callback);
network.put(url, body, callback);
network.delete(url, callback);

// Example
network.post("/api/score", { score: 5 }, (data) => {
  const { success } = data;
  log(`successful: ${success}`);
});
```

### `storage`

Platform-independent way of storing save data to the local device.

#### `getStore`

Returns the current store: an object of keys and values of type string.

```js
const { highScore } = storage.getStore();
```

#### `setStore`

Add or remove fields in the store. New fields are merged into the existing store:

```js
storage.setStore({ highScore: 5 });
```

Setting `undefined` will remove a field from storage:

```js
storage.setStore({ highScore: undefined });
```

### `alert`

Show an alert using the platform's dialog.

#### `ok(message, onResponse)`

An alert dialog with an OK button. Game loop will be paused on some platforms.

```js
alert.ok("Connected", () => {
  // Optional callback to handle OK clicked
});
```

#### `okCancel(message, onResponse)`

An alert dialog with an OK and cancel button. Game loop will be paused on some platforms.

```js
device.alert.okCancel(
  "Are you sure you want to delete this?",
  (wasOk) => {
    if (wasOk) {
      // Delete it
    } else {
      // Cancel
    }
  }
);
```

### `clipboard`

Interact with the player's clipboard.

#### `copy(text, onComplete)`

Asynchronously copy text to the clipboard. Callback has an error argument if unsuccessful (e.g. did not get permission).

```js
clipboard.copy("ABCDEFG", (error) => {
  if (error) {
    // Couldn't copy to clipboard
  } else {
    // Success
  }
});
```

### `isTouchScreen`

Boolean to indicate if the device is a touch screen device.

```js
const text = isTouchScreen ? "Tap to Start" : "Space Bar to Start";
```
