// Small, interruptible UI movements. No perpetual animation loop or wheel takeover.
export const settle=t=>{const p=Math.max(0,Math.min(1,t));return p*p*p*(p*(p*6-15)+10)};
export const easeOut='cubic-bezier(.22,1,.36,1)';
const quiet=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
export function createDialogMotion(element){
 let animation=null,serial=0;
 element.dataset.motionPhase='idle';
 function run(enter,finish=()=>{},immediate=false){
  const token=++serial,previous=animation;
  // Sample the displayed frame before cancelling: Escape during arrival never jumps.
  const current=previous?getComputedStyle(element):null;
  const from=current?{opacity:current.opacity,transform:current.transform}:enter?{opacity:0,transform:'translateY(14px) scale(.985)'}:{opacity:1,transform:'none'};
  previous?.cancel();animation=null;element.dataset.motionPhase=enter?'arriving':'leaving';
  const complete=()=>{if(token!==serial)return;finish();element.dataset.motionPhase='idle';animation?.cancel();animation=null};
  if(immediate||quiet()){complete();return}
  animation=element.animate([from,enter?{opacity:1,transform:'none'}:{opacity:0,transform:'translateY(8px) scale(.99)'}],{duration:enter?460:250,easing:enter?easeOut:'cubic-bezier(.4,0,.6,1)',fill:'both'});
  animation.finished.then(complete,()=>{});
 }
 return{arrive:()=>run(true),depart:(finish,immediate=false)=>run(false,finish,immediate)};
}
const reveals=new WeakMap();
export function revealContent(element){
 reveals.get(element)?.cancel();if(quiet()||!element)return;
 const animation=element.animate([{opacity:.45,translate:'0 7px'},{opacity:1,translate:'0 0'}],{duration:300,easing:easeOut});
 reveals.set(element,animation);animation.finished.then(()=>{if(reveals.get(element)===animation)reveals.delete(element)},()=>{});
}
