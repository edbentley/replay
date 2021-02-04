type WebkitMessages = LogMessage | ErrorMessage | JsCallbackMessage;
type LogMessage = "consoleLog";
type ErrorMessage = "error";
type JsCallbackMessage = "jsCallback";

declare interface Window {
  webkit: {
    messageHandlers: Record<
      WebkitMessages,
      { postMessage: (arg: string) => void }
    >;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __replayGlobalCallbacks__?: Record<string, undefined | ((arg: any) => void)>;
}
