// A short, equal-power tail for recordings and highlight loops. Keep the
// listener's volume setting, and leave the ambient bed / heartbeat untouched.
import {armMediaOutput,mediaOutput} from './media-output.js?v=20261007-mobile3';
const attached=new WeakMap(),mediaElements=new Set();
export function softenMedia(media){
 if(attached.has(media))return attached.get(media);
 let frame=0,tapered=false,fadeTimer=0,finishFade=null,playbackActive=false,fadeInUntil=0;
 const write=value=>{const output=mediaOutput(media);if(output)output.gain.gain.setValueAtTime(Math.max(0,Math.min(1,value)),output.context.currentTime)};
 function reset(){cancelAnimationFrame(frame);frame=0;clearTimeout(fadeTimer);fadeTimer=0;finishFade?.(false);finishFade=null;const output=mediaOutput(media);output?.gain.gain.cancelScheduledValues(output.context.currentTime);if(tapered)write(1);tapered=false;delete media.dataset.audioTail;}
 function fadeTo(target=0,duration=420){
  const output=mediaOutput(media);if(!output||media.paused)return Promise.resolve(true);
  const level=output.gain.gain.value;reset();const param=output.gain.gain,at=output.context.currentTime;
  param.setValueAtTime(level,at);for(let i=1;i<=24;i++){const q=i/24,s=q*q*(3-2*q);param.linearRampToValueAtTime(level+(target-level)*s,at+duration*q/1000)}
  tapered=true;media.dataset.audioTail='out';return new Promise(resolve=>{finishFade=resolve;fadeTimer=setTimeout(()=>{fadeTimer=0;finishFade=null;resolve(true)},duration)});
 }
 function tick(now){
  frame=0;if(media.paused||media.ended||document.hidden){reset();return}
  const highlight=media.dataset.highlightActive==='true';
  const end=highlight?Math.min(Number(media.dataset.previewEnd)||Infinity,media.duration):media.duration;
  const length=highlight?1.2:2.4,remaining=(end-media.currentTime)/media.playbackRate;
  const tail=!media.loop&&Number.isFinite(end)&&remaining<length;
  const output=mediaOutput(media),fadingIn=output&&output.context.currentTime<fadeInUntil;
  if(tail&&!fadingIn){const q=Math.max(0,Math.min(1,remaining/length));write(Math.sin(q*Math.PI/2));tapered=true;media.dataset.audioTail='out'}
  else if(fadingIn){/* AudioParam automation continues even when a video frame is expensive. */}
  else if(tapered){write(1);tapered=false;delete media.dataset.audioTail}
  frame=requestAnimationFrame(tick);
 }
 function start(){reset();playbackActive=true;const output=mediaOutput(media);if(output){const at=output.context.currentTime,param=output.gain.gain,duration=media.dataset.highlightActive==='true'?.36:.65;param.setValueAtTime(0,at);for(let i=1;i<=32;i++)param.linearRampToValueAtTime(Math.sin(i/32*Math.PI/2),at+duration*i/32);fadeInUntil=at+duration;tapered=true;media.dataset.audioTail='in'}if(!frame)frame=requestAnimationFrame(tick)}
 media.crossOrigin='anonymous';mediaElements.add(media);
 // A 'playing' event after buffering is continuation, not a fresh track.
 media.addEventListener('playing',()=>{if(!playbackActive)start()});media.addEventListener('seeked',()=>{if(!media.paused)start()});
 for(const event of ['pause','ended','emptied','loadstart'])media.addEventListener(event,()=>{playbackActive=false;reset()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();else if(!media.paused&&!frame){frame=requestAnimationFrame(tick)}});
 const api={reset,fadeTo};attached.set(media,api);if(!media.paused)start();return api;
}
export const fadeMedia=(media,duration=420)=>softenMedia(media).fadeTo(0,duration);
function scan(root){const candidates=root.matches?.('audio,video')?[root]:[];candidates.push(...(root.querySelectorAll?.('audio,video')||[]));for(const media of candidates)if(!media.dataset.ambient&&!media.dataset.heartbeat)softenMedia(media)}
scan(document);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node)}).observe(document.body,{childList:true,subtree:true});
const prime=()=>{for(const media of mediaElements)armMediaOutput(media)};
document.addEventListener('pointerdown',prime,{capture:true,passive:true});document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')prime()},{capture:true});
