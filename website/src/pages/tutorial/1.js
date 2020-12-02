import React from "react";
import { Page } from "../../tutorial/Page";

// Game
import { Game, gameProps } from "../../tutorial/final/js/src";

// MD
import MDXContent from "../../../docs/tutorial/1.md";

function Tutorial() {
  return (
    <Page part={1} MDXContent={MDXContent} Game={Game} gameProps={gameProps} />
  );
}

export default Tutorial;
