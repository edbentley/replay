import { makeSprite } from "@replay/core";
import { Bird } from "./bird";

export const Game = makeSprite({
  render() {
    return [
      Bird({
        id: "bird",
      }),
    ];
  },
});
