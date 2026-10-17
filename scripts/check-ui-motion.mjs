import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createDialogMotion,settle} from '../dist/ui-motion.js';
let reduced=false;
globalThis.matchMedia=()=>({matches:reduced});
globalThis.getComputedStyle=element=>element.displayed;
function panel(){return{dataset:{},displayed:{opacity:'.43',transform:'matrix(1,0,0,1,0,7)'},animations:[],animate(frames,options){let resolve,reject;const a={frames,options,finished:new Promise((yes,no)=>{resolve=yes;reject=no}),finish:()=>resolve(),cancel:()=>reject(new Error('cancelled'))};this.animations.push(a);return a}}}
const flush=async()=>{await Promise.resolve();await Promise.resolve()};
const el=panel(),motion=createDialogMotion(el);let closed=0;
motion.arrive();const arrival=el.animations[0];
motion.depart(()=>closed++);const departure=el.animations[1];
assert.deepEqual(departure.frames[0],el.displayed,'Closing during arrival continues from its visible frame');
arrival.finish();await flush();assert.equal(closed,0,'Cancelled arrival cannot complete the newer action');
departure.finish();await flush();assert.equal(closed,1);assert.equal(el.dataset.motionPhase,'idle');
motion.arrive();motion.depart(()=>closed++);const stale=el.animations.at(-1);motion.arrive();stale.finish();await flush();assert.equal(closed,1,'Reopening invalidates an old close');
el.animations.at(-1).finish();await flush();assert.equal(el.dataset.motionPhase,'idle');
reduced=true;const n=el.animations.length;motion.arrive();motion.depart(()=>closed++);assert.equal(el.animations.length,n,'Reduced motion creates no animation');assert.equal(closed,2);
reduced=false;motion.arrive();motion.depart(()=>closed++,true);await flush();assert.equal(closed,3,'Hidden-tab cleanup does not wait for a suspended animation');
assert.equal(settle(-1),0);assert.equal(settle(2),1);assert.equal(settle(.5),.5);
function scrollHarness(){
 let now=0,id=0,position=150;const frames=new Map(),handlers=new Map(),moves=[];
 const window={addEventListener:(name,fn)=>handlers.set(name,fn)};
 const ctx={settle,window,document:{documentElement:{scrollHeight:4000},addEventListener:(name,fn)=>handlers.set(name,fn)},innerHeight:800,performance:{now:()=>now},matchMedia:()=>({matches:reduced}),scrollTo:({top})=>{position=top;moves.push(top)},requestAnimationFrame:fn=>(frames.set(++id,fn),id),cancelAnimationFrame:id=>frames.delete(id)};
 Object.defineProperty(ctx,'scrollY',{get:()=>position});vm.createContext(ctx);
 vm.runInContext(fs.readFileSync('dist/scroll-motion.js','utf8').replace(/^import .*\n/,'').replace(/export /g,''),ctx);
 return{go:ctx.scrollToPosition,frames,moves,event:(name,e={})=>handlers.get(name)?.(e),step(ms){now+=ms;for(const [key,fn]of [...frames]){frames.delete(key);fn(now)}}};
}
for(const event of ['wheel','touchstart','pointerdown','pagehide','keydown']){
 const h=scrollHarness();h.go(1800);h.step(180);const previous=h.moves.at(-1);assert.ok(previous>150&&previous<1800);
 h.event(event,{key:'ArrowDown'});h.step(2000);assert.equal(h.moves.at(-1),previous,`${event} gives control back without a final jump`);assert.equal(h.frames.size,0);
}
const scroll=scrollHarness();scroll.go(9999);scroll.step(1200);assert.equal(scroll.moves.at(-1),3200,'Destination clamps to actual page height');assert.equal(scroll.frames.size,0);
scroll.go(1000);scroll.step(100);scroll.go(800);scroll.step(1200);assert.equal(scroll.moves.at(-1),800,'The latest navigation replaces the previous destination');
reduced=true;scroll.go(900);assert.equal(scroll.moves.at(-1),900);assert.equal(scroll.frames.size,0);
console.log('UI motion passed: interrupted opening/closing, stale callbacks, reduced motion, hidden-tab cleanup, native input takeover, bounds and latest navigation.');
// Rapid Next/Previous is relative to the requested song, even during its audio tail.
const fades=[],played=[];
const media={paused:false,src:'a.mp3',pause(){this.paused=true}};
const music={request:0,pauseRequested:false,songIndex:0,index:0,mode:'music',audio:media,video:{paused:true},songs:['a','b','c'].map(id=>({id,audio:id+'.mp3'})),videos:[],sync(){},play(){played.push(media.src)},fadeMedia:()=>new Promise(resolve=>fades.push(resolve))};
vm.createContext(music);
const playerSource=fs.readFileSync('dist/studio-player.js','utf8');
vm.runInContext(playerSource.slice(playerSource.indexOf(' async function chooseSong'),playerSource.indexOf(' async function setMode')),music);
const first=music.chooseSong('b');music.advance(1);music.advance(-1);
assert.equal(music.songIndex,1,'b → Next → Previous selects b without waiting for playback');
for(const resolve of fades)resolve();await flush();await first;
assert.deepEqual(played,['b.mp3'],'Superseded selections cannot start obsolete audio');
// Clearing OrbitControls momentum cannot kick the camera before its next journey.
const vector=value=>({value,clone(){return vector(this.value)},copy(other){this.value=other.value;return this}});
const cameraState={camera:{position:vector(10)},controls:{target:vector(4),autoRotate:true,enableDamping:true,update(){cameraState.camera.position.value+=3;if(!this.enableDamping)this.update=()=>{}}}};
vm.createContext(cameraState);const studio=fs.readFileSync('dist/studio.js','utf8');
vm.runInContext(studio.slice(studio.indexOf(' function stopOrbit()'),studio.indexOf(' function frameStudio()')),cameraState);
cameraState.stopOrbit();assert.equal(cameraState.camera.position.value,10);assert.equal(cameraState.controls.target.value,4);assert.equal(cameraState.controls.autoRotate,false);
console.log('Rapid media selection and camera momentum handoff passed.');
