import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/11/js";

// MD
import MDXContent from "../../../docs/tutorial/11.md";

// TS
import levelTs from "!raw-loader!../../tutorial/11/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/11/js/level.js";

function Tutorial() {
  return (
    <Page
      part={11}
      MDXContent={MDXContent}
      codesTs={[{ file: "level.ts", code: levelTs, highlight: [51] }]}
      codesJs={[{ file: "level.js", code: levelJs, highlight: [44] }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
