// defined in webpack
/* global ASSET_NAMES */

// polyfills
import "core-js/stable";
import "regenerator-runtime/runtime";

import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import { Game, gameProps } from "../src";

const loadingTextures = [
  t.text({
    color: "black",
    text: "Loading...",
  }),
];

renderCanvas(Game(gameProps), loadingTextures, ASSET_NAMES, "scale-up");
