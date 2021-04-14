(window.webpackJsonp=window.webpackJsonp||[]).push([[44],{116:function(e,r,t){"use strict";t.r(r),t.d(r,"frontMatter",(function(){return s})),t.d(r,"metadata",(function(){return p})),t.d(r,"toc",(function(){return l})),t.d(r,"default",(function(){return d}));var n=t(3),a=t(7),o=(t(0),t(157)),i=t(163),c=t(164),s={id:"pure-sprites",title:"Pure Sprites"},p={unversionedId:"pure-sprites",id:"pure-sprites",isDocsHomePage:!1,title:"Pure Sprites",description:"If your game has so many Sprites and Textures it can't run at a smooth 60 frames per second, you can use Replay's Pure Sprites to improve performance.",source:"@site/docs/pure-sprites.md",slug:"/pure-sprites",permalink:"/docs/pure-sprites",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/pure-sprites.md",version:"current",sidebar:"someSidebar",previous:{title:"Mask",permalink:"/docs/mask"},next:{title:"Replay Test",permalink:"/docs/test"}},l=[{value:"Common Props",id:"common-props",children:[]},{value:"Sprite Methods",id:"sprite-methods",children:[{value:"<code>shouldRerender</code>",id:"shouldrerender",children:[]},{value:"<code>render</code>",id:"render",children:[]},{value:"<code>renderP</code>",id:"renderp",children:[]},{value:"<code>renderXL</code>",id:"renderxl",children:[]},{value:"<code>renderPXL</code>",id:"renderpxl",children:[]}]}],u={toc:l};function d(e){var r=e.components,t=Object(a.a)(e,["components"]);return Object(o.b)("wrapper",Object(n.a)({},u,t,{components:r,mdxType:"MDXLayout"}),Object(o.b)("p",null,"If your game has so many Sprites and Textures it can't run at a smooth 60 frames per second, you can use Replay's ",Object(o.b)("em",{parentName:"p"},"Pure Sprites")," to improve performance."),Object(o.b)("div",{className:"admonition admonition-caution alert alert--warning"},Object(o.b)("div",{parentName:"div",className:"admonition-heading"},Object(o.b)("h5",{parentName:"div"},Object(o.b)("span",{parentName:"h5",className:"admonition-icon"},Object(o.b)("svg",{parentName:"span",xmlns:"http://www.w3.org/2000/svg",width:"16",height:"16",viewBox:"0 0 16 16"},Object(o.b)("path",{parentName:"svg",fillRule:"evenodd",d:"M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"}))),"note")),Object(o.b)("div",{parentName:"div",className:"admonition-content"},Object(o.b)("p",{parentName:"div"},"Only use Pure Sprites if you're having performance issues. They add additional complexity to your game and the potential for more bugs. Regular Sprites are still really fast!"))),Object(o.b)("p",null,"You can create a Pure Sprite by passing an object into the ",Object(o.b)("inlineCode",{parentName:"p"},"makePureSprite")," function:"),Object(o.b)(i.a,{defaultValue:"js",groupId:"code",values:[{label:"JavaScript",value:"js"},{label:"TypeScript",value:"ts"}],mdxType:"Tabs"},Object(o.b)(c.a,{value:"js",mdxType:"TabItem"},Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},'import { t, makePureSprite } from "@replay/core";\n\nexport const Player = makePureSprite({\n  shouldRerender(prevProps, newProps) {\n    return prevProps.color !== newProps.color;\n  },\n\n  render({ props }) {\n    return [\n      t.circle({\n        radius: 10,\n        color: props.color,\n      }),\n    ];\n  },\n});\n'))),Object(o.b)(c.a,{value:"ts",mdxType:"TabItem"},Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-ts"},'import { t, makePureSprite } from "@replay/core";\n\ntype Props = {\n  color: string;\n};\nexport const Player = makePureSprite<Props>({\n  shouldRerender(prevProps, newProps) {\n    return prevProps.color !== newProps.color;\n  },\n\n  render({ props }) {\n    return [\n      t.circle({\n        radius: 10,\n        color: props.color,\n      }),\n    ];\n  },\n});\n')))),Object(o.b)("p",null,"The Sprite object passed into ",Object(o.b)("inlineCode",{parentName:"p"},"makePureSprite")," must have the methods ",Object(o.b)("inlineCode",{parentName:"p"},"render")," and ",Object(o.b)("inlineCode",{parentName:"p"},"shouldRerender")," defined. ",Object(o.b)("inlineCode",{parentName:"p"},"render")," is similar to a regular Sprite, but with only a ",Object(o.b)("inlineCode",{parentName:"p"},"props")," and ",Object(o.b)("inlineCode",{parentName:"p"},"size")," parameter, and ",Object(o.b)("strong",{parentName:"p"},"can only return ",Object(o.b)("a",{parentName:"strong",href:"/docs/textures"},"Textures")," or other Pure Sprites"),". Pure Sprites do not have state or access to the ",Object(o.b)("inlineCode",{parentName:"p"},"device")," and ",Object(o.b)("inlineCode",{parentName:"p"},"getInputs")," parameters."),Object(o.b)("p",null,Object(o.b)("inlineCode",{parentName:"p"},"shouldRerender")," is how Replay optimises your Sprite. Based on the last frame's props and the current frame's props, you must return a ",Object(o.b)("inlineCode",{parentName:"p"},"boolean")," of whether the Sprite needs to be redrawn. In our example above, if the ",Object(o.b)("inlineCode",{parentName:"p"},"color")," prop doesn't change, we don't need to call ",Object(o.b)("inlineCode",{parentName:"p"},"render")," again (since the return value will be the same). This caching can save time over many renders and improve your game's performance."),Object(o.b)("h2",{id:"common-props"},"Common Props"),Object(o.b)("p",null,"Pure Sprites share the same ",Object(o.b)("a",{parentName:"p",href:"/docs/sprites#common-props"},"common props as Sprites"),"."),Object(o.b)("h2",{id:"sprite-methods"},"Sprite Methods"),Object(o.b)("h3",{id:"shouldrerender"},Object(o.b)("inlineCode",{parentName:"h3"},"shouldRerender")),Object(o.b)("p",null,"Returns whether the render function needs to be called again based on the change of props. Reducing the number of renders can boost performance."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"  shouldRerender(prevProps, newProps) {\n    return boolean;\n  },\n")),Object(o.b)("h4",{id:"parameters"},"Parameters"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"prevProps"),": Last frame's props."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"newProps"),": Current frame's props.")),Object(o.b)("h3",{id:"render"},Object(o.b)("inlineCode",{parentName:"h3"},"render")),Object(o.b)("p",null,"Returns an array of Pure Sprites or Textures to render."),Object(o.b)("pre",null,Object(o.b)("code",{parentName:"pre",className:"language-js"},"  render({ props, size }) {\n    return [ ... ];\n  },\n")),Object(o.b)("h4",{id:"parameters-1"},"Parameters"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"props"),": The props passed in by the parent Sprite."),Object(o.b)("li",{parentName:"ul"},Object(o.b)("inlineCode",{parentName:"li"},"size"),": The ",Object(o.b)("inlineCode",{parentName:"li"},"size")," field of the ",Object(o.b)("a",{parentName:"li",href:"/docs/device"},"Device")," object.")),Object(o.b)("h3",{id:"renderp"},Object(o.b)("inlineCode",{parentName:"h3"},"renderP")),Object(o.b)("p",null,"An alternative render method run if the device is in portrait. See ",Object(o.b)("a",{parentName:"p",href:"/docs/game-size"},"Game Size")," for more."),Object(o.b)("h3",{id:"renderxl"},Object(o.b)("inlineCode",{parentName:"h3"},"renderXL")),Object(o.b)("p",null,"An alternative render method run for large screens. See ",Object(o.b)("a",{parentName:"p",href:"/docs/game-size"},"Game Size")," for more."),Object(o.b)("h3",{id:"renderpxl"},Object(o.b)("inlineCode",{parentName:"h3"},"renderPXL")),Object(o.b)("p",null,"An alternative render method run for large screens if the device is in portrait. See ",Object(o.b)("a",{parentName:"p",href:"/docs/game-size"},"Game Size")," for more."))}d.isMDXComponent=!0},157:function(e,r,t){"use strict";t.d(r,"a",(function(){return u})),t.d(r,"b",(function(){return m}));var n=t(0),a=t.n(n);function o(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function i(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function c(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?i(Object(t),!0).forEach((function(r){o(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function s(e,r){if(null==e)return{};var t,n,a=function(e,r){if(null==e)return{};var t,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||(a[t]=e[t]);return a}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)t=o[n],r.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(a[t]=e[t])}return a}var p=a.a.createContext({}),l=function(e){var r=a.a.useContext(p),t=r;return e&&(t="function"==typeof e?e(r):c(c({},r),e)),t},u=function(e){var r=l(e.components);return a.a.createElement(p.Provider,{value:r},e.children)},d={inlineCode:"code",wrapper:function(e){var r=e.children;return a.a.createElement(a.a.Fragment,{},r)}},b=a.a.forwardRef((function(e,r){var t=e.components,n=e.mdxType,o=e.originalType,i=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=l(t),b=n,m=u["".concat(i,".").concat(b)]||u[b]||d[b]||o;return t?a.a.createElement(m,c(c({ref:r},p),{},{components:t})):a.a.createElement(m,c({ref:r},p))}));function m(e,r){var t=arguments,n=r&&r.mdxType;if("string"==typeof e||n){var o=t.length,i=new Array(o);i[0]=b;var c={};for(var s in r)hasOwnProperty.call(r,s)&&(c[s]=r[s]);c.originalType=e,c.mdxType="string"==typeof e?e:n,i[1]=c;for(var p=2;p<o;p++)i[p]=t[p];return a.a.createElement.apply(null,i)}return a.a.createElement.apply(null,t)}b.displayName="MDXCreateElement"},163:function(e,r,t){"use strict";var n=t(0),a=t.n(n),o=t(173),i=t(165),c=t(57),s=t.n(c),p=37,l=39;r.a=function(e){var r=e.lazy,t=e.block,c=e.defaultValue,u=e.values,d=e.groupId,b=e.className,m=Object(o.a)(),f=m.tabGroupChoices,h=m.setTabGroupChoices,O=Object(n.useState)(c),j=O[0],v=O[1],y=n.Children.toArray(e.children);if(null!=d){var g=f[d];null!=g&&g!==j&&u.some((function(e){return e.value===g}))&&v(g)}var N=function(e){v(e),null!=d&&h(d,e)},P=[];return a.a.createElement("div",null,a.a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:Object(i.a)("tabs",{"tabs--block":t},b)},u.map((function(e){var r=e.value,t=e.label;return a.a.createElement("li",{role:"tab",tabIndex:0,"aria-selected":j===r,className:Object(i.a)("tabs__item",s.a.tabItem,{"tabs__item--active":j===r}),key:r,ref:function(e){return P.push(e)},onKeyDown:function(e){!function(e,r,t){switch(t.keyCode){case l:!function(e,r){var t=e.indexOf(r)+1;e[t]?e[t].focus():e[0].focus()}(e,r);break;case p:!function(e,r){var t=e.indexOf(r)-1;e[t]?e[t].focus():e[e.length-1].focus()}(e,r)}}(P,e.target,e)},onFocus:function(){return N(r)},onClick:function(){N(r)}},t)}))),r?Object(n.cloneElement)(y.filter((function(e){return e.props.value===j}))[0],{className:"margin-vert--md"}):a.a.createElement("div",{className:"margin-vert--md"},y.map((function(e,r){return Object(n.cloneElement)(e,{key:r,hidden:e.props.value!==j})}))))}},164:function(e,r,t){"use strict";var n=t(0),a=t.n(n);r.a=function(e){var r=e.children,t=e.hidden,n=e.className;return a.a.createElement("div",{role:"tabpanel",hidden:t,className:n},r)}},165:function(e,r,t){"use strict";function n(e){var r,t,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e))for(r=0;r<e.length;r++)e[r]&&(t=n(e[r]))&&(a&&(a+=" "),a+=t);else for(r in e)e[r]&&(a&&(a+=" "),a+=r);return a}r.a=function(){for(var e,r,t=0,a="";t<arguments.length;)(e=arguments[t++])&&(r=n(e))&&(a&&(a+=" "),a+=r);return a}},173:function(e,r,t){"use strict";var n=t(0),a=t(174);r.a=function(){var e=Object(n.useContext)(a.a);if(null==e)throw new Error("`useUserPreferencesContext` is used outside of `Layout` Component.");return e}},174:function(e,r,t){"use strict";var n=t(0),a=Object(n.createContext)(void 0);r.a=a}}]);