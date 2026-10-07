// One analyser is attached to each real media element; no synthetic signal drives the display.
export function createMusicSignal(audio){
 audio.crossOrigin='anonymous';
 let context,analyser,source;const samples=new Float32Array(512),spectrum=new Uint8Array(256);let level=0;
 async function arm(){try{if(!context){context=new (window.AudioContext||window.webkitAudioContext)();analyser=context.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.72;source=context.createMediaElementSource(audio);source.connect(analyser).connect(context.destination)}if(context.state!=='running')await context.resume()}catch(e){console.warn('Audio visualizer unavailable',e.message)}}
 audio.addEventListener('play',arm);
 function read(){if(!analyser||audio.paused||audio.ended){samples.fill(0);spectrum.fill(0);level=0;return{samples,spectrum,level,playing:false}}analyser.getFloatTimeDomainData(samples);analyser.getByteFrequencyData(spectrum);let energy=0;for(const v of samples)energy+=v*v;level=Math.sqrt(energy/samples.length);return{samples,spectrum,level,playing:true}}
 return{arm,read};
}
