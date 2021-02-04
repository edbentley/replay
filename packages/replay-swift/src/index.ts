import { WebInputs } from "@replay/web";

export type iOSInputs = WebInputs;

/**
 * Send a string message to your Swift code and get the response back in a
 * Promise. The id should be unique for any messages sent in parallel.
 */
export function swiftBridge<T>({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  return new Promise<T>((res) => {
    function setCallback() {
      return new Promise<T>((res2) => {
        let globalCallbacks = window.__replayGlobalCallbacks__;
        if (!globalCallbacks) {
          globalCallbacks = {};
          window.__replayGlobalCallbacks__ = globalCallbacks;
        }

        globalCallbacks[id] = (value: T) => {
          res2(value);
        };
      });
    }

    setCallback().then((value) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      window.__replayGlobalCallbacks__![id] = undefined;
      res(value);
    });

    window.webkit.messageHandlers.jsCallback.postMessage(message);
  });
}
