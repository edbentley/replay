import { Device } from "@replay/core";

type Timer = {
  timeoutId: number;
  callback: () => void;
  timeStartedMs: number;
  timeRemainingMs: number;
  isPaused: boolean;
};

export function getTimer(): Device["timer"] {
  const timerMap: Record<string, Timer | undefined> = {};

  return {
    start: (callback, ms) => {
      const timeoutId = window.setTimeout(() => {
        delete timerMap[id];
        callback();
      }, ms);
      const id = String(timeoutId);
      timerMap[id] = {
        timeoutId,
        callback,
        timeStartedMs: Date.now(),
        timeRemainingMs: ms,
        isPaused: false,
      };
      return id;
    },
    pause: (id) => {
      const timer = timerMap[id];
      if (!timer || timer.isPaused) {
        return;
      }
      const timeElapsed = Date.now() - timer.timeStartedMs;
      timer.timeRemainingMs -= timeElapsed;
      timer.isPaused = true;
      window.clearTimeout(timer.timeoutId);
    },
    resume: (id) => {
      const timer = timerMap[id];
      if (!timer || !timer.isPaused) {
        return;
      }

      timer.timeStartedMs = Date.now();
      timer.isPaused = false;

      const newTimeoutId = window.setTimeout(() => {
        delete timerMap[id];
        timer.callback();
      }, timer.timeRemainingMs);

      timer.timeoutId = newTimeoutId;
    },
    cancel: (id) => {
      const timer = timerMap[id];
      if (!timer) {
        return;
      }
      window.clearTimeout(timer.timeoutId);
      delete timerMap[id];
    },
  };
}
