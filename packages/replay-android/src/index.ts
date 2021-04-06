import { WebInputs } from "@replay/web";

declare const window: Window & {
  // Class WebAppInterface in Kotlin
  Android: {
    bridge: (
      key: string,
      message: string,
      message2: string,
      message3: string,
      message4: string,
      message5: string
    ) => void;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __replayGlobalCallbacks__?: Record<string, undefined | ((arg: any) => void)>;
};

export type AndroidInputs = WebInputs;

/**
 * Send string messages to your Android code and get the response back in a
 * Promise. The id should be unique for any messages sent in parallel.
 */
export function androidBridge<T>({
  id,
  message = "",
  message2 = "",
  message3 = "",
  message4 = "",
  message5 = "",
}: {
  id: string;
  message?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  message5?: string;
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

    window.Android.bridge(id, message, message2, message3, message4, message5);
  });
}
