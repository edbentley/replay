import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/9/js";

// MD
import MDXContent from "../../../docs/tutorial/9.md";

// TS
import levelTs from "!raw-loader!../../tutorial/9/ts/level.ts";
import utilsTs from "!raw-loader!../../tutorial/9/ts/utils.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/9/js/level.js";
import utilsJs from "!raw-loader!../../tutorial/9/js/utils.js";

function Tutorial() {
  return (
    <Page
      part={9}
      MDXContent={MDXContent}
      codesTs={[
        { file: "level.ts", code: levelTs, highlight: [5, 32] },
        { file: "utils.ts", code: utilsTs },
      ]}
      codesJs={[
        { file: "level.js", code: levelJs, highlight: [3, 25] },
        { file: "utils.js", code: utilsJs },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
