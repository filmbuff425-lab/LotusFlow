import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Exercise the real modules, including the asynchronous first gesture and
// foreground-media rules. No browser or external package is needed.
function environment({failFetch=0,failPlay=0}={}){
 const nodes=[],contexts=[],sources=[],intervals=[],order=[];
 const listeners=()=>({handlers:new Map(),addEventListener(name,fn){const list=this.handlers.get(name)||[];list.push(fn);this.handlers.set(name,list)},async emit(name,event={}){for(const fn of this.handlers.get(name)||[])await fn(event)}});
 function element(tag){const e={...listeners(),tagName:tag.toUpperCase(),dataset:{},attributes:{},children:[],paused:true,muted:false,volume:1,currentTime:0,error:null,setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]??null},append(el){this.children.push(el)},matches(){return false},closest(){return null},querySelectorAll(){return[]},contains(){return false},pause(){this.paused=true},async play(){order.push('media.play');if(failPlay-->0)throw new Error('Gesture required');this.paused=false}};nodes.push(e);return e}
 const stage=element('section'),body=element('body');
 const document={...listeners(),body,hidden:false,createElement:element,querySelector(s){return s==='#studio-stage'?stage:null},querySelectorAll(s){return s.includes('audio')?nodes.filter(e=>['AUDIO','VIDEO'].includes(e.tagName)&&(!s.includes('not([data-ambient])')||!e.dataset.ambient)&&(!s.includes('not([data-heartbeat])')||!e.dataset.heartbeat)):[]}};
 const window={...listeners(),lotusSession:{audioState:{playing:false}}};
 window.dispatchEvent=e=>{for(const fn of window.handlers.get(e.type)||[])fn(e);return true};
 let intersection;
 function node(){return {connect(next){return next},disconnect(){},gain:{value:0,setValueAtTime(v){this.value=v},setTargetAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},setValueCurveAtTime(){},cancelAndHoldAtTime(){},exponentialRampToValueAtTime(v){this.value=v}},frequency:{value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},pan:{value:0},threshold:{},knee:{},ratio:{}}}
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
 const context={window,document,URL,URLSearchParams,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},location:{search:"",origin:"http://localhost"},Float32Array,console,localStorage:storage,sessionStorage:storage,performance:{now:()=>1000},MutationObserver:class{observe(){}},IntersectionObserver:class{constructor(fn){intersection=fn}observe(){}},fetch:async()=>{if(failFetch-->0)return{ok:false};return{ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}},setInterval(fn){intervals.push(fn);return intervals.length},clearInterval(){},setTimeout(){},innerWidth:1000,addEventListener:window.addEventListener.bind(window)};
 vm.createContext(context);
 return{nodes,contexts,sources,intervals,order,document,window,context,stage,visible(v){intersection([{isIntersecting:v}])},load(file){let code=fs.readFileSync('dist/'+file,'utf8');if(file==='interaction-sound.js'){vm.runInContext(fs.readFileSync('dist/water-surface.js','utf8').replace('export function','function'),context);vm.runInContext(fs.readFileSync('dist/air-sound.js','utf8').replace('export function','function'),context);code=code.replace(/^import .*?;\n/gm,'')}code=code.replaceAll('import.meta.url',JSON.stringify('http://localhost/'+file)).replaceAll('export async function','async function').replaceAll('export function','function');vm.runInContext(code,context)},call(code){return vm.runInContext(code,context)}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

const h=environment();h.load('cube-heartbeat.js');h.visible(true);
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
const retry=environment({failPlay:1});retry.load('cube-heartbeat.js');retry.visible(true);await retry.call('armHeartbeat()');assert.equal(retry.nodes.find(e=>e.dataset.heartbeat).paused,true);await retry.call('armHeartbeat()');retry.call('updateHeartbeat(.17,1)');await flush();assert.equal(retry.nodes.find(e=>e.className?.includes('cube-sound-toggle')).dataset.heartbeatPlays,'1','Failed heartbeat unlock must recover on the next gesture');

const a=environment({failPlay:1});a.load('interaction-sound.js');
const sound=a.nodes.find(e=>e.className==='interaction-sound-toggle'),ambient=a.nodes.find(e=>e.dataset.ambient);
assert.equal(sound.textContent,'SOUND / ENABLE','No false ON before audio is unlocked');
await a.document.emit('pointerdown',{target:sound});assert.equal(a.contexts.length,0);
await sound.emit('click');assert.equal(sound.dataset.ambienceState,'needs-gesture');assert.equal(sound.textContent,'SOUND / ENABLE','Blocked media play must not report ON');
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
let scoreEnabled=true;a.window.addEventListener('lotus-effects-change',e=>{scoreEnabled=e.detail});
await sound.emit('click');for(let i=0;i<160;i++)a.intervals[0]();assert.equal(ambient.paused,true);assert.equal(sound.textContent,'SOUND / OFF');
assert.equal(scoreEnabled,false,'The global sound switch tells the Identity score to stop');
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
console.log('Audio regression checks passed: ambience + paired heartbeat, foreground priority, first-click unlock, retries, independent mutes, room exit/return and page visibility.');
