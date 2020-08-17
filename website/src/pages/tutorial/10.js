import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/10/js";

// MD
import MDXContent from "../../../docs/tutorial/10.md";

// TS
import levelTs from "!raw-loader!../../tutorial/10/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/10/js/level.js";

function Tutorial() {
  return (
    <Page
      part={10}
      MDXContent={MDXContent}
      codesTs={[{ file: "level.ts", code: levelTs, highlight: [1, "39-46"] }]}
      codesJs={[{ file: "level.js", code: levelJs, highlight: [1, "32-39"] }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
