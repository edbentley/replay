import { makeSprite, t } from "@replay/core";

export const pipeWidth = 40;
export const pipeGap = 170;

export const Pipe = makeSprite({
  render({ props, device }) {
    const { size } = device;
    const { pipe } = props;

    const {
      yUpperTop,
      yUpperBottom,
      yLowerTop,
      yLowerBottom,
    } = getPipeYPositions(size, pipe.gapY);

    return [
      t.rectangle({
        color: "green",
        width: pipeWidth,
        height: yUpperTop - yUpperBottom,
        position: { x: 0, y: (yUpperTop + yUpperBottom) / 2 },
      }),
      t.rectangle({
        color: "green",
        width: pipeWidth,
        height: yLowerTop - yLowerBottom,
        position: { x: 0, y: (yLowerTop + yLowerBottom) / 2 },
      }),
    ];
  },
});

export function getPipeYPositions(size, gapY) {
  return {
    yUpperTop: size.height / 2 + size.heightMargin,
    yUpperBottom: gapY + pipeGap / 2,
    yLowerTop: gapY - pipeGap / 2,
    yLowerBottom: -size.height / 2 - size.heightMargin,
  };
}
