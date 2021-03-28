import { Device } from "@replay/core";
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
    playTime: number; // seconds
    alreadyPlayedTime: number;
    sample: AudioBufferSourceNode;
  };
};

export type ImageFileData = HTMLImageElement;

export function getAudio(
  audioContext: AudioContext,
  audioElements: AssetMap<AudioData>
): Device["audio"] {
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
        return getAudioPosition(audioContext, playState);
      },
      play: (fromPositionOrSettings) => {
        let fromPosition;
        let loop = false;
        let overwrite = false;
        let playbackRate = 1;
        if (typeof fromPositionOrSettings === "number") {
          fromPosition = fromPositionOrSettings;
        } else if (fromPositionOrSettings) {
          ({
            fromPosition,
            loop = loop,
            overwrite = overwrite,
            playbackRate = playbackRate,
          } = fromPositionOrSettings);
        }

        const sampleSource = audioContext.createBufferSource();
        sampleSource.buffer = buffer;
        sampleSource.playbackRate.value = playbackRate;
        sampleSource.connect(audioContext.destination);

        const alreadyPlayedTime =
          fromPosition ?? getAudioPosition(audioContext, playState);

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

        // If the sound is already playing, we fire and forget a new one unless
        // we want to overwrite it.
        if (!soundIsAlreadyPlaying || overwrite) {
          // Stop other sound if it exists and is playing
          if (playState && soundIsAlreadyPlaying) {
            playState.sample.onended = null;
            playState.sample.stop();
          }

          // Save info for pausing etc.
          data.playState = {
            playTime: audioContext.currentTime,
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
            alreadyPlayedTime: getAudioPosition(audioContext, playState),
            isPaused: true,
          };
        }
      },
    };
  };
}

function getAudioPosition(
  audioContext: AudioContext,
  playState: AudioData["playState"]
) {
  if (playState) {
    if (playState.isPaused) {
      return playState.alreadyPlayedTime;
    }
    return (
      (audioContext.currentTime - playState.playTime) *
        playState.sample.playbackRate.value +
      playState.alreadyPlayedTime
    );
  }
  return 0;
}

export function getNetwork(): Device["network"] {
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

export function getStorage(): Device["storage"] {
  return {
    getItem: async (key) => {
      return localStorage.getItem(key);
    },
    setItem: async (key, value) => {
      if (value === null) {
        localStorage.removeItem(key);
        return;
      }
      localStorage.setItem(key, value);
    },
  };
}

export function getClipboard(): Device["clipboard"] {
  return {
    copy: (text, onComplete) => {
      if (!navigator.clipboard) {
        onComplete(
          new Error(
            window.isSecureContext
              ? "Couldn't access clipboard"
              : "Clipboard only available on HTTPS or localhost"
          )
        );
        return;
      }
      navigator.clipboard
        .writeText(text)
        .then(() => {
          onComplete();
        })
        .catch((error: Error) => {
          onComplete(error);
        });
    },
  };
}
