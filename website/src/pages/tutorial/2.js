import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/4/js/src";

// MD
import MDXContent from "../../../docs/tutorial/2.md";

// TS
import birdTs from "!raw-loader!../../tutorial/2/ts/bird.ts";

// JS
import birdJs from "!raw-loader!../../tutorial/2/js/bird.js";

function Tutorial() {
  return (
    <Page
      part={2}
      MDXContent={MDXContent}
      codesTs={[{ file: "bird.ts", code: birdTs }]}
      codesJs={[{ file: "bird.js", code: birdJs }]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
