// One analyser is attached to each real media element; no synthetic signal drives the display.
import {armMediaOutput} from './media-output.js?v=20261007-mobile3';
export function createMusicSignal(audio){
 audio.crossOrigin='anonymous';
 let analyser;const samples=new Float32Array(512),spectrum=new Uint8Array(256);let level=0;
 async function arm(){const output=await armMediaOutput(audio);if(output)analyser=output.analyser;}
 audio.addEventListener('play',arm);
 function read(){if(!analyser||audio.paused||audio.ended){samples.fill(0);spectrum.fill(0);level=0;return{samples,spectrum,level,playing:false}}analyser.getFloatTimeDomainData(samples);analyser.getByteFrequencyData(spectrum);let energy=0;for(const v of samples)energy+=v*v;level=Math.sqrt(energy/samples.length);return{samples,spectrum,level,playing:true}}
 return{arm,read};
}
