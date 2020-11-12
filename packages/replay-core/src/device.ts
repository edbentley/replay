/**
 * The type of a device that supports Replay
 */
export interface Device<I> {
  inputs: I;

  /**
   * Is the device a touch screen device - e.g. show buttons instead of relying
   * on pinch gesture for zooming if there's no touch available.
   */
  isTouchScreen: boolean;

  /**
   * Computed dimensions of game based on device
   */
  size: DeviceSize;

  /**
   * Log a message to platform's standard output
   */
  log: (message: unknown) => void;

  /**
   * Returns a random number between 0 - 1
   */
  random: () => number;

  timer: {
    /**
     * Equivalent to setTimeout in JS. Returns an ID to let you pause it.
     */
    start: (callback: () => void, ms: number) => string;
    /**
     * Pause timer ID
     */
    pause: (id: string) => void;
    /**
     * Resume a paused timer ID
     */
    resume: (id: string) => void;
    /**
     * Remove a timer, will not be possible to resume it but callback is cleaned
     * up.
     */
    cancel: (id: string) => void;
  };

  /**
   * Get the current time & date now as a Date object
   */
  now: () => Date;

  preloadFiles: (
    globalSpriteId: string,
    assets: Assets,
    onLoad: () => void
  ) => void;

  cleanupFiles: (globalSpriteId: string) => void;

  /**
   * Play sound effects / background music
   */
  audio: (
    filename: string
  ) => {
    /**
     * Current time in audio track in seconds
     */
    getPosition: () => number;
    play: (fromPosition?: number, loop?: boolean) => void;
    pause: () => void;
  };

  /**
   * Make network calls
   */
  network: {
    get: (url: string, callback: (data: unknown) => void) => void;
    post: (
      url: string,
      body: object,
      callback: (data: unknown) => void
    ) => void;
    put: (url: string, body: object, callback: (data: unknown) => void) => void;
    delete: (url: string, callback: (data: unknown) => void) => void;
  };

  storage: {
    getStore: () => Store;
    setStore: (store: Store) => void;
  };

  alert: {
    /**
     * An alert dialog with an OK button. Game loop will be paused on some
     * platforms.
     */
    ok: (message: string, onResponse?: () => void) => void;
    /**
     * An alert dialog with an OK and cancel button. Game loop will be paused on
     * some platforms.
     */
    okCancel: (message: string, onResponse: (wasOk: boolean) => void) => void;
  };

  clipboard: {
    /**
     * Asynchronously copy text to the clipboard. Callback has an error argument
     * if unsuccessful (e.g. did not get permission).
     */
    copy: (text: string, onComplete: (error?: Error) => void) => void;
  };
}

/**
 * Width and height values and margins in game coordinates.
 */
export interface DeviceSize {
  /**
   * The width value passed into game props for current orientation.
   */
  width: number;
  /**
   * The height value passed into game props for current orientation.
   */
  height: number;
  /**
   * The actual width margin of the device.
   */
  widthMargin: number;
  /**
   * The actual height margin of the device.
   */
  heightMargin: number;
  /**
   * The device width in px
   */
  deviceWidth: number;
  /**
   * The device height in px
   */
  deviceHeight: number;
}

/**
 * The type of the store used in local storage
 */
export type Store = Record<string, string | undefined>;

export type Assets = {
  imageFileNames?: string[];
  audioFileNames?: string[];
};
