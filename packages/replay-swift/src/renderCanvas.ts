import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { iOSInputs, swiftBridge } from "./index";

declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, iOSInputs>;
  gameProps: GameProps;
  options?: RenderCanvasOptions;
};

console.log = (message: string) => {
  window.webkit.messageHandlers.consoleLog.postMessage(message);
};

export function run() {
  renderCanvas(game.Game(game.gameProps), game.options, {
    storage: {
      getItem(key) {
        return swiftBridge<string | null>({
          id: `__internalReplayStorageGetItem-${key}`,
          message: `__internalReplayStorageGetItem-${key}`,
        });
      },
      setItem(key, value) {
        if (value === null) {
          return swiftBridge<void>({
            id: `__internalReplayStorageRemoveItem-${key}`,
            message: `__internalReplayStorageRemoveItem-${key}`,
          });
        }
        return swiftBridge<void>({
          id: `__internalReplayStorageSetItem-${key}`,
          // We assume user's keys won't contain this separator
          message: `__internalReplayStorageSetItem-${key}_____end_of_key______${value}`,
        });
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
  });
}
