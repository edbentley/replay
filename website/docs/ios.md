---
id: ios
title: iOS
---

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

## Inputs

Since Replay Swift embeds your game as a web view, the `device.inputs` parameter of Sprite methods is an alias of the [Web package](web.md)'s inputs:

```ts
type iOSInputs = WebInputs;
```

The `@replay/swift` package exports this type for TypeScript projects.
