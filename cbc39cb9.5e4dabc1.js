(window.webpackJsonp=window.webpackJsonp||[]).push([[67],{127:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return l})),n.d(t,"toc",(function(){return p})),n.d(t,"default",(function(){return u}));var r=n(3),i=n(7),a=(n(0),n(157)),o={id:"text-input",title:"TextInput"},l={unversionedId:"text-input",id:"text-input",isDocsHomePage:!1,title:"TextInput",description:"To add a text input to your game, use the @replay/text-input package.",source:"@site/docs/text-input.md",slug:"/text-input",permalink:"/docs/text-input",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/text-input.md",version:"current",sidebar:"someSidebar",previous:{title:"Native Sprites",permalink:"/docs/native-sprites"}},p=[],c={toc:p};function u(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"To add a text input to your game, use the ",Object(a.b)("inlineCode",{parentName:"p"},"@replay/text-input")," package."),Object(a.b)("h4",{id:"example"},"Example"),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js",metastring:'title="my-sprite.js"',title:'"my-sprite.js"'},'import { TextInput } from "@replay/text-input";\n\nconst MySprite = makeSprite({\n  render({ state }) {\n    return [\n      TextInput({\n        id: "MyInput",\n        fontName: "Calibri",\n        fontSize: 20,\n        // We control the text in the input through our state.text field\n        text: state.text,\n        onChangeText: (text) => {\n          // Update our state.text field with new value when typing occurs\n          updateState((s) => ({ ...s, text }));\n        },\n        width: 100,\n      }),\n    ];\n  },\n});\n')),Object(a.b)("pre",null,Object(a.b)("code",{parentName:"pre",className:"language-js",metastring:'{1,6} title="src/index.js"',"{1,6}":!0,title:'"src/index.js"'},'import { TextInputWeb } from "@replay/text-input";\n\nexport const options = {\n  { TextInput: TextInputWeb }\n};\n')),Object(a.b)("h4",{id:"props"},"Props"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"id"),": (Required) Identifier, must be unique within a single render function."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"fontName"),": (Required) Name of the font to use."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"fontSize"),": (Required) Size of the font in game coordinates."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"text"),": (Required) The text to show in the input. Users typing will trigger ",Object(a.b)("inlineCode",{parentName:"li"},"onChangeText")," but will not automatically change the text shown in the input."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"onChangeText"),": (Required) A callback with the updated text value when the player types."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"width"),": (Required) Width of the text input in game coordinates."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"numberOfLines"),": Number of lines text input shows. You should not switch between single and multi-line for the same text input. Default ",Object(a.b)("inlineCode",{parentName:"li"},"1"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"align"),": Alignment of text in input field, can be ",Object(a.b)("inlineCode",{parentName:"li"},'"left"'),", ",Object(a.b)("inlineCode",{parentName:"li"},'"right"')," or ",Object(a.b)("inlineCode",{parentName:"li"},'"center"'),". Default ",Object(a.b)("inlineCode",{parentName:"li"},'"center"'),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"x"),": x coordinate of input. Default ",Object(a.b)("inlineCode",{parentName:"li"},"0"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"y"),": y coordinate of input. Default ",Object(a.b)("inlineCode",{parentName:"li"},"0"),"."),Object(a.b)("li",{parentName:"ul"},Object(a.b)("inlineCode",{parentName:"li"},"color"),": An RGB hex value (e.g. ",Object(a.b)("inlineCode",{parentName:"li"},'"#ff0000"'),") or ",Object(a.b)("a",{parentName:"li",href:"https://developer.mozilla.org/docs/Web/CSS/color_value"},"CSS Level 1 keyword")," (e.g. ",Object(a.b)("inlineCode",{parentName:"li"},'"green"'),"). Default ",Object(a.b)("inlineCode",{parentName:"li"},'"black"'),".")))}u.isMDXComponent=!0},157:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return m}));var r=n(0),i=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function p(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=i.a.createContext({}),u=function(e){var t=i.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},b=function(e){var t=u(e.components);return i.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},s=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,o=e.parentName,c=p(e,["components","mdxType","originalType","parentName"]),b=u(n),s=r,m=b["".concat(o,".").concat(s)]||b[s]||d[s]||a;return n?i.a.createElement(m,l(l({ref:t},c),{},{components:n})):i.a.createElement(m,l({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,o=new Array(a);o[0]=s;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var c=2;c<a;c++)o[c]=n[c];return i.a.createElement.apply(null,o)}return i.a.createElement.apply(null,n)}s.displayName="MDXCreateElement"}}]);