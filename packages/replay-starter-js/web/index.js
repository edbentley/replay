// polyfills
import "core-js/stable";
import "regenerator-runtime/runtime";

import { renderCanvas } from "@replay/web";
import { Game, gameProps, options } from "../src";

renderCanvas(Game(gameProps), options);
