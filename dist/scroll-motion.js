import {settle} from './ui-motion.js';
// Only explicit navigation animates. Wheel/touch/keyboard scrolling stays native.
let frame=0;
export function cancelPageScroll(){cancelAnimationFrame(frame);frame=0}
export function scrollToPosition(top){
 cancelPageScroll();const start=scrollY,end=Math.max(0,Math.min(top,document.documentElement.scrollHeight-innerHeight));
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||Math.abs(end-start)<2){scrollTo({top:end,behavior:'instant'});return}
 const at=performance.now(),duration=Math.min(1050,420+Math.sqrt(Math.abs(end-start))*11);
 function step(now){const p=Math.min(1,(now-at)/duration);scrollTo({top:start+(end-start)*settle(p),behavior:'instant'});frame=p<1?requestAnimationFrame(step):0}
 frame=requestAnimationFrame(step);
}
for(const type of ['wheel','touchstart','pointerdown','pagehide'])window.addEventListener(type,cancelPageScroll,{passive:true});
window.addEventListener('keydown',event=>{if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Escape'].includes(event.key))cancelPageScroll()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelPageScroll()});
