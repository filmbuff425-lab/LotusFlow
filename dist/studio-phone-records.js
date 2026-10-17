import {createDialogMotion} from './ui-motion.js';
import {mobileAsset} from './device-profile.js';

// A native scrolling shelf: only the selected case moves in depth.
// Covers share the existing mobile images; no scene or render loop is created.
export function createPhoneRecordShelf(trigger){
 const zh=()=>document.documentElement.lang.startsWith('zh'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const dialog=document.createElement('dialog');dialog.className='phone-record-picker';dialog.setAttribute('aria-label','Studio records');
 const header=document.createElement('header'),heading=document.createElement('div'),eyebrow=document.createElement('p'),title=document.createElement('h2'),close=document.createElement('button');
 eyebrow.className='phone-record-eyebrow';heading.append(eyebrow,title);close.className='phone-record-close';close.textContent='×';close.type='button';close.setAttribute('aria-label','Close record collection');header.append(heading,close);
 const rack=document.createElement('div');rack.className='phone-record-rack';rack.setAttribute('role','group');rack.setAttribute('aria-label','Swipe the shelf and take a CD');
 const caption=document.createElement('div');caption.className='phone-record-caption';caption.setAttribute('aria-live','polite');const name=document.createElement('strong'),artist=document.createElement('span');caption.append(name,artist);
 const hint=document.createElement('p');hint.className='phone-record-hint';
 dialog.append(header,rack,caption,hint);document.body.append(dialog);const motion=createDialogMotion(dialog);
 let active=null,flight=null,serial=0,closing=false,drag=null,suppress=0;
 const tracks=window.lotusCatalog||[],buttons=[];
 function captionFor(track){name.textContent=track?.title||(zh()?'抽出一张唱片':'Take a record');artist.textContent=track?.artist||(zh()?'滑动浏览，轻点抽出':'Slide to browse · tap to pull out')}
 function reset(){serial++;clearTimeout(flight);flight=null;active?.classList.remove('is-taken');active?.setAttribute('aria-pressed','false');active=null;captionFor(null)}
 function dismiss(){if(closing||!dialog.open)return;closing=true;reset();motion.depart(()=>{dialog.close();closing=false;trigger.focus({preventScroll:true})})}
 async function take(button,track){
  if(!dialog.open||performance.now()<suppress||active===button)return;
  if(active){serial++;clearTimeout(flight);flight=null;active.classList.remove('is-taken');active.setAttribute('aria-pressed','false')}
  active=button;const token=++serial;button.classList.add('is-taken');button.setAttribute('aria-pressed','true');captionFor(track);
  // Scroll the jewel case into a generous pocket before turning its cover.
  button.scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest',inline:'center'});
  flight=setTimeout(()=>{if(token!==serial||!dialog.open)return;flight=null;window.lotusPortfolio?.openTrack(track.id,button)},reduced?0:620);
 }
 for(const [index,track]of tracks.entries()){
  const b=document.createElement('button');b.type='button';b.className='phone-record-case';b.setAttribute('aria-label',`Take ${track.title}`);b.setAttribute('aria-pressed','false');
  const jewel=document.createElement('span');jewel.className='phone-record-jewel';const img=new Image();img.src=mobileAsset(track.image);img.alt='';img.loading=index<6?'eager':'lazy';img.decoding='async';img.width=180;img.height=180;
  const spine=document.createElement('span');spine.className='phone-record-spine';spine.textContent=track.title;const number=document.createElement('span');number.className='phone-record-number';number.textContent=String(index+1).padStart(2,'0');
  jewel.append(img,spine);b.append(jewel,number);b.onclick=()=>take(b,track);rack.append(b);buttons.push(b);
 }
 rack.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY}},{passive:true});
 rack.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>10)suppress=performance.now()+350;drag=null},{passive:true});
 rack.addEventListener('pointercancel',()=>{drag=null;suppress=performance.now()+350},{passive:true});
 document.querySelector('#track-dialog').addEventListener('close',()=>{if(!active)return;const b=active;reset();b.focus({preventScroll:true})});
 close.onclick=dismiss;dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss()});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&flight)reset()});
 return{open(){if(dialog.open)return;eyebrow.textContent=`LOTUS FLOW / ${tracks.length} RECORDS`;title.textContent=zh()?'唱片收藏':'CD collection';hint.textContent=zh()?'左右滑动 · 轻点唱片抽出查看':'SLIDE TO BROWSE · TAP A CD TO TAKE IT OUT';reset();dialog.showModal();motion.arrive();close.focus({preventScroll:true})},close:dismiss};
}
