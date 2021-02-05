import {
  makeSprite,
  t,
  GameProps,
  makeNativeSprite,
  NativeSpriteImplementation,
} from "@replay/core";
import { iOSInputs, swiftBridge } from "../../src/index";

export const gameProps: GameProps = {
  id: "Game",
  size: {
    width: 500,
    height: 300,
    maxWidthMargin: 50,
    maxHeightMargin: 50,
  },
  defaultFont: { family: "Arial", size: 16 },
};

export const Game = makeSprite<GameProps, undefined, iOSInputs>({
  render() {
    return [
      ClipboardSprite({ id: "clipboard" }),
      StorageSprite({ id: "storage" }),
      BridgeSprite({ id: "bridge" }),
      MyNativeSprite({ id: "native" }),
      t.text({
        x: -100,
        font: { family: "serif", size: 22 },
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

// -- Clipboard

const ClipboardSprite = makeSprite<{}>({
  init({ device }) {
    device.clipboard.copy("some_text", (err) => {
      if (err) {
        device.log("Copy Error!");
      } else {
        device.log("Copied!");
      }
    });

    return undefined;
  },
  render() {
    return [];
  },
});

// -- Storage

const StorageSprite = makeSprite<{}>({
  init({ device }) {
    device.storage
      .setItem("item1", "hi")
      .then(() => device.storage.getItem("item1"))
      .then((item1) => {
        device.log(`item1 set: ${item1}`);
      })
      .then(() => device.storage.setItem("item1", null))
      .then(() => device.storage.getItem("item1"))
      .then((item1) => {
        device.log(`item1 removed: ${item1}`);
      });

    device.storage.getItem("item2").then((item2) => {
      device.log(`item2: ${item2}`);
    });
    return undefined;
  },
  render() {
    return [];
  },
});

// -- Swift / JS Bridge

const BridgeSprite = makeSprite<{}>({
  init({ device }) {
    swiftBridge<{ response: string }>({
      id: "TestBridge",
      message: "Hello!",
    }).then(({ response }) => {
      device.log(`Bridge response: ${response}`);
    });
    return undefined;
  },
  render() {
    return [];
  },
});

// -- Options

export const options = {
  nativeSpriteMap: {
    MyNativeSprite: MyNativeSpriteWebView,
  },
};
