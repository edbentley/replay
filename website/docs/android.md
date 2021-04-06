---
id: android
title: Android
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Android Package

The Replay Android package is [hosted on GitHub](https://github.com/edbentley/replay-android). Once [added as a dependency using JitPack](https://jitpack.io/#edbentley/replay-android) to your Android Studio project, you can replace the `MainActivity`:

```java
import com.replay.android.ReplayActivity

class MainActivity : ReplayActivity() {

}
```

An assets folder also [needs to be created](https://code2care.org/2015/create-assets-folder-in-android-studio) for your project. See [Replay Starter](starter.md) for an example setup.

### `ReplayActivity()`

#### Overridable methods

- `onJsCallback(id: String, message: String, message2: String, message3: String, message4: String, message5: String)`: (Optional) A callback for messages sent from your game. See [Bridge](#bridge).

#### Methods

- `jsBridge(messageId: String, jsArg: String)`: Send a value from Android code to your JS game code. See [Bridge](#bridge).

## Inputs

Since Replay Android embeds your game as a web view, the `device.inputs` parameter of Sprite methods is an alias of the [Web package](web.md)'s inputs:

```ts
type AndroidInputs = WebInputs;
```

The `@replay/android` package exports this type for TypeScript projects.

## Bridge

You can send asynchronous messages from your game's JS code to your Android code, and then respond back using a Promise. This allows you to use native features like in-app purchases.

### JS side

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
import { androidBridge } from "@replay/android";

export const BridgeSprite = makeSprite({
  init({ device }) {
    androidBridge({
      // This should be unique between parallel messages
      id: "TestBridge",
      // Strings to send
      message: "Hello!",
      message2: "Key",
      message3: "Value",
      // Can send up to 5 messages
    }).then((message) => {
      // message is a value sent back from Android code.
      // This will log "Bridge response: Hi!"
      device.log(`Bridge response: ${message.response}`);
    });
  },
  render() {
    return [];
  },
});
```

</TabItem>
<TabItem value="ts">

```ts
import { makeSprite } from "@replay/core";
import { androidBridge } from "@replay/android";

export const BridgeSprite = makeSprite<{}>({
  init({ device }) {
    // Set the type here to match what you send in Android code
    androidBridge<{ response: string }>({
      // This should be unique between parallel messages
      id: "TestBridge",
      // Strings to send
      message: "Hello!",
      message2: "Key",
      message3: "Value",
      // Can send up to 5 messages
    }).then((message) => {
      // message is a value sent back from Android code.
      // This will log "Bridge response: Hi!"
      device.log(`Bridge response: ${message.response}`);
    });
    return undefined;
  },
  render() {
    return [];
  },
});
```

</TabItem>
</Tabs>

### Android side

```java
class MainActivity : ReplayActivity() {
    override fun onJsCallback(
        id: String,
        message: String,
        message2: String,
        message3: String,
        message4: String,
        message5: String
    ) {
        // Here you can call native APIs
        val myApiVal = "Hi!"

        jsBridge(id, "{ response: `${myApiVal}` }")
    }
}
```
