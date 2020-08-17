import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/9/js";

// MD
import MDXContent from "../../../docs/tutorial/9.md";

// TS
import levelTs from "!raw-loader!../../tutorial/9/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/9/js/level.js";

function Tutorial() {
  return (
    <Page
      part={9}
      MDXContent={MDXContent}
      codesTs={[{ file: "level.ts", code: levelTs, highlight: [29] }]}
      codesJs={[{ file: "level.js", code: levelJs, highlight: [22] }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
