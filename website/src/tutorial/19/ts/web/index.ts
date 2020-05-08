import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import { Game, gameProps } from "../src";

const loadingTextures = [
  t.text({
    color: "black",
    text: "Loading...",
  }),
];

renderCanvas(Game(gameProps), loadingTextures, {
  imageFileNames: ["bird.png"],
  audioFileNames: ["boop.wav"],
});
