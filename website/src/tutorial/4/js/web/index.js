import { renderCanvas } from "@replay/web";
import { t } from "@replay/core";
import { Game, gameProps } from "../src";

const options = {
  loadingTextures: [
    t.text({
      color: "black",
      text: "Loading...",
    }),
  ],
};

renderCanvas(Game(gameProps), options);
