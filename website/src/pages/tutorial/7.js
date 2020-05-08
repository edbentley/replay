import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/7/js";

// MD
import MDXContent from "../../../docs/tutorial/7.md";

// TS
import levelTs from "!raw-loader!../../tutorial/7/ts/level.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/7/js/level.js";

function Tutorial() {
  return (
    <Page
      part={7}
      MDXContent={MDXContent}
      codesTs={[{ file: "level.ts", code: levelTs, highlight: ["21-31"] }]}
      codesJs={[{ file: "level.js", code: levelJs, highlight: ["14-24"] }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
