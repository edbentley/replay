import { makeSprite, t, DeviceSize } from "@replay/core";

export type PipeT = {
  x: number;
  gapY: number;
  passed: boolean;
};

export const pipeWidth = 40;
export const pipeGap = 170;

type PipeProps = {
  pipe: PipeT;
};

export const Pipe = makeSprite<PipeProps>({
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

export function getPipeYPositions(size: DeviceSize, gapY: number) {
  return {
    yUpperTop: size.height / 2 + size.heightMargin,
    yUpperBottom: gapY + pipeGap / 2,
    yLowerTop: gapY - pipeGap / 2,
    yLowerBottom: -size.height / 2 - size.heightMargin,
  };
}
