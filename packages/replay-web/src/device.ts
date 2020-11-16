import { Device, Store } from "@replay/core";
import { AssetMap } from "@replay/core/dist/device";

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

export type AudioData = {
  buffer: AudioBuffer;
  playState?: {
    isPaused: boolean;
    startTime: number; // seconds
    alreadyPlayedTime: number;
    sample: AudioBufferSourceNode;
  };
};

export type ImageFileData = HTMLImageElement;

export function getAudio(
  audioContext: AudioContext,
  audioElements: AssetMap<AudioData>
): Device<{}>["audio"] {
  return (fileName) => {
    const audioElement = audioElements[fileName];
    if (!audioElement) {
      throw Error(`Audio file "${fileName}" was not preloaded`);
    }
    const { data } = audioElements[fileName];
    if ("then" in data) {
      throw Error(
        `Audio file "${fileName}" did not finish loading before it was used`
      );
    }
    const { buffer, playState } = data;

    return {
      getPosition: () => {
        if (playState) {
          if (playState.isPaused) {
            return playState.alreadyPlayedTime;
          }
          return audioContext.currentTime - playState.startTime;
        }
        return 0;
      },
      play: (fromPosition, loop = false) => {
        const sampleSource = audioContext.createBufferSource();
        sampleSource.buffer = buffer;
        sampleSource.connect(audioContext.destination);

        const alreadyPlayedTime =
          fromPosition ?? playState?.alreadyPlayedTime ?? 0;

        sampleSource.start(undefined, alreadyPlayedTime);
        sampleSource.loop = loop;
        sampleSource.onended = () => {
          if (!audioElements[fileName]) return;
          const { data } = audioElements[fileName];

          if (!("then" in data) && data.playState?.isPaused === false) {
            delete data.playState;
          }
        };

        const soundIsAlreadyPlaying = playState && !playState.isPaused;

        // If the sound is already playing, we fire and forget a new one.
        // Otherwise, we save its info here for pausing etc.
        if (!soundIsAlreadyPlaying) {
          data.playState = {
            startTime: audioContext.currentTime - alreadyPlayedTime,
            sample: sampleSource,
            alreadyPlayedTime,
            isPaused: false,
          };
        }
      },
      pause: () => {
        if (playState && !playState.isPaused) {
          playState.sample.stop();
          data.playState = {
            ...playState,
            alreadyPlayedTime: audioContext.currentTime - playState.startTime,
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
