import { Device } from "@replay/core";
import { AssetMap } from "@replay/core/dist/device";

/**
 * Load a file into memory using Web Audio API. Allows for immediate playback.
 *
 * Warning: has a high memory usage
 */
export async function getFileBuffer(
  audioContext: AudioContext,
  file: Promise<Response>
) {
  const response = await file;
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
    volume: number;
    gainNode: GainNode;
  };
};

export type ImageFileData = {
  image: HTMLImageElement;
  texture: WebGLTexture;
};

export function getAudio(
  audioContext: AudioContext,
  globalAudio: Device["globalAudio"],
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
        return getAudioPosition(audioContext, data.playState);
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

        const gainNode = audioContext.createGain();
        sampleSource.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Global volume
        gainNode.gain.setValueAtTime(
          globalAudio.volume,
          audioContext.currentTime
        );

        const alreadyPlayedTime =
          fromPosition ?? getAudioPosition(audioContext, playState);

        try {
          sampleSource.start(undefined, alreadyPlayedTime);
        } catch (_) {
          // Older versions of Safari randomly throw errors
          return;
        }
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
            gainNode,
            volume: 1,
          };
        }
      },
      pause: () => {
        if (playState && !playState.isPaused) {
          playState.sample.onended = null;
          playState.sample.stop();
          data.playState = {
            ...playState,
            alreadyPlayedTime: getAudioPosition(audioContext, playState),
            isPaused: true,
          };
        }
      },
      getStatus: () => {
        if (data.playState && data.playState.isPaused === false) {
          return "playing";
        }
        return "paused";
      },
      getDuration: () => {
        return buffer.duration;
      },
      getVolume: () => {
        if (data.playState) {
          return data.playState.volume;
        }
        return 1;
      },
      setVolume: (newVolume) => {
        const playState = data.playState;
        if (!playState) return;

        if (typeof newVolume === "number") {
          const volumeVal = Math.max(Math.min(1, newVolume), 0);
          playState.volume = volumeVal;
          playState.gainNode.gain.setValueAtTime(
            volumeVal * globalAudio.volume,
            audioContext.currentTime
          );
        } else {
          const { type, fadeTo, fadeTime } = newVolume;
          const volumeVal = Math.max(Math.min(1, fadeTo), 0);
          playState.volume = volumeVal;
          if (type === "linear") {
            playState.gainNode.gain.linearRampToValueAtTime(
              volumeVal * globalAudio.volume,
              audioContext.currentTime + fadeTime
            );
          } else {
            playState.gainNode.gain.exponentialRampToValueAtTime(
              volumeVal * globalAudio.volume,
              audioContext.currentTime + fadeTime
            );
          }
        }
      },
    };
  };
}

export function setAllVolumes(
  audioContext: AudioContext,
  audioElements: AssetMap<AudioData>,
  globalVolume: number
) {
  for (const fileName in audioElements) {
    const data = audioElements[fileName].data;
    if (!("then" in data)) {
      data.playState?.gainNode.gain.setValueAtTime(
        data.playState.volume * globalVolume,
        audioContext.currentTime
      );
    }
  }
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

export const RESOLUTION_KEY = "__replay_resolution_v1__";
export const GLOBAL_VOLUME_KEY = "__replay_global_volume_v1__";

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
