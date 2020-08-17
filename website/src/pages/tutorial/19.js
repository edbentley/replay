import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/19/js/src";

// MD
import MDXContent from "../../../docs/tutorial/19.md";

// TS
import levelTs from "!raw-loader!../../tutorial/19/ts/src/level.ts";
import webIndexTs from "!raw-loader!../../tutorial/19/ts/web/index.ts";

// JS
import levelJs from "!raw-loader!../../tutorial/19/js/src/level.js";
import webIndexJs from "!raw-loader!../../tutorial/19/js/web/index.js";

function Tutorial() {
  return (
    <Page
      part={19}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "level.ts",
          code: levelTs,
          highlight: [59],
        },
        { file: "web/index.ts", code: webIndexTs, highlight: [14] },
      ]}
      codesJs={[
        {
          file: "level.js",
          code: levelJs,
          highlight: [45],
        },
        { file: "web/index.js", code: webIndexJs, highlight: [14] },
      ]}
      Game={Game}
      gameProps={gameProps}
      assets={{
        imageFileNames: ["/img/bird.png"],
        audioFileNames: ["/audio/boop.wav"],
      }}
    />
  );
}

export default Tutorial;
