import React from "react";
import { Page } from "../../tutorial/Page";

// MD
import MDXContent from "../../../docs/tutorial/20.md";

// TS
import testTs from "!raw-loader!../../tutorial/20/ts/__tests__/game.test.ts";

// JS
import testJs from "!raw-loader!../../tutorial/20/js/__tests__/game.test.js";

function Tutorial() {
  return (
    <Page
      part={20}
      MDXContent={MDXContent}
      codesTs={[
        {
          file: "__tests__/game.test.ts",
          code: testTs,
        },
      ]}
      codesJs={[
        {
          file: "__tests__/game.test.js",
          code: testJs,
        },
      ]}
      image="/img/test20.gif"
    />
  );
}

export default Tutorial;
