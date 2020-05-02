---
id: ios
title: iOS
---

## Swift Package

<!-- TODO: GitHub link -->
The Replay Swift package is hosted on GitHub. Once added as a dependency to your Xcode project, you can replace the `rootViewController`:

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

## Inputs

The `device.inputs` parameter of Sprite methods is of type:

```ts
type iOSInputs = {
  pointer: {
    pressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    x: number;
    y: number;
  };
};
```

The `@replay/swift` package exports this type for TypeScript projects.
