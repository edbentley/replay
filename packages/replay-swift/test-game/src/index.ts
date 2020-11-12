import {
  makeSprite,
  t,
  GameProps,
  makeNativeSprite,
  NativeSpriteImplementation,
} from "@replay/core";
import { RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "../../src/index";

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 500,
    height: 300,
    maxWidthMargin: 50,
    maxHeightMargin: 50,
  },
  defaultFont: { name: "Arial", size: 16 },
};

export const Game = makeSprite<GameProps, undefined, iOSInputs>({
  render() {
    return [
      MyNativeSprite({ id: "native" }),
      t.text({
        x: -100,
        font: { name: "serif", size: 22 },
        color: "red",
        text: "Test text",
      }),
      t.circle({
        x: 100,
        radius: 10,
        color: "#0095DD",
      }),
    ];
  },
});

// -- NativeSprite for a web view

// tests will write to this global field
interface NativeSpriteGlobalsWindow extends Window {
  myGlobalField: { ref: string };
}
declare let window: NativeSpriteGlobalsWindow;

type MyNativeSpriteProps = { id: string };
type MyNativeSpriteState = { someField: string };

const MyNativeSprite = makeNativeSprite<MyNativeSpriteProps>("MyNativeSprite");

const MyNativeSpriteWebView: NativeSpriteImplementation<
  MyNativeSpriteProps,
  MyNativeSpriteState
> = {
  create: ({ parentGlobalId }) => {
    console.log(`create ${parentGlobalId}`);
    return { someField: "hello" };
  },
  loop: ({ state, parentGlobalId }) => {
    console.log(
      `loop ${state.someField} ${window.myGlobalField.ref} ${parentGlobalId}`
    );
    return state;
  },
  cleanup: ({ parentGlobalId }) => {
    console.log(`cleanup ${parentGlobalId}`);
  },
};

export const nativeSpriteMap = {
  MyNativeSprite: MyNativeSpriteWebView,
};

// -- Options

export const options: RenderCanvasOptions = {
  nativeSpriteMap: {
    MyNativeSprite: MyNativeSpriteWebView,
  },
};
