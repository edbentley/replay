interface TouchWindow extends Window {
  TouchEvent: unknown;
  // eslint-disable-next-line @typescript-eslint/ban-types
  DocumentTouch: Function;
}
declare let window: TouchWindow;

// Not 100% reliable
// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
export function isTouchDevice() {
  if (
    "ontouchstart" in window ||
    (window.DocumentTouch && document instanceof window.DocumentTouch)
  ) {
    return true;
  }

  const query =
    "(touch-enabled),(-webkit-touch-enabled),(-moz-touch-enabled),(-o-touch-enabled),(-ms-touch-enabled)";
  return window.matchMedia(query).matches;
}
