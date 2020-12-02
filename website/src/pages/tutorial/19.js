import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/19/js";

// MD
import MDXContent from "../../../docs/tutorial/19.md";

// TS
import levelTs from "!raw-loader!../../tutorial/19/ts/level.ts";
import indexTs from "!raw-loader!../../tutorial/19/ts/index.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/19/js/level.js";
import indexJs from "!raw-loader!../../tutorial/19/js/index.js";

function Tutorial() {
  return (
    <Page
      part={19}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "level.ts",
          code: levelTs,
          highlight: [59],
        },
        { file: "index.ts", code: indexTs, highlight: [15] },
      ]}
      codesJs={[
        {
          file: "level.js",
          code: levelJs,
          highlight: [45],
        },
        { file: "index.js", code: indexJs, highlight: [9] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
