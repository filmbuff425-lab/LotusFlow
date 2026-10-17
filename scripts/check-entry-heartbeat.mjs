import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('dist/cube-heartbeat.js','utf8')
 .replaceAll('import.meta.url',JSON.stringify('https://lotus.test/cube-heartbeat.js'))
 .replaceAll('export async function','async function').replaceAll('export function','function');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function scene({gated=true,failed=0,stalled=false,graph=true,failRoute=false,seekDelay=0}={}){
 let now=1000,serial=0,intersection,failures=failed,hang=stalled,outputNode=null,routed=false,routes=0;
 const timers=new Map(),nodes=[],plays=[],levels=[],seeks=[],curves=[];
 const events=()=>({listeners:new Map(),addEventListener(type,fn){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list)},removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(item=>item!==fn))},emit(type,event={}){for(const fn of [...this.listeners.get(type)||[]])fn(event)}});
 const html={dataset:gated?{soundEntry:'waiting'}:{}};
 function element(tag){
  let volume=1,currentTime=0;
  const node={...events(),tagName:tag.toUpperCase(),dataset:{},attributes:{},paused:true,muted:false,seeking:false,error:null,isConnected:true,append(){},setAttribute(name,value){this.attributes[name]=value},closest(){return null},pause(){this.paused=true},play(){
   plays.push({at:now,volume:this.muted?0:this.volume*(routed?outputNode.gain.value:1),mediaVolume:this.volume,time:this.currentTime,phase:html.dataset.soundEntry});
   if(hang)return new Promise(()=>{});
   if(failures-->0)return Promise.reject(new Error('Gesture required'));
   this.paused=false;this.emit('playing');return Promise.resolve();
  }};
  Object.defineProperty(node,'volume',{get:()=>volume,set:value=>{volume=value;levels.push({at:now,value:node.muted?0:value*(routed?outputNode.gain.value:1),mediaVolume:value,phase:html.dataset.soundEntry})}});
  Object.defineProperty(node,'currentTime',{get:()=>currentTime,set:value=>{seeks.push({at:now,paused:node.paused,value});currentTime=value;if(seekDelay){node.seeking=true;addTimer(()=>{node.seeking=false;node.emit('seeked')},seekDelay)}}});
  nodes.push(node);return node;
 }
 const stage=element('section'),host={dataset:{}},heart=element('audio');heart.id='cube-heart-audio';heart.src='https://lotus.test/assets/audio/cube-heart.wav';
 const document={...events(),documentElement:html,hidden:false,body:{append(){}},createElement:element,getElementById:id=>id==='cube-heart-audio'?heart:id==='studio-canvas'?host:null,querySelector:selector=>selector==='#studio-stage'?stage:null,querySelectorAll:()=>[]};
 const existingContext={get currentTime(){return now/1000},destination:{},createMediaElementSource(){routes++;if(failRoute)throw new Error('Route unavailable');return{connect(){routed=true}}},createGain(){
  let value=1,automation=null;
  const gain={get value(){if(!automation)return value;const q=Math.max(0,Math.min(1,(now/1000-automation.at)/automation.duration));if(automation.curve){const index=q*(automation.curve.length-1),lo=Math.floor(index),hi=Math.ceil(index);return automation.curve[lo]+(automation.curve[hi]-automation.curve[lo])*(index-lo)}return automation.from+(automation.to-automation.from)*q},set value(v){value=v;automation=null},setValueAtTime(v){value=v;automation=null},cancelScheduledValues(){value=this.value;automation=null},setValueCurveAtTime(curve,at,duration){curves.push({at,duration,curve});automation={curve,at,duration}},linearRampToValueAtTime(to,end){automation={from:this.value,to,at:now/1000,duration:end-now/1000}}};
  outputNode={gain,connect(){}};return outputNode;
 }};
 const window={...events(),lotusSfx:{enabled:true,audioContext:graph?existingContext:null},lotusSession:{audioState:{playing:false}}};
 const addTimer=(fn,delay,interval=false)=>{const id=++serial;timers.set(id,{fn,delay,at:now+delay,interval});return id};
 const context=vm.createContext({window,document,URL,localStorage:{getItem:()=>null},performance:{now:()=>now},IntersectionObserver:class{constructor(fn){intersection=fn}observe(){}},setTimeout:(fn,delay)=>addTimer(fn,delay),clearTimeout:id=>timers.delete(id),setInterval:(fn,delay)=>addTimer(fn,delay,true),clearInterval:id=>timers.delete(id)});
 vm.runInContext(source,context);
 const toggle=nodes.find(node=>node.className?.includes('cube-sound-toggle'));
 return {window,document,heart,toggle,timers,plays,levels,seeks,curves,host,routes:()=>routes,level:()=>heart.muted?0:heart.volume*(routed?outputNode.gain.value:1),phase(value){html.dataset.soundEntry=value},gain:()=>vm.runInContext('heartbeatEntryGain()',context),visible(value){intersection([{isIntersecting:value}])},fail(value=1){failures=value},stall(value){hang=value},now:()=>now,
  async advance(ms){const until=now+ms;while(true){const next=[...timers].filter(([,timer])=>timer.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;const [id,timer]=next;now=timer.at;if(timer.interval)timer.at+=timer.delay;else timers.delete(id);timer.fn();await flush()}now=until;await flush()},
  async prime(){this.phase('starting');window.emit('lotus-sound-unlock');await flush()},
  complete(){this.phase('entered');window.emit('lotus-entry-complete',{detail:{restored:false}})}
 };
}

const gate=scene();gate.visible(true);await flush();
assert.equal(gate.plays.length,0);assert.equal(gate.level(),0);assert.equal(gate.gain(),0);
await gate.prime();assert.equal(gate.heart.paused,false);assert.equal(gate.toggle.dataset.audioState,'playing');assert.equal(gate.toggle.dataset.entryHeartbeat,'primed');
gate.phase('preparing');await gate.advance(2100);gate.phase('revealing');await gate.advance(3500);
assert.ok(gate.plays.length>=3,'The actual paired recording can cycle while silently primed');
assert.ok(gate.plays.every(play=>play.volume===0));assert.ok(gate.levels.every(level=>level.value===0),'No volume transient is allowed behind the entrance');
assert.equal(gate.gain(),0);assert.equal(gate.toggle.dataset.heartbeatGain,'0.000');
const completedAt=gate.now();gate.complete();await gate.advance(179);assert.equal(gate.level(),0);assert.equal(gate.gain(),0);
await gate.advance(1);assert.equal(gate.plays.at(-1).at,completedAt+180);assert.equal(gate.plays.at(-1).time,0,'The audible entrance starts at the recording beginning');assert.equal(gate.plays.at(-1).volume,0);
assert.equal(gate.toggle.dataset.entryHeartbeat,'fading');
await gate.advance(250);assert.ok(gate.level()>.15&&gate.level()<.18);assert.ok(gate.gain()>.44&&gate.gain()<.53);
await gate.advance(250);assert.equal(gate.level(),.34);assert.equal(gate.gain(),1);assert.equal(gate.toggle.dataset.heartbeatGain,'0.340');assert.equal(gate.toggle.dataset.entryHeartbeat,'audible');
assert.equal(gate.curves.length,1);assert.equal(gate.curves[0].duration,.5);assert.equal(gate.curves[0].curve[0],0);assert.ok(Math.abs(gate.curves[0].curve.at(-1)-.34)<1e-6);
assert.equal(gate.levels.filter(level=>level.at>completedAt+180&&level.at<completedAt+680).length,0,'No JavaScript volume steps may modulate the first bass transient');
assert.equal(gate.routes(),1,'One media element is connected exactly once');assert.ok(gate.seeks.every(seek=>seek.paused),'Never seek a still-playing decoder');
const firstAudible=gate.plays.at(-1).at;await gate.advance(1400);
assert.ok(gate.plays.at(-1).at-firstAudible>=1850&&gate.plays.at(-1).at-firstAudible<1910,'Original 1.85-second paired cadence resumes after the entry restart');
assert.equal(gate.plays.at(-1).volume,.34);
const count=gate.plays.length;gate.window.emit('lotus-entry-complete',{detail:{restored:false}});await gate.advance(200);assert.equal(gate.plays.length,count,'Duplicate completion cannot restart heartbeat');

for(const cause of ['mute','hidden','priority']){
 const canceled=scene();canceled.visible(true);await canceled.prime();canceled.phase('revealing');canceled.complete();await canceled.advance(100);
 if(cause==='mute')canceled.window.emit('lotus-effects-change',{detail:false});
 if(cause==='hidden'){canceled.document.hidden=true;canceled.document.emit('visibilitychange')}
 if(cause==='priority'){canceled.window.lotusSession.audioState.playing=true;canceled.window.emit('lotus-audio-start')}
 const previousPlays=canceled.plays.length;await canceled.advance(2400);
 assert.equal(canceled.plays.length,previousPlays,cause+' must cancel delayed heartbeat');assert.equal(canceled.level(),0);assert.equal(canceled.heart.paused,true);
 assert.ok(![...canceled.timers.values()].some(timer=>timer.delay===180||timer.delay===20),'No entry envelope timers survive cancellation');
}
const rampMute=scene();rampMute.visible(true);await rampMute.prime();rampMute.complete();await rampMute.advance(380);
const mutedAt=rampMute.now(),beforeMute=rampMute.level();rampMute.window.emit('lotus-effects-change',{detail:false});await rampMute.advance(800);
assert.equal(rampMute.heart.paused,true);assert.ok(rampMute.levels.filter(level=>level.at>=mutedAt).every(level=>level.value<=beforeMute),'Canceling the fade-in must never raise the volume again');

const denied=scene({failed:1});denied.visible(true);await denied.prime();assert.equal(denied.toggle.dataset.audioState,'needs-gesture');assert.equal(denied.level(),0);await denied.prime();assert.equal(denied.toggle.dataset.entryHeartbeat,'primed');assert.equal(denied.routes(),1);
const stalled=scene({stalled:true});stalled.visible(true);await stalled.prime();await stalled.advance(1800);assert.equal(stalled.toggle.dataset.audioState,'unavailable');assert.equal(stalled.level(),0);stalled.stall(false);await stalled.prime();assert.equal(stalled.toggle.dataset.audioState,'playing');
const seeking=scene({seekDelay:80});seeking.visible(true);await seeking.prime();await seeking.advance(80);seeking.complete();await seeking.advance(180);assert.equal(seeking.curves.length,0);await seeking.advance(79);assert.equal(seeking.level(),0);await seeking.advance(1);assert.equal(seeking.curves.length,1,'Gain automation starts only after both playback and seek completion');
for(const fallbackOptions of [{graph:false},{failRoute:true}]){
 const fallback=scene(fallbackOptions);fallback.visible(true);await fallback.prime();assert.equal(fallback.heart.muted,true);assert.equal(fallback.level(),0);fallback.complete();await fallback.advance(679);assert.equal(fallback.level(),0);await fallback.advance(1);assert.equal(fallback.heart.muted,false);assert.equal(fallback.plays.at(-1).volume,.34,'Native fallback starts an intact pair after its silent pre-roll');assert.equal(fallback.plays.at(-1).time,0);
}
const normal=scene({gated:false});normal.visible(true);await flush();assert.equal(normal.heart.volume,.34);assert.equal(normal.gain(),1);assert.equal(normal.plays[0].volume,.34,'Ungated visits retain their original audible startup');
console.log('Entry heartbeat passed: shared-context zero-gain priming; sample-accurate 500ms envelope after the 180ms hold; no HTML gain stairs or live seeks; seek-ready handoff; one output route; original cadence; mute/priority/visibility cancellation; retry, timeout and native fallback; ungated behavior.');
