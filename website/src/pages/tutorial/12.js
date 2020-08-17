import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/12/js";

// MD
import MDXContent from "../../../docs/tutorial/12.md";

// TS
import levelTs from "!raw-loader!../../tutorial/12/ts/level.ts";
import indexTs from "!raw-loader!../../tutorial/12/ts/index.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/12/js/level.js";
import indexJs from "!raw-loader!../../tutorial/12/js/index.js";

function Tutorial() {
  return (
    <Page
      part={12}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "level.ts",
          code: levelTs,
          highlight: [8, 9, 10, 17, "25-28"],
        },
        {
          file: "index.ts",
          code: indexTs,
          highlight: [4, 5, 6, "8-11", 13, 14, 19],
        },
      ]}
      codesJs={[
        { file: "level.js", code: levelJs, highlight: ["14-17"] },
        { file: "index.js", code: indexJs, highlight: [5, 6, 7, 9, 10, 15] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
