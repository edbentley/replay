(window.webpackJsonp=window.webpackJsonp||[]).push([[61],{125:function(e,t,n){"use strict";n.r(t);var r=n(0),i=n.n(r),a=n(162),o=n(180),s=n(70);t.default=function(){return i.a.createElement(a.a,{part:1,MDXContent:s.default,Game:o.a,gameProps:o.b})}},158:function(e,t,n){"use strict";n.d(t,"b",(function(){return i})),n.d(t,"a",(function(){return a}));var r=n(161),i={text:function(e){return{type:"text",props:Object.assign({testId:e.testId},Object(r.a)(e),{font:e.font,text:e.text,color:e.color})}},circle:function(e){return{type:"circle",props:Object.assign({testId:e.testId},Object(r.a)(e),{radius:e.radius,color:e.color})}},rectangle:function(e){return{type:"rectangle",props:Object.assign({testId:e.testId},Object(r.a)(e),{width:e.width,height:e.height,color:e.color})}},line:function(e){var t;return{type:"line",props:Object.assign({testId:e.testId},Object(r.a)(e),{color:e.color,fillColor:e.fillColor,thickness:null!==(t=e.thickness)&&void 0!==t?t:1,lineCap:e.lineCap||"butt",path:e.path})}},image:function(e){return{type:"image",props:Object.assign({testId:e.testId},Object(r.a)(e),{fileName:e.fileName,width:e.width,height:e.height})}},spriteSheet:function(e){return{type:"spriteSheet",props:Object.assign({testId:e.testId},Object(r.a)(e),{fileName:e.fileName,columns:e.columns,rows:e.rows,index:e.index,width:e.width,height:e.height})}}};function a(e){return function(t){return{type:"custom",spriteObj:e,props:t}}}},161:function(e,t,n){"use strict";function r(e){var t,n,r;return{x:e.x||0,y:e.y||0,rotation:e.rotation||0,opacity:Math.min(1,Math.max(0,null!==(t=e.opacity)&&void 0!==t?t:1)),scaleX:null!==(n=e.scaleX)&&void 0!==n?n:1,scaleY:null!==(r=e.scaleY)&&void 0!==r?r:1,anchorX:e.anchorX||0,anchorY:e.anchorY||0,mask:e.mask||null}}function i(e,t){var n,r,i;e.x=t.x||0,e.y=t.y||0,e.rotation=t.rotation||0,e.opacity=Math.min(1,Math.max(0,null!==(n=t.opacity)&&void 0!==n?n:1)),e.scaleX=null!==(r=t.scaleX)&&void 0!==r?r:1,e.scaleY=null!==(i=t.scaleY)&&void 0!==i?i:1,e.anchorX=t.anchorX||0,e.anchorY=t.anchorY||0,e.mask=t.mask||null}n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return i}))},162:function(e,t,n){"use strict";n.d(t,"a",(function(){return ce}));var r=n(0),i=n.n(r),a=n(167),o=n(166),s=n(172),c=n(3),u=n(169),l=n(168),d=n(163),p=n(164),h=n(170),f=n.n(h),g=n(56),m=n.n(g);function v(e){var t=e.codesTs,n=e.codesJs;return i.a.createElement(d.a,{defaultValue:"js",groupId:"code",values:[{label:"JavaScript",value:"js"},{label:"TypeScript",value:"ts"}]},i.a.createElement(p.a,{value:"js"},i.a.createElement(y,{lang:"js",codes:n})),i.a.createElement(p.a,{value:"ts"},i.a.createElement(y,{lang:"ts",codes:t})))}function y(e){var t=e.lang,n=e.codes,a=n.map((function(e){return e.file})),o=Object(r.useState)(a[0]),s=o[0],c=o[1],u=n.find((function(e){return e.file===s}));return i.a.createElement("div",{style:{marginTop:-12}},i.a.createElement("div",{style:{position:"sticky",top:0,backgroundColor:"white",zIndex:1}},a.map((function(e){return i.a.createElement("button",{className:m.a.fileButton+(s===e?" "+m.a.fileButtonSelected:""),key:e,onClick:function(){return c(e)}},e)}))),i.a.createElement(w,{key:u.file,lang:t,code:u.code,highlight:u.highlight}))}function w(e){var t=e.lang,n=e.code,r=e.highlight,a=n.replace("/img/bird.png","bird.png").replace("/audio/boop.wav","boop.wav");return i.a.createElement(u.a,Object(c.a)({},u.b,{theme:l.a,code:a,language:t}),(function(e){var t=e.className,n=e.style,a=e.tokens,o=e.getLineProps,s=e.getTokenProps;return i.a.createElement("div",{className:m.a.codeBlockContent},i.a.createElement("div",{tabIndex:"0",className:f()(t,m.a.codeBlock)},i.a.createElement("div",{className:m.a.codeBlockLines,style:n},a.map((function(e,t){1===e.length&&""===e[0].content&&(e[0].content="\n");var n=o({line:e,key:t}),a=null==r?void 0:r.flatMap((function(e){if("number"==typeof e)return e;var t=e.split("-").map(Number),n=t[0],r=t[1];return Array.from({length:r-n+1}).map((function(e,t){return t+n}))}));return null!=a&&a.includes(t+1)&&(n.className+=" docusaurus-highlight-code-line"),i.a.createElement("div",n,i.a.createElement("span",{style:{display:"inline-block",width:30,textAlign:"right",marginRight:16,opacity:.5,userSelect:"none"}},t+1),e.map((function(e,t){return i.a.createElement("span",s({token:e,key:t}))})))})))))}))}var b=n(159),S=n.n(b),x=n(160);function E(e,t,n){return j.apply(this,arguments)}function j(){return(j=Object(x.a)(S.a.mark((function e(t,n,r){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Promise.all([].concat(P(t,n.audioFileNames||[],r.audioElements,r.loadAudioFile),P(t,n.imageFileNames||[],r.imageElements,r.loadImageFile)));case 2:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function P(e,t,n,r){return t.map((function(t){if(n[t]){n[t].globalSpriteIds.add(e);var i=n[t].data;return"then"in i?i:Promise.resolve()}var a=r(t).then((function(e){n[t].data=e}));return n[t]={globalSpriteIds:new Set([e]),data:a},a}))}function T(e,t,n){for(var r in t){var i=t[r].globalSpriteIds;i.has(e)&&(1===i.size?(n(r),delete t[r]):t[r].globalSpriteIds.delete(e))}}var O=n(161);function M(e,t,n,r,i,a,o,s,c,u,l){var d=e.baseProps;Object(O.b)(d,t);var p=u.nativeSpriteMap,h=u.nativeSpriteUtils,f=function(e){var t=i(e);return function(e){var t=Math.PI/180,n=-(e.rotation||0)*t;return function(t){var r=t.x,i=t.y,a=r-e.x,o=i-e.y,s=a*Math.cos(n)+o*Math.sin(n),c=-a*Math.sin(n)+o*Math.cos(n),u=s/e.scaleX,l=c/e.scaleY;return{x:u+e.anchorX,y:l+e.anchorY}}}(d)(t)},g=null,m=function(){return g||(g=r(f)),g},v=e.getSprites(t,m,a,o,s),y=new Set(e.prevChildIds);if(y.size<e.prevChildIds.length){var w=e.prevChildIds.find((function(t,n){return e.prevChildIds.indexOf(t)!==n}));throw Error("Duplicate Sprite id "+w)}var b=e.prevChildIds,S=0;l.startRenderSprite(d);for(var x=0;x<v.length;x++){var E=v[x];if(E)if("native"===E.type){b[S]=E.props.id,S++,y.delete(E.props.id);var j=p[E.name];if(!j)throw Error('Cannot find Native Sprite "'+E.name+'"');var P=e.childContainers[E.props.id];P&&"native"===P.type||function(){var t={type:"native",state:j.create({props:E.props,parentGlobalId:c,getState:function(){return t.state},updateState:function(e){t.state=Object.assign({},t.state,e)},utils:h}),cleanup:j.cleanup};e.childContainers[E.props.id]=t,P=t}(),P.state=j.loop({props:E.props,state:P.state,parentGlobalId:c,utils:h})}else if("pure"===E.type){b[S]=E.props.id,S++,y.delete(E.props.id);var k=e.childContainers[E.props.id];k&&"pure"===k.type||(k=C(E),e.childContainers[E.props.id]=k),L(k,E.props,n.size,h.didResize,o,l)}else if("custom"===E.type){b[S]=E.props.id,S++,y.delete(E.props.id);var z=!1,R=e.childContainers[E.props.id],X=c+"--"+E.props.id;R&&"custom"===R.type||(z=!0,R=I(E,n,m,e.prevTime,X),e.childContainers[E.props.id]=R),M(R,E.props,n,r,f,z,o,s,X,u,l)}else l.renderTexture(E)}l.endRenderSprite(),h.didResize=!1,S<b.length&&(b.length=S),y.forEach((function(t){var r,i=e.childContainers[t];!function e(t,r){Object.entries(t).forEach((function(t){var i=t[0],a=t[1];if("custom"===a.type){var o=r+"--"+i;e(a.childContainers,o),a.loadFilesPromise&&a.loadFilesPromise.then((function(){var e,t;e=o,t=n.assetUtils,T(e,t.audioElements,t.cleanupAudioFile),T(e,t.imageElements,t.cleanupImageFile)}))}else"native"===a.type&&a.cleanup({state:a.state,parentGlobalId:c})}))}((r={},r[t]=i,r),c),delete e.childContainers[t]}))}var k=1/60*1e3;function I(e,t,n,r,i){var a,o,s=e.spriteObj,c=e.props,u=[],l=function(e){u.push(e)},d=null,p=null;s.init&&(a=s.init({props:c,getState:function(){if(!d)throw Error("Cannot call getState synchronously in init");return d.state},device:t,getInputs:n,updateState:l,preloadFiles:(o=Object(x.a)(S.a.mark((function e(n){var r;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return r=E(i,n,t.assetUtils),d?d.loadFilesPromise=r:p=r,e.next=4,r;case 4:case"end":return e.stop()}}),e)}))),function(e){return o.apply(this,arguments)})}));var h=function(){for(var e=0;e<u.length;){var t=u[e];d.state=t(d.state),e++}u.length=0},f=function(){return d.state};return d={type:"custom",state:a,baseProps:Object(O.a)(c),childContainers:{},prevChildIds:[],prevTime:r,currentLag:0,loadFilesPromise:p,getSprites:function(e,n,r,i,a){h(),!r&&s.loop&&(this.state=s.loop({props:e,state:this.state,device:t,getInputs:n,updateState:l,getState:f})),h();var o=s[i];o||(o="renderPXL"===i&&s.renderXL?s.renderXL:s.render);var c=o({props:e,state:this.state,device:t,getInputs:n,updateState:l,getState:f,extrapolateFactor:a});return h(),c}}}function z(e,t){var n,r=e.deviceHeight>e.deviceWidth,i=!1;return"portrait"in t?(n=r?t.portrait:t.landscape,i=!0):n=t,n.minHeightXL&&e.deviceHeight>=n.minHeightXL||n.minWidthXL&&e.deviceWidth>=n.minWidthXL?i&&r?"renderPXL":"renderXL":i&&r?"renderP":"render"}function C(e){var t=e.spriteObj;return{type:"pure",childContainers:{},prevChildIds:[],baseProps:Object(O.a)(e.props),getSprites:function(e,n,r,i){if(this.prevProps&&this.cache&&!t.shouldRerender(this.prevProps,e)&&!r)return this.prevProps=e,this.cache;var a=t[i];return a||(a="renderPXL"===i&&t.renderXL?t.renderXL:t.render),this.prevProps=e,{type:"pureSprites",sprites:a({props:e,size:n})}}}}function L(e,t,n,r,i,a){var o=e.baseProps;Object(O.b)(o,t);var s=e.getSprites(t,n,r,i);return"cache"===s.type?(R(s,a),s):function(e,t,n,r,i,a){var o=e.baseProps,s=new Set(e.prevChildIds),c=e.prevChildIds,u=0;a.startRenderSprite(o);for(var l=new Array(t.length),d=0,p=0;p<t.length;p++){var h=t[p];if(h)if("pure"===h.type){c[u]=h.props.id,u++,s.delete(h.props.id);var f=e.childContainers[h.props.id];f&&"pure"===f.type||(f=C(h),e.childContainers[h.props.id]=f),l[d]=L(f,h.props,n,r,i,a),d++}else a.renderTexture(h),l[d]=h,d++}d<l.length&&(l.length=d);a.endRenderSprite(),s.forEach((function(t){delete e.childContainers[t]}));var g={type:"cache",baseProps:o,items:l};e.cache=g,u<c.length&&(c.length=u);return g}(e,s.sprites,n,r,i,a)}function R(e,t){t.startRenderSprite(e.baseProps);for(var n=0;n<e.items.length;n++){var r=e.items[n];"cache"===r.type?R(r,t):t.renderTexture(r)}t.endRenderSprite()}var X={keysDown:{},keysJustPressed:{},pointer:{pressed:!1,numberPressed:0,justPressed:!1,justReleased:!1,x:0,y:0}},F=[];function N(e){return function(e,t){var n=e(t.pointer);return Object.assign({},t,{pointer:Object.assign({},t.pointer,{x:n.x,y:n.y})})}(e,X)}function Y(e){["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(e.key)&&!(e.target instanceof HTMLTextAreaElement||e.target instanceof HTMLInputElement)&&e.preventDefault(),X.keysDown[e.key]=!0,X.keysJustPressed[e.key]=!0}function A(e){delete X.keysDown[e.key]}function D(e,t,n){F.includes(n)||(F=[].concat(F,[n])),X.pointer.pressed=!0,X.pointer.numberPressed=F.length,X.pointer.justPressed=!0,X.pointer.x=e,X.pointer.y=t}function B(e,t){X.pointer.x=e,X.pointer.y=t}function H(e,t,n){0===(F=F.filter((function(e){return e!==n}))).length&&(X.pointer.justPressed=!1,X.pointer.pressed=!1),X.pointer.numberPressed=F.length,X.pointer.justReleased=!0,X.pointer.x=e,X.pointer.y=t}function W(e){F=F.filter((function(t){return t!==e})),X.pointer.numberPressed=F.length,0===F.length&&(X.pointer.justPressed=!1,X.pointer.pressed=!1)}function G(){X={keysDown:X.keysDown,keysJustPressed:{},pointer:Object.assign({},X.pointer,{justPressed:!1,justReleased:!1})}}function J(e,t,n,r){var i=t.width,a=t.height,o=t.widthMargin,s=t.heightMargin,c=t.deviceWidth,u=t.deviceHeight;e.save();var l=Math.min(c/i,u/a),d=i+2*o,p=a+2*s;e.translate(c/2,u/2),e.scale(l,l);var h=$(e);return{scale:l,render:{newFrame:function(){e.clearRect(-c/2/l,-u/2/l,c/l,u/l),e.fillStyle="white",e.fillRect(-d/2,-p/2,d,p)},startRenderSprite:function(t){e.save();var n=t.opacity*h.globalAlphaStack[0];q(e,t,n),h.globalAlphaStack.unshift(n)},endRenderSprite:function(){e.restore(),h.globalAlphaStack.shift()},renderTexture:function(t){e.save();var i=t.props.opacity*h.globalAlphaStack[0];q(e,t.props,i),function(e,t,n,r){switch(e.type){case"text":var i=Object.assign({},r,e.props.font);return t.text(i,e.props.text,e.props.color),0;case"circle":return t.circle(e.props.radius,e.props.color),0;case"rectangle":return t.rectangle(e.props.width,e.props.height,e.props.color),0;case"line":return t.line(e.props.path,e.props.thickness,e.props.color,e.props.fillColor,e.props.lineCap),0;case"image":return t.image(U(n,e.props.fileName),e.props.width,e.props.height),0;case"spriteSheet":t.spriteSheet(U(n,e.props.fileName),e.props.columns,e.props.rows,e.props.index,e.props.width,e.props.height)}}(t,h,n,r),e.restore()}}}}var U=function(e,t){var n=e[t];if(!n)throw Error('Image file "'+t+'" was not preloaded');if("then"in n.data)throw Error('Image file "'+t+'" did not finish loading before it was used');return n.data},V=Math.PI/180,q=function(e,t,n){var r=t.x,i=t.y,a=t.rotation,o=t.scaleX,s=t.scaleY,c=t.anchorX,u=t.anchorY,l=t.opacity;0===r&&0===i||e.translate(r,-i),0!==a&&e.rotate(a*V),1===o&&1===s||e.scale(o,s),0===c&&0===u||e.translate(-c,u),1!==l&&(e.globalAlpha=n),function(e,t){if(!t)return 0;switch(t.type){case"lineMask":var n=t.path,r=n[0],i=r[0],a=r[1],o=n.slice(1);return e.beginPath(),e.moveTo(i,-a),o.forEach((function(t){var n=t[0],r=t[1];e.lineTo(n,-r)})),e.clip(),0;case"circleMask":return e.beginPath(),e.arc(t.x,-t.y,Math.round(t.radius),0,2*Math.PI),e.clip(),0;case"rectangleMask":e.beginPath(),e.rect(t.x-t.width/2,-t.y-t.height/2,t.width,t.height),e.clip()}}(e,t.mask)};var $=function(e){return{globalAlphaStack:[1],circle:function(t,n){e.beginPath(),e.arc(0,0,Math.round(t),0,2*Math.PI),e.fillStyle=n,e.fill(),e.closePath()},rectangle:function(t,n,r){e.fillStyle=r,e.fillRect(-t/2,-n/2,t,n),e.closePath()},line:function(t,n,r,i,a){if(!(t.length<2)){var o=t[0],s=o[0],c=o[1],u=t.slice(1);e.beginPath(),e.moveTo(s,-c),u.forEach((function(t){var n=t[0],r=t[1];e.lineTo(n,-r)})),i&&(e.fillStyle=i,e.fill()),r&&(e.strokeStyle=r,e.lineWidth=n,e.lineCap=a,e.stroke())}},text:function(t,n,r){var i=t.size,a=t.weight,o=void 0===a?"normal":a,s=t.style,c=void 0===s?"normal":s,u=t.family,l=c+" "+o+" "+(i?i+"px":"")+" "+(u?""+u:"");e.font=l,e.textBaseline=t.baseline||"middle",e.textAlign=t.align||"center",e.fillStyle=r,e.fillText(n,0,0)},image:function(t,n,r){e.drawImage(t,-n/2,-r/2,n,r)},spriteSheet:function(t,n,r,i,a,o){var s=t.width/n,c=t.height/r,u=i%n,l=Math.floor(i/n)%r;e.drawImage(t,u*s,l*c,s,c,-a/2,-o/2,a,o)}}};function K(e,t,n,r){var i;"portrait"in r?i=t>e?r.portrait:r.landscape:i=r;var a=i,o=a.width,s=a.height,c=a.maxWidthMargin,u=void 0===c?0:c,l=a.maxHeightMargin;if("game-coords"===n)return{width:o,height:s,widthMargin:0,heightMargin:0,deviceWidth:o,deviceHeight:s};var d=o/s;if(d>e/t){var p=e,h=p/d,f=h/s*(void 0===l?0:l),g=Math.min(t,h+2*f);return{width:o,height:s,widthMargin:0,heightMargin:(g-h)/2*(s/h),deviceWidth:p,deviceHeight:g}}var m=t,v=m*d,y=v/o*u,w=Math.min(e,v+2*y);return{width:o,height:s,widthMargin:(w-v)/2*(o/v),heightMargin:0,deviceWidth:w,deviceHeight:m}}function Q(){var e={};return{start:function(t,n){var r=window.setTimeout((function(){delete e[i],t()}),n),i=String(r);return e[i]={timeoutId:r,callback:t,timeStartedMs:Date.now(),timeRemainingMs:n,isPaused:!1},i},pause:function(t){var n=e[t];if(n&&!n.isPaused){var r=Date.now()-n.timeStartedMs;n.timeRemainingMs-=r,n.isPaused=!0,window.clearTimeout(n.timeoutId)}},resume:function(t){var n=e[t];if(n&&n.isPaused){n.timeStartedMs=Date.now(),n.isPaused=!1;var r=window.setTimeout((function(){delete e[t],n.callback()}),n.timeRemainingMs);n.timeoutId=r}},cancel:function(t){var n=e[t];n&&(window.clearTimeout(n.timeoutId),delete e[t])}}}function Z(){return(Z=Object(x.a)(S.a.mark((function e(t,n){var r,i,a;return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,n;case 2:return r=e.sent,e.next=5,r.arrayBuffer();case 5:return i=e.sent,e.next=8,new Promise((function(e,n){t.decodeAudioData(i,e,n)}));case 8:return a=e.sent,e.abrupt("return",a);case 10:case"end":return e.stop()}}),e)})))).apply(this,arguments)}function _(e,t){return function(n){if(!t[n])throw Error('Audio file "'+n+'" was not preloaded');var r=t[n].data;if("then"in r)throw Error('Audio file "'+n+'" did not finish loading before it was used');var i=r.buffer,a=r.playState;return{getPosition:function(){return ee(e,r.playState)},play:function(o){var s,c=!1,u=!1,l=1;if("number"==typeof o)s=o;else if(o){s=o.fromPosition;var d=o.loop;c=void 0===d?c:d;var p=o.overwrite;u=void 0===p?u:p;var h=o.playbackRate;l=void 0===h?l:h}var f=e.createBufferSource();f.buffer=i,f.playbackRate.value=l;var g=e.createGain();f.connect(g),g.connect(e.destination);var m=null!=s?s:ee(e,a);f.start(void 0,m),f.loop=c,f.onended=function(){var e;if(t[n]){var r=t[n].data;"then"in r||!1!==(null===(e=r.playState)||void 0===e?void 0:e.isPaused)||delete r.playState}};var v=a&&!a.isPaused;v&&!u||(a&&v&&(a.sample.onended=null,a.sample.stop()),r.playState={playTime:e.currentTime,sample:f,alreadyPlayedTime:m,isPaused:!1,gainNode:g})},pause:function(){a&&!a.isPaused&&(a.sample.stop(),r.playState=Object.assign({},a,{alreadyPlayedTime:ee(e,a),isPaused:!0}))},getStatus:function(){return r.playState&&!1===r.playState.isPaused?"playing":"paused"},getDuration:function(){return i.duration},getVolume:function(){return r.playState?r.playState.gainNode.gain.value:1},setVolume:function(e){var t=r.playState;t&&e>=0&&e<=1&&(t.gainNode.gain.value=e)}}}}function ee(e,t){return t?t.isPaused?t.alreadyPlayedTime:(e.currentTime-t.playTime)*t.sample.playbackRate.value+t.alreadyPlayedTime:0}function te(){return{get:function(e,t){fetch(e).then((function(e){return e.json()})).then(t)},post:function(e,t,n){fetch(e,{method:"POST",body:JSON.stringify(t)}).then((function(e){return e.json()})).then(n)},put:function(e,t,n){fetch(e,{method:"PUT",body:JSON.stringify(t)}).then((function(e){return e.json()})).then(n)},delete:function(e,t){fetch(e,{method:"DELETE"}).then((function(e){return e.json()})).then(t)}}}function ne(){return{getItem:(t=Object(x.a)(S.a.mark((function e(t){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",localStorage.getItem(t));case 1:case"end":return e.stop()}}),e)}))),function(e){return t.apply(this,arguments)}),setItem:(e=Object(x.a)(S.a.mark((function e(t,n){return S.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(null!==n){e.next=3;break}return localStorage.removeItem(t),e.abrupt("return");case 3:localStorage.setItem(t,n);case 4:case"end":return e.stop()}}),e)}))),function(t,n){return e.apply(this,arguments)})};var e,t}function re(){return{copy:function(e,t){navigator.clipboard?navigator.clipboard.writeText(e).then((function(){t()})).catch((function(e){t(e)})):t(new Error(window.isSecureContext?"Couldn't access clipboard":"Clipboard only available on HTTPS or localhost"))}}}function ie(){if("ontouchstart"in window||window.DocumentTouch&&document instanceof window.DocumentTouch)return!0;return window.matchMedia("(touch-enabled),(-webkit-touch-enabled),(-moz-touch-enabled),(-o-touch-enabled),(-ms-touch-enabled)").matches}var ae={family:"sans-serif",size:12};function oe(e,t,n){var r=t||{},i=r.dimensions,a=void 0===i?"game-coords":i,o=r.canvas,s=r.nativeSpriteMap,c=void 0===s?{}:s,u=r.windowSize,l=r.statsBegin,d=r.statsEnd,p=o||document.createElement("canvas");o||document.body.appendChild(p);var h=window.PointerEvent?"pointerdown":"touchstart",f=window.PointerEvent?"pointermove":"touchmove",g=window.PointerEvent?"pointerup":"touchend",m=window.PointerEvent?"pointercancel":"touchcancel",v=p.getContext("2d",{alpha:!1}),y=new(window.AudioContext||window.webkitAudioContext),w=!0,b=!0,S=0,x=!1,E=0,j=0,P=function(){document.hidden&&b&&(E=S,y.suspend()),document.hidden||b||(x=!0,setTimeout((function(){y.suspend(),setTimeout((function(){y.resume()}),75)}),75)),b=!document.hidden};document.addEventListener("keydown",(function(e){w&&!e.repeat&&Y(e)}),!1),document.addEventListener("keyup",(function(e){w&&A(e)}),!1),document.addEventListener("visibilitychange",P,!1),window.addEventListener("resize",V,!1);var T,O,C,L,R,X,F=function(){return V({didScroll:!0})};window.addEventListener("scroll",F,!1),document.addEventListener("contextmenu",(function(e){e.preventDefault()}));var U={didResize:!1,scale:1,gameXToPlatformX:function(e){return e},gameYToPlatformY:function(e){return e}};function V(t){var n=Boolean(t&&"cleanup"in t&&t.cleanup),r=Boolean(t&&"didScroll"in t&&t.didScroll);if(!T||(v.restore(),document.removeEventListener(h,O),document.removeEventListener(f,C),document.removeEventListener(g,L),document.removeEventListener(m,R),!n)){r&&T||(ue.size=K((null==u?void 0:u.width)||window.innerWidth,(null==u?void 0:u.height)||window.innerHeight,a,e.props.size)),p.width=ue.size.deviceWidth,p.height=ue.size.deviceHeight;var i=e.props.defaultFont||ae,o=J(v,ue.size,$,i);X=o.scale,ce.newFrame=o.render.newFrame,ce.startRenderSprite=o.render.startRenderSprite,ce.endRenderSprite=o.render.endRenderSprite,ce.renderTexture=o.render.renderTexture,U.gameXToPlatformX=function(e){var t=e.canvasOffsetLeft,n=e.widthMargin,r=e.scale,i=e.width;return function(e){return t+r*(e+i/2+n)}}({canvasOffsetLeft:p.offsetLeft,width:ue.size.width,widthMargin:ue.size.widthMargin,scale:X}),U.gameYToPlatformY=function(e){var t=e.canvasOffsetTop,n=e.heightMargin,r=e.scale,i=e.height;return function(e){return t-r*(e-i/2-n)}}({canvasOffsetTop:p.offsetTop,height:ue.size.height,heightMargin:ue.size.heightMargin,scale:X}),U.didResize=!0,U.scale=X;var s=function(e){var t=e.canvasOffsetLeft,n=e.scrollX,r=e.widthMargin,i=e.scale,a=e.width;return function(e){return(e.clientX-t+n)/i-r-a/2}}({canvasOffsetLeft:p.offsetLeft,scrollX:window.scrollX,width:ue.size.width,widthMargin:ue.size.widthMargin,scale:X}),c=function(e){var t=e.canvasOffsetTop,n=e.scrollY,r=e.heightMargin,i=e.scale,a=e.height;return function(e){return-(e.clientY-t+n)/i+r+a/2}}({canvasOffsetTop:p.offsetTop,scrollY:window.scrollY,height:ue.size.height,heightMargin:ue.size.heightMargin,scale:X}),l=function(e,t){return e>ue.size.width/2+ue.size.widthMargin||e<-ue.size.width/2-ue.size.widthMargin||t>ue.size.height/2+ue.size.heightMargin||t<-ue.size.height/2-ue.size.heightMargin};O=function(e){if("changedTouches"in e){w=!1;for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=s({clientX:n.screenX}),i=c({clientY:n.screenY});l(r,i)||(w=!0,D(r,i,n.identifier))}}else{var a=s(e),o=c(e);l(a,o)?w=!1:(w=!0,D(a,o,e.pointerId))}},C=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=s({clientX:n.screenX}),i=c({clientY:n.screenY});l(r,i)||B(r,i)}else{var a=s(e),o=c(e);l(a,o)||B(a,o)}},L=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++){var n=e.changedTouches[t],r=s({clientX:n.screenX}),i=c({clientY:n.screenY});l(r,i)?W(n.identifier):H(r,i,n.identifier)}else{var a=s(e),o=c(e);l(a,o)?W(e.pointerId):H(a,o,e.pointerId)}},R=function(e){if("changedTouches"in e)for(var t=0;t<e.changedTouches.length;t++)W(e.changedTouches[t].identifier);else W(e.pointerId)},document.addEventListener(h,O,!1),document.addEventListener(f,C,!1),document.addEventListener(g,L,!1),document.addEventListener(m,R,!1),T=ue.size}}var q={},$={},ee=function(e,t){return function(){throw Error("Failed to load "+e+' file "'+t+'"')}},oe=(null==n?void 0:n.fileFetch)||fetch,se={audioElements:q,imageElements:$,loadAudioFile:function(e){return function(e,t){return Z.apply(this,arguments)}(y,oe(e)).then((function(e){return{buffer:e,volume:1}})).catch(ee("audio",e))},loadImageFile:function(e){return new Promise((function(t,n){var r=new Image;r.addEventListener("load",(function(){t(r)})),r.addEventListener("error",n),r.src=e})).catch(ee("image",e))},cleanupAudioFile:function(e){var t=q[e].data;!("then"in t)&&t.playState&&(t.playState.sample.onended=null,t.playState.sample.disconnect(),t.playState.sample.buffer=null)},cleanupImageFile:function(){return null}},ce={newFrame:function(){return null},startRenderSprite:function(){return null},endRenderSprite:function(){return null},renderTexture:function(){return null}},ue=function(e,t,n,r){return Object.assign({isTouchScreen:ie(),log:console.log,random:Math.random,timer:Q(),audio:_(e,n.audioElements),assetUtils:n,network:te(),storage:ne(),alert:{ok:function(e,t){alert(e),null==t||t()},okCancel:function(e,t){t(confirm(e))}},clipboard:re(),size:t,now:function(){return new Date}},r)}(y,K((null==u?void 0:u.width)||window.innerWidth,(null==u?void 0:u.height)||window.innerHeight,a,e.props.size),se,(null==n?void 0:n.device)||{}),le={mutDevice:ue,getInputs:N,render:ce};V();var de=!1,pe=function e(){document.removeEventListener("keydown",e,!1),document.removeEventListener(h,e,!1),"suspended"===y.state&&y.resume(),y.onstatechange=function(){"suspended"!==y.state||document.hidden||y.resume()}};document.addEventListener("keydown",pe,!1),document.addEventListener(h,pe,!1);var he=function(e,t,n,r){var i=function(e){return{x:e.x,y:e.y}},a=e.mutDevice,o=e.getInputs,s=I(n,a,(function(){return o(i)}),0,n.props.id),c=r||n.props.size,u=z(a.size,c),l=0,d=0;M(s,n.props,a,o,i,!0,u,0,n.props.id,t,e.render);var p={newFrame:function(){return null},startRenderSprite:function(){return null},endRenderSprite:function(){return null},renderTexture:function(){return null}};return{runNextFrame:function(r,u){var h=r-l;l=r,d+=h;for(var f=Math.floor(d/k);f>0;){f--;var g=(d-=k)/k,m=z(a.size,c),v=0===f?e.render:p;v.newFrame(),M(s,n.props,a,o,i,!1,m,g,n.props.id,t,v),u()}}}}(le,{nativeSpriteMap:c,nativeSpriteUtils:U},e).runNextFrame,fe=null;return function e(){null==d||d(),window.requestAnimationFrame((function(t){de||(null==l||l(),null===fe&&(fe=t-1/60),x&&(x=!1,j+=t-E),S=t,he(t-fe-j,G),e())}))}(),{cleanup:function(){p.width=p.width,o||document.body.removeChild(p),de=!0,document.removeEventListener("keydown",Y,!1),document.removeEventListener("keyup",A,!1),document.removeEventListener("visibilitychange",P,!1),window.removeEventListener("resize",V,!1),window.removeEventListener("scroll",F,!1),V({cleanup:!0})},audioElements:q,imageElements:$,audioContext:y}}function se(e){var t=e.Game,n=e.gameProps,a=e.showReload,o=function(){var e=Object(r.useRef)(null),t=Object(r.useState)(null),n=t[0],i=t[1],a=function(){i(e.current.getBoundingClientRect())};Object(r.useEffect)((function(){return window.addEventListener("resize",a,!1),function(){return window.removeEventListener("resize",a,!1)}}),[]);var o=Object(r.useCallback)((function(t){null!==t&&(e.current=t,a())}),[]);return Object(r.useEffect)((function(){document.getElementById("iphone-img").onload=function(){a()}}),[]),[n,o]}(),s=o[0],c=o[1],u=Object(r.useState)(0),l=u[0],d=u[1],p=0,h=0,f=0;if(s&&s.height&&s.width){var g=375/667;s.width/s.height>g?(h=s.height*(667/900),p=h*g):(p=s.width*(375/460),h=p/g);var v=n.size.maxHeightMargin?0:.08*h;f=(s.height-h)/2+v}return Object(r.useEffect)((function(){if(p&&h){var e=document.getElementById("myCanvas"),r=oe(t(n),{dimensions:"scale-up",canvas:e,windowSize:{width:p,height:h}}).cleanup;return function(){r()}}}),[p,h,l]),i.a.createElement(i.a.Fragment,null,i.a.createElement("div",{ref:c,style:{height:"100%",width:"100%",display:"flex",justifyContent:"center"}},i.a.createElement("img",{id:"iphone-img",style:{userSelect:"none",objectFit:"contain",maxHeight:"100%"},src:"/img/iPhone8-Portrait-SpaceGray.png"})),a&&i.a.createElement("img",{className:m.a.refresh,src:"/img/reload.svg",width:20,height:20,onClick:function(){return d((function(e){return e+1}))}}),i.a.createElement("canvas",{id:"myCanvas",style:{position:"absolute",marginTop:f},width:p,height:h}))}function ce(e){var t=e.part,n=e.MDXContent,r=e.codesTs,c=e.codesJs,u=e.Game,l=e.gameProps,d=e.image,p=e.isEnd,h=r&&c,f=u&&l?i.a.createElement(s.a,{fallback:i.a.createElement("div",null,"Preview")},(function(){return i.a.createElement(se,{Game:u,gameProps:l,showReload:h})})):i.a.createElement("div",null,i.a.createElement("img",{src:d}));return i.a.createElement(a.a,{title:"Tutorial - Part "+t,noFooter:!0},i.a.createElement("div",{style:{display:"flex",minWidth:1024,height:"calc(100vh - 60px)"}},i.a.createElement("div",{style:{flex:"1",overflow:"auto",padding:16,borderRight:"1px solid #ededed"}},i.a.createElement(n,null),i.a.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},t>1?i.a.createElement(o.a,{to:"/tutorial/"+(t-1)},"Back"):i.a.createElement("div",null),p?i.a.createElement("div",null):i.a.createElement(o.a,{to:"/tutorial/"+(t+1)},"Next"))),h?i.a.createElement(i.a.Fragment,null,i.a.createElement("div",{style:{flex:"1",overflow:"auto",borderRight:"1px solid #ededed"}},i.a.createElement(v,{codesTs:r,codesJs:c})),i.a.createElement("div",{style:{flex:"1",display:"flex",justifyContent:"center"}},f)):i.a.createElement("div",{style:{flex:"2",display:"flex",justifyContent:"center"}},f)))}},175:function(e,t,n){"use strict";function r(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function i(e,t){var n;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return r(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?r(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var i=0;return function(){return i>=e.length?{done:!0}:{done:!1,value:e[i++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}return(n=e[Symbol.iterator]()).next.bind(n)}n.d(t,"a",(function(){return i}))},180:function(e,t,n){"use strict";n.d(t,"a",(function(){return g})),n.d(t,"b",(function(){return m}));var r=n(158),i=n(175),a=50,o=40,s=Object(r.a)({render:function(){return[r.b.image({testId:"bird",fileName:"/img/bird.png",width:a,height:o})]}}),c=40,u=Object(r.a)({render:function(e){var t=e.props,n=l(e.device.size,t.pipe.gapY),i=n.yUpperTop,a=n.yUpperBottom,o=n.yLowerTop,s=n.yLowerBottom;return[r.b.rectangle({color:"green",width:c,height:i-a,y:(i+a)/2}),r.b.rectangle({color:"green",width:c,height:o-s,y:(o+s)/2})]}});function l(e,t){return{yUpperTop:e.height/2+e.heightMargin,yUpperBottom:t+85,yLowerTop:t-85,yLowerBottom:-e.height/2-e.heightMargin}}var d=Object(r.a)({init:function(e){var t=e.device;return{birdY:10,birdGravity:-12,pipes:e.props.paused?[]:[p(t)],score:0}},loop:function(e){var t=e.props,n=e.state,r=e.getInputs,a=e.device;if(t.paused)return n;var o=r(),s=n.birdGravity,u=n.birdY,d=n.pipes,f=n.score;return u-=s+=.8,(o.pointer.justPressed||o.keysJustPressed[" "])&&(s=-12),d[d.length-1].x<140&&(d=[].concat(d,[p(a)]).filter((function(e){return e.x>-(a.size.width+a.size.widthMargin+c)}))),function(e,t,n){if(e-20<-(t.height/2+t.heightMargin)||e+20>t.height/2+t.heightMargin)return!0;for(var r,a=function(){var n=r.value;if(n.x>45||n.x<-45)return"continue";var i=l(t,n.gapY),a=i.yUpperTop,o=i.yUpperBottom,s=i.yLowerTop,u=i.yLowerBottom,d={x:n.x,y:(a+o)/2,width:c,height:a-o},p={x:n.x,y:(s+u)/2,width:c,height:s-u};return[{x:25,y:e+20},{x:25,y:e-20},{x:0,y:e+20},{x:0,y:e-20},{x:-25,y:e+20},{x:-25,y:e-20}].some((function(e){return h(e,d)||h(e,p)}))?{v:!0}:void 0},o=Object(i.a)(n);!(r=o()).done;){var s=a();if("continue"!==s&&"object"==typeof s)return s.v}return!1}(u,a.size,d)&&(a.audio("/audio/boop.wav").play(),t.gameOver(n.score)),{birdGravity:s,birdY:u,pipes:d=d.map((function(e){var t=e.passed;return!t&&e.x<-45&&(t=!0,f++),Object.assign({},e,{passed:t,x:e.x-2})})),score:f}},render:function(e){var t=e.state,n=e.device,i=n.size;return[r.b.rectangle({color:"#add8e6",width:i.width+2*i.widthMargin,height:i.height+2*i.heightMargin}),s({id:"bird",x:0,y:t.birdY,rotation:Math.max(-30,3*t.birdGravity-30)})].concat(t.pipes.map((function(e,t){return u({id:"pipe-"+t,pipe:e,x:e.x})})),[r.b.text({text:"Score: "+t.score,color:"white",x:-n.size.width/2+10,y:n.size.height/2+n.size.heightMargin-80,font:{align:"left"}})])}});function p(e){var t=(e.size.height+2*e.size.heightMargin-340)*(e.random()-.5);return{x:e.size.width+e.size.widthMargin+50,gapY:t,passed:!1}}function h(e,t){return e.x>t.x-t.width/2&&e.x<t.x+t.width/2&&e.y>t.y-t.height/2&&e.y<t.y+t.height/2}var f=Object(r.a)({render:function(e){var t=e.props,n=e.getInputs,i=e.device,a=n();return(a.pointer.justReleased||a.keysJustPressed[" "])&&t.start(),[r.b.text({text:i.isTouchScreen?"Tap to Start":"Click or Space Bar to Start",color:"white",y:100}),r.b.text({text:"High score: "+t.highScore,font:{family:"Courier",size:24},color:"white",y:150})]}}),g=Object(r.a)({init:function(e){var t=e.device,n=e.preloadFiles,r=e.updateState;return Promise.all([t.storage.getItem("highScore"),n({imageFileNames:["/img/bird.png"],audioFileNames:["/audio/boop.wav"]})]).then((function(e){var t=e[0];r((function(e){return Object.assign({},e,{view:"menu",highScore:Number(t||"0")})}))})),{view:"loading",attempt:0,highScore:0}},render:function(e){var t=e.state,n=e.updateState,i=e.device;if("loading"===t.view)return[r.b.text({color:"black",text:"Loading..."})];var a="menu"===t.view;return[d({id:"level-"+t.attempt,paused:a,gameOver:function(e){n((function(t){var n=t.highScore;return e>n&&(n=e,i.storage.setItem("highScore",String(n))),Object.assign({},t,{view:"menu",highScore:n})}))}}),a?f({id:"menu",highScore:t.highScore,start:function(){n((function(e){return Object.assign({},e,{view:"level",attempt:e.attempt+1})}))}}):null]}}),m={id:"Game",size:{width:400,height:600,maxHeightMargin:150},defaultFont:{family:"Helvetica",size:24}}},70:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return s})),n.d(t,"toc",(function(){return c})),n.d(t,"default",(function(){return l}));var r=n(3),i=n(7),a=(n(0),n(157)),o={},s={unversionedId:"tutorial/1",id:"tutorial/1",isDocsHomePage:!1,title:"1",description:"1 - Intro",source:"@site/docs/tutorial/1.md",slug:"/tutorial/1",permalink:"/docs/tutorial/1",editUrl:"https://github.com/edbentley/replay/edit/master/website/docs/tutorial/1.md",version:"current"},c=[],u={toc:c};function l(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h1",{id:"1---intro"},"1 - Intro"),Object(a.b)("p",null,"Welcome to the Replay tutorial!"),Object(a.b)("p",null,"We're going to explore how to build games with Replay by building ",Object(a.b)("em",{parentName:"p"},"Replay Bird"),". You can try playing it yourself on the right. By the end of this tutorial, you'll be equipped with all the knowledge you need to go out and make your own games using Replay."),Object(a.b)("p",null,"If you'd like to follow along, you can clone the replay-starter GitHub project in ",Object(a.b)("a",{parentName:"p",href:"https://github.com/edbentley/replay-starter-ts"},"TypeScript")," or ",Object(a.b)("a",{parentName:"p",href:"https://github.com/edbentley/replay-starter-js"},"JavaScript"),". Once complete, we can play it in the browser and on iOS!"),Object(a.b)("p",null,"Alternatively, you can develop online using CodeSandbox in ",Object(a.b)("a",{parentName:"p",href:"https://codesandbox.io/s/github/edbentley/replay-starter-ts"},"TypeScript")," or ",Object(a.b)("a",{parentName:"p",href:"https://codesandbox.io/s/github/edbentley/replay-starter-js"},"JavaScript"),"."))}l.isMDXComponent=!0}}]);