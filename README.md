<img src="https://user-images.githubusercontent.com/15923595/80867852-59ea6680-8c8e-11ea-93ee-a17b922239f2.png" alt="Replay" align="center" width="250" />

Replay is a cross-platform JavaScript game engine inspired by
[React](https://reactjs.org/).

Its declarative API goes against the grain of typical game engines. It's small
yet powerful, giving you total control on how your game runs. With a great
testing library built in, Replay is ideal for writing bug-free games.

Build your game once and deploy it for web, iOS and Android.

[Tutorial](https://replay.js.org/tutorial) ·
[Docs](https://replay.js.org/docs/intro) · [Blog](https://replay.js.org/blog) ·
[Games](https://replay.js.org/games)

## ⚠️ Status

Replay is still in early development and will go through many breaking changes.
However we encourage you to start making games now - your feedback will help
shape Replay's future!

## Quick Setup

Create a file, copy this in and open it in a browser:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Load Replay through a CDN -->
  <script src="https://unpkg.com/@replay/core@0.9.0/umd/replay-core.min.js"></script>
  <script src="https://unpkg.com/@replay/web@0.9.0/umd/replay-web.min.js"></script>
  <title>Replay Game</title>
</head>
<body>
<script>

// Import from Replay
const { makeSprite, t } = replay;
const { renderCanvas } = replayWeb;

// Setup game size
const gameProps = {
  id: "Game",
  size: {
    landscape: {
      width: 600,
      height: 400,
      maxWidthMargin: 150,
    },
    portrait: {
      width: 400,
      height: 600,
      maxHeightMargin: 150,
    },
  },
  defaultFont: {
    family: "Courier",
    size: 10,
  },
};

// Create a Game Sprite
const Game = makeSprite({
  init() {
    // Our initial state
    return {
      posX: 0,
      posY: 0,
      targetX: 0,
      targetY: 0,
    };
  },

  // This is run 60 times a second. Returns next frame's state.
  loop({ state, getInputs }) {
    const { pointer } = getInputs();
    const { posX, posY } = state;
    let { targetX, targetY } = state;

    // Update our target when the mouse is clicked
    if (pointer.justPressed) {
      targetX = pointer.x;
      targetY = pointer.y;
    }

    return {
      // Update our position to move closer to target over time
      posX: posX + (targetX - posX) / 10,
      posY: posY + (targetY - posY) / 10,
      targetX,
      targetY,
    };
  },

  // Render Textures based on game state
  render({ state }) {
    return [
      t.text({
        color: "red",
        text: "Hello Replay!",
        y: 50,
      }),
      t.circle({
        x: state.posX,
        y: state.posY,
        color: "#147aff",
        radius: 10,
      }),
    ];
  },
});

// Render in the browser using canvas
renderCanvas(Game(gameProps), { dimensions: "scale-up" });

</script>
</body>
</html>
```
