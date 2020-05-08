import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/4/js/src";

// MD
import MDXContent from "../../../docs/tutorial/3.md";

// TS
import birdTs from "!raw-loader!../../tutorial/3/ts/bird.ts";
import indexTs from "!raw-loader!../../tutorial/3/ts/index.ts";

// JS
import birdJs from "!raw-loader!../../tutorial/3/js/bird.js";
import indexJs from "!raw-loader!../../tutorial/3/js/index.js";

function Tutorial() {
  return (
    <Page
      part={3}
      MDXContent={MDXContent}
      codesTs={[
        { file: "index.ts", code: indexTs },
        { file: "bird.ts", code: birdTs },
      ]}
      codesJs={[
        { file: "index.js", code: indexJs },
        { file: "bird.js", code: birdJs },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
