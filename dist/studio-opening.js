// The room entrance and the computer playlist are separate listening moments.
// The original 5.8 s camera easing first exposes the blue sky at 2014.45 ms.
// Begin the intact pickup 866 ms earlier, then let its media clock lead the reveal.
export const studioWarmupAt=1148.45;
export function advanceStudioEntrance(journey,now,musicTime){
 const dt=Math.max(0,now-(journey.clockAt??journey.at));journey.clockAt=now;
 const elapsed=(journey.elapsed??0)+dt;
 // Small clock corrections retain the approved pickup/downbeat cue without a stop.
 const desired=musicTime==null?elapsed:studioWarmupAt+musicTime*1000;
 const correction=Math.max(-dt*.12,Math.min(dt*.12,desired-elapsed));
 journey.elapsed=elapsed+correction;return journey.elapsed;
}
// Prime this exact media element in the entry gesture, before the room loads.
export function createStudioOpening({media,stopScreen,announce,onState=()=>{}}){
 let revision=0,active=false,waiting=false,progressAt=0,position=0;
 // First kick onset in the supplied mirror instrumental.
 const firstKick=.866;
 const volume=media.volume,originalMuted=media.muted;
 function state(value){media.dataset.audioState=value;onState(value)}
 // A stalled media request must never hold the room or camera indefinitely.
 // pause() also aborts the pending HTMLMediaElement play request on timeout.
 async function playWithin(token,milliseconds){
  let timer;
  try{await Promise.race([media.play(),new Promise((_,reject)=>{timer=setTimeout(()=>{if(token===revision)media.pause();const error=new Error('Opening audio timed out');error.name='TimeoutError';reject(error)},milliseconds)})])}
  finally{clearTimeout(timer)}
 }
 function stop(){revision++;active=false;waiting=false;media.pause();media.volume=volume;media.muted=originalMuted||window.lotusSfx?.enabled===false;state('paused')}
 async function arm(){
  if(window.lotusSfx?.enabled===false){state("muted");return}
  const token=++revision;active=false;media.preload='auto';media.muted=true;media.volume=0;state('arming');
  try{await playWithin(token,1800);if(token!==revision)return;media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted||window.lotusSfx?.enabled===false;state('armed')}
  catch(error){if(token===revision){media.volume=volume;media.muted=originalMuted||window.lotusSfx?.enabled===false;state(error.name==='TimeoutError'?'unavailable':'needs-gesture')}}
 }
 async function start({offset=0,keepWaiting=false}={}){
  if(window.lotusSfx?.enabled===false){active=false;waiting=keepWaiting;state("muted");return}
  const token=++revision;active=true;waiting=keepWaiting;stopScreen();media.pause();if(Math.abs(media.currentTime-offset)>.001)media.currentTime=offset;media.volume=volume;media.muted=originalMuted||window.lotusSfx?.enabled===false;
  announce();state('starting');
  try{await playWithin(token,1400);if(token!==revision)return;position=media.currentTime;progressAt=Date.now();state(media.paused?'needs-gesture':'playing')}
  catch(error){if(token===revision){active=false;state(error.name==='TimeoutError'?'unavailable':'needs-gesture')}}
 }
 media.addEventListener('ended',()=>{if(active){active=false;state('ended')}});
 media.addEventListener('error',()=>{if(active)state('unavailable')});
 // Keep the pickup and drum attack continuous; the blue cue never seeks a live score.
 function waitForReveal(){waiting=true;media.dataset.entranceCue='waiting-for-blue';state('waiting')}
 function warmup(){if(!waiting)return;media.dataset.entranceCue='warming-up';return start({keepWaiting:true})}
 function reveal(){if(!waiting)return;waiting=false;media.dataset.entranceCue='blue-visible';if(!active)return start({offset:firstKick})}
 function elapsed(){
  if(!active||media.paused||media.dataset.audioState!=='playing')return null;
  if(media.currentTime>position+.001){position=media.currentTime;progressAt=Date.now()}
  else if(Date.now()-progressAt>1400){media.pause();active=false;state('unavailable');return null}
  return media.currentTime;
 }
 return {arm,start,stop,waitForReveal,warmup,reveal,get elapsed(){return elapsed()},get active(){return active}};
}
