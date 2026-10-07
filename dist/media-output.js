// One output graph per media element. GainNode envelopes also work on iOS,
// where the system controls HTMLMediaElement.volume.
const outputs=new WeakMap();let context;
export async function armMediaOutput(media){
 try{
  context??=new(window.AudioContext||window.webkitAudioContext)();
  if(context.state!=='running')await context.resume();
  if(context.state!=='running')return null;
  let output=outputs.get(media);if(output)return output;
  const source=context.createMediaElementSource(media),gain=context.createGain(),analyser=context.createAnalyser();analyser.fftSize=512;analyser.smoothingTimeConstant=.72;
  source.connect(analyser).connect(gain).connect(context.destination);output={context,source,gain,analyser};outputs.set(media,output);return output;
 }catch(error){console.warn('Media envelope unavailable',error.message);return null}
}
export const mediaOutput=media=>outputs.get(media);
