// A short, equal-power tail for recordings and highlight loops. Keep the
// listener's volume setting, and leave the ambient bed / heartbeat untouched.
import {armMediaOutput,mediaOutput} from './media-output.js?v=20261007-mobile3';
const attached=new WeakMap(),mediaElements=new Set();
export function softenMedia(media){
 if(attached.has(media))return attached.get(media);
 let frame=0,tapered=false,started=0;
 const write=value=>{const output=mediaOutput(media);if(output)output.gain.gain.setValueAtTime(Math.max(0,Math.min(1,value)),output.context.currentTime)};
 function reset(){cancelAnimationFrame(frame);frame=0;if(tapered)write(1);tapered=false;delete media.dataset.audioTail;}
 function tick(now){
  frame=0;if(media.paused||media.ended||document.hidden){reset();return}
  const highlight=media.dataset.highlightActive==='true';
  const end=highlight?Math.min(Number(media.dataset.previewEnd)||Infinity,media.duration):media.duration;
  const length=highlight?.85:1.8,remaining=(end-media.currentTime)/media.playbackRate;
  const tail=!media.loop&&Number.isFinite(end)&&remaining<length;
  const fadeIn=highlight?Math.min(1,(now-started)/280):1;
  if(tail||fadeIn<1){const q=tail?Math.max(0,Math.min(1,remaining/length)):1;write(Math.sin(q*Math.PI/2)*Math.sin(fadeIn*Math.PI/2));tapered=true;media.dataset.audioTail=tail?'out':'in'}
  else if(tapered){write(1);tapered=false;delete media.dataset.audioTail}
  frame=requestAnimationFrame(tick);
 }
 function start(){reset();started=performance.now();if(!frame)frame=requestAnimationFrame(tick)}
 media.crossOrigin='anonymous';mediaElements.add(media);
 media.addEventListener('playing',start);media.addEventListener('seeked',start);
 for(const event of ['pause','ended','emptied','loadstart'])media.addEventListener(event,reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();else if(!media.paused)start()});
 const api={reset};attached.set(media,api);if(!media.paused)start();return api;
}
function scan(root){const candidates=root.matches?.('audio,video')?[root]:[];candidates.push(...(root.querySelectorAll?.('audio,video')||[]));for(const media of candidates)if(!media.dataset.ambient&&!media.dataset.heartbeat)softenMedia(media)}
scan(document);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)scan(node)}).observe(document.body,{childList:true,subtree:true});
const prime=()=>{for(const media of mediaElements)armMediaOutput(media)};
document.addEventListener('pointerdown',prime,{capture:true,passive:true});document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')prime()},{capture:true});
