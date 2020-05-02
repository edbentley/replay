import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import { Game, gameProps } from "../src";

// defined in webpack
declare const ASSET_NAMES: {};

const loadingTextures = [
  t.text({
    color: "black",
    text: "Loading...",
  }),
];

renderCanvas(Game(gameProps), loadingTextures, ASSET_NAMES, "scale-up");
