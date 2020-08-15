import { GameProps } from "@replay/core";
import { CustomSprite } from "@replay/core/dist/sprite";
import { renderCanvas, RenderCanvasOptions } from "@replay/web";
import { iOSInputs } from "./index";

declare const webkit: {
  messageHandlers: Record<Messages, { postMessage: (arg: string) => void }>;
};
declare const game: {
  Game: (props: GameProps) => CustomSprite<GameProps, unknown, iOSInputs>;
  gameProps: GameProps;
  options: RenderCanvasOptions;
};

type Messages = WebkitMessage | DidLoadMessage;
type WebkitMessage = "consoleLog";
type DidLoadMessage = "didLoad";

console.log = (message: string) => {
  webkit.messageHandlers.consoleLog.postMessage(message);
};

export function run() {
  const { loadPromise } = renderCanvas(game.Game(game.gameProps), game.options);
  loadPromise.then(() => {
    webkit.messageHandlers.didLoad.postMessage("");
  });
}
