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
            6,
            8,
            18,
            22,
            26,
            37,
            "49-67",
            72,
            "92-98",
            "103-112",
          ],
        },
      ]}
      codesJs={[
        { file: "pipe.js", code: pipeJs },
        {
          file: "level.js",
          code: levelJs,
          highlight: [2, 4, 6, 10, 14, 25, "37-55", 60, "80-86", "91-100"],
        },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
