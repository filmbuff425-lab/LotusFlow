// Each new document unlocks its audio; same-page navigation and bfcache retain the live state.
// Playback starts in the real button click, before any asynchronous work.
export function createSoundEntry({root=document.getElementById('sound-entry'),timeoutMs=5000,revealMs=4400,studioTimeoutMs=12000,waitForStudio=root?.dataset.waitForStudio==='true',preview=document.documentElement.dataset.entryPreview==='true'}={}){
 if(!root)return null;
 const button=root.querySelector('[data-enter-with-sound]'),status=root.querySelector('[data-sound-entry-status]');
 if(!button)throw new Error('Sound entry requires its enter button');
 const html=document.documentElement,body=document.body;
 let phase='waiting',cancelAttempt=()=>{},revealTimer=0,observer,pointerGesture=null;
 const previousFocus=document.activeElement,inertState=new Map(),overflow=[html.style.overflow,body.style.overflow];
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const setState=value=>{phase=value;root.dataset.state=value;html.dataset.soundEntry=value};
 const say=text=>{if(status)status.textContent=text};
 const dispatch=(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}));
 function lockSiblings(){
  for(let branch=root,parent=root.parentElement;parent;branch=parent,parent=parent.parentElement){
   for(const sibling of parent.children)if(sibling!==branch){if(!inertState.has(sibling))inertState.set(sibling,sibling.inert);sibling.inert=true}
   if(parent===body)break;
  }
 }
 function unlock(){
  observer?.disconnect();for(const [element,inert] of inertState)element.inert=inert;
  html.style.overflow=overflow[0];body.style.overflow=overflow[1];body.classList.remove('sound-entry-open');
  document.removeEventListener('focusin',keepFocus);root.removeEventListener('keydown',keyTrap);
  root.removeEventListener('pointerdown',rememberPointer);root.removeEventListener('pointermove',trackPointer);root.removeEventListener('pointercancel',cancelPointer);
 }
 function keepFocus(event){if(phase!=='entered'&&!root.contains(event.target))(button.disabled?root:button).focus({preventScroll:true})}
 function keyTrap(event){
  if(event.key==='Escape'){event.preventDefault();return}
  if(event.key!=='Tab')return;
  const focusable=[...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(element=>!element.hidden&&!element.inert);
  const first=focusable[0]||root,last=focusable.at(-1)||root;
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
 function finish(){
  if(phase!=='revealing')return;clearTimeout(revealTimer);root.hidden=true;setState('entered');unlock();
  // Focus the scene without triggering the studio button's glass-preview hover.
  const destination=document.querySelector('[data-sound-entry-focus]')||document.querySelector('#studio-canvas canvas')||document.getElementById('open-studio')||previousFocus;
  if(destination&&!root.contains(destination)&&!destination.inert)destination.focus?.({preventScroll:true});
  dispatch('lotus-entry-complete',{restored:false});
 }
 function reveal(){
  root.dataset.revealMs=String(revealMs);root.style.setProperty('--entry-duration',revealMs+'ms');cancelAttempt();setState('revealing');dispatch('lotus-entry-reveal',{durationMs:revealMs});button.disabled=true;say('');root.setAttribute('aria-busy','false');
  if(reduced||revealMs<=0)finish();else revealTimer=setTimeout(finish,revealMs);
 }
 function prepareScene(){
  cancelAttempt();setState('preparing');button.disabled=true;say('');
  if(!waitForStudio){dispatch('lotus-entry-audible');reveal();return}
  let studioTimer,frame1,frame2,finished=false;
  const ready=()=>{
   if(finished)return;finished=true;clearTimeout(studioTimer);
   // The renderer's ready event follows its draw call. Allow its first real
   // frame to reach the compositor before moving the flat entrance.
   frame1=requestAnimationFrame(()=>{frame2=requestAnimationFrame(reveal)});
  };
  const unavailable=()=>retry('此设备暂时无法显示场景，请刷新重试。\nThe scene could not start. Please reload to retry.');
  cancelAttempt=()=>{clearTimeout(studioTimer);cancelAnimationFrame(frame1);cancelAnimationFrame(frame2);window.removeEventListener('lotus-studio-ready',ready);window.removeEventListener('lotus-studio-unavailable',unavailable);cancelAttempt=()=>{}};
  window.addEventListener('lotus-studio-ready',ready);window.addEventListener('lotus-studio-unavailable',unavailable);
  studioTimer=setTimeout(()=>retry('场景尚未就绪，请轻点重试。\nThe scene is still preparing. Tap to retry.'),studioTimeoutMs);
  dispatch('lotus-entry-audible');
  if(document.getElementById('studio-canvas')?.dataset.firstFrameMs)ready();
 }
 function retry(message){
  cancelAttempt();setState('retry');button.disabled=false;root.setAttribute('aria-busy','false');say(message);button.focus({preventScroll:true});
 }
 function rememberPointer(event){pointerGesture={x:event.clientX,y:event.clientY,moved:false}}
 function trackPointer(event){if(pointerGesture&&Math.hypot(event.clientX-pointerGesture.x,event.clientY-pointerGesture.y)>8)pointerGesture.moved=true}
 function cancelPointer(){pointerGesture=null}
 function start(event){
  // Keyboard activation produces the same trusted click as mouse and touch.
  const dragged=pointerGesture?.moved;pointerGesture=null;if(dragged&&event?.detail!==0)return;
  if(event?.isTrusted===false||phase==='starting'||phase==='preparing'||phase==='revealing'||phase==='entered')return;
  const ambience=document.getElementById('lotus-ambience'),heartbeat=document.getElementById('cube-heart-audio'),sfx=window.lotusSfx;
  if(!ambience||!heartbeat||!sfx?.arm||!document.querySelector('.cube-sound-toggle')){retry('声音尚在准备，请再轻点一次。\nSound is still preparing. Please tap again.');return}
  setState('starting');button.disabled=true;root.focus({preventScroll:true});root.setAttribute('aria-busy','true');say('');
  const media=[ambience,heartbeat],ready=new Set(),cleanups=[],initialTimes=new Map(media.map(element=>[element,element.currentTime]));let timer,poll;
  cancelAttempt=()=>{clearTimeout(timer);clearInterval(poll);for(const cleanup of cleanups)cleanup();cancelAttempt=()=>{}};
  // The ambience is audible immediately. The heartbeat is already unlocked
  // at zero gain, so its later entrance does not need another user gesture.
  const prepared=element=>!element.paused&&(element===heartbeat||!element.muted&&element.volume>0);
  const observe=(element,playing=false)=>{
   if(prepared(element)&&(playing||element.currentTime>initialTimes.get(element)+.001&&element.readyState>=2))ready.add(element);
   if(ready.size===media.length&&phase==='starting')prepareScene();
  };
  for(const element of media){
   const playing=()=>observe(element,true),error=()=>retry('声音未能加载，请轻点重试。\nThe sound could not load. Please tap to retry.');
   element.addEventListener('playing',playing);element.addEventListener('error',error);
   cleanups.push(()=>{element.removeEventListener('playing',playing);element.removeEventListener('error',error)});
  }
  timer=setTimeout(()=>retry('声音尚未开启，请检查网络后轻点重试。\nSound has not started. Check your connection and tap to retry.'),timeoutMs);
  poll=setInterval(()=>{
   for(const element of media)observe(element);
   if(phase!=='starting')return;
   const ambientState=document.querySelector('.interaction-sound-toggle')?.dataset.ambienceState,heartbeatState=document.querySelector('.cube-sound-toggle')?.dataset.audioState;
   if([ambientState,heartbeatState].includes('needs-gesture'))retry('浏览器未开启声音，请再轻点一次。\nYour browser did not start the sound. Please tap to retry.');
   else if([ambientState,heartbeatState].some(state=>state==='unavailable'||state==='error'))retry('声音未能加载，请轻点重试。\nThe sound could not load. Please tap to retry.');
  },100);
  // This explicit sound action overrides an earlier mute. Later navigation
  // never changes that preference merely because this gate was completed.
  try{
   if(sfx.enabled===false){const toggle=document.querySelector('.interaction-sound-toggle');if(!toggle)throw new Error('Sound control unavailable');toggle.click();if(sfx.enabled===false)throw new Error('Sound remains disabled')}
   else Promise.resolve(sfx.arm()).catch(()=>{if(phase==='starting')retry('声音未能开启，请轻点重试。\nSound could not start. Please tap to retry.')});
   // Prime the heartbeat silently in this gesture; its gain opens only after the scene is complete.
   dispatch('lotus-sound-unlock',{source:'sound-entry'});
   for(const element of media)observe(element);
  }catch{retry('声音未能开启，请轻点重试。\nSound could not start. Please tap to retry.')}
 }
 const placeLight=event=>{
  if(phase!=='revealing')return;
  const content=root.querySelector('.sound-entry-content'),light=root.querySelector('.sound-entry-light-anchor');if(!content||!light)return;
  const bounds=content.getBoundingClientRect(),lightBounds=light.getBoundingClientRect(),seed=event.detail.seed??0,trace=event.detail.trace??0;
  root.style.setProperty('--entry-light-x',((event.detail.x-bounds.left-bounds.width/2)*seed)+'px');
  root.style.setProperty('--entry-light-y',((event.detail.y-bounds.top-19-lightBounds.height/2)*seed)+'px');
  const fade=Math.min(1,Math.max(0,trace/.24));root.style.setProperty('--entry-light-opacity',String(1-fade*fade*(3-2*fade)));
 };
 window.addEventListener('lotus-entry-target',placeLight);
 window.addEventListener('lotus-entry-complete',()=>window.removeEventListener('lotus-entry-target',placeLight),{once:true});
 setState('waiting');root.hidden=false;root.tabIndex=-1;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
 if(!root.getAttribute('aria-label')&&!root.getAttribute('aria-labelledby'))root.setAttribute('aria-label','Enter Lotus Flow with sound');
 if(status){status.setAttribute('role','status');status.setAttribute('aria-live','polite')}
 html.style.overflow='hidden';body.style.overflow='hidden';body.classList.add('sound-entry-open');lockSiblings();
 observer=new MutationObserver(lockSiblings);observer.observe(body,{childList:true,subtree:true});
 document.addEventListener('focusin',keepFocus);root.addEventListener('keydown',keyTrap);button.addEventListener('click',start);
 root.addEventListener('pointerdown',rememberPointer,{passive:true});root.addEventListener('pointermove',trackPointer,{passive:true});root.addEventListener('pointercancel',cancelPointer,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&phase==='starting')retry('回来后轻点以开启声音。\nTap to start the sound when you return.')});
 root.focus({preventScroll:true});dispatch('lotus-entry-pending');
 return{get state(){return phase}};
}
if(typeof document!=='undefined'&&document.documentElement.dataset.entryGate==='true')createSoundEntry();
