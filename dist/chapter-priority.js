// Build a heavy scene only when its chapter is visible, and after the identity cut.
// Waiting uses visibility events rather than a background polling loop.
export function waitForVisibleChapter(element){
 const available=()=>{const box=element.getBoundingClientRect();return !document.hidden&&!document.body.classList.contains('prologue-open')&&box.width>0&&box.height>0&&box.bottom>0&&box.top<innerHeight};
 if(available())return Promise.resolve();
 return new Promise(resolve=>{
  const check=()=>{if(!available())return;observer.disconnect();document.removeEventListener('visibilitychange',check);window.removeEventListener('lotus-prologue-end',check);resolve()};
  const observer=new IntersectionObserver(check);observer.observe(element);document.addEventListener('visibilitychange',check);window.addEventListener('lotus-prologue-end',check);check();
 });
}

export const identityMotionActive=()=>typeof document!=='undefined'&&Boolean(document.body?.classList.contains('prologue-open'));
export function waitForIdentityMotion(){
 if(!identityMotionActive())return Promise.resolve();
 return new Promise(resolve=>window.addEventListener('lotus-prologue-end',resolve,{once:true}));
}
