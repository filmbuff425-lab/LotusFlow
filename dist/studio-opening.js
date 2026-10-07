// The room entrance and the computer playlist are separate listening moments.
// Prime this exact media element in the entry gesture, before the room loads.
export function createStudioOpening({media,stopScreen,announce,onState=()=>{}}){
 let revision=0,active=false;
 const volume=media.volume,originalMuted=media.muted;
 function state(value){media.dataset.audioState=value;onState(value)}
 function stop(){revision++;active=false;media.pause();media.volume=volume;media.muted=originalMuted;state('paused')}
 async function arm(){
  const token=++revision;active=false;media.muted=true;media.volume=0;state('arming');
  try{await media.play();if(token!==revision)return;media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted;state('armed')}
  catch{if(token===revision){media.volume=volume;media.muted=originalMuted;state('needs-gesture')}}
 }
 async function start(){
  const token=++revision;active=true;stopScreen();media.pause();media.currentTime=0;media.volume=volume;media.muted=originalMuted;
  announce();state('starting');
  try{await media.play();if(token!==revision)return;state(media.paused?'needs-gesture':'playing')}
  catch{if(token===revision)state('needs-gesture')}
 }
 media.addEventListener('ended',()=>{if(active){active=false;state('ended')}});
 media.addEventListener('error',()=>{if(active)state('unavailable')});
 return {arm,start,stop,get active(){return active}};
}
