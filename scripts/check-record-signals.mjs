import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createSignalPainter,signalStyle,signalPalette,mountRecordSignals} from '../dist/record-signals.js';

const events=()=>({listeners:new Map(),addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn)},removeEventListener(type,fn){this.listeners.get(type)?.delete(fn)},emit(type,event={}){for(const fn of this.listeners.get(type)||[])fn(event)}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function drawing(){
 const calls=[];return {calls,globalAlpha:1,globalCompositeOperation:'source-over',clearRect(){calls.length=0},createRadialGradient(){return{addColorStop(){}}},createLinearGradient(){return{addColorStop(){}}},fillRect(...args){calls.push({kind:'fill',args,colour:this.fillStyle,alpha:this.globalAlpha})},beginPath(){},closePath(){},moveTo(...args){calls.push({kind:'move',args})},lineTo(...args){calls.push({kind:'line',args})},stroke(){calls.push({kind:'stroke'})}};
}
const live={playing:true,ready:true,level:.12,spectrum:new Uint8Array(256).fill(76)};
const catalog={window:{lotusMedia:{}}};vm.runInNewContext(fs.readFileSync('dist/catalog-data.js','utf8'),catalog);
for(const track of catalog.window.lotusCatalog){
 assert.equal(signalStyle(track.id),track.id==='im-falling'?'prismatic-ring':'particle-ribbon');
 assert.ok(['ice','violet','rose','amber','mint','pearl'].includes(signalPalette(track.id)));
 const g=drawing(),painter=createSignalPainter({width:431,height:412,getContext:()=>g},signalStyle(track.id),signalPalette(track.id));
 painter.draw(live,1/60);const first=g.calls.map(c=>c.args);
 assert.ok(g.calls.every(c=>!c.args||c.args.every(Number.isFinite)),'Every rendered position is finite');
 if(track.id==='im-falling')assert.equal(g.calls.filter(c=>c.kind==='stroke').length,9,'The original optical ring remains layered');
 else{
  const particles=g.calls.filter(c=>c.kind==='fill'&&typeof c.colour==='string');
  assert.equal(particles.length,1900);assert.equal(new Set(particles.map(c=>c.colour)).size,3,'Each cover uses its three-tone complement');
  assert.ok(particles.some(c=>c.alpha>.2),'The ribbon includes clearly visible particles');
 }
 painter.draw(live,1/60);assert.notDeepEqual(g.calls.map(c=>c.args),first,'The material keeps folding and advecting while audio plays');
 painter.draw({...live,playing:false},1/60);assert.equal(g.calls.length,0,'Stopped audio clears every signal mark');
}
const quiet=drawing(),loud=drawing();createSignalPainter({width:400,height:400,getContext:()=>quiet},'particle-ribbon').draw({...live,level:0,spectrum:new Uint8Array(256)},1/60);createSignalPainter({width:400,height:400,getContext:()=>loud},'particle-ribbon').draw(live,1/60);assert.notDeepEqual(quiet.calls,loud.calls,'Actual sample level and spectrum deform the ribbon');

// Measure the actual painted grains at a 300px gallery card with a 1.5x
// backing store. Quiet passages must remain legible over detailed cover art.
const visible=drawing(),visiblePainter=createSignalPainter({width:450,height:432,getContext:()=>visible},'particle-ribbon');
for(let frame=0;frame<120;frame++)visiblePainter.draw({...live,level:.04},1/60);
const grains=visible.calls.filter(c=>c.kind==='fill'&&typeof c.colour==='string');
const cssWidths=grains.map(c=>c.args[2]/1.5).sort((a,b)=>a-b),alphaArea=grains.reduce((sum,c)=>sum+c.args[2]*c.args[3]*c.alpha,0)/(1.5*1.5);
assert.ok(cssWidths[Math.floor(cssWidths.length/2)]>.5&&cssWidths[Math.floor(cssWidths.length/2)]<1.2,'Fine grains remain subtle instead of a solid coloured sheet');
assert.ok(alphaArea>300*288*.002&&alphaArea<300*288*.018,'The ribbon keeps enough visible particle coverage during quiet playback');
assert.ok(grains.reduce((sum,c)=>sum+c.alpha,0)/grains.length>.15&&grains.reduce((sum,c)=>sum+c.alpha,0)/grains.length<.48,'Quiet particles retain cover contrast without depending on a loud peak');
const firstShape=grains.map(c=>c.args);
for(let frame=0;frame<120;frame++)visiblePainter.draw({...live,level:.04},1/60);
const nextShape=visible.calls.filter(c=>c.kind==='fill'&&typeof c.colour==='string').map(c=>c.args);
const distance=(shape,a,b)=>Math.hypot(shape[a][0]-shape[b][0],shape[a][1]-shape[b][1]);
assert.ok(Math.abs(distance(firstShape,100,600)-distance(nextShape,100,600))>5,'The current folds the particle material instead of merely rotating a fixed cloud');

const inset=drawing(),bounded=createSignalPainter({width:300,height:288,getContext:()=>inset},'particle-ribbon');
for(let frame=0;frame<1800;frame++){
 bounded.draw({...live,level:1},1/30);
 for(const c of inset.calls.filter(c=>c.kind==='fill'&&typeof c.colour==='string'&&c.alpha>.001)){
  const [x,y,w,h]=c.args;assert.ok(x>=0&&y>=0&&x+w<=300&&y+h<=288,'Every visible grain remains on the printed cover');
 }
}

// Hold context readiness beyond the first frame, then suspend and resume it.
// This reproduces the blank reduced-motion canvas before the ready callback.
const context={...events(),state:'running'},analyser={getFloatTimeDomainData(a){a.fill(.125)},getByteFrequencyData(a){a.fill(42)}};
const pending=[];let arms=0;
const scope=vm.createContext({armMediaOutput(){arms++;return new Promise(resolve=>pending.push(resolve))},console});
vm.runInContext(fs.readFileSync('dist/music-signal.js','utf8').replace(/^import .*;\n/gm,'').replace('export function','function'),scope);
const createMusicSignal=vm.runInContext('createMusicSignal',scope),audio={...events(),paused:false,ended:false};
const signal=createMusicSignal(audio);let notifications=0;const unsubscribe=signal.subscribe(()=>notifications++);
const firstArm=signal.arm();assert.equal(signal.read().playing,false);assert.equal(signal.read().ready,false);
pending.shift()({context,analyser});await firstArm;assert.equal(notifications,1);assert.equal(signal.read().level,.125);assert.equal(signal.read().spectrum[0],42);
context.state='suspended';context.emit('statechange');assert.equal(signal.read().playing,false);assert.equal(signal.read().level,0);assert.equal(notifications,2);
context.state='running';context.emit('statechange');assert.equal(signal.read().playing,true);assert.equal(notifications,3);
audio.paused=true;assert.equal(signal.read().playing,false);assert.ok(signal.read().samples.every(v=>v===0));audio.paused=false;
audio.emit('playing');assert.equal(arms,2,'Playing retries a late analyser');pending.shift()({context,analyser});await flush();assert.equal(context.listeners.get('statechange').size,1,'Retries do not multiply context listeners');unsubscribe();
const earlier=signal.arm(),gesture=signal.arm();assert.equal(arms,4,'A new gesture retries resume even when an older resume is pending');pending.shift()({context,analyser});pending.shift()({context,analyser});await Promise.all([earlier,gesture]);

function lifecycle({reducedMotion=false,ready=true}={}){
 const frames=new Map(),windowEvents=events(),documentEvents=events(),motion={...events(),matches:reducedMotion};let tick=0,id=0,current='lov',enabled=true,signalReady=ready,onReady,intersection,resizing,reads=0;
 const cards=['lov','im-falling'].map(id=>{const set=new Set(),canvas={dataset:{},width:300,height:150,box:{width:431,height:412},g:drawing(),setAttribute(){},getContext(){return this.g},getBoundingClientRect(){return this.box}};const art={append(node){Object.assign(canvas,node)}};return {dataset:{id},canvas,classList:{add:c=>set.add(c),remove:c=>set.delete(c),contains:c=>set.has(c)},querySelector(selector){return selector==='.track-art'?art:null}}});
 let nextCanvas=0;const document={...documentEvents,hidden:false,querySelectorAll:()=>cards,createElement:()=>cards[nextCanvas++].canvas};
 const audio={...events(),paused:false,ended:false};const signal={read(){reads++;return {...live,playing:signalReady,ready:signalReady}},subscribe(fn){onReady=fn}};
 Object.assign(globalThis,{document,location:{search:'?perf'},matchMedia:()=>motion,devicePixelRatio:2,addEventListener:windowEvents.addEventListener.bind(windowEvents),requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame(id){frames.delete(id)},IntersectionObserver:class{constructor(fn){intersection=fn}observe(){}},ResizeObserver:class{constructor(fn){resizing=fn}observe(){}}});
 const mounted=mountRecordSignals({audio,signal,current:()=>({id:current}),active:()=>enabled});
 return{audio,cards,document,motion,mounted,frames,get reads(){return reads},step(){tick+=16;for(const [key,fn]of [...frames]){frames.delete(key);fn(tick)}},intersect(id,visible){intersection([{target:cards.find(c=>c.dataset.id===id),isIntersecting:visible}])},ready(value){signalReady=value;onReady()},select(id){current=id;mounted.wake()},enable(value){enabled=value;mounted.wake()},resize(id,width,height){const canvas=cards.find(c=>c.dataset.id===id).canvas;canvas.box={width,height};resizing([{target:canvas}])}};
}
const h=lifecycle({reducedMotion:true,ready:false});h.intersect('lov',true);h.step();assert.equal(h.frames.size,0);assert.equal(h.cards[0].classList.contains('is-signal-playing'),false);assert.equal(h.cards[0].canvas.g.calls.length,0);
h.ready(true);h.step();assert.ok(h.cards[0].canvas.g.calls.length>1000,'Async readiness paints the reduced-motion still');assert.equal(h.frames.size,0,'Reduced motion does not create a permanent animation loop');assert.equal(h.cards[0].canvas.width,647,'Backing store caps DPR at 1.5');
h.ready(false);h.step();assert.equal(h.cards[0].classList.contains('is-signal-playing'),false);h.ready(true);h.step();assert.equal(h.cards[0].classList.contains('is-signal-playing'),true,'Context resume repaints the still');
h.audio.paused=true;h.audio.emit('pause');assert.equal(h.frames.size,0);assert.equal(h.cards[0].classList.contains('is-signal-playing'),false);
h.audio.paused=false;h.audio.emit('playing');h.step();assert.equal(h.cards[0].classList.contains('is-signal-playing'),true);
h.intersect('lov',false);assert.equal(h.frames.size,0);assert.equal(h.cards[0].classList.contains('is-signal-playing'),false);const offscreenReads=h.reads;h.ready(true);h.step();assert.equal(h.reads,offscreenReads,'No analyser polling while the selected card is offscreen');
h.intersect('lov',true);h.step();h.document.hidden=true;h.document.emit('visibilitychange');assert.equal(h.frames.size,0);h.document.hidden=false;h.document.emit('visibilitychange');h.step();assert.equal(h.cards[0].classList.contains('is-signal-playing'),true);
h.select('im-falling');assert.equal(h.frames.size,0,'An offscreen selection does not schedule painting');h.intersect('im-falling',true);h.step();assert.equal(h.cards[0].classList.contains('is-signal-playing'),false);assert.equal(h.cards[1].canvas.g.calls.filter(c=>c.kind==='stroke').length,9);
h.resize('im-falling',0,0);h.step();assert.equal(h.frames.size,0);h.resize('im-falling',300,300);h.step();assert.equal(h.cards[1].canvas.width,450,'A measurable canvas resumes after its hidden layout');
h.enable(false);assert.equal(h.frames.size,0);assert.equal(h.cards[1].classList.contains('is-signal-playing'),false);
const normal=lifecycle();normal.intersect('lov',true);normal.intersect('im-falling',true);normal.step();assert.equal(normal.frames.size,1);assert.equal(normal.cards[1].canvas.g.calls.length,0,'Visible unselected cards remain idle');normal.select('im-falling');normal.step();assert.equal(normal.cards[0].classList.contains('is-signal-playing'),false);normal.intersect('im-falling',false);assert.equal(normal.frames.size,0,'Leaving the viewport immediately cancels rendering');

// A browser may leave the initial silent play unresolved. The next gesture
// still has to reach resume(), and may need to retry a selected real preview.
let unlocks=0,plays=0;const dom=new Map();
function element(){return {...events(),dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>true},append(){},setAttribute(){},querySelector:()=>null,open:false,paused:true,volume:.65,pause(){this.paused=true},play(){plays++;if(plays===1)return new Promise(()=>{});if(plays===2){this.paused=true;return Promise.reject(Object.assign(new Error('Gesture required'),{name:'NotAllowedError'}))}this.paused=false;return Promise.resolve()}}}
const doc={...events(),hidden:false,body:element(),createElement:element,querySelector(selector){if(!dom.has(selector))dom.set(selector,element());return dom.get(selector)},querySelectorAll:()=>[],getElementById(id){return this.querySelector('#'+id)}};
const win={...events(),dispatchEvent(event){this.emit(event.type,event)}};
const release=vm.createContext({document:doc,window:win,navigator:{},console,mountRecordSignals(){},createMusicSignal:()=>({arm(){unlocks++},read:()=>live}),loadHook(){},cancelHook(){},previewEnded:()=>false,mountCollaborators(){},mountRecognition(){},mobileAsset:x=>x,performance:{now:()=>0},setTimeout:()=>1,clearTimeout(){},requestAnimationFrame:()=>1,cancelAnimationFrame(){},matchMedia:()=>({matches:false}),IntersectionObserver:class{observe(){}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},btoa:s=>Buffer.from(s,'binary').toString('base64')});
vm.runInContext(fs.readFileSync('dist/release-player.js','utf8').replace(/^import .*;\n/gm,'').replace('export function','function'),release);vm.runInContext("initReleasePlayer({tracks:[{id:'lov',title:'1 of LOV'}]})",release);
win.lotusReleasePlayer.unlock();win.lotusReleasePlayer.unlock();assert.equal(unlocks,2,'Pending silent playback cannot swallow a fresh analyser unlock');assert.equal(plays,1,'A second unlock does not layer silent players');
win.lotusReleasePlayer.preview('lov',{gesture:true});await flush();assert.equal(plays,2);win.lotusReleasePlayer.unlock();await flush();assert.equal(plays,3,'A real preview retries from the next gesture even if the original silent play never settles');
console.log('Record signal checks passed: 26 cover palettes, original optical ring, live sample response, delayed analyser readiness, resume, reduced motion, pause, hidden/zero-size/offscreen lifecycle, one active canvas and stalled gesture unlock.');
