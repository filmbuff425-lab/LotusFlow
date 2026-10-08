// The room entrance and the computer playlist are separate listening moments.
// The original 5.8 s camera easing first exposes the blue sky at 2014.45 ms.
// Begin the intact pickup 866 ms earlier, then let its media clock lead the reveal.
export const studioWarmupAt=1148.45;
// Prime this exact media element in the entry gesture, before the room loads.
export function createStudioOpening({media,stopScreen,announce,onState=()=>{}}){
 let revision=0,active=false,waiting=false;
 // First kick onset in the supplied mirror instrumental.
 const firstKick=.866;
 const volume=media.volume,originalMuted=media.muted;
 function state(value){media.dataset.audioState=value;onState(value)}
 function stop(){revision++;active=false;waiting=false;media.pause();media.volume=volume;media.muted=originalMuted;state('paused')}
 async function arm(){
  const token=++revision;active=false;media.preload='auto';media.muted=true;media.volume=0;state('arming');
  try{await media.play();if(token!==revision)return;media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted;state('armed')}
  catch{if(token===revision){media.volume=volume;media.muted=originalMuted;state('needs-gesture')}}
 }
 async function start({offset=0,keepWaiting=false}={}){
  const token=++revision;active=true;waiting=keepWaiting;stopScreen();media.pause();if(Math.abs(media.currentTime-offset)>.001)media.currentTime=offset;media.volume=volume;media.muted=originalMuted;
  announce();state('starting');
  try{await media.play();if(token!==revision)return;state(media.paused?'needs-gesture':'playing')}
  catch{if(token===revision)state('needs-gesture')}
 }
 media.addEventListener('ended',()=>{if(active){active=false;state('ended')}});
 media.addEventListener('error',()=>{if(active)state('unavailable')});
 // Keep the pickup and drum attack continuous; the blue cue never seeks a live score.
 function waitForReveal(){waiting=true;media.dataset.entranceCue='waiting-for-blue';state('waiting')}
 function warmup(){if(!waiting)return;media.dataset.entranceCue='warming-up';return start({keepWaiting:true})}
 function reveal(){if(!waiting)return;waiting=false;media.dataset.entranceCue='blue-visible';if(!active)return start({offset:firstKick})}
 return {arm,start,stop,waitForReveal,warmup,reveal,get elapsed(){return active&&!media.paused&&media.dataset.audioState==='playing'?media.currentTime:null},get active(){return active}};
}
