import { Device, Store } from "@replay/core";

/**
 * Load a file into memory using Web Audio API. Allows for immediate playback.
 *
 * Warning: has a high memory usage
 */
export async function getFileBuffer(
  audioContext: AudioContext,
  fileName: string
) {
  const response = await fetch(fileName);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await new Promise<AudioBuffer>((res, rej) => {
    audioContext.decodeAudioData(arrayBuffer, res, rej);
  });
  return audioBuffer;
}

export type AudioMap = Record<
  string,
  {
    /**
     * Which Sprites are using this asset
     */
    globalSpriteIds: Set<string>;
    data: AudioBuffer;
    mutPlayState?: {
      isPaused: boolean;
      startTime: number; // seconds
      alreadyPlayedTime: number;
      sample: AudioBufferSourceNode;
    };
  }
>;

export function getAudio(
  audioContext: AudioContext,
  audioElements: AudioMap
): Device<{}>["audio"] {
  return (fileName) => {
    const audioElement = audioElements[fileName];
    if (!audioElement) {
      throw Error(`Audio file "${fileName}" was not preloaded`);
    }
    const { data, mutPlayState } = audioElement;

    return {
      getPosition: () => {
        if (mutPlayState) {
          if (mutPlayState.isPaused) {
            return mutPlayState.alreadyPlayedTime;
          }
          return audioContext.currentTime - mutPlayState.startTime;
        }
        return 0;
      },
      play: (fromPosition, loop = false) => {
        const sampleSource = audioContext.createBufferSource();
        sampleSource.buffer = data;
        sampleSource.connect(audioContext.destination);

        const alreadyPlayedTime =
          fromPosition ?? mutPlayState?.alreadyPlayedTime ?? 0;

        sampleSource.start(undefined, alreadyPlayedTime);
        sampleSource.loop = loop;
        sampleSource.onended = () => {
          if (audioElements[fileName]?.mutPlayState?.isPaused === false) {
            delete audioElements[fileName].mutPlayState;
          }
        };

        const soundIsAlreadyPlaying = mutPlayState && !mutPlayState.isPaused;

        // If the sound is already playing, we fire and forget a new one.
        // Otherwise, we save its info here for pausing etc.
        if (!soundIsAlreadyPlaying) {
          audioElements[fileName].mutPlayState = {
            startTime: audioContext.currentTime - alreadyPlayedTime,
            sample: sampleSource,
            alreadyPlayedTime,
            isPaused: false,
          };
        }
      },
      pause: () => {
        if (mutPlayState && !mutPlayState.isPaused) {
          mutPlayState.sample.stop();
          audioElements[fileName].mutPlayState = {
            ...mutPlayState,
            alreadyPlayedTime:
              audioContext.currentTime - mutPlayState.startTime,
            isPaused: true,
          };
        }
      },
    };
  };
}

export function getNetwork(): Device<{}>["network"] {
  return {
    get: (url, callback) => {
      fetch(url)
        .then((res) => res.json())
        .then(callback);
    },
    post: (url, body, callback) => {
      fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then(callback);
    },
    put: (url, body, callback) => {
      fetch(url, {
        method: "PUT",
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then(callback);
    },
    delete: (url, callback) => {
      fetch(url, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then(callback);
    },
  };
}

export function getStorage(): Device<{}>["storage"] {
  return {
    getStore: () => {
      const store: Store = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          store[key] = localStorage.getItem(key) ?? undefined;
        }
      }
      return store;
    },
    setStore: (store) => {
      Object.entries(store).forEach(([field, value]) => {
        if (value === undefined) {
          localStorage.removeItem(field);
        } else {
          localStorage.setItem(field, value);
        }
      });
    },
  };
}
