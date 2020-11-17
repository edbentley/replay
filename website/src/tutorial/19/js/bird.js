import { makeSprite, t } from "@replay/core";

export const birdWidth = 50;
export const birdHeight = 40;

export const Bird = makeSprite({
  render() {
    return [
      t.image({
        fileName: "/img/bird.png",
        width: birdWidth,
        height: birdHeight,
      }),
    ];
  },
});
