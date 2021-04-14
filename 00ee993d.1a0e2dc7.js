(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{157:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return b}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=a.a.createContext({}),l=function(e){var t=a.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},u=function(e){var t=l(e.components);return a.a.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),u=l(n),d=r,b=u["".concat(i,".").concat(d)]||u[d]||m[d]||o;return n?a.a.createElement(b,s(s({ref:t},p),{},{components:n})):a.a.createElement(b,s({ref:t},p))}));function b(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var s={};for(var c in t)hasOwnProperty.call(t,c)&&(s[c]=t[c]);s.originalType=e,s.mdxType="string"==typeof e?e:r,i[1]=s;for(var p=2;p<o;p++)i[p]=n[p];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},95:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return l}));var r=n(3),a=n(7),o=(n(0),n(157)),i={id:"basic-setup",title:"Basic Setup"},s={unversionedId:"basic-setup",id:"basic-setup",isDocsHomePage:!1,title:"Basic Setup",description:"Create a file, copy this in and open it in a browser:",source:"@site/docs/basic-setup.md",slug:"/basic-setup",permalink:"/docs/basic-setup",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/basic-setup.md",version:"current",sidebar:"someSidebar",previous:{title:"Introduction",permalink:"/docs/intro"},next:{title:"Replay Starter",permalink:"/docs/starter"}},c=[],p={toc:c};function l(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Create a file, copy this in and open it in a browser:"),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-html",metastring:'title="index.html"',title:'"index.html"'},'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  \x3c!-- Load Replay through a CDN --\x3e\n  <script src="https://unpkg.com/@replay/core@0.9.0/umd/replay-core.min.js"><\/script>\n  <script src="https://unpkg.com/@replay/web@0.9.0/umd/replay-web.min.js"><\/script>\n  <title>Replay Game</title>\n</head>\n<body>\n<script>\n\n// Import from Replay\nconst { makeSprite, t } = replay;\nconst { renderCanvas } = replayWeb;\n\n// Setup game size\nconst gameProps = {\n  id: "Game",\n  size: {\n    landscape: {\n      width: 600,\n      height: 400,\n      maxWidthMargin: 150,\n    },\n    portrait: {\n      width: 400,\n      height: 600,\n      maxHeightMargin: 150,\n    },\n  },\n  defaultFont: {\n    family: "Courier",\n    size: 10,\n  },\n};\n\n// Create a Game Sprite\nconst Game = makeSprite({\n  init() {\n    // Our initial state\n    return {\n      posX: 0,\n      posY: 0,\n      targetX: 0,\n      targetY: 0,\n    };\n  },\n\n  // This is run 60 times a second. Returns next frame\'s state.\n  loop({ state, getInputs }) {\n    const { pointer } = getInputs();\n    const { posX, posY } = state;\n    let { targetX, targetY } = state;\n\n    // Update our target when the mouse is clicked\n    if (pointer.justPressed) {\n      targetX = pointer.x;\n      targetY = pointer.y;\n    }\n\n    return {\n      // Update our position to move closer to target over time\n      posX: posX + (targetX - posX) / 10,\n      posY: posY + (targetY - posY) / 10,\n      targetX,\n      targetY,\n    };\n  },\n\n  // Render Textures based on game state\n  render({ state }) {\n    return [\n      t.text({\n        color: "red",\n        text: "Hello Replay!",\n        y: 50,\n      }),\n      t.circle({\n        x: state.posX,\n        y: state.posY,\n        color: "#147aff",\n        radius: 10,\n      }),\n    ];\n  },\n});\n\n// Render in the browser using canvas\nrenderCanvas(Game(gameProps), { dimensions: "scale-up" });\n\n<\/script>\n</body>\n</html>\n')),Object(o.b)("p",null,"Within the ",Object(o.b)("inlineCode",{parentName:"p"},"<script>")," tag is the JavaScript to program your game. Head to the ",Object(o.b)("a",{parentName:"p",href:"/docs/sprites"},"API")," docs to learn more!"))}l.isMDXComponent=!0}}]);