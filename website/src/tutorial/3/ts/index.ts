import { makeSprite, GameProps } from "@replay/core";
import { Bird } from "./bird";

export const Game = makeSprite<GameProps>({
  render() {
    return [
      Bird({
        id: "bird",
      }),
    ];
  },
});
