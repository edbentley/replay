---
id: game-loop
title: Game Loop
---

The `loop` and `render` method of every Sprite is guaranteed to run 60 times a second, in that order. If the `render` method returns other Sprites, the returned Sprites will then call their own `loop` and `render` _after_ `render` returns.

![Sprite Lifecycle](/img/sprite-lifecycle.png)

The `render` method has a parameter `extrapolateFactor`, a value between -0.5 and 0.5 representing how much time has passed or overshot on the frame. For example, each frame will take 16.667ms to run, but if there were 25ms since the last render, then `extrapolateFactor` will be 0.5 (there is 8.33ms spare). This can be used to extrapolate the position of a sprite ahead of time for a smoother gameplay experience.

The article [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/) covers this in more detail.
