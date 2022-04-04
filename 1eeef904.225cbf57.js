(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{102:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return o})),n.d(t,"toc",(function(){return b})),n.d(t,"default",(function(){return p}));var a=n(3),i=n(7),l=(n(0),n(159)),r={id:"textures",title:"Textures"},o={unversionedId:"textures",id:"textures",isDocsHomePage:!1,title:"Textures",description:"Textures are the basic building blocks of things to render on the screen, like a rectangle or image.",source:"@site/docs/textures.md",slug:"/textures",permalink:"/docs/textures",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/textures.md",version:"current",sidebar:"someSidebar",previous:{title:"Sprites",permalink:"/docs/sprites"},next:{title:"Device",permalink:"/docs/device"}},b=[{value:"Common Props",id:"common-props",children:[]},{value:"Array Textures",id:"array-textures",children:[]},{value:"Circle",id:"circle",children:[]},{value:"Rectangle",id:"rectangle",children:[]},{value:"Rectangle Array",id:"rectangle-array",children:[]},{value:"Line",id:"line",children:[]},{value:"Text",id:"text",children:[]},{value:"Image",id:"image",children:[]},{value:"Image Array",id:"image-array",children:[]},{value:"Sprite Sheet",id:"sprite-sheet",children:[]},{value:"Gradient",id:"gradient",children:[{value:"Horizontal Gradient",id:"horizontal-gradient",children:[]},{value:"Vertical Gradient",id:"vertical-gradient",children:[]}]}],c={toc:b};function p(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(l.b)("wrapper",Object(a.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(l.b)("p",null,"Textures are the basic building blocks of things to render on the screen, like a rectangle or image."),Object(l.b)("blockquote",null,Object(l.b)("p",{parentName:"blockquote"},"If you're coming from React, think of Textures as DOM elements like ",Object(l.b)("inlineCode",{parentName:"p"},"<div>")," and ",Object(l.b)("inlineCode",{parentName:"p"},"<span>"),".")),Object(l.b)("h2",{id:"common-props"},"Common Props"),Object(l.b)("p",null,"Textures share the same ",Object(l.b)("a",{parentName:"p",href:"/docs/sprites#common-props"},"common props as Sprites"),", except for ",Object(l.b)("inlineCode",{parentName:"p"},"id")," which isn't required."),Object(l.b)("p",null,"Textures also accept the optional props:"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"testId"),": Used by ",Object(l.b)("a",{parentName:"li",href:"/docs/test"},"Replay Test"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"show"),": Show or hide a texture (default ",Object(l.b)("inlineCode",{parentName:"li"},"true"),").")),Object(l.b)("h2",{id:"array-textures"},"Array Textures"),Object(l.b)("p",null,"Using Array Textures (e.g. ",Object(l.b)("inlineCode",{parentName:"p"},"t.rectangleArray"),") enables batch rendering for improved performance. The elements in the ",Object(l.b)("inlineCode",{parentName:"p"},"props")," arrays share the same ",Object(l.b)("a",{parentName:"p",href:"#common-props"},"common props as other Textures")," except for the ",Object(l.b)("inlineCode",{parentName:"p"},"mask")," prop, which is set once outside of the array."),Object(l.b)("h2",{id:"circle"},"Circle"),Object(l.b)("h4",{id:"example"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.circle({\n  radius: 5,\n  color: "#ff0000",\n})\n')),Object(l.b)("h4",{id:"props"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"radius"),": Radius of the circle in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"color"),": A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),").")),Object(l.b)("h2",{id:"rectangle"},"Rectangle"),Object(l.b)("h4",{id:"example-1"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.rectangle({\n  width: 10,\n  height: 20,\n  color: "#ff0000",\n})\n')),Object(l.b)("h4",{id:"props-1"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Width of the rectangle in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Height of the rectangle in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"color"),": A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),")."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"gradient"),": (Optional) Override the ",Object(l.b)("inlineCode",{parentName:"li"},"color")," prop with a ",Object(l.b)("a",{parentName:"li",href:"#gradient"},"gradient"),".")),Object(l.b)("h2",{id:"rectangle-array"},"Rectangle Array"),Object(l.b)("h4",{id:"example-2"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.rectangleArray({\n  props: [\n    {\n      width: 10,\n      height: 20,\n      color: "#FF0000",\n    },\n    {\n      width: 50,\n      height: 20,\n      color: "#0000FF",\n      x: 100,\n    },\n  ],\n})\n')),Object(l.b)("h4",{id:"props-2"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"mask"),": (Optional) See ",Object(l.b)("a",{parentName:"li",href:"/docs/mask"},"Mask"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"props"),": An array of the following:",Object(l.b)("ul",{parentName:"li"},Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Width of the rectangle in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Height of the rectangle in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"color"),": A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),").")))),Object(l.b)("h2",{id:"line"},"Line"),Object(l.b)("h4",{id:"example-3"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.line({\n  color: "#ff0000",\n  thickness: 2,\n  path: [\n    [10, 20],\n    [10, 30],\n    [20, 30],\n  ],\n})\n')),Object(l.b)("h4",{id:"props-3"},"Props"),Object(l.b)("blockquote",null,Object(l.b)("p",{parentName:"blockquote"},"Make sure one of ",Object(l.b)("inlineCode",{parentName:"p"},"color"),", ",Object(l.b)("inlineCode",{parentName:"p"},"fillColor")," or ",Object(l.b)("inlineCode",{parentName:"p"},"fillGradient")," is set, otherwise nothing will be drawn!")),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"color"),": (Optional) A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),") of the stroke colour. Default no stroke."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"fillColor"),": (Optional) A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),") to fill in the shape of the path with a colour. Default no fill."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"fillGradient"),": (Optional) Set a fill ",Object(l.b)("a",{parentName:"li",href:"#gradient"},"gradient")," instead of using the ",Object(l.b)("inlineCode",{parentName:"li"},"fillColor")," prop. Default no gradient fill."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"path"),": An array of ",Object(l.b)("inlineCode",{parentName:"li"},"[x, y]")," coordinates to draw the line."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"thickness"),": (Optional) Line thickness. Default ",Object(l.b)("inlineCode",{parentName:"li"},"1"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"lineCap"),": (Optional) The shape of the line ends. Can be one of:",Object(l.b)("ul",{parentName:"li"},Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},'"butt"'),": (Default) The ends of lines are squared off at the endpoints."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},'"round"'),": The ends of lines are rounded.")))),Object(l.b)("h2",{id:"text"},"Text"),Object(l.b)("h4",{id:"example-4"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.text({\n  font: { family: "Calibri", size: 16, align: "left", },\n  text: "Hello Replay",\n  color: "#ff0000",\n})\n')),Object(l.b)("h4",{id:"props-4"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"text"),": A string to display."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"color"),": A ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),")."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"gradient"),": (Optional) Override the ",Object(l.b)("inlineCode",{parentName:"li"},"color")," prop with a ",Object(l.b)("a",{parentName:"li",href:"#gradient"},"gradient"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"strokeColor"),": (Optional) Apply a stroke to the text, must be a ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"strokeThickness"),": (Optional) Thickness of stroke. Default ",Object(l.b)("inlineCode",{parentName:"li"},"1"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"font"),": (Optional) Set the font family, size, etc. If any properties are not provided, will cascade from the game's default font (see ",Object(l.b)("a",{parentName:"li",href:"/docs/top-level-game"},"Top-Level Game"),").",Object(l.b)("ul",{parentName:"li"},Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"family"),": (Optional) Font family, e.g. ",Object(l.b)("inlineCode",{parentName:"li"},'"Helvetica"')),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"size"),": (Optional) Font size, e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"20")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"weight"),": (Optional) Font weight, e.g. ",Object(l.b)("inlineCode",{parentName:"li"},'"bold"'),", ",Object(l.b)("inlineCode",{parentName:"li"},"500")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"style"),": (Optional) Font style, typically either ",Object(l.b)("inlineCode",{parentName:"li"},'"normal"')," (default) or ",Object(l.b)("inlineCode",{parentName:"li"},'"italic"')),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"baseline"),": (Optional) Alignment of text around y position, can be ",Object(l.b)("inlineCode",{parentName:"li"},'"top"'),", ",Object(l.b)("inlineCode",{parentName:"li"},'"hanging"'),", ",Object(l.b)("inlineCode",{parentName:"li"},'"middle"')," (default), ",Object(l.b)("inlineCode",{parentName:"li"},'"alphabetic"'),", ",Object(l.b)("inlineCode",{parentName:"li"},'"ideographic"'),", ",Object(l.b)("inlineCode",{parentName:"li"},'"bottom"')),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"align"),": (Optional) Alignment of text around x position, can be ",Object(l.b)("inlineCode",{parentName:"li"},'"left"'),", ",Object(l.b)("inlineCode",{parentName:"li"},'"center"')," or ",Object(l.b)("inlineCode",{parentName:"li"},'"right"'),". ",Object(l.b)("inlineCode",{parentName:"li"},'"left"')," will put the left edge of the text at the Texture's x position. Default ",Object(l.b)("inlineCode",{parentName:"li"},'"center"'),".")))),Object(l.b)("h2",{id:"image"},"Image"),Object(l.b)("h4",{id:"example-5"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.image({\n  fileName: "player.png",\n  width: 30,\n  height: 80,\n})\n')),Object(l.b)("h4",{id:"props-5"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"fileName"),": The name of the file to render. Note that this file must be loaded using ",Object(l.b)("a",{parentName:"li",href:"/docs/sprites#init"},Object(l.b)("inlineCode",{parentName:"a"},"preloadFiles"))," before you render the Texture."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Scale the image to this width in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Scale the image to this height in game coordinates.")),Object(l.b)("h2",{id:"image-array"},"Image Array"),Object(l.b)("h4",{id:"example-6"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.imageArray({\n  fileName: "enemy.png",\n  props: [\n    {\n      width: 10,\n      height: 10,\n    },\n    {\n      width: 10,\n      height: 10,\n      x: 100,\n    },\n  ],\n})\n')),Object(l.b)("h4",{id:"props-6"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"fileName"),": The name of the file to render. Note batching is only available per image file."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"mask"),": (Optional) See ",Object(l.b)("a",{parentName:"li",href:"/docs/mask"},"Mask"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"props"),": An array of the following:",Object(l.b)("ul",{parentName:"li"},Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Scale the image to this width in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Scale the image to this height in game coordinates.")))),Object(l.b)("h2",{id:"sprite-sheet"},"Sprite Sheet"),Object(l.b)("p",null,"The sprite sheet Texture provides a way to render a section of an image. Iterate through the ",Object(l.b)("inlineCode",{parentName:"p"},"index")," over time to achieve an animation effect. All tiles should be of equal width and height."),Object(l.b)("h4",{id:"example-7"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.spriteSheet({\n  fileName: "player-tiles.png",\n  columns: 3,\n  rows: 6,\n  index: state.frame,\n  width: 50,\n  height: 60,\n})\n')),Object(l.b)("h4",{id:"props-7"},"Props"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"fileName"),": The name of the sprite sheet file to render. Note that this file must be loaded using ",Object(l.b)("a",{parentName:"li",href:"/docs/sprites#init"},Object(l.b)("inlineCode",{parentName:"a"},"preloadFiles"))," before you render the Texture."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"columns"),": The number of columns of tiles in the sprite sheet."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"rows"),": The number of rows of tiles in the sprite sheet."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"index"),": The tile to display. An index of ",Object(l.b)("inlineCode",{parentName:"li"},"0")," will be the top-left tile, moves left to right then top to bottom. An index greater than the number of tiles will loop back to an index of ",Object(l.b)("inlineCode",{parentName:"li"},"0"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Scale the displayed tile to this width in game coordinates."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Scale the displayed tile to this height in game coordinates.")),Object(l.b)("img",{src:"/img/sprite-sheet-index.png",width:"50%"}),Object(l.b)("h2",{id:"gradient"},"Gradient"),Object(l.b)("p",null,"A colour gradient effect can be achieved through the ",Object(l.b)("inlineCode",{parentName:"p"},"gradient")," props. Pass in one of the following objects:"),Object(l.b)("h3",{id:"horizontal-gradient"},"Horizontal Gradient"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"type"),": ",Object(l.b)("inlineCode",{parentName:"li"},'"linearHoriz"')),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"colors"),": An array of ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),") colours in left to right order spread evenly."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"opacities"),": (Optional) An array of opacities for each colour in ",Object(l.b)("inlineCode",{parentName:"li"},"colors"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"width"),": Width between first and last colour in game coordinates.")),Object(l.b)("h3",{id:"vertical-gradient"},"Vertical Gradient"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"type"),": ",Object(l.b)("inlineCode",{parentName:"li"},'"linearVert"')),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"colors"),": An array of ",Object(l.b)("a",{parentName:"li",href:"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value"},"CSS Level 1 color")," or 6 char hex (e.g. ",Object(l.b)("inlineCode",{parentName:"li"},"#ff0000"),", ",Object(l.b)("inlineCode",{parentName:"li"},"green"),") colours in top to bottom order spread evenly."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"opacities"),": (Optional) An array of opacities for each colour in ",Object(l.b)("inlineCode",{parentName:"li"},"colors"),"."),Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"height"),": Height between first and last colour in game coordinates.")),Object(l.b)("h4",{id:"example-8"},"Example"),Object(l.b)("pre",null,Object(l.b)("code",{parentName:"pre",className:"language-js"},'t.rectangle({\n  width: 10,\n  height: 10,\n  color: "white",\n  gradient: {\n    type: "linearVert",\n    colors: ["#FF0000", "#0000FF"],\n    opacities: [0.5, 1],\n    height: 5,\n  },\n}),\n')))}p.isMDXComponent=!0},159:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return O}));var a=n(0),i=n.n(a);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function b(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=i.a.createContext({}),p=function(e){var t=i.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},d=function(e){var t=p(e.components);return i.a.createElement(c.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},s=i.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,r=e.parentName,c=b(e,["components","mdxType","originalType","parentName"]),d=p(n),s=a,O=d["".concat(r,".").concat(s)]||d[s]||m[s]||l;return n?i.a.createElement(O,o(o({ref:t},c),{},{components:n})):i.a.createElement(O,o({ref:t},c))}));function O(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,r=new Array(l);r[0]=s;var o={};for(var b in t)hasOwnProperty.call(t,b)&&(o[b]=t[b]);o.originalType=e,o.mdxType="string"==typeof e?e:a,r[1]=o;for(var c=2;c<l;c++)r[c]=n[c];return i.a.createElement.apply(null,r)}return i.a.createElement.apply(null,n)}s.displayName="MDXCreateElement"}}]);