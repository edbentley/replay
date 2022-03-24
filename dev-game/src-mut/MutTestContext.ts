import {
  makeContext,
  makeMutableSprite,
  t2,
} from "../../packages/replay-core/src";

export type TestContext = {
  val: number;
};
export const testContext = makeContext<TestContext>();

export const TestContextChild = makeMutableSprite({
  render({ getContext }) {
    return [
      t2.text(
        {
          y: -80,
        },
        (thisProps) => {
          thisProps.text = `test context val: ${getContext(testContext).val}`;
        }
      ),
    ];
  },
});
