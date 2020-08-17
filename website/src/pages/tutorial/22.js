import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/22/js/src";

// MD
import MDXContent from "../../../docs/tutorial/22.md";

// TS
import indexTs from "!raw-loader!../../tutorial/22/ts/src/index.ts";
import webIndexTs from "!raw-loader!../../tutorial/22/ts/web/index.ts";

// JS
import indexJs from "!raw-loader!../../tutorial/22/js/src/index.js";
import webIndexJs from "!raw-loader!../../tutorial/22/js/web/index.js";

function Tutorial() {
  return (
    <Page
      part={22}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "index.ts",
          code: indexTs,
          highlight: [1, 2, "6-17"],
        },
        { file: "web/index.ts", code: webIndexTs },
      ]}
      codesJs={[
        {
          file: "index.js",
          code: indexJs,
          highlight: [1, "5-16"],
        },
        { file: "web/index.js", code: webIndexJs },
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
