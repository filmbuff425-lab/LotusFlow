import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('dist/sound-entry.js','utf8').replace('export function','function').replace(/if\(typeof document!==.*createSoundEntry\(\);/,'');
function scene({saved=false,muted=false,blocked=false,reduced=false,pendingContext=false,silentHeart=false,oneSound=false,revealMs=0,waitForStudio=false,preview=false}={}){
 const timers=new Map(),intervals=new Map(),frames=new Map(),record=[],storage=new Map(saved?[['lotus-sound-entry-v1','entered']]:[]);let serial=0,enabled=!muted;
 const events=()=>({handlers:new Map(),addEventListener(type,fn){const list=this.handlers.get(type)||[];list.push(fn);this.handlers.set(type,list)},removeEventListener(type,fn){this.handlers.set(type,(this.handlers.get(type)||[]).filter(f=>f!==fn))},emit(type,event={}){for(const fn of [...this.handlers.get(type)||[]])fn({type,target:this,...event})}});
 let document;
 class Element{
  constructor(tag='div'){Object.assign(this,events());this.tagName=tag.toUpperCase();this.dataset={};this.style={setProperty(k,v){this[k]=v}};this.attributes={};this.children=[];this.inert=false;this.hidden=false;this.disabled=false;this.textContent='';this.classList={values:new Set(),add(v){this.values.add(v)},remove(v){this.values.delete(v)},contains(v){return this.values.has(v)}}}
  append(child){this.children.push(child);child.parentElement=this}
  setAttribute(k,v){this.attributes[k]=String(v)}getAttribute(k){return this.attributes[k]??null}
  contains(node){return node===this||this.children.some(child=>child.contains(node))}
  all(){return this.children.flatMap(child=>[child,...child.all()])}
  querySelector(selector){if(selector==='[data-enter-with-sound]')return this.all().find(e=>e.dataset.enterWithSound!==undefined);if(selector==='[data-sound-entry-status]')return this.all().find(e=>e.dataset.soundEntryStatus!==undefined);return null}
  querySelectorAll(){return this.all().filter(e=>e.tagName==='BUTTON'&&!e.disabled)}
  focus(){document.activeElement=this;record.push('focus:'+this.id)}
  click(){this.emit('click',{isTrusted:false})}
 }
 const html=new Element('html'),body=new Element('body');html.append(body);html.style.overflow='auto';body.style.overflow='visible';
 const root=new Element('section');root.id='sound-entry';body.append(root);
 const button=new Element('button');button.id='enter';button.dataset.enterWithSound='';button.textContent='ENTER';button.innerHTML='ENTER';root.append(button);
 const status=new Element('p');status.dataset.soundEntryStatus='';root.append(status);
 const main=new Element('main');main.id='main';body.append(main);const destination=new Element('button');destination.id='open-studio';main.append(destination);
 const locked=new Element('footer');locked.inert=true;body.append(locked);
 const soundToggle=new Element('button');soundToggle.className='interaction-sound-toggle';body.append(soundToggle);
 const heartToggle=new Element('button');heartToggle.className='cube-sound-toggle';body.append(heartToggle);
 const audio=id=>{const e=new Element('audio');e.id=id;e.paused=true;e.muted=false;e.volume=.12;e.currentTime=0;e.readyState=4;e.start=()=>{if(!e.paused)return;e.paused=false;record.push('play:'+id);e.emit('playing')};body.append(e);return e};
 const ambient=audio('lotus-ambience'),heart=audio('cube-heart-audio');if(silentHeart)heart.volume=0;
 document={...events(),body,documentElement:html,hidden:false,activeElement:destination,getElementById:id=>html.all().find(e=>e.id===id),querySelector(selector){return selector[0]==='.'?html.all().find(e=>e.className===selector.slice(1)):null}};
 const window={...events(),matchMedia:()=>({matches:reduced})};window.dispatchEvent=event=>{record.push(event.type);window.emit(event.type,event)};
 function startHeart(){if(blocked){heartToggle.dataset.audioState='needs-gesture';return}heartToggle.dataset.audioState='playing';if(!oneSound)heart.start()}
 window.addEventListener('lotus-sound-unlock',startHeart);
 window.lotusSfx={get enabled(){return enabled},arm(){record.push('arm');if(blocked)soundToggle.dataset.ambienceState='needs-gesture';else{soundToggle.dataset.ambienceState='playing';ambient.start()}window.dispatchEvent({type:'lotus-sound-unlock'});return pendingContext?new Promise(()=>{}):Promise.resolve()}};
 soundToggle.addEventListener('click',()=>{enabled=true;record.push('explicit-enable');window.dispatchEvent({type:'lotus-effects-change',detail:true});window.lotusSfx.arm()});
 let observer;const context={document,window,sessionStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail}},MutationObserver:class{constructor(fn){observer=this;this.fn=fn}observe(){}disconnect(){this.disconnected=true}},setTimeout(fn,delay){timers.set(++serial,{fn,delay});return serial},clearTimeout:id=>timers.delete(id),setInterval(fn,delay){intervals.set(++serial,{fn,delay});return serial},clearInterval:id=>intervals.delete(id),requestAnimationFrame(fn){frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id)};
 vm.createContext(context);vm.runInContext(source,context);const entry=vm.runInContext('createSoundEntry',context)({root,revealMs,waitForStudio,preview});
 return{entry,root,button,status,main,locked,document,window,ambient,heart,record,timers,intervals,frames,storage,observer,Element,frame(){const batch=[...frames.values()];frames.clear();for(const fn of batch)fn()},unblock(){blocked=false},click(){button.emit('click',{isTrusted:true})},poll(){for(const timer of [...intervals.values()])timer.fn()},expire(delay){for(const timer of [...timers.values()])if(timer.delay===delay)timer.fn()}};
}
const fresh=scene({pendingContext:true,silentHeart:true});
assert.equal(fresh.entry.state,'waiting');assert.equal(fresh.main.inert,true);assert.equal(fresh.document.activeElement,fresh.root);assert.equal(fresh.ambient.paused,true);
fresh.button.click();assert.equal(fresh.entry.state,'waiting','Synthetic click does not silently approve mandatory sound entry');
fresh.click();assert.equal(fresh.entry.state,'entered','Actual media playback, not a pending effects context, completes entry');
assert.ok(fresh.record.includes('play:lotus-ambience')&&fresh.record.includes('play:cube-heart-audio'),'Both original recordings are unlocked synchronously in the trusted click');
assert.equal(fresh.heart.volume,0,'Silent heartbeat priming must satisfy readiness without forcing the beat to sound during entry');
assert.equal(fresh.root.hidden,true);assert.equal(fresh.main.inert,false);assert.equal(fresh.locked.inert,true,'Prior inert state is preserved');
assert.equal(fresh.document.documentElement.style.overflow,'auto');assert.equal(fresh.document.body.style.overflow,'visible');
assert.equal(fresh.document.activeElement.id,'open-studio');assert.equal(fresh.storage.size,0);
assert.equal(fresh.timers.size,0);assert.equal(fresh.intervals.size,0);
const muted=scene({muted:true});muted.click();assert.equal(muted.entry.state,'entered');assert.ok(muted.record.includes('explicit-enable'),'The explicit entry action overrides prior mute');
const restored=scene({saved:true,muted:true});assert.equal(restored.entry.state,'waiting');assert.equal(restored.root.hidden,false);assert.equal(restored.main.inert,true);assert.equal(restored.window.lotusSfx.enabled,false,'Reload cannot silently override mute');assert.ok(!restored.record.includes('arm'),'A saved session is not a new user gesture');restored.click();assert.equal(restored.entry.state,'entered');
const blocked=scene({blocked:true});blocked.click();blocked.poll();assert.equal(blocked.entry.state,'retry');assert.equal(blocked.root.hidden,false);assert.equal(blocked.main.inert,true);assert.equal(blocked.storage.size,0);assert.match(blocked.status.textContent,/browser/);
blocked.unblock();blocked.click();assert.equal(blocked.entry.state,'entered','A failed play remains recoverable by a second real click');
const partial=scene({oneSound:true});partial.click();assert.equal(partial.entry.state,'starting','Ambient alone cannot silently pass a two-source readiness gate');partial.expire(5000);assert.equal(partial.entry.state,'retry');assert.equal(partial.timers.size,0);assert.equal(partial.intervals.size,0);
const fading=scene({revealMs:650});fading.click();assert.equal(fading.entry.state,'revealing');assert.equal(fading.main.inert,true);assert.ok(!fading.record.includes('lotus-entry-complete'),'Heavy scene wake waits until the soft reveal ends');fading.expire(650);assert.equal(fading.entry.state,'entered');
const reduced=scene({reduced:true,revealMs:650});reduced.click();assert.equal(reduced.entry.state,'entered','Reduced motion skips the fade delay');
const keys=scene();keys.button.focus();let prevented=0;keys.root.emit('keydown',{key:'Tab',preventDefault(){prevented++}});assert.equal(prevented,1);assert.equal(keys.document.activeElement,keys.button);keys.root.emit('keydown',{key:'Escape',preventDefault(){prevented++}});assert.equal(keys.entry.state,'waiting');assert.equal(prevented,2,'Escape cannot dismiss a mandatory gate');
const addition=new keys.Element('dialog');keys.document.body.append(addition);keys.observer.fn();assert.equal(addition.inert,true,'Later inserted dialogs cannot become interactive behind the gate');
keys.document.activeElement=keys.main;keys.document.emit('focusin',{target:keys.main});assert.equal(keys.document.activeElement,keys.button);
console.log('Sound entry checks passed: trusted synchronous playback, audible ambience and silent heartbeat priming required, retry, explicit mute override, fresh-document audio unlock, focus/inert restoration, soft reveal and reduced motion.');

const preview=scene({saved:true,preview:true,waitForStudio:true,revealMs:1800});
assert.equal(preview.entry.state,'waiting','Visual review reloads always show the gate even when another session entered');
const bilingual=preview.button.innerHTML;preview.click();assert.equal(preview.entry.state,'preparing');assert.ok(preview.record.includes('lotus-entry-audible'));
assert.equal(preview.button.innerHTML,bilingual,'Starting never replaces the entry button markup');
assert.equal(preview.main.inert,true);assert.ok(!preview.record.includes('lotus-entry-complete'));
preview.window.emit('lotus-studio-ready');assert.equal(preview.entry.state,'preparing');preview.frame();assert.equal(preview.entry.state,'preparing');preview.frame();assert.equal(preview.entry.state,'revealing','Transition begins only after the actual cube is rendered and has painted');
preview.expire(1800);assert.equal(preview.entry.state,'entered');assert.equal(preview.frames.size,0);assert.equal(preview.timers.size,0);
const previewFresh=scene({preview:true});previewFresh.click();assert.equal(previewFresh.storage.size,0,'Preview cannot grant a production-session unlock');
const sceneTimeout=scene({waitForStudio:true});sceneTimeout.click();sceneTimeout.expire(12000);assert.equal(sceneTimeout.entry.state,'retry');assert.match(sceneTimeout.status.textContent,/场景/);assert.match(sceneTimeout.status.textContent,/scene/);assert.equal(sceneTimeout.button.innerHTML,bilingual);

const studioSource=fs.readFileSync('dist/studio.js','utf8'),guardSource=studioSource.slice(studioSource.indexOf('const soundEntryPending='),studioSource.indexOf('await waitForSoundEntryAudio();'));
let release;const studioDocument={documentElement:{dataset:{soundEntry:'waiting'}}},guardContext=vm.createContext({document:studioDocument,window:{addEventListener(type,fn){assert.equal(type,'lotus-entry-complete');release=fn}}});
vm.runInContext(guardSource,guardContext);let prepared=false;const preparation=vm.runInContext('waitForSoundEntry()',guardContext).then(()=>prepared=true);await Promise.resolve();assert.equal(prepared,false,'Studio initialization waits behind the optional gate');studioDocument.documentElement.dataset.soundEntry='entered';release();await preparation;assert.equal(prepared,true);
delete studioDocument.documentElement.dataset.soundEntry;await vm.runInContext('waitForSoundEntry()',guardContext);console.log('Studio interior guard passed: full room preparation releases only after entry; ungated pages retain their behavior.');
const audioEvents=new Map(),audioContext=vm.createContext({document:studioDocument,window:{addEventListener(type,fn){audioEvents.set(type,fn)}}});vm.runInContext(guardSource,audioContext);studioDocument.documentElement.dataset.soundEntry='waiting';let minimalReady=false;const minimal=vm.runInContext('waitForSoundEntryAudio()',audioContext).then(()=>minimalReady=true);await Promise.resolve();assert.equal(minimalReady,false);assert.ok(audioEvents.has('lotus-entry-audible'));assert.ok(!audioEvents.has('lotus-entry-complete'));studioDocument.documentElement.dataset.soundEntry='preparing';audioEvents.get('lotus-entry-audible')();await minimal;assert.equal(minimalReady,true);await vm.runInContext('waitForSoundEntryAudio()',audioContext);console.log('Preview checks passed: bilingual labels survive retries; actual first-frame handshake precedes light reveal; minimal cube releases on audible, full room releases on completion.');

const surrounding=scene();surrounding.root.emit('click',{isTrusted:true,detail:1});assert.equal(surrounding.entry.state,'waiting','The black background must not bypass the light / ENTER entrance');
const dragged=scene();dragged.root.emit('pointerdown',{clientX:20,clientY:20});dragged.root.emit('pointermove',{clientX:80,clientY:60});dragged.button.emit('click',{isTrusted:true,detail:1});assert.equal(dragged.entry.state,'waiting','Dragging the entry must not accidentally enter');dragged.root.emit('pointerdown',{clientX:80,clientY:60});dragged.button.emit('click',{isTrusted:true,detail:1});assert.equal(dragged.entry.state,'entered','A subsequent tap still enters');
console.log('Light / ENTER hit area passed: background clicks do not enter; dragging does not accidentally enter; clicking ENTER starts the entry.');
