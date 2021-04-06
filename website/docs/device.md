---
id: device
title: Device
---

The `device` and `getInputs` parameters of the Sprite methods can be used to interact with the platform, like getting mouse coordinates and playing sound effects.

```js
  loop({ device, getInputs }) {
    const inputs = getInputs();

    const {
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

### `getInputs`

A function which returns an object of the device's input state. **The value depends on the platform your game is running on**. See [Platforms](web.md) for the values available.

Platforms share similar input object shapes. For example, both the web and mobile platforms have a `pointer` field (relative to the Sprite's position):

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

Note that the file must be loaded using [`preloadFiles`](sprites.md#init) before you can play it.

The returned object has the following methods:

#### `play`

Play the audio file. If the file is already playing, another sound will be played at the same time (unless `overwrite` is set to `true`).

The first argument is optional and can be a number (start time in seconds) or an object with the following fields:

- `fromPosition`: (Optional) Where to start the audio file from in seconds, same as providing the first argument as a number.
- `overwrite`: (Optional) If this audio file is already playing, remove it first. Default `false`.
- `loop`: (Optional) Keep playing the audio when it finishes. Default `false`.
- `playbackRate`: (Optional) The speed to play at, less than `1` slows audio down and more than `1` speeds it up. Default `1`.

If no argument is provided or `fromPosition` is not defined in the argument object:

- The audio will play from the beginning if:
  - It's the first time being played, or
  - The audio is already playing and `overwrite` is not set to `true`.
- Otherwise, the audio will continue from where it was paused.

```js
mySound.play();

mySound.play(10);

mySound.play({ overwrite: true });

mySound.play({ fromPosition: 10, overwrite: true, loop: true, playbackRate: 0.5 });
```

#### `pause`

Pause the sound.

```js
mySound.pause();
```

#### `getPosition`

Get the current play position of the sound in seconds.

```js
mySound.getPosition();
```

#### `getStatus`

Get current status of the sound (as a string): `playing` or `paused`.

```js
const status = mySound.getStatus();
const isPlaying = status === "playing";
```

#### `getDuration`

Get the total duration of the sound in seconds.

```js
mySound.getDuration();
```

#### `setVolume`

Set the volume of the sound. 1 is maximum (default), 0 is muted. Resets when sound finishes playing.

```js
mySound.setVolume(0);
```

#### `getVolume`

Get the volume of the sound. 1 is maximum, 0 is muted.

```js
const volume = mySound.getVolume();
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

#### `getItem(key)`

Retrieve a saved value by its `string` key. Returns a `string` or `null`.

```js
const playerName = storage.getItem("playerName");
```

#### `setItem(key, value)`

Set or remove a value in storage.

```js
storage.setItem("playerName", "Replay");
```

Setting `null` will remove a field from storage:

```js
storage.setItem("playerName", null);
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
