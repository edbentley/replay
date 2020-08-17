import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/16/js";

// MD
import MDXContent from "../../../docs/tutorial/16.md";

// TS
import levelTs from "!raw-loader!../../tutorial/16/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/16/js/level.js";

function Tutorial() {
  return (
    <Page
      part={16}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "level.ts",
          code: levelTs,
          highlight: [19, 28, 39, 68, 77, "102-108"],
        },
      ]}
      codesJs={[
        {
          file: "level.js",
          code: levelJs,
          highlight: [14, 25, 54, 63, "88-94"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
