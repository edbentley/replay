import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/22/js/src";

// MD
import MDXContent from "../../../docs/tutorial/23.md";

function Tutorial() {
  return (
    <Page
      part={23}
      MDXContent={MDXContent}
      Game={Game}
      gameProps={gameProps}
      isEnd
      assets={{
        imageFileNames: ["/img/bird.png"],
        audioFileNames: ["/audio/boop.wav"],
      }}
    />
  );
}

export default Tutorial;
