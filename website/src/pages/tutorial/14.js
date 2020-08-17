import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/14/js";

// MD
import MDXContent from "../../../docs/tutorial/14.md";

// TS
import pipeTs from "!raw-loader!../../tutorial/14/ts/pipe.ts";
import levelTs from "!raw-loader!../../tutorial/14/ts/level.ts";

// JS
import pipeJs from "!raw-loader!../../tutorial/14/js/pipe.js";
import levelJs from "!raw-loader!../../tutorial/14/js/level.js";

function Tutorial() {
  return (
    <Page
      part={14}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "pipe.ts",
          code: pipeTs,
        },
        {
          file: "level.ts",
          code: levelTs,
          highlight: [
            1,
            4,
            5,
            7,
            17,
            21,
            25,
            36,
            "45-63",
            68,
            "86-92",
            "97-106",
          ],
        },
      ]}
      codesJs={[
        { file: "pipe.js", code: pipeJs },
        {
          file: "level.js",
          code: levelJs,
          highlight: [2, 3, 5, 9, 13, 24, "33-51", 56, "74-80", "85-94"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
