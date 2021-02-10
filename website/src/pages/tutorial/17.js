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
          highlight: [8, "12-27", 29, 36, "38-42", 46, 54],
        },
        {
          file: "level.ts",
          code: levelTs,
          highlight: [12, 59],
        },
        {
          file: "menu.ts",
          code: menuTs,
          highlight: [7, "26-31"],
        },
      ]}
      codesJs={[
        {
          file: "index.js",
          code: indexJs,
          highlight: ["6-21", 23, 30, "32-36", 40, 48],
        },
        {
          file: "level.js",
          code: levelJs,
          highlight: [45],
        },
        {
          file: "menu.js",
          code: menuJs,
          highlight: ["19-24"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
