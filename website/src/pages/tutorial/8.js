import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/8/js";

// MD
import MDXContent from "../../../docs/tutorial/8.md";

// TS
import levelTs from "!raw-loader!../../tutorial/8/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/8/js/level.js";

function Tutorial() {
  return (
    <Page
      part={8}
      MDXContent={MDXContent}
      codesTs={[
        { file: "level.ts", code: levelTs, highlight: [21, 22, 29, 30, 31] },
      ]}
      codesJs={[
        { file: "level.js", code: levelJs, highlight: [14, 15, 22, 23, 24] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
