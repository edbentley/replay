import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/18/js";

// MD
import MDXContent from "../../../docs/tutorial/18.md";

// TS
import birdTs from "!raw-loader!../../tutorial/18/ts/bird.ts";
import indexTs from "!raw-loader!../../tutorial/18/ts/index.ts";

// JS
import birdJs from "!raw-loader!../../tutorial/18/js/bird.js";
import indexJs from "!raw-loader!../../tutorial/18/js/index.js";

function Tutorial() {
  return (
    <Page
      part={18}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "bird.ts",
          code: birdTs,
          highlight: ["9-13"],
        },
        {
          file: "index.ts",
          code: indexTs,
          highlight: [1, 6, "13-29", "36-43"],
        },
      ]}
      codesJs={[
        {
          file: "bird.js",
          code: birdJs,
          highlight: ["9-13"],
        },
        {
          file: "index.js",
          code: indexJs,
          highlight: [1, "7-23", "30-37"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
