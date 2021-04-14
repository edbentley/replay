(window.webpackJsonp=window.webpackJsonp||[]).push([[76],{157:function(e,t,r){"use strict";r.d(t,"a",(function(){return s})),r.d(t,"b",(function(){return f}));var n=r(0),o=r.n(n);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function c(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function p(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=o.a.createContext({}),u=function(e){var t=o.a.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):c(c({},t),e)),r},s=function(e){var t=u(e.components);return o.a.createElement(l.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,i=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),s=u(r),b=n,f=s["".concat(i,".").concat(b)]||s[b]||d[b]||a;return r?o.a.createElement(f,c(c({ref:t},l),{},{components:r})):o.a.createElement(f,c({ref:t},l))}));function f(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=b;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var l=2;l<a;l++)i[l]=r[l];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,r)}b.displayName="MDXCreateElement"},80:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return i})),r.d(t,"metadata",(function(){return c})),r.d(t,"toc",(function(){return p})),r.d(t,"default",(function(){return u}));var n=r(3),o=r(7),a=(r(0),r(157)),i={},c={unversionedId:"tutorial/2",id:"tutorial/2",isDocsHomePage:!1,title:"2",description:"2 - Bird Sprite",source:"@site/docs/tutorial/2.md",slug:"/tutorial/2",permalink:"/docs/tutorial/2",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/tutorial/2.md",version:"current"},p=[],l={toc:p};function u(e){var t=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(n.a)({},l,r,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h1",{id:"2---bird-sprite"},"2 - Bird Sprite"),Object(a.b)("p",null,"Let's start off by creating our bird in a new file within the ",Object(a.b)("inlineCode",{parentName:"p"},"src")," folder, as you can see in the code block on the right."),Object(a.b)("p",null,"We'll represent our bird as a ",Object(a.b)("em",{parentName:"p"},"Sprite"),". Sprites are the building blocks of Replay, and provide a neat way to modularise our code."),Object(a.b)("p",null,"For now we'll just render a yellow rectangle in the middle of the screen. To do this we create a new Sprite with ",Object(a.b)("inlineCode",{parentName:"p"},"makeSprite"),", passing in an object with a ",Object(a.b)("inlineCode",{parentName:"p"},"render")," method."),Object(a.b)("p",null,"All Sprites need a ",Object(a.b)("inlineCode",{parentName:"p"},"render")," method which returns an array of other Sprites. For our bird, we return a rectangle ",Object(a.b)("em",{parentName:"p"},"Texture"),". Textures are elements to draw onto the screen like text, images and shapes. In this case, we use Replay's ",Object(a.b)("inlineCode",{parentName:"p"},"t.rectangle")," Texture, and pass in the width, height and color ",Object(a.b)("em",{parentName:"p"},Object(a.b)("inlineCode",{parentName:"em"},"props")),"."))}u.isMDXComponent=!0}}]);