(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{107:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return r})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return s}));var a=n(3),i=n(7),o=(n(0),n(157)),l={id:"device",title:"Device"},r={unversionedId:"device",id:"device",isDocsHomePage:!1,title:"Device",description:"The device and getInputs parameters of the Sprite methods can be used to interact with the platform, like getting mouse coordinates and playing sound effects.",source:"@site/docs/device.md",slug:"/device",permalink:"/docs/device",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/device.md",version:"current",sidebar:"someSidebar",previous:{title:"Textures",permalink:"/docs/textures"},next:{title:"Game Size",permalink:"/docs/game-size"}},c=[{value:"<code>getInputs</code>",id:"getinputs",children:[]},{value:"<code>size</code>",id:"size",children:[]},{value:"<code>log</code>",id:"log",children:[]},{value:"<code>random</code>",id:"random",children:[]},{value:"<code>timer</code>",id:"timer",children:[]},{value:"<code>now</code>",id:"now",children:[]},{value:"<code>audio</code>",id:"audio",children:[]},{value:"<code>network</code>",id:"network",children:[]},{value:"<code>storage</code>",id:"storage",children:[]},{value:"<code>alert</code>",id:"alert",children:[]},{value:"<code>clipboard</code>",id:"clipboard",children:[]},{value:"<code>isTouchScreen</code>",id:"istouchscreen",children:[]}],b={toc:c};function s(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(a.a)({},b,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"The ",Object(o.b)("inlineCode",{parentName:"p"},"device")," and ",Object(o.b)("inlineCode",{parentName:"p"},"getInputs")," parameters of the Sprite methods can be used to interact with the platform, like getting mouse coordinates and playing sound effects."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"  loop({ device, getInputs }) {\n    const inputs = getInputs();\n\n    const {\n      size,\n      log,\n      random,\n      timer,\n      now,\n      audio,\n      network,\n      storage,\n      alert,\n      clipboard,\n      isTouchScreen,\n    } = device;\n\n    ...\n  },\n")),Object(o.b)("div",{className:"admonition admonition-tip alert alert--success"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"}))),"Important")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"Functions like ",Object(o.b)("inlineCode",{parentName:"p"},"log")," and ",Object(o.b)("inlineCode",{parentName:"p"},"random")," replace ",Object(o.b)("inlineCode",{parentName:"p"},"console.log")," and ",Object(o.b)("inlineCode",{parentName:"p"},"Math.random"),". Using these ensures the game works across all platforms and tests (plus it keeps your Sprite methods pure)."))),Object(o.b)("h3",{id:"getinputs"},Object(o.b)("inlineCode",{parentName:"h3"},"getInputs")),Object(o.b)("p",null,"A function which returns an object of the device's input state. ",Object(o.b)("strong",{parentName:"p"},"The value depends on the platform your game is running on"),". See ",Object(o.b)("a",{parentName:"p",href:"/docs/web"},"Platforms")," for the values available."),Object(o.b)("p",null,"Platforms share similar input object shapes. For example, both the web and mobile platforms have a ",Object(o.b)("inlineCode",{parentName:"p"},"pointer")," field (relative to the Sprite's position):"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const hitX = inputs.pointer.x;\n")),Object(o.b)("div",{className:"admonition admonition-tip alert alert--success"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"}))),"Important")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"The pointer is relative to the Sprite's position and rotation. If your Sprite has an ",Object(o.b)("inlineCode",{parentName:"p"},"x")," position of ",Object(o.b)("inlineCode",{parentName:"p"},"100"),", and you click at an ",Object(o.b)("inlineCode",{parentName:"p"},"x")," position of ",Object(o.b)("inlineCode",{parentName:"p"},"50"),", the value of ",Object(o.b)("inlineCode",{parentName:"p"},"inputs.pointer.x")," in the Sprite will be translated to ",Object(o.b)("inlineCode",{parentName:"p"},"-50"),". To do this translation in ",Object(o.b)("a",{parentName:"p",href:"/docs/test"},"Replay Test")," you can pass in a ",Object(o.b)("inlineCode",{parentName:"p"},"mapInputCoordinates")," function."))),Object(o.b)("h3",{id:"size"},Object(o.b)("inlineCode",{parentName:"h3"},"size")),Object(o.b)("p",null,"An object of the device's size. See ",Object(o.b)("a",{parentName:"p",href:"/docs/game-size"},"Game Size")," for info on this."),Object(o.b)("h3",{id:"log"},Object(o.b)("inlineCode",{parentName:"h3"},"log")),Object(o.b)("p",null,"A platform independent way of logging messages. Replaces ",Object(o.b)("inlineCode",{parentName:"p"},"console.log"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'log("debug message");\n')),Object(o.b)("h3",{id:"random"},Object(o.b)("inlineCode",{parentName:"h3"},"random")),Object(o.b)("p",null,"Returns a random number between 0 - 1. Replaces ",Object(o.b)("inlineCode",{parentName:"p"},"Math.random"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const spawnY = random() * 500;\n")),Object(o.b)("h3",{id:"timer"},Object(o.b)("inlineCode",{parentName:"h3"},"timer")),Object(o.b)("p",null,"Run, pause and cancel timers."),Object(o.b)("h4",{id:"startcallback-ms"},Object(o.b)("inlineCode",{parentName:"h4"},"start(callback, ms)")),Object(o.b)("p",null,"Run a callback after a time in milliseconds, returns an ",Object(o.b)("inlineCode",{parentName:"p"},"id")," string. Replaces ",Object(o.b)("inlineCode",{parentName:"p"},"setTimeout"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const timerId = device.timer.start(() => {\n  // Do stuff\n}, 500);\n")),Object(o.b)("h4",{id:"pauseid"},Object(o.b)("inlineCode",{parentName:"h4"},"pause(id)")),Object(o.b)("p",null,"Pause a timer using its ID."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"device.timer.pause(timerId);\n")),Object(o.b)("h4",{id:"resumeid"},Object(o.b)("inlineCode",{parentName:"h4"},"resume(id)")),Object(o.b)("p",null,"Resume a paused timer using its ID."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"device.timer.resume(timerId);\n")),Object(o.b)("h4",{id:"cancelid"},Object(o.b)("inlineCode",{parentName:"h4"},"cancel(id)")),Object(o.b)("p",null,"Cancel a timer using its ID. It will not be possible to resume the timer, but the callback is cleaned up."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"device.timer.cancel(timerId);\n")),Object(o.b)("h3",{id:"now"},Object(o.b)("inlineCode",{parentName:"h3"},"now")),Object(o.b)("p",null,"Get the current time and date as a Date object. Replaces ",Object(o.b)("inlineCode",{parentName:"p"},"new Date()"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const date = now();\n")),Object(o.b)("h3",{id:"audio"},Object(o.b)("inlineCode",{parentName:"h3"},"audio")),Object(o.b)("p",null,"Play audio files in your game."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const mySound = audio("sound.wav");\n')),Object(o.b)("p",null,"Note that the file must be loaded using ",Object(o.b)("a",{parentName:"p",href:"/docs/sprites#init"},Object(o.b)("inlineCode",{parentName:"a"},"preloadFiles"))," before you can play it."),Object(o.b)("p",null,"The returned object has the following methods:"),Object(o.b)("h4",{id:"play"},Object(o.b)("inlineCode",{parentName:"h4"},"play")),Object(o.b)("p",null,"Play the audio file. If the file is already playing, another sound will be played at the same time (unless ",Object(o.b)("inlineCode",{parentName:"p"},"overwrite")," is set to ",Object(o.b)("inlineCode",{parentName:"p"},"true"),")."),Object(o.b)("p",null,"The first argument is optional and can be a number (start time in seconds) or an object with the following fields:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"fromPosition"),": (Optional) Where to start the audio file from in seconds, same as providing the first argument as a number."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"overwrite"),": (Optional) If this audio file is already playing, remove it first. Default ",Object(o.b)("inlineCode",{parentName:"li"},"false"),"."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"loop"),": (Optional) Keep playing the audio when it finishes. Default ",Object(o.b)("inlineCode",{parentName:"li"},"false"),"."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"playbackRate"),": (Optional) The speed to play at, less than ",Object(o.b)("inlineCode",{parentName:"li"},"1")," slows audio down and more than ",Object(o.b)("inlineCode",{parentName:"li"},"1")," speeds it up. Default ",Object(o.b)("inlineCode",{parentName:"li"},"1"),".")),Object(o.b)("p",null,"If no argument is provided or ",Object(o.b)("inlineCode",{parentName:"p"},"fromPosition")," is not defined in the argument object:"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"The audio will play from the beginning if:",Object(o.b)("ul",{parentName:"li"},Object(o.b)("li",{parentName:"ul"},"It's the first time being played, or"),Object(o.b)("li",{parentName:"ul"},"The audio is already playing and ",Object(o.b)("inlineCode",{parentName:"li"},"overwrite")," is not set to ",Object(o.b)("inlineCode",{parentName:"li"},"true"),"."))),Object(o.b)("li",{parentName:"ul"},"Otherwise, the audio will continue from where it was paused.")),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"mySound.play();\n\nmySound.play(10);\n\nmySound.play({ overwrite: true });\n\nmySound.play({ fromPosition: 10, overwrite: true, loop: true, playbackRate: 0.5 });\n")),Object(o.b)("h4",{id:"pause"},Object(o.b)("inlineCode",{parentName:"h4"},"pause")),Object(o.b)("p",null,"Pause the sound."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"mySound.pause();\n")),Object(o.b)("h4",{id:"getposition"},Object(o.b)("inlineCode",{parentName:"h4"},"getPosition")),Object(o.b)("p",null,"Get the current play position of the sound in seconds."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"mySound.getPosition();\n")),Object(o.b)("h4",{id:"getstatus"},Object(o.b)("inlineCode",{parentName:"h4"},"getStatus")),Object(o.b)("p",null,"Get current status of the sound (as a string): ",Object(o.b)("inlineCode",{parentName:"p"},"playing")," or ",Object(o.b)("inlineCode",{parentName:"p"},"paused"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const status = mySound.getStatus();\nconst isPlaying = status === "playing";\n')),Object(o.b)("h4",{id:"getduration"},Object(o.b)("inlineCode",{parentName:"h4"},"getDuration")),Object(o.b)("p",null,"Get the total duration of the sound in seconds."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"mySound.getDuration();\n")),Object(o.b)("h4",{id:"setvolume"},Object(o.b)("inlineCode",{parentName:"h4"},"setVolume")),Object(o.b)("p",null,"Set the volume of the sound. 1 is maximum (default), 0 is muted. Resets when sound finishes playing."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"mySound.setVolume(0);\n")),Object(o.b)("h4",{id:"getvolume"},Object(o.b)("inlineCode",{parentName:"h4"},"getVolume")),Object(o.b)("p",null,"Get the volume of the sound. 1 is maximum, 0 is muted."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"const volume = mySound.getVolume();\n")),Object(o.b)("h3",{id:"network"},Object(o.b)("inlineCode",{parentName:"h3"},"network")),Object(o.b)("p",null,"Make platform-independent networks calls. Returns and sends data as a JSON object."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'network.get(url, callback);\nnetwork.post(url, body, callback);\nnetwork.put(url, body, callback);\nnetwork.delete(url, callback);\n\n// Example\nnetwork.post("/api/score", { score: 5 }, (data) => {\n  const { success } = data;\n  log(`successful: ${success}`);\n});\n')),Object(o.b)("h3",{id:"storage"},Object(o.b)("inlineCode",{parentName:"h3"},"storage")),Object(o.b)("p",null,"Platform-independent way of storing save data to the local device."),Object(o.b)("h4",{id:"getitemkey"},Object(o.b)("inlineCode",{parentName:"h4"},"getItem(key)")),Object(o.b)("p",null,"Retrieve a saved value by its ",Object(o.b)("inlineCode",{parentName:"p"},"string")," key. Returns a ",Object(o.b)("inlineCode",{parentName:"p"},"string")," or ",Object(o.b)("inlineCode",{parentName:"p"},"null"),"."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const playerName = storage.getItem("playerName");\n')),Object(o.b)("h4",{id:"setitemkey-value"},Object(o.b)("inlineCode",{parentName:"h4"},"setItem(key, value)")),Object(o.b)("p",null,"Set or remove a value in storage."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'storage.setItem("playerName", "Replay");\n')),Object(o.b)("p",null,"Setting ",Object(o.b)("inlineCode",{parentName:"p"},"null")," will remove a field from storage:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'storage.setItem("playerName", null);\n')),Object(o.b)("h3",{id:"alert"},Object(o.b)("inlineCode",{parentName:"h3"},"alert")),Object(o.b)("p",null,"Show an alert using the platform's dialog."),Object(o.b)("h4",{id:"okmessage-onresponse"},Object(o.b)("inlineCode",{parentName:"h4"},"ok(message, onResponse)")),Object(o.b)("p",null,"An alert dialog with an OK button. Game loop will be paused on some platforms."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'alert.ok("Connected", () => {\n  // Optional callback to handle OK clicked\n});\n')),Object(o.b)("h4",{id:"okcancelmessage-onresponse"},Object(o.b)("inlineCode",{parentName:"h4"},"okCancel(message, onResponse)")),Object(o.b)("p",null,"An alert dialog with an OK and cancel button. Game loop will be paused on some platforms."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'device.alert.okCancel(\n  "Are you sure you want to delete this?",\n  (wasOk) => {\n    if (wasOk) {\n      // Delete it\n    } else {\n      // Cancel\n    }\n  }\n);\n')),Object(o.b)("h3",{id:"clipboard"},Object(o.b)("inlineCode",{parentName:"h3"},"clipboard")),Object(o.b)("p",null,"Interact with the player's clipboard."),Object(o.b)("h4",{id:"copytext-oncomplete"},Object(o.b)("inlineCode",{parentName:"h4"},"copy(text, onComplete)")),Object(o.b)("p",null,"Asynchronously copy text to the clipboard. Callback has an error argument if unsuccessful (e.g. did not get permission)."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'clipboard.copy("ABCDEFG", (error) => {\n  if (error) {\n    // Couldn\'t copy to clipboard\n  } else {\n    // Success\n  }\n});\n')),Object(o.b)("h3",{id:"istouchscreen"},Object(o.b)("inlineCode",{parentName:"h3"},"isTouchScreen")),Object(o.b)("p",null,"Boolean to indicate if the device is a touch screen device."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'const text = isTouchScreen ? "Tap to Start" : "Space Bar to Start";\n')))}s.isMDXComponent=!0},157:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var a=n(0),i=n.n(a);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function r(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},o=Object.keys(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(a=0;a<o.length;a++)n=o[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var b=i.a.createContext({}),s=function(e){var t=i.a.useContext(b),n=t;return e&&(n="function"==typeof e?e(t):r(r({},t),e)),n},p=function(e){var t=s(e.components);return i.a.createElement(b.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},u=i.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,b=c(e,["components","mdxType","originalType","parentName"]),p=s(n),u=a,m=p["".concat(l,".").concat(u)]||p[u]||d[u]||o;return n?i.a.createElement(m,r(r({ref:t},b),{},{components:n})):i.a.createElement(m,r({ref:t},b))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=n.length,l=new Array(o);l[0]=u;var r={};for(var c in t)hasOwnProperty.call(t,c)&&(r[c]=t[c]);r.originalType=e,r.mdxType="string"==typeof e?e:a,l[1]=r;for(var b=2;b<o;b++)l[b]=n[b];return i.a.createElement.apply(null,l)}return i.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);