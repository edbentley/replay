(window.webpackJsonp=window.webpackJsonp||[]).push([[37],{143:function(e,t,n){"use strict";n.r(t);var r=n(0),i=n.n(r),a=n(163),o=n(159),s=Object(o.a)({render:function(){return[o.b.rectangle({width:50,height:40,color:"yellow"})]}}),c=Object(o.a)({init:function(){return{birdY:10,birdGravity:-12}},loop:function(e){var t=e.state,n=t.birdGravity,r=t.birdY;return{birdGravity:n+=.8,birdY:r-=n}},render:function(e){var t=e.state;return[s({id:"bird",x:0,y:t.birdY})]}}),l=Object(o.a)({render:function(){return[c({id:"level"})]}}),d={id:"Game",size:{width:400,height:600,maxHeightMargin:150},defaultFont:{family:"Helvetica",size:24}},u=n(73);t.default=function(){return i.a.createElement(a.a,{part:7,MDXContent:u.default,codesTs:[{file:"level.ts",code:'import { makeSprite } from "@replay/core";\nimport { WebInputs } from "@replay/web";\nimport { iOSInputs } from "@replay/swift";\nimport { Bird } from "./bird";\n\nconst birdX = 0;\n\ntype LevelState = {\n  birdY: number;\n  birdGravity: number;\n};\n\nexport const Level = makeSprite<{}, LevelState, WebInputs | iOSInputs>({\n  init() {\n    return {\n      birdY: 10,\n      birdGravity: -12,\n    };\n  },\n\n  loop({ state }) {\n    let { birdGravity, birdY } = state;\n\n    birdGravity += 0.8;\n    birdY -= birdGravity;\n\n    return {\n      birdGravity,\n      birdY,\n    };\n  },\n\n  render({ state }) {\n    return [\n      Bird({\n        id: "bird",\n        x: birdX,\n        y: state.birdY,\n      }),\n    ];\n  },\n});\n',highlight:["21-31"]}],codesJs:[{file:"level.js",code:'import { makeSprite } from "@replay/core";\nimport { Bird } from "./bird";\n\nconst birdX = 0;\n\nexport const Level = makeSprite({\n  init() {\n    return {\n      birdY: 10,\n      birdGravity: -12,\n    };\n  },\n\n  loop({ state }) {\n    let { birdGravity, birdY } = state;\n\n    birdGravity += 0.8;\n    birdY -= birdGravity;\n\n    return {\n      birdGravity,\n      birdY,\n    };\n  },\n\n  render({ state }) {\n    return [\n      Bird({\n        id: "bird",\n        x: birdX,\n        y: state.birdY,\n      }),\n    ];\n  },\n});\n',highlight:["14-24"]}],Game:l,gameProps:d})}},159:function(e,t,n){"use strict";n.d(t,"b",(function(){return i})),n.d(t,"a",(function(){return a}));var r=n(162),i={text:function(e){return{type:"text",props:Object.assign({testId:e.testId},Object(r.a)(e),{font:e.font,text:e.text,color:e.color,gradient:e.gradient,strokeColor:e.strokeColor,strokeThickness:e.strokeThickness})}},circle:function(e){return{type:"circle",props:Object.assign({testId:e.testId},Object(r.a)(e),{radius:e.radius,color:e.color,gradient:e.gradient})}},rectangle:function(e){return{type:"rectangle",props:Object.assign({testId:e.testId},Object(r.a)(e),{width:e.width,height:e.height,color:e.color,gradient:e.gradient})}},line:function(e){var t;return{type:"line",props:Object.assign({testId:e.testId},Object(r.a)(e),{color:e.color,fillColor:e.fillColor,thickness:null!==(t=e.thickness)&&void 0!==t?t:1,lineCap:e.lineCap||"butt",path:e.path,gradient:e.gradient,fillGradient:e.fillGradient})}},image:function(e){return{type:"image",props:Object.assign({testId:e.testId},Object(r.a)(e),{fileName:e.fileName,width:e.width,height:e.height})}},spriteSheet:function(e){return{type:"spriteSheet",props:Object.assign({testId:e.testId},Object(r.a)(e),{fileName:e.fileName,columns:e.columns,rows:e.rows,index:e.index,width:e.width,height:e.height})}}};function a(e){return function(t){return{type:"custom",spriteObj:e,props:t}}}},162:function(e,t,n){"use strict";function r(e){var t,n,r;return{x:e.x||0,y:e.y||0,rotation:e.rotation||0,opacity:Math.min(1,Math.max(0,null!==(t=e.opacity)&&void 0!==t?t:1)),scaleX:null!==(n=e.scaleX)&&void 0!==n?n:1,scaleY:null!==(r=e.scaleY)&&void 0!==r?r:1,anchorX:e.anchorX||0,anchorY:e.anchorY||0,mask:e.mask||null}}function i(e,t){var n,r,i;e.x=t.x||0,e.y=t.y||0,e.rotation=t.rotation||0,e.opacity=Math.min(1,Math.max(0,null!==(n=t.opacity)&&void 0!==n?n:1)),e.scaleX=null!==(r=t.scaleX)&&void 0!==r?r:1,e.scaleY=null!==(i=t.scaleY)&&void 0!==i?i:1,e.anchorX=t.anchorX||0,e.anchorY=t.anchorY||0,e.mask=t.mask||null}n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}))},163:function(e,t,n){"use strict";n.d(t,"a",(function(){return de}));var r=n(0),i=n.n(r),a=n(168),o=n(167),s=n(173),c=n(3),l=n(170),d=n(169),u=n(164),p=n(165),h=n(171),f=n.n(h),m=n(56),v=n.n(m);function g(e){var t=e.codesTs,n=e.codesJs;return i.a.createElement(u.a,{defaultValue:"js",groupId:"code",values:[{label:"JavaScript",value:"js"},{label:"TypeScript",value:"ts"}]},i.a.createElement(p.a,{value:"js"},i.a.createElement(b,{lang:"js",codes:n})),i.a.createElement(p.a,{value:"ts"},i.a.createElement(b,{lang:"ts",codes:t})))}function b(e){var t=e.lang,n=e.codes,a=n.map((function(e){return e.file})),o=Object(r.useState)(a[0]),s=o[0],c=o[1],l=n.find((function(e){return e.file===s}));return i.a.createElement("div",{style:{marginTop:-12}},i.a.createElement("div",{style:{position:"sticky",top:0,backgroundColor:"white",zIndex:1}},a.map((function(e){return i.a.createElement("button",{className:v.a.fileButton+(s===e?" "+v.a.fileButtonSelected:""),key:e,onClick:function(){return c(e)}},e)}))),i.a.createElement(w,{key:l.file,lang:t,code:l.code,highlight:l.highlight}))}function w(e){var t=e.lang,n=e.code,r=e.highlight,a=n.replace("/img/bird.png","bird.png").replace("/audio/boop.wav","boop.wav");return i.a.createElement(l.a,Object(c.a)({},l.b,{theme:d.a,code:a,language:t}),(function(e){var t=e.className,n=e.style,a=e.tokens,o=e.getLineProps,s=e.getTokenProps;return i.a.createElement("div",{className:v.a.codeBlockContent},i.a.createElement("div",{tabIndex:"0",className:f()(t,v.a.codeBlock)},i.a.createElement("div",{className:v.a.codeBlockLines,style:n},a.map((function(e,t){1===e.length&&""===e[0].content&&(e[0].content="\n");var n=o({line:e,key:t}),a=null==r?void 0:r.flatMap((function(e){if("number"==typeof e)return e;var t=e.split("-").map(Number),n=t[0],r=t[1];return Array.from({length:r-n+1}).map((function(e,t){return t+n}))}));return null!=a&&a.includes(t+1)&&(n.className+=" docusaurus-highlight-code-line"),i.a.createElement("div",n,i.a.createElement("span",{style:{display:"inline-block",width:30,textAlign:"right",marginRight:16,opacity:.5,userSelect:"none"}},t+1),e.map((function(e,t){return i.a.createElement("span",s({token:e,key:t}))})))})))))}))}var y=n(160),S=n.n(y),x=n(161);function E(e,t,n){return k.apply(this,arguments)}function k(){return(k=Object(x.a)(S.a.mark((function e(t,n,r){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Promise.all([].concat(T(t,n.audioFileNames||[],r.audioElements,r.loadAudioFile),T(t,n.imageFileNames||[],r.imageElements,r.loadImageFile)));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function T(e,t,n,r){return t.map((function(t){if(n[t]){n[t].globalSpriteIds.push(e);var i=n[t].data;return"then"in i?i:Promise.resolve()}var a=r(t).then((function(e){n[t].data=e}));return n[t]={globalSpriteIds:[e],data:a},a}))}function P(e,t,n){for(var r in t){var i=t[r].globalSpriteIds,a=i.indexOf(e);-1!==a&&(1===i.length?(n(r),delete t[r]):t[r].globalSpriteIds.splice(a,1))}}var j=n(162);function C(e,t,n,r,i,a,o,s,c,l,d,u){var p=e.baseProps;Object(j.b)(p,t);var h=function(e){var t=i(e);return function(e){var t=Math.PI/180,n=-(e.rotation||0)*t;return function(t){var r=t.x,i=t.y,a=r-e.x,o=i-e.y,s=a*Math.cos(n)+o*Math.sin(n),c=-a*Math.sin(n)+o*Math.cos(n),l=s/e.scaleX,d=c/e.scaleY;return{x:l+e.anchorX,y:d+e.anchorY}}}(p)(t)},f=null,m=function(){return f||(f=r(h)),f},v=e.getSprites(t,m,a,o,s,u),g=e.prevChildIdsSet,b=e.prevChildIds,w=0;if(d.startRenderSprite(p),O(v,e,n,r,o,s,c,l,d,u,(function(e){b[w]=e,w++,g.delete(e)}),m,h),d.endRenderSprite(),l.nativeSpriteUtils.didResize=!1,w<b.length&&(b.length=w),g.forEach((function(t){var r,i=e.childContainers[t];!function e(t,r){Object.entries(t).forEach((function(t){var i=t[0],a=t[1];if("custom"===a.type){var o=r+"--"+i;e(a.childContainers,o),a.cleanup(m),a.loadFilesPromise&&a.loadFilesPromise.then((function(){var e,t;e=o,t=n.assetUtils,P(e,t.audioElements,t.cleanupAudioFile),P(e,t.imageElements,t.cleanupImageFile)}))}else"native"===a.type&&a.cleanup({state:a.state,parentGlobalId:c})}))}((r={},r[t]=i,r),c),delete e.childContainers[t]})),e.prevChildIdsSet=new Set(b),e.prevChildIdsSet.size<b.length){var y=b.find((function(e,t){return b.indexOf(e)!==t}));throw Error("Duplicate Sprite id "+y)}}function O(e,t,n,r,i,a,o,s,c,l,d,u,p){for(var h=0;h<e.length;h++){var f=e[h];if(f)if("context"===f.type)O(f.sprites,t,n,r,i,a,o,s,c,[].concat(l,[f]),d,u,p);else if("native"===f.type){d(f.props.id);var m=s.nativeSpriteMap,v=s.nativeSpriteUtils,g=m[f.name];if(!g)throw Error('Cannot find Native Sprite "'+f.name+'"');var b=t.childContainers[f.props.id];b&&"native"===b.type||function(){var e={type:"native",state:g.create({props:f.props,parentGlobalId:o,getState:function(){return e.state},updateState:function(t){e.state=Object.assign({},e.state,t)},utils:v}),cleanup:g.cleanup};t.childContainers[f.props.id]=e,b=e}(),b.state=g.loop({props:f.props,state:b.state,parentGlobalId:o,utils:v})}else if("pure"===f.type){d(f.props.id);var w=t.childContainers[f.props.id];w&&"pure"===w.type||(w=z(f),t.childContainers[f.props.id]=w),X(w,f.props,n.size,s.nativeSpriteUtils.didResize,i,c)}else if("custom"===f.type){d(f.props.id);var y=!1,S=t.childContainers[f.props.id],x=o+"--"+f.props.id;S&&"custom"===S.type||(y=!0,S=M(f,n,u,t.prevTime,x,l),t.childContainers[f.props.id]=S),C(S,f.props,n,r,p,y,i,a,x,s,c,l)}else c.renderTexture(f)}}var I=1/60*1e3;function M(e,t,n,r,i,a){var o,s,c=e.spriteObj,l=e.props,d=[],u=function(e){d.push(e)},p=null,h=null;c.init&&(o=c.init({props:l,getState:function(){if(!p)throw Error("Cannot call getState synchronously in init");return p.state},device:t,getInputs:n,updateState:u,getContext:function(e){var t=a.find((function(t){return t.context===e}));if(!t)throw Error("No context setup");return t.value},preloadFiles:(s=Object(x.a)(S.a.mark((function e(n){var r;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=E(i,n,t.assetUtils),p?p.loadFilesPromise=r:h=r,e.next=4,r;case 4:case"end":return e.stop()}}),e)}))),function(e){return s.apply(this,arguments)})}));var f=function(){for(var e=0;e<d.length;){var t=d[e];p.state=t(p.state),e++}d.length=0},m=function(){return p.state};return p={type:"custom",state:o,baseProps:Object(j.a)(l),childContainers:{},prevChildIds:[],prevChildIdsSet:new Set,prevTime:r,currentLag:0,loadFilesPromise:h,getSprites:function(e,n,r,i,a,o){f();var s=function(e){var t=o.find((function(t){return t.context===e}));if(!t)throw Error("No context setup");return t.value};!r&&c.loop&&(this.state=c.loop({props:e,state:this.state,device:t,getInputs:n,updateState:u,getState:m,getContext:s})),f();var l=c[i];l||(l="renderPXL"===i&&c.renderXL?c.renderXL:c.render);var d=l({props:e,state:this.state,device:t,getInputs:n,updateState:u,getState:m,getContext:s,extrapolateFactor:a});return f(),d},cleanup:function(e){var n;null===(n=c.cleanup)||void 0===n||n.call(c,{state:this.state,device:t,getInputs:e})}}}function L(e,t){var n,r=e.deviceHeight>e.deviceWidth,i=!1;return"portrait"in t?(n=r?t.portrait:t.landscape,i=!0):n=t,n.minHeightXL&&e.deviceHeight>=n.minHeightXL||n.minWidthXL&&e.deviceWidth>=n.minWidthXL?i&&r?"renderPXL":"renderXL":i&&r?"renderP":"render"}function z(e){var t=e.spriteObj;return{type:"pure",childContainers:{},prevChildIds:[],prevChildIdsSet:new Set,baseProps:Object(j.a)(e.props),getSprites:function(e,n,r,i){if(this.prevProps&&this.cache&&!t.shouldRerender(this.prevProps,e)&&!r)return this.prevProps=e,this.cache;var a=t[i];return a||(a="renderPXL"===i&&t.renderXL?t.renderXL:t.render),this.prevProps=e,{type:"pureSprites",sprites:a({props:e,size:n})}}}}function X(e,t,n,r,i,a){var o=e.baseProps;Object(j.b)(o,t);var s=e.getSprites(t,n,r,i);return"cache"===s.type?(R(s,a),s):function(e,t,n,r,i,a){var o=e.baseProps,s=e.prevChildIdsSet,c=e.prevChildIds,l=0;a.startRenderSprite(o);for(var d=new Array(t.length),u=0,p=0;p<t.length;p++){var h=t[p];if(h)if("pure"===h.type){c[l]=h.props.id,l++,s.delete(h.props.id);var f=e.childContainers[h.props.id];f&&"pure"===f.type||(f=z(h),e.childContainers[h.props.id]=f),d[u]=X(f,h.props,n,r,i,a),u++}else a.renderTexture(h),d[u]=h,u++}u<d.length&&(d.length=u);a.endRenderSprite(),s.forEach((function(t){delete e.childContainers[t]}));var m={type:"cache",baseProps:o,items:d};e.cache=m,l<c.length&&(c.length=l);if(e.prevChildIdsSet=new Set(c),e.prevChildIdsSet.size<c.length){var v=c.find((function(e,t){return c.indexOf(e)!==t}));throw Error("Duplicate Sprite id "+v)}return m}(e,s.sprites,n,r,i,a)}function R(e,t){t.startRenderSprite(e.baseProps);for(var n=0;n<e.items.length;n++){var r=e.items[n];"cache"===r.type?R(r,t):t.renderTexture(r)}t.endRenderSprite()}var Y={keysDown:{},keysJustPressed:{},pointer:{pressed:!1,numberPressed:0,justPressed:!1,justReleased:!1,x:0,y:0}},N=[];function F(e){return function(e,t){var n=e(t.pointer);return Object.assign({},t,{pointer:Object.assign({},t.pointer,{x:n.x,y:n.y})})}(e,Y)}function G(e){["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)&&!(e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLInputElement)&&e.preventDefault(),Y.keysDown[e.key]=!0,Y.keysJustPressed[e.key]=!0}function A(e){delete Y.keysDown[e.key]}function D(e,t,n){N.includes(n)||(N=[].concat(N,[n])),Y.pointer.pressed=!0,Y.pointer.numberPressed=N.length,Y.pointer.justPressed=!0,Y.pointer.x=e,Y.pointer.y=t}function H(e,t){Y.pointer.x=e,Y.pointer.y=t}function W(e,t,n){0===(N=N.filter((function(e){return e!==n}))).length&&(Y.pointer.justPressed=!1,Y.pointer.pressed=!1),Y.pointer.numberPressed=N.length,Y.pointer.justReleased=!0,Y.pointer.x=e,Y.pointer.y=t}function B(e){N=N.filter((function(t){return t!==e})),Y.pointer.numberPressed=N.length,0===N.length&&(Y.pointer.justPressed=!1,Y.pointer.pressed=!1)}function J(){Y={keysDown:Y.keysDown,keysJustPressed:{},pointer:Object.assign({},Y.pointer,{justPressed:!1,justReleased:!1})}}function U(e,t,n,r,i,a){var o=t.width,s=t.height,c=t.widthMargin,l=t.heightMargin,d=t.deviceWidth,u=t.deviceHeight;e.save();var p=d*n,h=u*n,f=o+2*c,m=s+2*l;e.translate(p/2,h/2);var v=p/f;e.scale(v,v);var g=Z(e);return{scale:d/f,render:{newFrame:function(){e.clearRect(-f/2,-m/2,f,m),e.fillStyle=a,e.fillRect(-f/2,-m/2,f,m)},startRenderSprite:function(t){e.save();var n=t.opacity*g.globalAlphaStack[0];Q(e,t,n),g.globalAlphaStack.unshift(n)},endRenderSprite:function(){e.restore(),g.globalAlphaStack.shift()},renderTexture:function(t){e.save();var n=t.props.opacity*g.globalAlphaStack[0];Q(e,t.props,n),function(e,t,n,r){switch(e.type){case"text":var i=Object.assign({},r,e.props.font);return t.text(i,e.props.text,e.props.color,e.props.gradient,e.props.strokeColor,e.props.strokeThickness),0;case"circle":return t.circle(e.props.radius,e.props.color,e.props.gradient),0;case"rectangle":return t.rectangle(e.props.width,e.props.height,e.props.color,e.props.gradient),0;case"line":return t.line(e.props.path,e.props.thickness,e.props.color,e.props.fillColor,e.props.gradient,e.props.fillGradient,e.props.lineCap),0;case"image":return t.image(q(n,e.props.fileName),e.props.width,e.props.height),0;case"spriteSheet":t.spriteSheet(q(n,e.props.fileName),e.props.columns,e.props.rows,e.props.index,e.props.width,e.props.height)}}(t,g,r,i),e.restore()}}}}var V=function(e,t){var n=t.path,r=n[0],i=r[0],a=r[1],o=n[1],s=o[0],c=o[1],l=e.createLinearGradient(i,a,s,c);return t.colors.forEach((function(e){var t=e.offset,n=e.color;l.addColorStop(t,n)})),l},q=function(e,t){var n=e[t];if(!n)throw Error('Image file "'+t+'" was not preloaded');if("then"in n.data)throw Error('Image file "'+t+'" did not finish loading before it was used');return n.data},K=Math.PI/180,Q=function(e,t,n){var r=t.x,i=t.y,a=t.rotation,o=t.scaleX,s=t.scaleY,c=t.anchorX,l=t.anchorY,d=t.opacity;0===r&&0===i||e.translate(r,-i),0!==a&&e.rotate(a*K),1===o&&1===s||e.scale(o,s),0===c&&0===l||e.translate(-c,l),1!==d&&(e.globalAlpha=n),function(e,t){if(!t)return 0;switch(t.type){case"lineMask":var n=t.path,r=n[0],i=r[0],a=r[1],o=n.slice(1);return e.beginPath(),e.moveTo(i,-a),o.forEach((function(t){var n=t[0],r=t[1];e.lineTo(n,-r)})),e.clip(),0;case"circleMask":return e.beginPath(),e.arc(t.x,-t.y,Math.round(t.radius),0,2*Math.PI),e.clip(),0;case"rectangleMask":e.beginPath(),e.rect(t.x-t.width/2,-t.y-t.height/2,t.width,t.height),e.clip()}}(e,t.mask)};var Z=function(e){return{globalAlphaStack:[1],circle:function(t,n,r){e.beginPath(),e.arc(0,0,Math.round(t),0,2*Math.PI),e.fillStyle=r?V(e,r):n,e.fill(),e.closePath()},rectangle:function(t,n,r,i){e.fillStyle=i?V(e,i):r,e.fillRect(-t/2,-n/2,t,n),e.closePath()},line:function(t,n,r,i,a,o,s){if(!(t.length<2)){var c=t[0],l=c[0],d=c[1],u=t.slice(1);e.beginPath(),e.moveTo(l,-d),u.forEach((function(t){var n=t[0],r=t[1];e.lineTo(n,-r)})),o?(e.fillStyle=V(e,o),e.fill()):i&&(e.fillStyle=i,e.fill()),a?(e.strokeStyle=V(e,a),e.lineWidth=n,e.lineCap=s,e.stroke()):r&&(e.strokeStyle=r,e.lineWidth=n,e.lineCap=s,e.stroke())}},text:function(t,n,r,i,a,o){void 0===o&&(o=1);var s=t.size,c=t.weight,l=void 0===c?"normal":c,d=t.style,u=void 0===d?"normal":d,p=t.family,h=u+" "+l+" "+(s?s+"px":"")+" "+(p?""+p:"");e.font=h,e.textBaseline=t.baseline||"middle",e.textAlign=t.align||"center",a&&(e.strokeStyle=a,e.lineWidth=o,e.strokeText(n,0,0)),e.fillStyle=i?V(e,i):r,e.fillText(n,0,0)},image:function(t,n,r){e.drawImage(t,-n/2,-r/2,n,r)},spriteSheet:function(t,n,r,i,a,o){var s=t.width/n,c=t.height/r,l=i%n,d=Math.floor(i/n)%r;e.drawImage(t,l*s,d*c,s,c,-a/2,-o/2,a,o)}}};function $(e,t,n,r){var i;"portrait"in r?i=t>e?r.portrait:r.landscape:i=r;var a=i,o=a.width,s=a.height,c=a.maxWidthMargin,l=void 0===c?0:c,d=a.maxHeightMargin;if("game-coords"===n||0===e||0===t)return{width:o,height:s,widthMargin:0,heightMargin:0,deviceWidth:o,deviceHeight:s};var u=o/s;if(u>e/t){var p=e,h=p/u,f=h/s*(void 0===d?0:d),m=Math.min(t,h+2*f);return{width:o,height:s,widthMargin:0,heightMargin:(m-h)/2*(s/h),deviceWidth:p,deviceHeight:m}}var v=t,g=v*u,b=g/o*l,w=Math.min(e,g+2*b);return{width:o,height:s,widthMargin:(w-g)/2*(o/g),heightMargin:0,deviceWidth:w,deviceHeight:v}}function _(){var e={};return{start:function(t,n){var r=window.setTimeout((function(){delete e[i],t()}),n),i=String(r);return e[i]={timeoutId:r,callback:t,timeStartedMs:Date.now(),timeRemainingMs:n,isPaused:!1},i},pause:function(t){var n=e[t];if(n&&!n.isPaused){var r=Date.now()-n.timeStartedMs;n.timeRemainingMs-=r,n.isPaused=!0,window.clearTimeout(n.timeoutId)}},resume:function(t){var n=e[t];if(n&&n.isPaused){n.timeStartedMs=Date.now(),n.isPaused=!1;var r=window.setTimeout((function(){delete e[t],n.callback()}),n.timeRemainingMs);n.timeoutId=r}},cancel:function(t){var n=e[t];n&&(window.clearTimeout(n.timeoutId),delete e[t])}}}function ee(){return(ee=Object(x.a)(S.a.mark((function e(t,n){var r,i,a;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n;case 2:return r=e.sent,e.next=5,r.arrayBuffer();case 5:return i=e.sent,e.next=8,new Promise((function(e,n){t.decodeAudioData(i,e,n)}));case 8:return a=e.sent,e.abrupt("return",a);case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function te(e,t){return function(n){if(!t[n])throw Error('Audio file "'+n+'" was not preloaded');var r=t[n].data;if("then"in r)throw Error('Audio file "'+n+'" did not finish loading before it was used');var i=r.buffer,a=r.playState;return{getPosition:function(){return ne(e,r.playState)},play:function(o){var s,c=!1,l=!1,d=1;if("number"==typeof o)s=o;else if(o){s=o.fromPosition;var u=o.loop;c=void 0===u?c:u;var p=o.overwrite;l=void 0===p?l:p;var h=o.playbackRate;d=void 0===h?d:h}var f=e.createBufferSource();f.buffer=i,f.playbackRate.value=d;var m=e.createGain();f.connect(m),m.connect(e.destination);var v=null!=s?s:ne(e,a);try{f.start(void 0,v)}catch(b){return}f.loop=c,f.onended=function(){var e;if(t[n]){var r=t[n].data;"then"in r||!1!==(null===(e=r.playState)||void 0===e?void 0:e.isPaused)||delete r.playState}};var g=a&&!a.isPaused;g&&!l||(a&&g&&(a.sample.onended=null,a.sample.stop()),r.playState={playTime:e.currentTime,sample:f,alreadyPlayedTime:v,isPaused:!1,gainNode:m})},pause:function(){a&&!a.isPaused&&(a.sample.onended=null,a.sample.stop(),r.playState=Object.assign({},a,{alreadyPlayedTime:ne(e,a),isPaused:!0}))},getStatus:function(){return r.playState&&!1===r.playState.isPaused?"playing":"paused"},getDuration:function(){return i.duration},getVolume:function(){return r.playState?r.playState.gainNode.gain.value:1},setVolume:function(t){var n=r.playState;if(n)if("number"==typeof t)n.gainNode.gain.setValueAtTime(Math.max(Math.min(1,t),0),e.currentTime);else{var i=t.type,a=t.fadeTo,o=t.fadeTime,s=Math.max(Math.min(1,a),0);"linear"===i?n.gainNode.gain.linearRampToValueAtTime(s,e.currentTime+o):n.gainNode.gain.exponentialRampToValueAtTime(s,e.currentTime+o)}}}}}function ne(e,t){return t?t.isPaused?t.alreadyPlayedTime:(e.currentTime-t.playTime)*t.sample.playbackRate.value+t.alreadyPlayedTime:0}function re(){return{get:function(e,t){fetch(e).then((function(e){return e.json()})).then(t)},post:function(e,t,n){fetch(e,{method:"POST",body:JSON.stringify(t)}).then((function(e){return e.json()})).then(n)},put:function(e,t,n){fetch(e,{method:"PUT",body:JSON.stringify(t)}).then((function(e){return e.json()})).then(n)},delete:function(e,t){fetch(e,{method:"DELETE"}).then((function(e){return e.json()})).then(t)}}}function ie(){return{getItem:(t=Object(x.a)(S.a.mark((function e(t){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",localStorage.getItem(t));case 1:case"end":return e.stop()}}),e)}))),function(e){return t.apply(this,arguments)}),setItem:(e=Object(x.a)(S.a.mark((function e(t,n){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null!==n){e.next=3;break}return localStorage.removeItem(t),e.abrupt("return");case 3:localStorage.setItem(t,n);case 4:case"end":return e.stop()}}),e)}))),function(t,n){return e.apply(this,arguments)})};var e,t}function ae(){return{copy:function(e,t){navigator.clipboard?navigator.clipboard.writeText(e).then((function(){t()})).catch((function(e){t(e)})):t(new Error(window.isSecureContext?"Couldn't access clipboard":"Clipboard only available on HTTPS or localhost"))}}}function oe(){if("ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch)return!0;return window.matchMedia("(touch-enabled),(-webkit-touch-enabled),(-moz-touch-enabled),(-o-touch-enabled),(-ms-touch-enabled)").matches}var se={family:"sans-serif",size:12};function ce(e,t,n){var r=t||{},i=r.dimensions,a=void 0===i?"game-coords":i,o=r.canvas,s=r.nativeSpriteMap,c=void 0===s?{}:s,l=r.windowSize,d=r.statsBegin,u=r.statsEnd,p=o||document.createElement("canvas");o||document.body.appendChild(p);var h=window.PointerEvent?"pointerdown":"touchstart",f=window.PointerEvent?"pointermove":"touchmove",m=window.PointerEvent?"pointerup":"touchend",v=window.PointerEvent?"pointercancel":"touchcancel",g=p.getContext("2d",{alpha:!1}),b=new(window.AudioContext||window.webkitAudioContext),w=!0,y=!0,S=0,x=!1,E=0,k=0,T=function(){document.hidden&&y&&(E=S,b.suspend()),document.hidden||y||(x=!0,setTimeout((function(){b.suspend(),setTimeout((function(){b.resume()}),75)}),75)),y=!document.hidden};document.addEventListener("keydown",(function(e){w&&!e.repeat&&G(e)}),!1),document.addEventListener("keyup",(function(e){w&&A(e)}),!1),document.addEventListener("visibilitychange",T,!1),window.addEventListener("resize",V,!1);var P,j,O,z,X,R,Y=function(){return V({didScroll:!0})};window.addEventListener("scroll",Y,!1),document.addEventListener("contextmenu",(function(e){e.preventDefault()}));var N={didResize:!1,scale:1,gameXToPlatformX:function(e){return e},gameYToPlatformY:function(e){return e}};function V(t){var n=Boolean(t&&"cleanup"in t&&t.cleanup),r=Boolean(t&&"didScroll"in t&&t.didScroll);if(!P||(g.restore(),document.removeEventListener(h,j),document.removeEventListener(f,O),document.removeEventListener(m,z),document.removeEventListener(v,X),!n)){r&&P||(le.size=$((null==l?void 0:l.width)||window.innerWidth,(null==l?void 0:l.height)||window.innerHeight,a,e.props.size));var i=window.devicePixelRatio||1;p.width=le.size.deviceWidth*i,p.height=le.size.deviceHeight*i,p.style.width=le.size.deviceWidth+"px",p.style.height=le.size.deviceHeight+"px";var o=e.props.defaultFont||se,s=e.props.backgroundColor||"white",c=U(g,le.size,i,K,o,s);R=c.scale,ce.newFrame=c.render.newFrame,ce.startRenderSprite=c.render.startRenderSprite,ce.endRenderSprite=c.render.endRenderSprite,ce.renderTexture=c.render.renderTexture,N.gameXToPlatformX=function(e){var t=e.canvasOffsetLeft,n=e.widthMargin,r=e.scale,i=e.width;return function(e){return t+r*(e+i/2+n)}}({canvasOffsetLeft:p.offsetLeft,width:le.size.width,widthMargin:le.size.widthMargin,scale:R}),N.gameYToPlatformY=function(e){var t=e.canvasOffsetTop,n=e.heightMargin,r=e.scale,i=e.height;return function(e){return t-r*(e-i/2-n)}}({canvasOffsetTop:p.offsetTop,height:le.size.height,heightMargin:le.size.heightMargin,scale:R}),N.didResize=!0,N.scale=R;var d=function(e){var t=e.canvasOffsetLeft,n=e.scrollX,r=e.widthMargin,i=e.scale,a=e.width;return function(e){return(e.clientX-t+n)/i-r-a/2}}({canvasOffsetLeft:p.offsetLeft,scrollX:window.scrollX,width:le.size.width,widthMargin:le.size.widthMargin,scale:R}),u=function(e){var t=e.canvasOffsetTop,n=e.scrollY,r=e.heightMargin,i=e.scale,a=e.height;return function(e){return-(e.clientY-t+n)/i+r+a/2}}({canvasOffsetTop:p.offsetTop,scrollY:window.scrollY,height:le.size.height,heightMargin:le.size.heightMargin,scale:R}),b=function(e,t){return e>le.size.width/2+le.size.widthMargin||e<-le.size.width/2-le.size.widthMargin||t>le.size.height/2+le.size.heightMargin||t<-le.size.height/2-le.size.heightMargin};j=function(e){if("changedTouches"in e){w=!1;for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=d({clientX:n.screenX}),i=u({clientY:n.screenY});b(r,i)||(w=!0,D(r,i,n.identifier))}}else{var a=d(e),o=u(e);b(a,o)?w=!1:(w=!0,D(a,o,e.pointerId))}},O=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=d({clientX:n.screenX}),i=u({clientY:n.screenY});b(r,i)||H(r,i)}else{var a=d(e),o=u(e);b(a,o)||H(a,o)}},z=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=d({clientX:n.screenX}),i=u({clientY:n.screenY});b(r,i)?B(n.identifier):W(r,i,n.identifier)}else{var a=d(e),o=u(e);b(a,o)?B(e.pointerId):W(a,o,e.pointerId)}},X=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++)B(e.changedTouches[t].identifier);else B(e.pointerId)},document.addEventListener(h,j,!1),document.addEventListener(f,O,!1),document.addEventListener(m,z,!1),document.addEventListener(v,X,!1),P=le.size}}var q={},K={},Q=function(e,t){return function(){throw Error("Failed to load "+e+' file "'+t+'"')}},Z=(null==n?void 0:n.fileFetch)||fetch,ne={audioElements:q,imageElements:K,loadAudioFile:function(e){return function(e,t){return ee.apply(this,arguments)}(b,Z(e)).then((function(e){return{buffer:e,volume:1}})).catch(Q("audio",e))},loadImageFile:function(e){return new Promise((function(t,n){var r=new Image;r.addEventListener("load",(function(){t(r)})),r.addEventListener("error",n),r.src=e})).catch(Q("image",e))},cleanupAudioFile:function(e){var t=q[e].data;!("then"in t)&&t.playState&&(t.playState.sample.onended=null,t.playState.sample.disconnect(),t.playState.sample.buffer=null)},cleanupImageFile:function(){return null}},ce={newFrame:function(){return null},startRenderSprite:function(){return null},endRenderSprite:function(){return null},renderTexture:function(){return null}},le=function(e,t,n,r){return Object.assign({isTouchScreen:oe(),log:console.log,random:Math.random,timer:_(),audio:te(e,n.audioElements),assetUtils:n,network:re(),storage:ie(),alert:{ok:function(e,t){alert(e),null==t||t()},okCancel:function(e,t){t(confirm(e))}},clipboard:ae(),size:t,now:function(){return new Date}},r)}(b,$((null==l?void 0:l.width)||window.innerWidth,(null==l?void 0:l.height)||window.innerHeight,a,e.props.size),ne,(null==n?void 0:n.device)||{}),de={mutDevice:le,getInputs:F,render:ce},ue=!1,pe=function e(){document.removeEventListener("keydown",e,!1),document.removeEventListener(h,e,!1),"suspended"===b.state&&b.resume(),b.onstatechange=function(){"suspended"!==b.state||document.hidden||b.resume()}};return document.addEventListener("keydown",pe,!1),document.addEventListener(h,pe,!1),function t(){var n=(null==l?void 0:l.width)||window.innerWidth,r=(null==l?void 0:l.height)||window.innerHeight;if(n&&r){V();var i=function(e,t,n,r){var i=function(e){return{x:e.x,y:e.y}},a=e.mutDevice,o=e.getInputs,s=M(n,a,(function(){return o(i)}),0,n.props.id,[]),c=r||n.props.size,l=L(a.size,c),d=0,u=0;e.render.newFrame(),C(s,n.props,a,o,i,!0,l,0,n.props.id,t,e.render,[]);var p={newFrame:function(){return null},startRenderSprite:function(){return null},endRenderSprite:function(){return null},renderTexture:function(){return null}};return{runNextFrame:function(r,l){var h=r-d;d=r,u+=h;for(var f=Math.floor(u/I);f>0;){f--;var m=(u-=I)/I,v=L(a.size,c),g=0===f?e.render:p;g.newFrame(),C(s,n.props,a,o,i,!1,v,m,n.props.id,t,g,[]),l()}}}}(de,{nativeSpriteMap:c,nativeSpriteUtils:N},e).runNextFrame,a=null;!function e(){null==u||u(),window.requestAnimationFrame((function(t){ue||(null==d||d(),null===a&&(a=t-1/60),y?(x&&(x=!1,k+=t-E),S=t,i(t-a-k,J),e()):e())}))}()}else setTimeout(t,50)}(),{cleanup:function(){p.width=p.width,o||document.body.removeChild(p),ue=!0,document.removeEventListener("keydown",G,!1),document.removeEventListener("keyup",A,!1),document.removeEventListener("visibilitychange",T,!1),window.removeEventListener("resize",V,!1),window.removeEventListener("scroll",Y,!1),V({cleanup:!0})},audioElements:q,imageElements:K,audioContext:b}}function le(e){var t=e.Game,n=e.gameProps,a=e.showReload,o=function(){var e=Object(r.useRef)(null),t=Object(r.useState)(null),n=t[0],i=t[1],a=function(){i(e.current.getBoundingClientRect())};Object(r.useEffect)((function(){return window.addEventListener("resize",a,!1),function(){return window.removeEventListener("resize",a,!1)}}),[]);var o=Object(r.useCallback)((function(t){null!==t&&(e.current=t,a())}),[]);return Object(r.useEffect)((function(){document.getElementById("iphone-img").onload=function(){a()}}),[]),[n,o]}(),s=o[0],c=o[1],l=Object(r.useState)(0),d=l[0],u=l[1],p=0,h=0,f=0;if(s&&s.height&&s.width){var m=375/667;s.width/s.height>m?(h=s.height*(667/900),p=h*m):(p=s.width*(375/460),h=p/m);var g=n.size.maxHeightMargin?0:.08*h;f=(s.height-h)/2+g}return Object(r.useEffect)((function(){if(p&&h){var e=document.getElementById("myCanvas"),r=ce(t(n),{dimensions:"scale-up",canvas:e,windowSize:{width:p,height:h}}).cleanup;return function(){r()}}}),[p,h,d]),i.a.createElement(i.a.Fragment,null,i.a.createElement("div",{ref:c,style:{height:"100%",width:"100%",display:"flex",justifyContent:"center"}},i.a.createElement("img",{id:"iphone-img",style:{userSelect:"none",objectFit:"contain",maxHeight:"100%"},src:"/img/iPhone8-Portrait-SpaceGray.png"})),a&&i.a.createElement("img",{className:v.a.refresh,src:"/img/reload.svg",width:20,height:20,onClick:function(){return u((function(e){return e+1}))}}),i.a.createElement("canvas",{id:"myCanvas",style:{position:"absolute",marginTop:f},width:p,height:h}))}function de(e){var t=e.part,n=e.MDXContent,r=e.codesTs,c=e.codesJs,l=e.Game,d=e.gameProps,u=e.image,p=e.isEnd,h=r&&c,f=l&&d?i.a.createElement(s.a,{fallback:i.a.createElement("div",null,"Preview")},(function(){return i.a.createElement(le,{Game:l,gameProps:d,showReload:h})})):i.a.createElement("div",null,i.a.createElement("img",{src:u}));return i.a.createElement(a.a,{title:"Tutorial - Part "+t,noFooter:!0},i.a.createElement("div",{style:{display:"flex",minWidth:1024,height:"calc(100vh - 60px)"}},i.a.createElement("div",{style:{flex:"1",overflow:"auto",padding:16,borderRight:"1px solid #ededed"}},i.a.createElement(n,null),i.a.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},t>1?i.a.createElement(o.a,{to:"/tutorial/"+(t-1)},"Back"):i.a.createElement("div",null),p?i.a.createElement("div",null):i.a.createElement(o.a,{to:"/tutorial/"+(t+1)},"Next"))),h?i.a.createElement(i.a.Fragment,null,i.a.createElement("div",{style:{flex:"1",overflow:"auto",borderRight:"1px solid #ededed"}},i.a.createElement(g,{codesTs:r,codesJs:c})),i.a.createElement("div",{style:{flex:"1",display:"flex",justifyContent:"center"}},f)):i.a.createElement("div",{style:{flex:"2",display:"flex",justifyContent:"center"}},f)))}},73:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return d}));var r=n(3),i=n(7),a=(n(0),n(158)),o={},s={unversionedId:"tutorial/7",id:"tutorial/7",isDocsHomePage:!1,title:"7",description:"7 - Game Loop",source:"@site/docs/tutorial/7.md",slug:"/tutorial/7",permalink:"/docs/tutorial/7",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/tutorial/7.md",version:"current"},c=[],l={toc:c};function d(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h1",{id:"7---game-loop"},"7 - Game Loop"),Object(a.b)("p",null,"We have state, but we still don't have movement since the state never changes."),Object(a.b)("p",null,"We can update the state in the ",Object(a.b)("inlineCode",{parentName:"p"},"loop")," Sprite method. ",Object(a.b)("inlineCode",{parentName:"p"},"loop"),", which runs 60 times per second, takes an existing ",Object(a.b)("inlineCode",{parentName:"p"},"state")," and returns the next frame's ",Object(a.b)("inlineCode",{parentName:"p"},"state"),". ",Object(a.b)("inlineCode",{parentName:"p"},"loop")," should be a ",Object(a.b)("em",{parentName:"p"},"pure")," function: avoid directly mutating ",Object(a.b)("inlineCode",{parentName:"p"},"state"),"."),Object(a.b)("p",null,"In our game, every frame of the ",Object(a.b)("inlineCode",{parentName:"p"},"loop")," we're updating the ",Object(a.b)("inlineCode",{parentName:"p"},"birdY"),' state, as well as the gravity for a more "flappy" effect. This provides some movement!'),Object(a.b)("p",null,"You'll need to refresh the preview on the right to see it since our bird is currently falling forever."))}d.isMDXComponent=!0}}]);