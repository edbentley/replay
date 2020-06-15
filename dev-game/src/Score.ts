import { t, makeSprite } from "../../packages/replay-core/src";

export const Score = makeSprite<{ score: number; preText?: string }>({
  render({ device: { size }, props: { score, preText = "" } }) {
    return [
      t.text({
        text: `${preText}Score ${score}`,
        align: "left",
        x: -size.width / 2 + 50,
        y: -size.height / 2 + 10,
        color: "black",
      }),
    ];
  },
  renderP({ device: { size }, props: { score, preText = "" } }) {
    return [
      t.text({
        text: `${preText}Score ${score}`,
        align: "left",
        x: -size.width / 2 + 50,
        y: size.height / 2 - 10,
        color: "black",
      }),
    ];
  },
});
