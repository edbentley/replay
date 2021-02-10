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
          id: `__internalReplayGetItem-${key}`,
          message: `__internalReplayGetItem-${key}`,
        });
      },
      setItem(key, value) {
        if (value === null) {
          return swiftBridge<void>({
            id: `__internalReplayRemoveItem-${key}`,
            message: `__internalReplayRemoveItem-${key}`,
          });
        }
        return swiftBridge<void>({
          id: `__internalReplaySetItem-${key}`,
          // We assume user's keys won't contain this separator
          message: `__internalReplaySetItem-${key}_____end_of_key______${value}`,
        });
      },
    },
  });
}
