// The room entrance and the computer playlist are separate listening moments.
// Prime this exact media element in the entry gesture, before the room loads.
export function createStudioOpening({media,stopScreen,announce,onState=()=>{}}){
 let revision=0,active=false,waiting=false;
 const volume=media.volume,originalMuted=media.muted;
 function state(value){media.dataset.audioState=value;onState(value)}
 function stop(){revision++;active=false;waiting=false;media.pause();media.volume=volume;media.muted=originalMuted;state('paused')}
 async function arm(){
  const token=++revision;active=false;media.muted=true;media.volume=0;state('arming');
  try{await media.play();if(token!==revision)return;media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted;state('armed')}
  catch{if(token===revision){media.volume=volume;media.muted=originalMuted;state('needs-gesture')}}
 }
 async function start(){
  const token=++revision;active=true;waiting=false;stopScreen();media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted;
  announce();state('starting');
  try{await media.play();if(token!==revision)return;state(media.paused?'needs-gesture':'playing')}
  catch{if(token===revision)state('needs-gesture')}
 }
 media.addEventListener('ended',()=>{if(active){active=false;state('ended')}});
 media.addEventListener('error',()=>{if(active)state('unavailable')});
 // The supplied instrumental starts with a short pickup before its first kick.
 // Trigger it from the actual planet reveal, never a timer running during loading.
 function waitForReveal(){waiting=true;media.dataset.entranceCue='waiting-for-planet';state('waiting')}
 function reveal(){if(!waiting)return;waiting=false;media.dataset.entranceCue='planet-revealed';return start()}
 return {arm,start,stop,waitForReveal,reveal,get active(){return active}};
}
