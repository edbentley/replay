import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/6/js";

// MD
import MDXContent from "../../../docs/tutorial/6.md";

// TS
import levelTs from "!raw-loader!../../tutorial/6/ts/level.ts";
import indexTs from "!raw-loader!../../tutorial/6/ts/index.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/6/js/level.js";
import indexJs from "!raw-loader!../../tutorial/6/js/index.js";

function Tutorial() {
  return (
    <Page
      part={6}
      MDXContent={MDXContent}
      codesTs={[
        { file: "level.ts", code: levelTs },
        { file: "index.ts", code: indexTs, highlight: [2, 7, 8, 9] },
      ]}
      codesJs={[
        { file: "level.js", code: levelJs },
        { file: "index.js", code: indexJs, highlight: [2, 7, 8, 9] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
