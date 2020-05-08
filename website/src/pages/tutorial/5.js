import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/5/js";

// MD
import MDXContent from "../../../docs/tutorial/5.md";

// TS
import indexTs from "!raw-loader!../../tutorial/5/ts/index.ts";

// JS
import indexJs from "!raw-loader!../../tutorial/5/js/index.js";

function Tutorial() {
  return (
    <Page
      part={5}
      MDXContent={MDXContent}
      codesTs={[{ file: "index.ts", code: indexTs, highlight: [19] }]}
      codesJs={[{ file: "index.js", code: indexJs, highlight: [19] }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
