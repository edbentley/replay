import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/13/js";

// MD
import MDXContent from "../../../docs/tutorial/13.md";

// TS
import menuTs from "!raw-loader!../../tutorial/13/ts/menu.ts";
import indexTs from "!raw-loader!../../tutorial/13/ts/index.ts";

// JS
import menuJs from "!raw-loader!../../tutorial/13/js/menu.js";
import indexJs from "!raw-loader!../../tutorial/13/js/index.js";

function Tutorial() {
  return (
    <Page
      part={13}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "menu.ts",
          code: menuTs,
        },
        {
          file: "index.ts",
          code: indexTs,
          highlight: [3, 14, "22-34"],
        },
      ]}
      codesJs={[
        { file: "menu.js", code: menuJs },
        { file: "index.js", code: indexJs, highlight: [3, 10, "18-30"] },
      ]}
      Game={Game}
      gameProps={gameProps}
    />
  );
}

export default Tutorial;
