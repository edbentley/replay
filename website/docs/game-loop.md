---
id: game-loop
title: Game Loop
---

The `loop` method of every Sprite is guaranteed to run 60 times a second. `loop` can be called multiple times between `render` methods if the device is not able to render at 60 fps.

![Sprite Lifecycle](/img/sprite-lifecycle.png)

The `render` method has an argument `extrapolateFactor`, a value between 0 and 1 representing how much time has passed before the next frame is scheduled. For example, each frame will take 16.667ms to run, but if there were 25ms since the last render, then `extrapolateFactor` will be 0.5 (there is 8.33ms spare). This can be used to extrapolate the position of a sprite ahead of time for a smoother gameplay experience.

The article [Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/) covers this in more detail.
