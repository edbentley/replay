import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/18/js/src";

// MD
import MDXContent from "../../../docs/tutorial/18.md";

// TS
import birdTs from "!raw-loader!../../tutorial/18/ts/src/bird.ts";
import webIndexTs from "!raw-loader!../../tutorial/18/ts/web/index.ts";

// JS
import birdJs from "!raw-loader!../../tutorial/18/js/src/bird.js";
import webIndexJs from "!raw-loader!../../tutorial/18/js/web/index.js";

function Tutorial() {
  return (
    <Page
      part={18}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "bird.ts",
          code: birdTs,
          highlight: ["9-13"],
        },
        { file: "web/index.ts", code: webIndexTs, highlight: [12, 13, 14] },
      ]}
      codesJs={[
        {
          file: "bird.js",
          code: birdJs,
          highlight: ["9-13"],
        },
        { file: "web/index.js", code: webIndexJs, highlight: [12, 13, 14] },
      ]}
      Game={Game}
      gameProps={gameProps}
      assets={{
        imageFileNames: ["/img/bird.png"],
      }}
    />
  );
}

export default Tutorial;
