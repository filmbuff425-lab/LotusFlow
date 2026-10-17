const stage=document.querySelector('#studio-stage');
const toggle=document.createElement('button');
toggle.className='cube-sound-toggle mono';toggle.type='button';stage.append(toggle);
// Load independently of Three.js. Keep the original paired recording and level.
const heart=document.getElementById?.('cube-heart-audio')||document.createElement('audio');
const heartUrl=new URL('./assets/audio/cube-heart.wav',import.meta.url).href;
// Preserve the recording already buffered by the HTML preload.
if(heart.src!==heartUrl)heart.src=heartUrl;
heart.preload='auto';heart.dataset.heartbeat='true';heart.setAttribute('aria-hidden','true');
if(!heart.isConnected)document.body.append(heart);
let armed=false,arming,muted=false,visible=false,inside=false,cycle=-1,fade=0,plays=0,lastDiagnostic=-1,closed=1,ticker=0;
let epoch=performance.now(),attempt=0,playAttempts=0;
let soundEnabled=true;try{soundEnabled=localStorage.getItem('lotus-effects')!=='off'}catch{}
const allowed=()=>soundEnabled&&window.lotusSfx?.enabled!==false;
export function heartbeatTime(){return (performance.now()-epoch)/1000}
function label(){const on=armed&&!muted&&allowed();toggle.textContent=muted||!allowed()?'HEARTBEAT / OFF':on?'HEARTBEAT / ON':'HEARTBEAT / ENABLE';toggle.setAttribute('aria-pressed',String(on));toggle.setAttribute('aria-label',on?'Mute heartbeat sound':'Enable heartbeat sound');toggle.dataset.audioState=on?'ready':'needs-gesture'}
const musicPlaying=()=>window.lotusSession?.audioState?.playing||window.lotusIdentityAudio?.playing||[...document.querySelectorAll('audio:not([data-ambient]):not([data-heartbeat]),video')].some(el=>!el.paused&&!el.muted&&el.volume>.01);
const entryState=()=>document.documentElement?.dataset?.soundEntry;
const entryPending=()=>['waiting','starting','retry','preparing','revealing'].includes(entryState());
const heartLevel=.34;
let entryHeld=entryPending(),entryLevel=entryHeld?0:heartLevel,entryWasGated=entryHeld,entryCompleted=false,entryDelay=0,entryRamp=0,entryRestarting=false;
let outputContext=null,outputSource=null,outputGain=null,routeFailed=false,entryAutomation=null;
const heartbeatEase=value=>{const t=Math.min(1,Math.max(0,value));return t*t*(3-2*t)};
// This envelope controls entrance timing only; mute and foreground priority
// remain independent. The cube uses the same gain to reveal its visual pulse.
export function heartbeatEntryGain(){return entryPending()||entryHeld?0:entryAutomation!==null?heartbeatEase((outputContext.currentTime-entryAutomation)/.5):entryLevel/heartLevel}
heart.volume=heartLevel*heartbeatEntryGain();
// Native media volume is not honored on every phone. A muted fallback remains
// silent until the existing effects context supplies a real zero-gain route.
if(entryHeld)heart.muted=true;
const effectiveLevel=()=>heart.muted?0:heart.volume*(outputGain?.gain.value??1);
function reportGain(){toggle.dataset.heartbeatGain=effectiveLevel().toFixed(3)}
reportGain();
const canPlay=()=>!['waiting','retry'].includes(entryState())&&allowed()&&!muted&&(visible||['starting','preparing','revealing'].includes(entryState()))&&!inside&&closed>=.99&&!document.hidden&&!musicPlaying();
function connectOutput(){
 if(outputGain)return true;if(routeFailed){if(outputSource)throw new Error('Heartbeat output unavailable');return false}
 const context=window.lotusSfx?.audioContext;if(!context?.createMediaElementSource||!context.createGain)return false;
 const wasMuted=heart.muted,nativeLevel=wasMuted?0:heart.volume;heart.muted=true;
 try{
  // Preserve a heartbeat that was already playing through the native media
  // path. The first Studio tap can now fade it through Web Audio instead of
  // pausing a live bass transient abruptly on iOS.
  const gain=context.createGain();gain.gain.value=entryPending()?0:nativeLevel;
  outputSource=context.createMediaElementSource(heart);
  outputSource.connect(gain);gain.connect(context.destination);
  outputContext=context;outputGain=gain;heart.volume=1;heart.muted=false;toggle.dataset.heartbeatOutput='shared-gain';reportGain();return true;
 }catch(error){routeFailed=true;heart.muted=wasMuted||entryPending();toggle.dataset.heartbeatOutput='native-fallback';if(outputSource)throw error;return false}
}
function setLevel(value){
 if(outputGain){outputGain.gain.cancelScheduledValues(outputContext.currentTime);outputGain.gain.setValueAtTime(value,outputContext.currentTime);heart.volume=1}
 else heart.volume=value;
 reportGain();
}
function clearEntryEnvelope(){clearTimeout(entryDelay);clearInterval(entryRamp);entryDelay=entryRamp=0;entryRestarting=false;entryAutomation=null}
function fadeEntry(token){
 const started=performance.now();toggle.dataset.entryHeartbeat='fading';
 if(outputGain){
  const at=outputContext.currentTime,curve=new Float32Array(65);
  for(let i=0;i<curve.length;i++)curve[i]=heartLevel*heartbeatEase(i/(curve.length-1));
  outputGain.gain.cancelScheduledValues(at);outputGain.gain.setValueAtTime(0,at);
  outputGain.gain.setValueCurveAtTime(curve,at,.5);entryAutomation=at;
 }else{
  // Without Web Audio, do not staircase .volume across a bass transient.
  // Keep the prime muted during this short pre-roll, then play the intact pair.
  heart.pause();heart.muted=true;entryHeld=true;
 }
 entryRamp=setInterval(()=>{
  if(token!==attempt){clearInterval(entryRamp);entryRamp=0;return}
  if(!canPlay()||entryPending()){stop();return}
  const t=outputGain?(outputContext.currentTime-entryAutomation)/.5:(performance.now()-started)/500;
  reportGain();
  if(t>=1){
   clearInterval(entryRamp);entryRamp=0;entryAutomation=null;entryHeld=false;entryLevel=heartLevel;
   if(outputGain)setLevel(heartLevel);else{heart.muted=false;play({resetClock:true})}
   toggle.dataset.entryHeartbeat='audible';
  }
 },20);
}
function reportHeartbeat(state,error=''){
 toggle.dataset.audioState=state;toggle.dataset.audioError=error;reportGain();
 const host=document.getElementById?.('studio-canvas');if(host){host.dataset.heartbeatState=state;host.dataset.heartbeatError=error;host.dataset.heartbeatAttempts=String(playAttempts)}
}
async function play({entryStart=false,resetClock=false}={}){
 if(!canPlay())return false;
 if(entryPending())entryWasGated=true;
 const token=++attempt,at=performance.now();let timer,removeSeek=()=>{};clearInterval(fade);fade=0;playAttempts++;
 try{
  if(entryWasGated)connectOutput();
  // Rewinding a live decoder can expose its old tail before the seek settles.
  // Pause first and establish zero gain before asking the recording to restart.
  heart.pause();setLevel(heartLevel*heartbeatEntryGain());heart.muted=!outputGain&&(entryStart||entryPending()||entryHeld);heart.currentTime=0;reportHeartbeat('starting');
  const seekReady=heart.seeking?new Promise(resolve=>{const ready=()=>{removeSeek();resolve()};removeSeek=()=>heart.removeEventListener('seeked',ready);heart.addEventListener('seeked',ready)}):Promise.resolve();
  await Promise.race([Promise.all([heart.play(),seekReady]),new Promise((_,reject)=>{timer=setTimeout(()=>{if(token===attempt)heart.pause();const error=new Error('Heartbeat playback timed out');error.name='TimeoutError';reject(error)},1800)})]);
  if(token!==attempt)return false;if(!canPlay()){heart.pause();return false}
  // Decode/network latency cannot put the first paired sound behind its pulse.
  if(!armed||entryStart||resetClock){epoch=performance.now()-(heart.currentTime+.16)*1000;cycle=0}
  armed=true;plays++;label();toggle.dataset.heartbeatPlays=String(plays);reportHeartbeat('playing');
  if(entryStart)fadeEntry(token);else if(heartbeatEntryGain()===0)toggle.dataset.entryHeartbeat=entryCompleted?'waiting':'primed';
  const host=document.getElementById?.('studio-canvas');if(host)host.dataset.heartbeatStartMs=(performance.now()-at).toFixed(1);return true;
 }catch(error){if(token===attempt){armed=false;label();reportHeartbeat(error.name==='TimeoutError'?'unavailable':heart.error?'error':'needs-gesture',error.name||'Error')}return false}
 finally{clearTimeout(timer);removeSeek()}
}
export async function armHeartbeat(){
 if(!canPlay()||arming)return arming;
 // A restored session may have started the heartbeat before a trusted tap
 // created the effects context. Attach it on that tap so room entry always
 // has a real gain envelope and cannot produce a pause click.
 if(armed){if(!outputGain)connectOutput();return true}
 // Unlock the real recording in the trusted gesture. A gated entrance keeps
 // that recording at zero volume until the entire visual reveal has finished.
 epoch=performance.now()-160;cycle=0;arming=play();
 try{return await arming}finally{arming=null}
}
function stop(){
 const level=effectiveLevel();attempt++;clearEntryEnvelope();clearInterval(fade);fade=0;
 entryHeld=entryPending();entryLevel=entryHeld?0:heartLevel;
 if(entryHeld||document.hidden||level===0){setLevel(0);heart.pause();return}
 if(heart.paused)return;
 if(outputGain){
  const at=outputContext.currentTime;setLevel(level);outputGain.gain.linearRampToValueAtTime(0,at+.12);
  fade=setInterval(()=>{reportGain();if(outputContext.currentTime>=at+.12){heart.pause();clearInterval(fade);fade=0}},20);
 }else fade=setInterval(()=>{heart.volume*=.5;reportGain();if(heart.volume<.006){heart.pause();clearInterval(fade);fade=0}},40);
}
export function updateHeartbeat(t,amount){
 closed=amount;
 if(t-lastDiagnostic>.2){lastDiagnostic=t;toggle.dataset.heartbeatProgress=heart.currentTime.toFixed(3);toggle.dataset.heartbeatPaused=String(heart.paused)}
 if(!canPlay()){if(!fade)stop();return}
 if(entryRestarting)return;
 const c=Math.floor((t-.16)/1.85);if(c!==cycle){cycle=c;if(c>=0&&armed)play()}
}
function tick(){updateHeartbeat(heartbeatTime(),closed)}
function schedule(){clearInterval(ticker);ticker=0;if(visible&&!document.hidden&&!inside){ticker=setInterval(tick,60)}}
heart.addEventListener('ended',()=>{toggle.dataset.audioState='ready'});
heart.addEventListener('error',()=>{armed=false;label();toggle.textContent='HEARTBEAT / RETRY'});
toggle.addEventListener('click',async()=>{if(armed&&!muted&&allowed()){muted=true;stop()}else{muted=false;if(!allowed()){document.querySelector('.interaction-sound-toggle')?.click()}else await armHeartbeat()}label()});
const unlock=e=>{if(e.target===toggle||e.target?.closest?.('.interaction-sound-toggle')||muted||armed)return;armHeartbeat()};
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('touchstart',unlock,{passive:true});document.addEventListener('keydown',unlock);
window.addEventListener('lotus-sound-unlock',()=>armHeartbeat());
window.addEventListener('lotus-effects-change',e=>{soundEnabled=e.detail;if(!soundEnabled)stop();label()});
new IntersectionObserver(([e])=>{visible=e.isIntersecting;schedule();if(visible)armHeartbeat();else stop()},{threshold:.15}).observe(stage);
window.addEventListener('lotus-room-change',e=>{inside=e.detail;toggle.hidden=inside;closed=inside?0:1;schedule();if(inside)stop();else if(!armed)armHeartbeat()});
window.addEventListener('lotus-audio-start',stop);
window.addEventListener('lotus-entry-complete',event=>{
 schedule();
 if(event.detail?.restored||!entryWasGated){if(!visible)stop();return}
 if(entryCompleted)return;entryCompleted=true;clearEntryEnvelope();
 entryHeld=true;entryLevel=0;setLevel(0);toggle.dataset.entryHeartbeat='waiting';
 if(!canPlay()){stop();return}
 entryDelay=setTimeout(async()=>{
  entryDelay=0;if(!canPlay()){stop();return}
  entryHeld=false;entryLevel=0;entryRestarting=true;
  const played=await play({entryStart:true});entryRestarting=false;
  // A failed replay stays silent and keeps the existing retry diagnostics.
  // A later explicit retry can use the original level once entry is complete.
  if(!played&&!entryPending())entryLevel=heartLevel;
 },180);
});
document.addEventListener('visibilitychange',()=>{schedule();if(document.hidden)stop();else if(!armed)armHeartbeat()});
window.addEventListener('pagehide',()=>{clearInterval(ticker);ticker=0;stop()});
window.addEventListener('pageshow',schedule);label();
