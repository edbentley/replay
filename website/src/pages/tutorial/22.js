import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/21/js";

// MD
import MDXContent from "../../../docs/tutorial/22.md";

function Tutorial() {
  return (
    <Page
      part={22}
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
