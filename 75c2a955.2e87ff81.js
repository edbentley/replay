(window.webpackJsonp=window.webpackJsonp||[]).push([[42],{114:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return s}));var r=n(3),a=n(7),i=(n(0),n(157)),o={id:"mask",title:"Mask"},l={unversionedId:"mask",id:"mask",isDocsHomePage:!1,title:"Mask",description:"Adding a mask to a Sprite or Texture ensures it only renders what's within the outline of the mask shape.",source:"@site/docs/mask.md",slug:"/mask",permalink:"/docs/mask",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/mask.md",version:"current",sidebar:"someSidebar",previous:{title:"Thinking in Replay",permalink:"/docs/thinking-in-replay"},next:{title:"Pure Sprites",permalink:"/docs/pure-sprites"}},c=[{value:"Circle Mask",id:"circle-mask",children:[]},{value:"Rectangle Mask",id:"rectangle-mask",children:[]},{value:"Line Mask",id:"line-mask",children:[]}],p={toc:c};function s(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(i.b)("wrapper",Object(r.a)({},p,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Adding a mask to a Sprite or Texture ensures it only renders what's within the outline of the mask shape."),Object(i.b)("h2",{id:"circle-mask"},"Circle Mask"),Object(i.b)("h4",{id:"example"},"Example"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js",metastring:"{7-10}","{7-10}":!0},'import { t, mask } from "@replay/core";\n\nt.rectangle({\n  width: 100,\n  height: 100,\n  color: "black",\n  mask: mask.circle({\n    radius: 5,\n    x: 10,\n  }),\n}),\n')),Object(i.b)("h4",{id:"props"},"Props"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"radius"),": Radius of the circle in game coordinates."),Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"x"),": (Optional) x coordinate of circle. Default ",Object(i.b)("inlineCode",{parentName:"li"},"0"),"."),Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"y"),": (Optional) y coordinate of circle. Default ",Object(i.b)("inlineCode",{parentName:"li"},"0"),".")),Object(i.b)("h2",{id:"rectangle-mask"},"Rectangle Mask"),Object(i.b)("h4",{id:"example-1"},"Example"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js",metastring:"{5-9}","{5-9}":!0},'import { mask } from "@replay/core";\n\nMySprite({\n  id: "MySprite",\n  mask: mask.rectangle({\n    width: 5,\n    height: 5,\n    y: 10,\n  }),\n}),\n')),Object(i.b)("h4",{id:"props-1"},"Props"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"width"),": Width of the rectangle in game coordinates."),Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"height"),": Height of the rectangle in game coordinates."),Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"x"),": (Optional) x coordinate of rectangle. Default ",Object(i.b)("inlineCode",{parentName:"li"},"0"),"."),Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"y"),": (Optional) y coordinate of rectangle. Default ",Object(i.b)("inlineCode",{parentName:"li"},"0"),".")),Object(i.b)("h2",{id:"line-mask"},"Line Mask"),Object(i.b)("h4",{id:"example-2"},"Example"),Object(i.b)("pre",null,Object(i.b)("code",{parentName:"pre",className:"language-js",metastring:"{7-13}","{7-13}":!0},'import { t, mask } from "@replay/core";\n\nt.rectangle({\n  width: 100,\n  height: 100,\n  color: "black",\n  mask: mask.line({\n    path: [\n      [0, 0],\n      [10, 0],\n      [10, 10],\n    ],\n  }),\n}),\n')),Object(i.b)("h4",{id:"props-2"},"Props"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},Object(i.b)("inlineCode",{parentName:"li"},"path"),": An array of ",Object(i.b)("inlineCode",{parentName:"li"},"[x, y]")," coordinates to draw the mask shape outline.")))}s.isMDXComponent=!0},157:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return d}));var r=n(0),a=n.n(r);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var p=a.a.createContext({}),s=function(e){var t=a.a.useContext(p),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},b=function(e){var t=s(e.components);return a.a.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},u=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),b=s(n),u=r,d=b["".concat(o,".").concat(u)]||b[u]||m[u]||i;return n?a.a.createElement(d,l(l({ref:t},p),{},{components:n})):a.a.createElement(d,l({ref:t},p))}));function d(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=u;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var p=2;p<i;p++)o[p]=n[p];return a.a.createElement.apply(null,o)}return a.a.createElement.apply(null,n)}u.displayName="MDXCreateElement"}}]);