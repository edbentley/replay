import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/4/js/src";

// MD
import MDXContent from "../../../docs/tutorial/4.md";

// TS
import webIndexTs from "!raw-loader!../../tutorial/4/ts/web/index.ts";
import indexTs from "!raw-loader!../../tutorial/4/ts/src/index.ts";

// JS
import webIndexJs from "!raw-loader!../../tutorial/4/js/web/index.js";
import indexJs from "!raw-loader!../../tutorial/4/js/src/index.js";

function Tutorial() {
  return (
    <Page
      part={4}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "index.ts",
          code: indexTs,
          highlight: ["14-24"],
        },
        { file: "web/index.ts", code: webIndexTs },
      ]}
      codesJs={[
        {
          file: "index.js",
          code: indexJs,
          highlight: ["14-24"],
        },
        { file: "web/index.js", code: webIndexJs },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
