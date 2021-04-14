(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{157:function(e,t,n){"use strict";n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return m}));var r=n(0),a=n.n(r);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=a.a.createContext({}),u=function(e){var t=a.a.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},s=function(e){var t=u(e.components);return a.a.createElement(l.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},d=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,l=p(e,["components","mdxType","originalType","parentName"]),s=u(n),d=r,m=s["".concat(o,".").concat(d)]||s[d]||b[d]||i;return n?a.a.createElement(m,c(c({ref:t},l),{},{components:n})):a.a.createElement(m,c({ref:t},l))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=d;var c={};for(var p in t)hasOwnProperty.call(t,p)&&(c[p]=t[p]);c.originalType=e,c.mdxType="string"==typeof e?e:r,o[1]=c;for(var l=2;l<i;l++)o[l]=n[l];return a.a.createElement.apply(null,o)}return a.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"},62:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return c})),n.d(t,"toc",(function(){return p})),n.d(t,"default",(function(){return u}));var r=n(3),a=n(7),i=(n(0),n(157)),o={},c={unversionedId:"tutorial/3",id:"tutorial/3",isDocsHomePage:!1,title:"3",description:"3 - Game Sprite",source:"@site/docs/tutorial/3.md",slug:"/tutorial/3",permalink:"/docs/tutorial/3",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/tutorial/3.md",version:"current"},p=[],l={toc:p};function u(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(i.b)("wrapper",Object(r.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("h1",{id:"3---game-sprite"},"3 - Game Sprite"),Object(i.b)("p",null,"On its own, our ",Object(i.b)("inlineCode",{parentName:"p"},"Bird")," Sprite doesn't do anything - we need to import it in another Sprite. Open ",Object(i.b)("inlineCode",{parentName:"p"},"src/index")," and replace the starter code with what's shown on the right."),Object(i.b)("p",null,"Firstly you'll see we've made a new ",Object(i.b)("inlineCode",{parentName:"p"},"Game")," Sprite. This is our top-level Sprite which contains our entire game."),Object(i.b)("p",null,"Again, it has a ",Object(i.b)("inlineCode",{parentName:"p"},"render")," function returning an array of Sprites. In this case, we return our ",Object(i.b)("inlineCode",{parentName:"p"},"Bird")," Sprite we just made. We need to pass a locally unique ",Object(i.b)("inlineCode",{parentName:"p"},"id")," ",Object(i.b)("inlineCode",{parentName:"p"},"prop")," to any custom Sprites we've made - here we pass an ",Object(i.b)("inlineCode",{parentName:"p"},"id")," of ",Object(i.b)("inlineCode",{parentName:"p"},'"bird"')," by ",Object(i.b)("em",{parentName:"p"},"calling")," the ",Object(i.b)("inlineCode",{parentName:"p"},"Bird")," Sprite like ",Object(i.b)("inlineCode",{parentName:"p"},"Bird(props)"),"."))}u.isMDXComponent=!0}}]);