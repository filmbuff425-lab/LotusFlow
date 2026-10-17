import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real modules, including the asynchronous first gesture and
// foreground-media rules. No browser or external package is needed.
function environment({failFetch=0,failPlay=0,hangPlay=0,preloaded=false}={}){
 const nodes=[],contexts=[],sources=[],intervals=[],order=[],timeouts=new Map();let timerId=0,clock=1000;
 const listeners=()=>({handlers:new Map(),addEventListener(name,fn){const list=this.handlers.get(name)||[];list.push(fn);this.handlers.set(name,list)},async emit(name,event={}){for(const fn of this.handlers.get(name)||[])await fn(event)}});
 function element(tag){const e={...listeners(),tagName:tag.toUpperCase(),dataset:{},attributes:{},children:[],paused:true,muted:false,volume:1,currentTime:0,error:null,setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]??null},append(el){this.children.push(el)},matches(){return false},closest(){return null},querySelectorAll(){return[]},contains(){return false},pause(){this.paused=true},async play(){order.push('media.play');if(hangPlay-->0)return new Promise(()=>{});if(failPlay-->0)throw new Error('Gesture required');this.paused=false}};nodes.push(e);return e}
 const stage=element('section'),body=element('body'),host=element('div');host.id='studio-canvas';
 if(preloaded)for(const [id,path] of [['lotus-ambience','space-exploration-soft.m4a'],['cube-heart-audio','cube-heart.wav']]){const media=element('audio');media.id=id;media.isConnected=true;let src='http://localhost/assets/audio/'+path;media.sourceAssignments=0;Object.defineProperty(media,'src',{get:()=>src,set(value){src=value;this.sourceAssignments++}})}
 const document={...listeners(),body,hidden:false,createElement:element,getElementById:id=>nodes.find(e=>e.id===id),querySelector(s){return s==='#studio-stage'?stage:null},querySelectorAll(s){return s.includes('audio')?nodes.filter(e=>['AUDIO','VIDEO'].includes(e.tagName)&&(!s.includes('not([data-ambient])')||!e.dataset.ambient)&&(!s.includes('not([data-heartbeat])')||!e.dataset.heartbeat)):[]}};
 const window={...listeners(),lotusSession:{audioState:{playing:false}}};
 window.dispatchEvent=e=>{for(const fn of window.handlers.get(e.type)||[])fn(e);return true};
 let intersection;
 function node(){return {connect(next){return next},disconnect(){},gain:{value:0,setValueAtTime(v){this.value=v},setTargetAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},setValueCurveAtTime(){},cancelScheduledValues(){},cancelAndHoldAtTime(){},exponentialRampToValueAtTime(v){this.value=v}},frequency:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},pan:{value:0},threshold:{},knee:{},ratio:{}}}
 class AudioContext{
  constructor(){Object.assign(this,listeners());this.state='suspended';this.currentTime=1;this.sampleRate=22050;this.destination=node();contexts.push(this)}
  async resume(){order.push('context.resume');this.state='running';await this.emit('statechange');order.push('context.resumed')}
  async suspend(){this.state='suspended';await this.emit('statechange')}
  async decodeAudioData(){return {duration:.82}}
  createGain(){return node()}
  createStereoPanner(){return node()}
  createBiquadFilter(){return {...node(),Q:{value:0}}}
  createOscillator(){return {...node(),start(){},stop(){}}}
  createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)}}
  createDynamicsCompressor(){return node()}
  createMediaElementSource(){return node()}
  createAnalyser(){return {...node(),fftSize:512,getFloatTimeDomainData(a){a.fill(.02)}}}
  createBufferSource(){const n={...node(),start(){order.push('source.start');sources.push(this)},stop(){this.stopped=true}};return n}
 }
 window.AudioContext=AudioContext;
 const storage={getItem(){return null},setItem(){}};
 const context={window,document,URL,URLSearchParams,CustomEvent:class{constructor(type,options={}){this.type=type;this.detail=options.detail}},location:{search:"",origin:"http://localhost"},Float32Array,console,localStorage:storage,sessionStorage:storage,performance:{now:()=>clock},MutationObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){intersection=fn}observe(){}},fetch:async()=>{if(failFetch-->0)return{ok:false};return{ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}},setInterval(fn){intervals.push(fn);return intervals.length},clearInterval(){},setTimeout(fn,delay){timeouts.set(++timerId,{fn,delay});return timerId},clearTimeout:id=>timeouts.delete(id),innerWidth:1000,addEventListener:window.addEventListener.bind(window)};
 vm.createContext(context);
 return{nodes,contexts,sources,intervals,order,document,window,context,stage,host,timeouts,setTime:time=>clock=time,visible(v){intersection([{isIntersecting:v}])},load(file){let code=fs.readFileSync('dist/'+file,'utf8');if(file==='interaction-sound.js'){vm.runInContext(fs.readFileSync('dist/water-surface.js','utf8').replace('export function','function'),context);vm.runInContext(fs.readFileSync('dist/air-sound.js','utf8').replace('export function','function'),context);code=code.replace(/^import .*?;\n/gm,'')}code=code.replaceAll('import.meta.url',JSON.stringify('http://localhost/'+file)).replaceAll('export async function','async function').replaceAll('export function','function');vm.runInContext('"use strict";\n'+code,context)},call(code){return vm.runInContext(code,context)}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

const h=environment({failPlay:1});h.load('cube-heartbeat.js');h.visible(true);await flush();
const heart=h.nodes.find(e=>e.className?.includes('cube-sound-toggle'));
const beat=h.nodes.find(e=>e.dataset.heartbeat);
const count=()=>Number(heart.dataset.heartbeatPlays||0);
const step=async t=>{h.call(`updateHeartbeat(${t},1)`);await flush()};
const finishFade=()=>{for(let i=0;i<8;i++)h.intervals.at(-1)?.()};
const bed=h.document.createElement('audio');bed.dataset.ambient='true';bed.paused=false;
await h.document.emit('pointerdown',{target:heart});assert.equal(beat.paused,true,'First heartbeat toggle gesture must not pre-arm and invert its click');
await heart.emit('click');assert.equal(heart.textContent,'HEARTBEAT / ON');assert.equal(h.contexts.length,0,'Heartbeat does not depend on Web Audio');
await step(.17);assert.equal(count(),1,'Ambient music must not silence heartbeat');
await step(.4);await step(1.8);assert.equal(count(),1,'One paired audio source per visual cycle');
await step(2.02);assert.equal(count(),2,'Paired pulse repeats every 1.85 seconds');
const song=h.document.createElement('audio');song.paused=false;
await h.window.emit('lotus-audio-start');finishFade();assert.equal(beat.paused,true);
await step(3.87);assert.equal(count(),2,'Audible songs take priority');
song.volume=0;await step(5.72);assert.equal(count(),3,'Zero-volume preview must not silence heartbeat');
song.paused=true;h.window.lotusSession.audioState.playing=true;
await step(7.57);assert.equal(count(),3,'Web Audio mixer also takes priority');
h.window.lotusSession.audioState.playing=false;
await heart.emit('click');finishFade();await step(9.42);assert.equal(count(),3);assert.equal(heart.textContent,'HEARTBEAT / OFF');assert.equal(bed.paused,false,'Heartbeat has an independent mute');
await heart.emit('click');await step(11.27);assert.equal(count(),4);
await h.window.emit('lotus-room-change',{detail:true});finishFade();assert.equal(heart.hidden,true);assert.equal(beat.paused,true);
await step(13.12);assert.equal(count(),4,'No heartbeat inside the open studio');
await h.window.emit('lotus-room-change',{detail:false});await step(14.97);assert.equal(count(),5,'Returning to cube restores its heartbeat');
h.call('updateHeartbeat(15,.9)');finishFade();assert.equal(beat.paused,true,'Opening animation fades the heartbeat');
h.visible(false);await step(16.82);assert.equal(count(),5);
h.visible(true);h.document.hidden=true;await h.document.emit('visibilitychange');await step(18.67);assert.equal(count(),5);
h.document.hidden=false;await h.document.emit('visibilitychange');await step(20.52);assert.equal(count(),6);
const retry=environment({failPlay:1});retry.load('cube-heartbeat.js');retry.visible(true);await flush();assert.equal(retry.nodes.find(e=>e.dataset.heartbeat).paused,true);await retry.call('armHeartbeat()');retry.call('updateHeartbeat(.17,1)');await flush();assert.equal(retry.nodes.find(e=>e.className?.includes('cube-sound-toggle')).dataset.heartbeatPlays,'1','Failed heartbeat unlock must recover on the next gesture');

await h.window.emit('lotus-effects-change',{detail:false});finishFade();await step(22.37);assert.equal(count(),6,'Global sound off must also silence heartbeat');
const a=environment({failPlay:1});a.load('interaction-sound.js');await flush();
const sound=a.nodes.find(e=>e.className==='interaction-sound-toggle'),ambient=a.nodes.find(e=>e.dataset.ambient);
assert.equal(sound.textContent,'SOUND / ENABLE','No false ON before audio is unlocked');
await a.document.emit('pointerdown',{target:sound});assert.equal(a.contexts.length,0);
assert.equal(sound.dataset.ambienceState,'needs-gesture');assert.equal(sound.textContent,'SOUND / ENABLE','Blocked arrival play must not report ON');
await sound.emit('click');assert.equal(ambient.paused,false);assert.equal(sound.textContent,'SOUND / ON');
assert.ok(a.order.indexOf('media.play')>=0&&a.order.indexOf('media.play')<a.order.indexOf('context.resumed'),'Both unlock operations begin in the gesture');
const subtleBed=()=>assert.ok(ambient.volume>.10&&ambient.volume<.13,'Ambient level stays quiet after its fade');
for(let i=0;i<160;i++)a.intervals[0]();subtleBed();ambient.currentTime=2.5;a.intervals[0]();assert.equal(sound.dataset.ambienceProgress,'2.500');
const companion=a.document.createElement('audio');companion.dataset.heartbeat='true';companion.paused=false;for(let i=0;i<160;i++)a.intervals[0]();subtleBed();
const foreground=a.document.createElement('video');foreground.paused=false;
for(let i=0;i<160;i++)a.intervals[0]();assert.ok(ambient.volume<.017,'Music ducks the ambience instead of stopping its loop');
foreground.muted=true;for(let i=0;i<160;i++)a.intervals[0]();subtleBed();
a.window.lotusIdentityAudio={playing:true};for(let i=0;i<160;i++)a.intervals[0]();assert.ok(ambient.volume<.017,'Identity score also ducks the ambient bed');
a.window.lotusIdentityAudio.playing=false;
a.window.dispatchEvent(new a.context.CustomEvent('lotus-room-change',{detail:true}));assert.equal(sound.dataset.airCue,'studio-wind','Wind starts on the actual camera entrance event');
assert.equal(a.window.lotusSfx.play('seam-air'),true);assert.equal(sound.dataset.airDesign,'unpitched-soft-breath');
assert.equal(a.window.lotusSfx.play('archive-invite'),true,'Discography has its own quiet invitation');
assert.equal(sound.dataset.lastCue,'archive-invite');
foreground.muted=false;assert.equal(a.window.lotusSfx.play('archive-invite'),false,'The invitation must not interrupt music');foreground.muted=true;
let scoreEnabled=true;a.window.addEventListener('lotus-effects-change',e=>{scoreEnabled=e.detail});
await sound.emit('click');for(let i=0;i<160;i++)a.intervals[0]();assert.equal(ambient.paused,true);assert.equal(sound.textContent,'SOUND / OFF');
assert.equal(scoreEnabled,false,'The global sound switch tells the Identity score to stop');
assert.equal(a.window.lotusSfx.play('archive-invite'),false,'Discography honors global mute');
const mutedSources=a.sources.length;assert.equal(a.window.lotusSfx.play('seam-air',{performanceAction:true}),false);assert.equal(a.sources.length,mutedSources,'The opening hint cannot bypass the visitor’s mute preference');
await sound.emit('click');assert.equal(ambient.paused,false);assert.equal(sound.textContent,'SOUND / ON');
a.document.hidden=true;await a.document.emit('visibilitychange');assert.equal(ambient.paused,true);assert.equal(a.contexts[0].state,'suspended');
a.document.hidden=false;await a.document.emit('visibilitychange');await flush();assert.equal(ambient.paused,false);assert.equal(a.contexts[0].state,'running');
const embedded=environment();let parentUnlocks=0,parentCues=0;
embedded.context.location={origin:'http://localhost',search:'?embed=1'};
embedded.window.parent={location:{origin:'http://localhost'},lotusSfx:{enabled:true,arm(){parentUnlocks++},play(){parentCues++}}};
embedded.load('interaction-sound.js');
assert.ok(!embedded.nodes.some(e=>e.dataset.ambient),'Embedded CD must not create a second ambient bed');
await embedded.document.emit('pointerdown');embedded.window.lotusSfx.play('case-open');
assert.equal(parentUnlocks,1);assert.equal(parentCues,1,'Embedded interactions use the page sound channel');
const motion=environment({failPlay:2});motion.load('cube-heartbeat.js');motion.visible(true);await flush();motion.load('interaction-sound.js');await flush();
const motionBed=motion.nodes.find(e=>e.dataset.ambient),motionHeart=motion.nodes.find(e=>e.dataset.heartbeat);
assert.equal(motionBed.paused,true);assert.equal(motionHeart.paused,true);
await motion.document.emit('pointermove',{pointerType:'touch'});await flush();assert.equal(motionBed.paused,true,'Touch scrolling is not a mouse-movement start');
await motion.document.emit('pointermove',{pointerType:'mouse'});await flush();assert.equal(motionBed.paused,false);assert.equal(motionHeart.paused,false,'Mouse movement also starts heartbeat when playback is permitted');
const motionPlays=motion.order.filter(x=>x==='media.play').length;
await motion.document.emit('pointermove',{pointerType:'mouse'});await flush();assert.equal(motion.order.filter(x=>x==='media.play').length,motionPlays,'Movement must not restart or layer the sounds');
const denied=environment({failPlay:100});denied.load('interaction-sound.js');await flush();
await denied.document.emit('pointermove',{pointerType:'mouse'});await flush();
assert.equal(denied.nodes.find(e=>e.className==='interaction-sound-toggle').textContent,'SOUND / ENABLE','Movement must not claim to override browser autoplay restrictions');
assert.equal(denied.order.filter(x=>x==='media.play').length,2);
await denied.document.emit('pointermove',{pointerType:'mouse'});await flush();assert.equal(denied.order.filter(x=>x==='media.play').length,2,'Blocked movement must not repeatedly retry every frame');
const off=environment();off.load('interaction-sound.js');await flush();await off.nodes.find(e=>e.className==='interaction-sound-toggle').emit('click');
const offPlays=off.order.filter(x=>x==='media.play').length;await off.document.emit('pointermove',{pointerType:'mouse'});await flush();assert.equal(off.order.filter(x=>x==='media.play').length,offPlays,'Movement respects sound off');
console.log('Audio regression checks passed: ambience + paired heartbeat, foreground priority, first-click unlock, retries, independent mutes, room exit/return and page visibility.');

const movement=environment({failPlay:2});movement.load('interaction-sound.js');movement.load('cube-heartbeat.js');movement.visible(true);await flush();
await movement.document.emit('pointermove',{pointerType:'mouse'});await flush();
assert.equal(movement.nodes.find(e=>e.dataset.ambient).paused,false,'Mouse movement alone retries the ambient recording');
assert.equal(movement.nodes.find(e=>e.dataset.heartbeat).paused,false,'The same movement starts the visible cube heartbeat');
assert.equal(movement.contexts.length,0,'Starting the two recordings does not initialize or wait for the effects graph');
console.log('Mouse-only ambience and heartbeat path passed; browser policy errors remain visible.');

const preloaded=environment({preloaded:true});preloaded.load('interaction-sound.js');preloaded.load('cube-heartbeat.js');preloaded.visible(true);await flush();
assert.ok(preloaded.nodes.filter(e=>e.id?.endsWith('audio')||e.id==='lotus-ambience').every(e=>e.sourceAssignments===0),'Reusing the HTML audio must not reset an already buffered source');
assert.equal(preloaded.host.dataset.ambientState,'playing');assert.equal(preloaded.host.dataset.heartbeatState,'playing');
const stalled=environment({hangPlay:2});stalled.load('interaction-sound.js');stalled.load('cube-heartbeat.js');stalled.visible(true);await flush();
assert.equal(stalled.host.dataset.ambientState,'starting');assert.equal(stalled.host.dataset.heartbeatState,'starting');
for(const timer of [...stalled.timeouts.values()])if(timer.delay===1800||timer.delay===2400)timer.fn();await flush();
assert.equal(stalled.host.dataset.ambientState,'unavailable');assert.equal(stalled.host.dataset.ambientError,'TimeoutError');assert.equal(stalled.host.dataset.heartbeatState,'unavailable');
stalled.setTime(4000);await stalled.document.emit('pointermove',{pointerType:'mouse'});await flush();
assert.equal(stalled.nodes.find(e=>e.dataset.ambient).paused,false,'A stalled ambient play releases the next mouse retry');
assert.equal(stalled.nodes.find(e=>e.dataset.heartbeat).paused,false,'A stalled heartbeat releases the next mouse retry');
assert.equal(stalled.contexts.length,0,'Recovering recordings never waits for a suspended effects context');
assert.equal(stalled.timeouts.size,0,'Successful recordings clear their pending timeout guards');
console.log('Startup audio checks passed: buffered HTML sources are preserved, stalled plays recover on movement, and diagnostics show actual playback state.');

const gated=environment();gated.document.documentElement={dataset:{soundEntry:'waiting'}};
gated.load('interaction-sound.js');gated.load('cube-heartbeat.js');gated.visible(true);await flush();
await gated.document.emit('pointermove',{pointerType:'mouse'});await gated.window.lotusSfx.arm();await flush();
assert.equal(gated.order.filter(event=>event==='media.play').length,0,'An approved entry gate blocks arrival, movement and incidental pointer unlocks');
gated.visible(false);gated.document.documentElement.dataset.soundEntry='starting';await gated.window.lotusSfx.arm();await flush();
assert.equal(gated.nodes.find(e=>e.dataset.ambient).paused,false);
assert.equal(gated.nodes.find(e=>e.dataset.heartbeat).paused,false,'The trusted gate click can start the heartbeat before the first studio intersection');
assert.equal(gated.host.dataset.ambientState,'playing');assert.equal(gated.host.dataset.heartbeatState,'playing');
console.log('Passive sound entry guards passed: no pre-click playback; one explicit start unlocks both recordings before graphics visibility.');
