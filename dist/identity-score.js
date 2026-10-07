// One clock for the approved blade mix and the musical reveal. The supplied
// track's first strong drum transient is at 43.12 s; the visitor need not wait.
export const identityBeat=43.12;
// Map the audio output clock to the animation clock, including device latency.
export function audioVisualTime(ctx,at,now=performance.now()){
 const stamp=ctx.getOutputTimestamp?.();
 if(stamp?.performanceTime>0&&Number.isFinite(stamp.contextTime)&&Math.abs(now-stamp.performanceTime)<500)return stamp.performanceTime+(at-stamp.contextTime)*1000;
 return now+(at-ctx.currentTime+(ctx.outputLatency||ctx.baseLatency||0))*1000;
}
export function createIdentityScore({getContext,loadBuffer,announce,onState=()=>{}}){
 let buffer,loading,revision=0,current=null,phase='warmup',saved=0,loopTimer=0;
 const layers=new Set();
 function state(value){onState(value,{phase,cue:identityBeat,playing:layers.size>0})}
 async function prepare(){
  const ctx=getContext();const resuming=ctx.resume();
  if(!buffer)loading??=loadBuffer(ctx).then(value=>buffer=value).catch(error=>{loading=null;throw error});
  await Promise.all([resuming,loading]);return ctx.state==='running'&&Boolean(buffer);
 }
 function layer(at,offset,volume){
  const ctx=getContext(),source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;source.loop=false;
  source.loopStart=phase==='warmup'?0:identityBeat;source.loopEnd=phase==='warmup'?40.9:buffer.duration;
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(volume,at+.015);source.connect(gain).connect(ctx.destination);
  const end=at+source.loopEnd-offset,overlap=Math.min(.85,(end-at)/2);
  gain.gain.setValueAtTime(volume,end-overlap);gain.gain.linearRampToValueAtTime(0,end);
  const item={source,gain,at,offset};layers.add(item);source.onended=()=>{layers.delete(item);source.disconnect();gain.disconnect()};source.start(at,offset);source.stop(end);
  // Schedule the next phrase on the audio clock; waiting on this page never
  // reaches the drum section, and neither loop has a hard cut at its boundary.
  clearTimeout(loopTimer);const token=revision,loopPhase=phase;
  loopTimer=setTimeout(()=>{if(token!==revision||phase!==loopPhase||!current)return;const next=layer(end-overlap,source.loopStart,volume);next.gain.gain.cancelScheduledValues(end-overlap);next.gain.gain.setValueAtTime(0,end-overlap);next.gain.gain.linearRampToValueAtTime(volume,end);const nextEnd=next.at+next.source.loopEnd-next.offset;next.gain.gain.setValueAtTime(volume,nextEnd-.85);next.gain.gain.linearRampToValueAtTime(0,nextEnd);current=next},Math.max(0,(end-overlap-ctx.currentTime-.25)*1000));
  return item;
 }
 function pause(){
  revision++;clearTimeout(loopTimer);if(current){const ctx=getContext(),begin=phase==='warmup'?0:identityBeat,end=phase==='warmup'?40.9:buffer.duration;saved=begin+((current.offset-begin+Math.max(0,ctx.currentTime-current.at))%(end-begin));}
  current=null;for(const item of layers){const ctx=getContext(),value=item.at>ctx.currentTime?0:item.gain.gain.value;item.gain.gain.cancelScheduledValues(ctx.currentTime);item.gain.gain.setValueAtTime(value,ctx.currentTime);item.gain.gain.linearRampToValueAtTime(0,ctx.currentTime+.24);try{item.source.stop(ctx.currentTime+.25)}catch{}}layers.clear();state('paused');
 }
 async function enter(revealed=false){
  if(current)return;const token=++revision;const next=revealed?'reveal':'warmup';if(phase!==next){phase=next;saved=revealed?identityBeat:0}state('loading');
  try{if(!await prepare()||token!==revision)return;announce();current=layer(getContext().currentTime+.02,saved,phase==='warmup'?.32:.29);state(phase)}catch{if(token===revision)state('needs-gesture')}
 }
 function reveal(at){
  if(!buffer||getContext().state!=='running')return false;revision++;clearTimeout(loopTimer);const ctx=getContext(),when=Math.max(at,ctx.currentTime+.035),old=current;
  // Start 20 ms before the attack, and let the two short tails crossfade.
  phase='reveal';saved=identityBeat;announce();
  current=layer(when-.02,identityBeat-.02,.29);
  for(const item of layers)if(item!==current){item.gain.gain.cancelScheduledValues(ctx.currentTime);item.gain.gain.setValueAtTime(item===old ? .32 : 0,ctx.currentTime);item.gain.gain.linearRampToValueAtTime(0,when-.02);try{item.source.stop(when+.01)}catch{}}
  state('reveal-scheduled');onState('reveal-scheduled',{phase,cue:identityBeat,playing:true,at:when});return true;
 }
 return {prepare,enter,reveal,pause,get playing(){return layers.size>0},get phase(){return phase}};
}
