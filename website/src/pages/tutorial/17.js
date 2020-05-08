import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/17/js";

// MD
import MDXContent from "../../../docs/tutorial/17.md";

// TS
import indexTs from "!raw-loader!../../tutorial/17/ts/index.ts";
import levelTs from "!raw-loader!../../tutorial/17/ts/level.ts";
import menuTs from "!raw-loader!../../tutorial/17/ts/menu.ts";

// JS
import indexJs from "!raw-loader!../../tutorial/17/js/index.js";
import levelJs from "!raw-loader!../../tutorial/17/js/level.js";
import menuJs from "!raw-loader!../../tutorial/17/js/menu.js";

function Tutorial() {
  return (
    <Page
      part={17}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "index.ts",
          code: indexTs,
          highlight: [8, 12, 13, 17, 21, 28, "30-34", 38, 46],
        },
        {
          file: "level.ts",
          code: levelTs,
          highlight: [13, 63],
        },
        {
          file: "menu.ts",
          code: menuTs,
          highlight: [8, "30-35"],
        },
      ]}
      codesJs={[
        {
          file: "index.js",
          code: indexJs,
          highlight: [6, 7, 11, 15, 22, "24-28", 32, 40],
        },
        {
          file: "level.js",
          code: levelJs,
          highlight: [49],
        },
        {
          file: "menu.js",
          code: menuJs,
          highlight: ["23-28"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
