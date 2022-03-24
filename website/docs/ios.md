---
id: ios
title: iOS
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Swift Package

The Replay Swift package is [hosted on GitHub](https://github.com/edbentley/replay-swift). Once [added as a package dependency](https://developer.apple.com/documentation/xcode/adding_package_dependencies_to_your_app) to your Xcode project, you can replace the `rootViewController`:

```swift {1,8}
import Replay

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        if let windowScene = scene as? UIWindowScene {
            let window = UIWindow(windowScene: windowScene)
            window.rootViewController = ReplayViewController()
            self.window = window
            window.makeKeyAndVisible()
        }
    }

}
```

Your image and audio assets also need to be added to your Xcode project. See [Replay Starter](starter.md) for an example setup.

### `ReplayViewController(hideStatusBar)`

#### Parameters

- `hideStatusBar`: (Optional) A boolean to set if the status bar is hidden or not. Default `true`.
- `userStyles`: (Optional) CSS code which will be injected into the web view. Useful for defining custom fonts.
- `jsRun`: (Optional) The JS code that starts the game - can be overridden to load assets before starting game. Default `"renderCanvas.run();"`.
- `onJsCallback`: (Optional) A callback for messages sent from your game. See [Bridge](#bridge).
- `webWorkerFiles`: (Optional) An array of additional Web Worker JS file names (without `.js` extension) to load (e.g. `["file1", "file2"]`).

#### Methods

- `jsBridge(messageId: String, jsArg: String)`: Send a value from Swift to your JS game code. See [Bridge](#bridge).

## Inputs

Since Replay Swift embeds your game as a web view, the `device.inputs` parameter of Sprite methods is an alias of the [Web package](web.md)'s inputs:

```ts
type iOSInputs = WebInputs;
```

The `@replay/swift` package exports this type for TypeScript projects.

## Bridge

You can send asynchronous messages from your game's JS code to your Swift code, and then respond back using a Promise. This allows you to use native features like in-app purchases.

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
import { swiftBridge } from "@replay/swift";

export const BridgeSprite = makeSprite({
  init({ device }) {
    swiftBridge({
      // This should be unique between parallel messages
      id: "TestBridge",
      // A string to send
      message: "Hello!",
    }).then((message) => {
      // message is a value sent back from Swift code.
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
import { swiftBridge } from "@replay/swift";

export const BridgeSprite = makeSprite<{}>({
  init({ device }) {
    // Set the type here to match what you send in Swift code
    swiftBridge<{ response: string }>({
      // This should be unique between parallel messages
      id: "TestBridge",
      // A string to send
      message: "Hello!",
    }).then((message) => {
      // message is a value sent back from Swift code.
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

### Swift side

```swift
        var vc: ReplayViewController!
        vc = ReplayViewController(onJsCallback: { (message) in
            if (message == "Hello!") {
                // Here you can call native APIs
                let myApiVal = "Hi!"

                vc.jsBridge(
                    // This should match the id above
                    messageId: "TestBridge",
                    // The return value of the Promise in JS code.
                    // Use a String which will be evaluated as JS code (like eval)
                    jsArg: "{ response: `\(myApiVal)` }"
                )
            }
        })
```
