import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { AndroidInputs } from "./index";

declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, AndroidInputs>;
  gameProps: GameProps;
  options?: RenderCanvasOptions;
};

// fetch local file doesn't work in Android WebView
window.fetch = function fetchXML(url: RequestInfo) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(new Response(xhr.response, { status: xhr.status }));
    };
    xhr.onerror = function () {
      reject(new TypeError("Local request failed"));
    };
    xhr.open("GET", url as string);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
  });
};

export function run() {
  renderCanvas(game.Game(game.gameProps), game.options, {
    storage: {
      getItem(key) {
        return Promise.resolve("");
        // return swiftBridge<string | null>({
        //   id: `__internalReplayStorageGetItem-${key}`,
        //   message: `__internalReplayStorageGetItem-${key}`,
        // });
      },
      setItem(key, value) {
        return Promise.resolve();
        // if (value === null) {
        //   return swiftBridge<void>({
        //     id: `__internalReplayStorageRemoveItem-${key}`,
        //     message: `__internalReplayStorageRemoveItem-${key}`,
        //   });
        // }
        // return swiftBridge<void>({
        //   id: `__internalReplayStorageSetItem-${key}`,
        //   // We assume user's keys won't contain this separator
        //   message: `__internalReplayStorageSetItem-${key}_____end_of_key______${value}`,
        // });
      },
    },
    clipboard: {
      copy(text, onComplete) {
        // swiftBridge<void>({
        //   id: "__internalReplayClipboardCopy",
        //   message: `__internalReplayClipboardCopy${text}`,
        // }).then(() => {
        //   onComplete();
        // });
      },
    },
  });
}
