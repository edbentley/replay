// Swift 5.3 will support Package resources like a JS file
// https://github.com/apple/swift-evolution/blob/master/proposals/0271-package-manager-resources.md
// Until then, we'll just copy game.js as a string here

let gameJsString = """
var game=function(e){var t={};function o(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,o),n.l=!0,n.exports}return o.m=e,o.c=t,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(r,n,function(t){return e[t]}.bind(null,n));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=0)}([function(e,t,o){"use strict";function r(e){var t,o,r;return{x:e.x||0,y:e.y||0,rotation:e.rotation||0,opacity:Math.min(1,Math.max(0,null!==(t=e.opacity)&&void 0!==t?t:1)),scaleX:null!==(o=e.scaleX)&&void 0!==o?o:1,scaleY:null!==(r=e.scaleY)&&void 0!==r?r:1,anchorX:e.anchorX||0,anchorY:e.anchorY||0}}o.r(t),o.d(t,"gameProps",(function(){return i})),o.d(t,"Game",(function(){return s}));const n=e=>({type:"text",props:{testId:e.testId,...r(e),font:e.font,text:e.text,align:e.align||"center",color:e.color}}),a=e=>({type:"circle",props:{testId:e.testId,...r(e),radius:e.radius,color:e.color}});const i={id:"Game",size:{width:500,height:300,maxWidthMargin:50,maxHeightMargin:50},defaultFont:{name:"Arial",size:16}},s=(u={init:()=>({playerX:100,enemiesX:[]}),loop({state:e,device:t,updateState:o}){const{pointer:r}=t.inputs,n=e=>{o(t=>({...t,enemiesX:t.enemiesX.concat(e)}))};return r.justPressed&&(100===r.x?t.timeout(()=>{n(100)},50):101===r.x?n(1e3*t.random()):102===r.x?(t.network.get("/test",e=>{n(e.x)}),t.network.post("/test",{x:100},e=>{n(e.x)}),t.network.put("/test",{x:100},e=>{n(e.x)}),t.network.delete("/test",e=>{n(e.x)})):103===r.x?n(t.now().getSeconds()):104===r.x?t.audio("sound.wav").play():105===r.x?t.audio("sound.wav").play(20):106===r.x?t.audio("sound.wav").play(0,!0):107===r.x?t.audio("sound.wav").pause():108===r.x?n(t.audio("sound.wav").getPosition()):109===r.x?t.log("Hello Replay!"):110===r.x?t.log(t.storage.getStore().testKey):111===r.x?t.storage.setStore({testKey:"testValue"}):112===r.x?t.alert.ok("Ok?",()=>{t.log("It's ok")}):113===r.x&&t.alert.okCancel("Ok or cancel?",e=>{t.log("Was ok: "+e)})),{...e,playerX:e.playerX+(t.inputs.pointer.pressed?1:0)}},render:({state:e,device:t})=>[t.inputs.pointer.pressed?null:l({id:"native"}),n({x:-100,font:{name:"serif",size:22},color:"red",text:"Test text"}),a({x:e.playerX,radius:10,color:"#0095DD"}),...e.enemiesX.map(e=>a({x:e,radius:10,color:"#0095DD"}))]},e=>({type:"custom",spriteObj:u,props:e}));var u;const l=(c="NativeSprite",e=>({type:"native",name:c,props:e}));var c}]);
"""
