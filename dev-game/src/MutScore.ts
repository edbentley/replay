import { makeMutableSprite } from "../../packages/replay-core/src";
import { t } from "../../packages/replay-core/src/t2";

export const MutScore = makeMutableSprite<{ score: number; preText?: string }>({
  render({ device: { size }, props }) {
    return [
      t.text(
        {
          x: -size.width / 2 + 50,
          y: -size.height / 2 + 10,
          color: "black",
          font: {
            align: "left",
          },
        },
        (thisProps) => {
          const { score, preText = "" } = props;
          thisProps.text = `${preText}Score ${score}`;

          // Updates?
          // thisProps.x = -device.size.width / 2 + 50;
          // thisProps.y = -device.size.height / 2 + 10;
        }
      ),
    ];
  },
});
