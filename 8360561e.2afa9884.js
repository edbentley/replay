(window.webpackJsonp=window.webpackJsonp||[]).push([[45],{157:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=a.a.createContext({}),s=function(e){var t=a.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=s(e.components);return a.a.createElement(p.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,i=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),u=s(n),d=r,m=u["".concat(i,".").concat(d)]||u[d]||b[d]||o;return n?a.a.createElement(m,l(l({ref:t},p),{},{components:n})):a.a.createElement(m,l({ref:t},p))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,i=new Array(o);i[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,i[1]=l;for(var p=2;p<o;p++)i[p]=n[p];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},75:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return s}));var r=n(3),a=n(7),o=(n(0),n(157)),i={},l={unversionedId:"tutorial/18",id:"tutorial/18",isDocsHomePage:!1,title:"18",description:"18 - Image",source:"@site/docs/tutorial/18.md",slug:"/tutorial/18",permalink:"/docs/tutorial/18",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/tutorial/18.md",version:"current"},c=[],p={toc:c};function s(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h1",{id:"18---image"},"18 - Image"),Object(o.b)("p",null,"As beautiful as our yellow bird rectangle is, it would look even better to use an image in its place. I've taken some artwork from this ",Object(o.b)("a",{parentName:"p",href:"https://opengameart.org/content/bevouliin-free-game-character-yellow-flappy-bird"},"Open Game Art submission"),"."),Object(o.b)("p",null,"replay-starter stores its images in the ",Object(o.b)("inlineCode",{parentName:"p"},"assets/images")," folder, so we can copy one of the PNG files from Open Game Art to there as ",Object(o.b)("inlineCode",{parentName:"p"},"bird.png"),"."),Object(o.b)("p",null,"In our ",Object(o.b)("inlineCode",{parentName:"p"},"Bird")," Sprite we replace the rectangle with the ",Object(o.b)("inlineCode",{parentName:"p"},"t.image")," Texture, set to the same width and height."),Object(o.b)("p",null,"To use the image it first needs to be loaded. Back in our top-level ",Object(o.b)("inlineCode",{parentName:"p"},"Game")," Sprite we can load it when the game launches using ",Object(o.b)("inlineCode",{parentName:"p"},"preloadFiles")," and by specifying the image file names to load. Putting it in ",Object(o.b)("inlineCode",{parentName:"p"},"Promise.all")," allows us to load the assets at the same time saved data is being loaded."),Object(o.b)("p",null,"We don't want to render the image until the loading is finished, so we add a ",Object(o.b)("inlineCode",{parentName:"p"},"view")," state called ",Object(o.b)("inlineCode",{parentName:"p"},'"loading"')," before we enter the menu. In the ",Object(o.b)("inlineCode",{parentName:"p"},"render")," function we can then return a text Texture of ",Object(o.b)("inlineCode",{parentName:"p"},'"Loading..."')," before the game starts."),Object(o.b)("p",null,"This allows us to only load the files we need when we want them. You can have as many loading states like this as you like, even in different Sprites."))}s.isMDXComponent=!0}}]);