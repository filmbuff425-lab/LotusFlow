// One audio clock drives the flyby and the visual journey.
const bytes=fetch('assets/audio/universe-flyby.wav?v=original2').then(r=>{if(!r.ok)throw Error('Flight audio unavailable');return r.arrayBuffer()}).catch(()=>null);
let context,buffer,source,gain,filter,started=0,generation=0,playing=false;
export const flightDuration=3.8;
export async function startFlightSound(){
 const current=++generation;
 try{
  context||=new (window.AudioContext||window.webkitAudioContext)();
  await context.resume();
  if(!buffer){const data=await bytes;if(!data)throw Error('No flight audio');buffer=await context.decodeAudioData(data.slice(0))}
  if(current!==generation)return false;
  source=context.createBufferSource();source.buffer=buffer;
  gain=context.createGain();filter=context.createBiquadFilter();filter.type='highpass';filter.frequency.value=65;
  source.connect(filter).connect(gain).connect(context.destination);
  started=context.currentTime+.025;
  // The closest pass in the supplied recording is 3.85 s: align it to the planet passing at 1.60 s.
  gain.gain.setValueAtTime(0,started);gain.gain.linearRampToValueAtTime(.76,started+.25);
  gain.gain.setValueAtTime(.76,started+2.6);gain.gain.exponentialRampToValueAtTime(.001,started+flightDuration);
  source.start(started,2.25,flightDuration);playing=true;
  document.querySelector('#home').dataset.flightAudio='source 2.25–6.05s / closest pass 1.60s';
  return true;
 }catch{return current===generation}
}
export function flightElapsed(fallback){
 // Some embedded browsers report a running AudioContext while its clock is stalled.
 // The scheduled sound and visual start share a 25 ms lead; elapsed wall time must
 // continue the journey even when the audio device stops advancing.
 const audioTime=playing?Math.max(0,context.currentTime-started):0;
 return Math.max(audioTime,Math.max(0,fallback-.025));
}
export function stopFlightSound(){generation++;playing=false;if(source){try{source.stop()}catch{}source.disconnect();source=null}gain?.disconnect();filter?.disconnect()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopFlightSound()});
window.addEventListener('pagehide',stopFlightSound);
