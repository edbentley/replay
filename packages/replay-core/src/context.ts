import { Context } from "./sprite";

/**
 * Function to define a context, which can be used to pass props into nested
 * Sprites using `getContext`:
 *
 * ```js
 * const myContext = makeContext()
 *
 * myContext.Sprite({ context: { count: 0 }, sprites: [...] })
 *
 * const { count } = getContext(myContext)
 * ```
 */
export function makeContext<T>(): Context<T> {
  const contextThis: Context<T> = {
    Sprite: ({ context, sprites }) => ({
      type: "context",
      value: context,
      sprites,
      context: contextThis,
    }),
  };
  return contextThis;
}

export type ContextValue<T = unknown> = {
  context: Context<T>;
  value: T;
};
