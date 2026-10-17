// One analyser is attached to each real media element; no synthetic signal drives the display.
import {armMediaOutput} from './media-output.js?v=20261007-mobile3';
export function createMusicSignal(audio){
 audio.crossOrigin='anonymous';
 let output;const samples=new Float32Array(512),spectrum=new Uint8Array(256),listeners=new Set();let level=0;
 const notify=()=>{for(const listener of listeners)listener()};
 async function arm(){
  // Resume is started by the caller's gesture; a previous pending resume must
  // not prevent that new gesture from reaching the AudioContext.
  const next=await armMediaOutput(audio);if(!next)return false;
  if(output?.context!==next.context){output?.context.removeEventListener('statechange',notify);next.context.addEventListener('statechange',notify)}
  output=next;notify();return next.context.state==='running';
 }
 for(const event of ['play','playing'])audio.addEventListener(event,arm);
 function read(){const ready=output?.context.state==='running';if(!ready||audio.paused||audio.ended){samples.fill(0);spectrum.fill(0);level=0;return{samples,spectrum,level,playing:false,ready:!!ready}}output.analyser.getFloatTimeDomainData(samples);output.analyser.getByteFrequencyData(spectrum);let energy=0;for(const v of samples)energy+=v*v;level=Math.sqrt(energy/samples.length);return{samples,spectrum,level,playing:true,ready:true}}
 return{arm,read,subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener)}};
}
