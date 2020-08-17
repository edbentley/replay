import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/15/js";

// MD
import MDXContent from "../../../docs/tutorial/15.md";

// TS
import indexTs from "!raw-loader!../../tutorial/15/ts/index.ts";
import levelTs from "!raw-loader!../../tutorial/15/ts/level.ts";

// JS
import indexJs from "!raw-loader!../../tutorial/15/js/index.js";
import levelJs from "!raw-loader!../../tutorial/15/js/level.js";

function Tutorial() {
  return (
    <Page
      part={15}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "level.ts",
          code: levelTs,
          highlight: [1, 4, 5, 12, 22, 26, 56, 57, 58, "113-179"],
        },
        {
          file: "index.ts",
          code: indexTs,
          highlight: [7, 12, 20, "22-29", 39],
        },
      ]}
      codesJs={[
        {
          file: "level.js",
          code: levelJs,
          highlight: [2, 3, 9, 13, "43-45", "100-163"],
        },
        { file: "index.js", code: indexJs, highlight: [7, 15, "17-24", 34] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
