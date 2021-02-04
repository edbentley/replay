import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "./index";

declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, iOSInputs>;
  gameProps: GameProps;
  options?: RenderCanvasOptions;
};

console.log = (message: string) => {
  window.webkit.messageHandlers.consoleLog.postMessage(message);
};

export function run() {
  renderCanvas(game.Game(game.gameProps), game.options);
}
