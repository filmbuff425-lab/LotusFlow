import {createLakeRipple} from './water-surface.js?v=20261006-lake-surface1';
// Embedded record objects share their page's soundscape: never layer two beds.
let soundHost=null;
try{if(new URLSearchParams(location.search).has('embed')&&window.parent&&window.parent!==window&&window.parent.location.origin===location.origin)soundHost=window.parent}catch{}
if(soundHost){
 window.lotusSfx={play:(...args)=>soundHost.lotusSfx?.play(...args),playPercussion:(...args)=>soundHost.lotusSfx?.playPercussion(...args),playWater:(...args)=>soundHost.lotusSfx?.playWater(...args),arm:()=>soundHost.lotusSfx?.arm(),get enabled(){return soundHost.lotusSfx?.enabled??false}};
 document.addEventListener('pointerdown',()=>window.lotusSfx.arm(),{passive:true,capture:true});
 document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')window.lotusSfx.arm()},{capture:true});
 document.addEventListener('click',e=>{const el=e.target.closest('button,a,[role=button]');if(!el||el.disabled)return;const isCase=el.matches('#case-stage,#toggle-case');window.lotusSfx.play(isCase?(el.getAttribute('aria-expanded')==='true'?'case-close':'case-open'):'tap')},{capture:true});
}else{
// Original restrained feedback and a bright, seamless space exploration score.
// The first gesture unlocks audio. Songs, videos and the mixer take priority.
let context,master,compressor,enabled=true,unlocked=false,activated=false,lastHover=0,lastSlide=0,lastType=0,lastPercussion=0,lastWater=0,waterOutput=null;
try{enabled=localStorage.getItem('lotus-effects')!=='off'}catch{}
const button=document.createElement('button');button.className='interaction-sound-toggle';button.type='button';document.body.append(button);
function label(){const ready=enabled&&activated&&['playing','ducked'].includes(button.dataset.ambienceState);button.textContent=!enabled?'SOUND / OFF':ready?'SOUND / ON':'SOUND / ENABLE';button.setAttribute('aria-pressed',String(ready));button.setAttribute('aria-label',ready?'Mute ambience and interaction sounds':'Enable ambience and interaction sounds')};label();
const ambience=document.createElement('audio');ambience.src=new URL('./assets/audio/space-exploration-soft.wav?v=20261006-lake-surface1',import.meta.url).href;ambience.loop=true;ambience.preload='none';ambience.volume=0;ambience.dataset.ambient='true';ambience.setAttribute('aria-hidden','true');document.body.append(ambience);
let bedTimer=0,bedStarting=false;
try{const state=JSON.parse(sessionStorage.getItem('lotus-ambient-position')||'null');if(state&&Date.now()-state.at<120000)ambience.currentTime=(state.time+(Date.now()-state.at)/1000)%64}catch{}
function blendBed(){const target=enabled&&activated&&!document.hidden?(busy()?.008:.12):0;ambience.volume=Math.max(0,Math.min(1,ambience.volume+(target-ambience.volume)*.075));button.dataset.ambienceVolume=ambience.volume.toFixed(3);button.dataset.ambienceState=ambience.paused?'paused':busy()?'ducked':'playing';button.dataset.ambienceProgress=ambience.currentTime.toFixed(3);if(!enabled&&ambience.volume<.0005)ambience.pause()}
async function startBed(){if(!enabled||document.hidden||bedStarting||!ambience.paused)return;bedStarting=true;try{await ambience.play();activated=true;button.dataset.ambienceState='playing';if(!bedTimer)bedTimer=setInterval(blendBed,80)}catch{button.dataset.ambienceState=ambience.error?'error':'needs-gesture'}finally{bedStarting=false;label()}}
function init(){if(context)return context;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;context=new AC();master=context.createGain();master.gain.value=.43;compressor=context.createDynamicsCompressor();compressor.threshold.value=-18;compressor.knee.value=18;compressor.ratio.value=3;master.connect(compressor).connect(context.destination);context.addEventListener('statechange',()=>{unlocked=context.state==='running';if(unlocked)activated=true;button.dataset.audioState=context.state;label()});return context}
async function arm(){const starting=startBed();try{if(!init()){await starting;return}const resuming=context.resume();await resuming;unlocked=context.state==='running';button.dataset.audioState=context.state;if(unlocked){try{sessionStorage.setItem('lotus-audio-unlocked','true')}catch{}}await starting;label()}catch{await starting;label()}}
function busy(){
 if(window.lotusSession?.audioState?.playing||window.lotusIdentityAudio?.playing)return true;
 const audible=doc=>[...doc.querySelectorAll('audio:not([data-ambient]):not([data-heartbeat]),video')].some(el=>!el.paused&&!el.muted&&el.volume>.01);
 if(audible(document))return true;
 for(const frame of document.querySelectorAll('iframe'))try{if(frame.contentDocument&&audible(frame.contentDocument))return true}catch{}
 return false;
}
function output(x=0,performanceAction=false){const g=context.createGain();g.gain.value=busy()?(performanceAction?.75:.23):1;const pan=context.createStereoPanner();pan.pan.value=Math.max(-.55,Math.min(.55,x));g.connect(pan).connect(master);return{g,pan}}
function tone(out,freq,duration,level,offset=0,end=freq,type='sine'){
 const at=context.currentTime+offset,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),at+duration);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(level,at+.008);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(g).connect(out);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};
}
function noise(out,duration,level,frequency,offset=0,shape='bandpass'){
 const count=Math.ceil(context.sampleRate*duration),buffer=context.createBuffer(1,count,context.sampleRate),data=buffer.getChannelData(0);let old=0;for(let i=0;i<count;i++){old=(old+(Math.random()*2-1)*.32)/1.32;data[i]=old}
 const src=context.createBufferSource(),filter=context.createBiquadFilter(),g=context.createGain(),at=context.currentTime+offset;src.buffer=buffer;filter.type=shape;filter.frequency.value=frequency;filter.Q.value=.65;g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(level,at+Math.min(.04,duration*.25));g.gain.exponentialRampToValueAtTime(.0001,at+duration);src.connect(filter).connect(g).connect(out);src.start(at);src.onended=()=>{src.disconnect();filter.disconnect();g.disconnect()};
}
function play(kind='tap',{x=0,value=.5,motion=.5,voice='kick',performanceAction=false}={}){
 if((!enabled&&!performanceAction)||!unlocked||context?.state!=='running'||document.hidden)return false;
 const now=performance.now();if(kind==='type'&&now-lastType<90)return;if(kind==='type')lastType=now;if(kind==='hover'&&now-lastHover<100)return;if(kind==='slider'&&now-lastSlide<110)return;if(kind==='hover')lastHover=now;if(kind==='slider')lastSlide=now;
 const {g,pan}=output(x,performanceAction);let tail=1.8;
 if(kind==='hover'){tone(g,1120,.042,.009,0,1040);tail=.07}
 else if(kind==='tap'||kind==='toggle'){tone(g,kind==='toggle'?740:920,.085,.038,0,kind==='toggle'?680:860);tone(g,1640,.035,.009);noise(g,.032,.009,3100);tail=.12}
 else if(kind==='slider'){tone(g,620+value*280,.040,.014);tail=.07}
 else if(kind==='case-lift'){noise(g,.24,.040,850);tone(g,660,.20,.022,0,780);tail=.32}
 else if(kind==='case-open'){tone(g,880,.16,.025);tone(g,1320,.15,.012,.025);noise(g,.055,.012,2500);tail=.23}
 else if(kind==='case-close'){tone(g,660,.105,.025,0,580);noise(g,.050,.016,1500);tail=.16}
 else if(kind==='glass'){tone(g,1046.5,.35,.022);tone(g,1569.8,.28,.008,.016);tail=.44}
 else if(kind==='room-open'||kind==='portal'){noise(g,.8,.075,470);tone(g,146.832,.70,.028,.05,110);tone(g,587.33,.68,.013,.17);tone(g,880,.58,.007,.25);tail=1.2}
 else if(kind==='drag'){noise(g,.20,.039,700);tail=.28}
 else if(kind==='move'){noise(g,.28,.025,650);tone(g,660,.18,.010,0,740);tail=.37}
 else if(kind==='arrive'){tone(g,392,.38,.020);tone(g,784,.32,.010,.04);tail=.5}
 else if(kind==='water'){
  if(now-lastWater<(performanceAction?450:850)){g.disconnect();pan.disconnect();return false}lastWater=now;
  // One gentle lake ripple, crossfaded with the preceding touch.
  const notes=[246.94,261.626,293.665,329.63,349.23],pitch=notes[Math.min(4,Math.floor(Math.max(0,Math.min(.999,value))*5))],at=context.currentTime;
  if(waterOutput){waterOutput.gain.cancelAndHoldAtTime(at);waterOutput.gain.linearRampToValueAtTime(0,at+.28)}waterOutput=g;
  const lake=createLakeRipple(context,g,{pitch,motion});tail=lake.tail;
  setTimeout(()=>{lake.dispose();if(waterOutput===g)waterOutput=null},tail*1000);
  button.dataset.waterHits=String(Number(button.dataset.waterHits||0)+1);button.dataset.waterPitch=pitch.toFixed(2);button.dataset.soundDesign='soft-lake-synth';
  const meter=context.createAnalyser();meter.fftSize=256;g.connect(meter);const samples=new Float32Array(256),until=performance.now()+900;let peak=0;
  function readWaterPeak(){meter.getFloatTimeDomainData(samples);for(const sample of samples)peak=Math.max(peak,Math.abs(sample));button.dataset.waterPeak=peak.toFixed(4);if(performance.now()<until)requestAnimationFrame(readWaterPeak);else{g.disconnect(meter);meter.disconnect()}}requestAnimationFrame(readWaterPeak);
 }
 else if(kind==='percussion'){
  if(now-lastPercussion<75){g.disconnect();pan.disconnect();return false}lastPercussion=now;
  if(voice==='snare'){noise(g,.16,.68,1900,0,'highpass');tone(g,190,.11,.15,0,130);tail=.19}
  else if(voice==='hat'){noise(g,.065,.46,5800,0,'highpass');tail=.09}
  else if(voice==='tom'){tone(g,245,.23,.46,0,89);tone(g,410,.08,.07,0,280);tail=.26}
  else if(voice==='rim'){tone(g,1680,.065,.22,0,1590);tone(g,2570,.04,.10);noise(g,.026,.10,2500);tail=.10}
  else{tone(g,155,.28,.62,0,47);tone(g,820,.022,.055,0,280);tail=.31}
  button.dataset.percussionVoice=voice;button.dataset.percussionHits=String(Number(button.dataset.percussionHits||0)+1);
  const meter=context.createAnalyser();meter.fftSize=256;g.connect(meter);const samples=new Float32Array(256),until=performance.now()+220;let peak=0;
  function readPeak(){meter.getFloatTimeDomainData(samples);for(const sample of samples)peak=Math.max(peak,Math.abs(sample));button.dataset.percussionPeak=peak.toFixed(4);if(performance.now()<until)requestAnimationFrame(readPeak);else{g.disconnect(meter);meter.disconnect()}}
  requestAnimationFrame(readPeak);
 }
 else if(kind==='type'){tone(g,940,.047,.018,0,860);noise(g,.025,.008,2800);tail=.08}
 else{tone(g,350,.08,.025,0,180);tail=.15}
 button.dataset.lastCue=kind;button.dataset.audioState=context.state;setTimeout(()=>{g.disconnect();pan.disconnect()},Math.max(tail+.1,kind==='percussion'?.32:0)*1000);return true;
}
// Playing the title is an intentional musical action, like playing a record.
// Resume only Web Audio here; a muted ambient bed stays muted.
async function playPercussion(voice='kick',{x=0,gesture=true}={}){
 try{if(!gesture&&(!enabled||context?.state!=='running'))return false;if(!init())return false;if(gesture)await context.resume();unlocked=context.state==='running';return play('percussion',{voice,x,performanceAction:gesture})}catch{return false}
}
async function playWater({x=0,value=.5,motion=.5,gesture=true}={}){
 try{if(!gesture&&(!enabled||context?.state!=='running'))return false;if(!init())return false;if(gesture)await context.resume();unlocked=context.state==='running';return play('water',{x,value,motion,performanceAction:gesture})}catch{return false}
}
window.lotusSfx={play,playPercussion,playWater,arm,get enabled(){return enabled}};
window.dispatchEvent(new CustomEvent('lotus-effects-change',{detail:enabled}));
button.addEventListener('click',async()=>{if(enabled&&activated&&!ambience.paused)enabled=false;else enabled=true;try{localStorage.setItem('lotus-effects',enabled?'on':'off')}catch{}window.dispatchEvent(new CustomEvent('lotus-effects-change',{detail:enabled}));label();blendBed();if(enabled){await arm();play('glass')}});
document.addEventListener('pointerdown',e=>{if(e.target!==button)arm()},{passive:true,capture:true});document.addEventListener('keydown',e=>{if(e.target!==button&&(e.key==='Enter'||e.key===' '))arm()},{capture:true});
const position=el=>{const b=el.getBoundingClientRect();return{x:(b.left+b.width/2-innerWidth/2)/innerWidth}};
function cue(el){if(el.matches('.record-portal'))return 'portal';if(el.matches('#open-studio,#close-studio'))return null;if(el.matches('.cd-spine,[data-pick-studio-record],.record-choice'))return 'case-lift';if(el.matches('.inspector-close,[data-close],.dialog-close'))return 'case-close';if(el.matches('[data-camera],[data-studio-zoom],#studio-reset-view'))return 'move';if(el.matches('[aria-pressed],input[type=checkbox]'))return 'toggle';if(el.matches('a[href^="#"]'))return 'move';return 'tap'}
document.addEventListener('click',e=>{const el=e.target.closest('button,a,summary,input[type=checkbox]');if(!el||el===button||el.disabled||el.matches('.contact h2')||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const kind=cue(el);if(kind)play(kind,position(el))},{capture:true});
document.addEventListener('pointerover',e=>{const el=e.target.closest('a,button,summary,.elastic-letter');if(!el||el===button||el.closest('#noise-title')||el.contains(e.relatedTarget)||el.disabled)return;play(el.matches('.elastic-letter')?'type':'hover',position(el))},{passive:true});
document.addEventListener('focusin',e=>{if(e.target.matches('a,button,summary')&&!e.target.closest('#noise-title'))play('hover',position(e.target))});
document.addEventListener('input',e=>{const el=e.target;if(!el.matches('input[type=range]'))return;play('slider',{...position(el),value:(Number(el.value)-Number(el.min||0))/(Number(el.max||100)-Number(el.min||0))})});
let canvasDrag=null,lastDrag=0;
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#noise-title')&&(e.target.matches('canvas')||e.target.closest('#portrait-wrap')))canvasDrag={id:e.pointerId,x:e.clientX,y:e.clientY}},{capture:true,passive:true});
document.addEventListener('pointermove',e=>{if(!canvasDrag||canvasDrag.id!==e.pointerId||!e.buttons||Math.hypot(e.clientX-canvasDrag.x,e.clientY-canvasDrag.y)<12)return;const now=performance.now();if(now-lastDrag>330){play('drag',{x:(e.clientX-innerWidth/2)/innerWidth});lastDrag=now;canvasDrag.x=e.clientX;canvasDrag.y=e.clientY}},{capture:true,passive:true});
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,()=>canvasDrag=null,{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(!e.target.matches('canvas'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){if(!e.repeat)play('move')}else if(/^[1-8ms]$/i.test(e.key))play('tap')});
window.addEventListener('lotus-room-change',e=>play(e.detail?'room-open':'move'));window.addEventListener('lotus-room-settled',()=>play('arrive'));
const dialogs=new MutationObserver(records=>{for(const r of records){const el=r.target;if(r.attributeName==='open'&&el.open)play(el.id==='studio-desktop'?'glass':'case-open');else if(r.attributeName==='class'&&el.classList.contains('is-closing'))play('case-close')}});
for(const dialog of document.querySelectorAll('dialog'))dialogs.observe(dialog,{attributes:true,attributeFilter:['open','class']});
new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1){if(n.matches('dialog'))dialogs.observe(n,{attributes:true,attributeFilter:['open','class']});n.querySelectorAll('dialog').forEach(d=>dialogs.observe(d,{attributes:true,attributeFilter:['open','class']}))}}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){context?.suspend();ambience.pause()}else if(activated)arm()});addEventListener('pageshow',()=>{if(activated)arm()});addEventListener('pagehide',()=>{try{sessionStorage.setItem('lotus-ambient-position',JSON.stringify({time:ambience.currentTime,at:Date.now()}))}catch{}ambience.pause();clearInterval(bedTimer);bedTimer=0;context?.suspend()});

try{if(enabled&&sessionStorage.getItem('lotus-audio-unlocked')==='true')arm()}catch{}

}
