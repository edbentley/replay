import { Device, Store } from "@replay/core";

export function getAudio(audioElements: {
  [filename: string]: HTMLAudioElement;
}): Device<{}>["audio"] {
  return (filename) => {
    function getAudioElement(play: boolean) {
      let audioElement = audioElements[filename];
      if (!audioElement) {
        throw Error(`Cannot find audio file ${filename}`);
      }
      if (play && !audioElement.paused) {
        // it's being played somewhere else, need a new audio element
        audioElement = new Audio(filename);
      }
      return audioElement;
    }
    return {
      getPosition: () => getAudioElement(false).currentTime,
      play: (fromPosition, loop) => {
        const audioElement = getAudioElement(true);
        audioElement.play();
        if (fromPosition !== undefined) {
          audioElement.currentTime = fromPosition;
        }
        if (loop) {
          audioElement.loop = true;
        }
      },
      pause: () => {
        getAudioElement(false).pause();
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
