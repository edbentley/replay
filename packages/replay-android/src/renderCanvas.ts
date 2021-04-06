import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { androidBridge, AndroidInputs } from "./index";

declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, AndroidInputs>;
  gameProps: GameProps;
  options?: RenderCanvasOptions;
};

// local file doesn't work using `fetch` in Android WebView
function fileFetch(url: RequestInfo) {
  return new Promise<Response>(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(new Response(xhr.response, { status: xhr.status }));
    };
    xhr.onerror = function () {
      reject(new TypeError(`Failed to load file: ${url.toString()}`));
    };
    xhr.open("GET", url as string);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
  });
}

export function run() {
  renderCanvas(game.Game(game.gameProps), game.options, {
    fileFetch,
    device: {
      storage: {
        getItem: async (key) => {
          const result = await androidBridge<
            { value: string | null } | { error: string }
          >({
            id: `__internalReplayStorageGetItem-${key}`,
            message: key,
          });
          if ("error" in result) {
            throw Error(result.error);
          }
          return result.value;
        },
        setItem: async (key, value) => {
          if (value === null) {
            const error = await androidBridge<void | string>({
              id: `__internalReplayStorageRemoveItem-${key}`,
              message: key,
            });
            if (typeof error === "string") {
              throw Error(error);
            }
          }
          const error = await androidBridge<void | string>({
            id: `__internalReplayStorageSetItem-${key}`,
            message: key,
            message2: value,
          });
          if (typeof error === "string") {
            throw Error(error);
          }
        },
      },
      clipboard: {
        copy(text, onComplete) {
          androidBridge<void>({
            id: "__internalReplayClipboardCopy",
            message: text,
          }).then(() => {
            onComplete();
          });
        },
      },
      alert: {
        ok: (message, onResponse) => {
          androidBridge<void>({
            id: "__internalReplayAlertOk",
            message,
          }).then(() => {
            onResponse();
          });
        },
        okCancel: (message, onResponse) => {
          androidBridge<boolean>({
            id: "__internalReplayAlertOkCancel",
            message,
          }).then((wasOk) => {
            onResponse(wasOk);
          });
        },
      },
    },
  });
}
