---
id: basic-setup
title: Basic Setup
---

Create a file, copy this in and open it in a browser:

```html title="index.html"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Load Replay through a CDN -->
  <script src="https://unpkg.com/@replay/core@0.4.0/umd/replay-core.min.js"></script>
  <script src="https://unpkg.com/@replay/web@0.4.0/umd/replay-web.min.js"></script>
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
    name: "Courier",
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
  loop({ state, device }) {
    const { pointer } = device.inputs;
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

// Some Textures to show while loading
const loadingTextures = [
  t.text({
    color: "black",
    text: "Loading...",
  }),
];

// Render in the browser using canvas
renderCanvas(Game(gameProps), loadingTextures, {}, "scale-up");

</script>
</body>
</html>
```

Within the `<script>` tag is the JavaScript to program your game. Head to the [API](sprites.md) docs to learn more!
