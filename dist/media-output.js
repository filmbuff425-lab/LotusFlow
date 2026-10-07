// One output graph per media element. GainNode envelopes also work on iOS,
// where the system controls HTMLMediaElement.volume.
const outputs=new WeakMap();let context;
export async function armMediaOutput(media){
 try{
  context??=new(window.AudioContext||window.webkitAudioContext)();
  if(context.state!=='running')await context.resume();
  if(context.state!=='running')return null;
  let output=outputs.get(media);if(output)return output;
  const source=context.createMediaElementSource(media),gain=context.createGain(),volumeGain=context.createGain(),analyser=context.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.72;
  if(media.dataset.listenerVolume!==undefined){volumeGain.gain.setValueAtTime(Number(media.dataset.listenerVolume),context.currentTime);try{media.volume=1}catch{}}
  source.connect(analyser).connect(gain).connect(volumeGain).connect(context.destination);output={context,source,gain,volumeGain,analyser};outputs.set(media,output);return output;
 }catch(error){console.warn('Media envelope unavailable',error.message);return null}
}
export const mediaOutput=media=>outputs.get(media);
export const mediaVolume=media=>media.dataset.listenerVolume===undefined?media.volume:Number(media.dataset.listenerVolume);
export function setMediaVolume(media,value){
 const level=Math.max(0,Math.min(1,value)),output=mediaOutput(media);
 if(output){const param=output.volumeGain.gain,now=output.context.currentTime;const previous=mediaVolume(media);if(media.dataset.listenerVolume===undefined){param.setValueAtTime(previous,now);try{media.volume=1}catch{}}
  param.cancelScheduledValues(now);param.setTargetAtTime(level,now,.025);media.dataset.listenerVolume=String(level);
 }else{try{media.volume=level}catch{}media.dataset.listenerVolume=String(level)}
 media.muted=level===0;
}
