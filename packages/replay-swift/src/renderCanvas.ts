import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { iOSInputs, swiftBridge } from "./index";

declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, iOSInputs>;
  gameProps: GameProps;
  options?: RenderCanvasOptions;
};

const sendLog = (...args: unknown[]) => {
  window.webkit.messageHandlers.consoleLog.postMessage(
    args
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : arg instanceof Error
          ? `Error(${arg.message})`
          : JSON.stringify(arg)
      )
      .join("    ")
  );
};
console.log = sendLog;
console.info = sendLog;
console.warn = sendLog;
console.error = sendLog;

export function run() {
  return renderCanvas(game.Game(game.gameProps), game.options, {
    device: {
      storage: {
        getItem: async (key) => {
          const result = await swiftBridge<
            { value: string | null } | { error: string }
          >({
            id: `__internalReplayStorageGetItem-${key}`,
            message: `__internalReplayStorageGetItem-${key}`,
          });
          if ("error" in result) {
            throw Error(result.error);
          }
          return result.value;
        },
        setItem: async (key, value) => {
          if (value === null) {
            const error = await swiftBridge<void | string>({
              id: `__internalReplayStorageRemoveItem-${key}`,
              message: `__internalReplayStorageRemoveItem-${key}`,
            });
            if (typeof error === "string") {
              throw Error(error);
            }
            return;
          }
          const error = await swiftBridge<void | string>({
            id: `__internalReplayStorageSetItem-${key}`,
            // We assume user's keys won't contain this separator
            message: `__internalReplayStorageSetItem-${key}_____end_of_key______${value}`,
          });
          if (typeof error === "string") {
            throw Error(error);
          }
        },
      },
      clipboard: {
        copy(text, onComplete) {
          swiftBridge<void>({
            id: "__internalReplayClipboardCopy",
            message: `__internalReplayClipboardCopy${text}`,
          }).then(() => {
            onComplete();
          });
        },
      },
      alert: {
        ok: (message, onResponse) => {
          swiftBridge<void>({
            id: "__internalReplayAlertOk",
            message: `__internalReplayAlertOk${message}`,
          }).then(() => {
            onResponse?.();
          });
        },
        okCancel: (message, onResponse) => {
          swiftBridge<boolean>({
            id: "__internalReplayAlertConfirm",
            message: `__internalReplayAlertConfirm${message}`,
          }).then((wasOk) => {
            onResponse(wasOk);
          });
        },
      },
    },
  });
}
