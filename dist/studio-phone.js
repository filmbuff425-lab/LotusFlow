import {createDialogMotion,revealContent} from './ui-motion.js';
import {scrollToPosition} from './scroll-motion.js';
import {entryRevealFrame} from './entry-reveal.js';
import {heartbeatTime,heartbeatEntryGain} from './cube-heartbeat.js?v=20261007-mobile3';
import {mobileAsset} from './device-profile.js';
import {phoneStudio} from './studio-phone-data.js';
import {phoneObjects,objectBounds,swipeDirection,phoneHeartbeatScale} from './studio-phone-interactions.js';
import {openPhoneFilms,mountPhoneFilmScreen} from './studio-phone-films.js';
import {decodeImage as decode,playPhoneTransition} from './studio-phone-media.js';

const html=document.documentElement,section=document.getElementById('studio'),stage=document.getElementById('studio-stage'),host=document.getElementById('studio-canvas'),loading=document.getElementById('studio-loading');
html.dataset.studioRenderer='prerendered';
host.dataset.deviceProfile='phone';host.dataset.roomState='waiting';host.dataset.loadingProfile='prerendered';
host.setAttribute('aria-label','Lotus Flow studio');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const asset=name=>new URL('./assets/phone-studio51/'+name,import.meta.url).href;
const zh=()=>html.lang.startsWith('zh');
const surface=document.createElement('div');surface.className='phone-studio-surface';surface.dataset.phase='closed';surface.tabIndex=0;surface.setAttribute('data-sound-entry-focus','');
const still=new Image();still.className='phone-studio-image';still.alt='Lotus Flow glass studio';still.decoding='async';still.fetchPriority='high';still.src=asset('closed.webp');
const clip=document.createElement('video');clip.className='phone-studio-transition';clip.muted=true;clip.defaultMuted=true;clip.playsInline=true;clip.preload='none';clip.disablePictureInPicture=true;clip.setAttribute('aria-hidden','true');clip.tabIndex=-1;
const contour=document.createElementNS('http://www.w3.org/2000/svg','svg');contour.classList.add('phone-studio-contour');contour.setAttribute('viewBox','0 0 720 900');contour.setAttribute('aria-hidden','true');
const edgeIndices=[[7,6],[6,4],[4,5],[5,7],[7,3],[3,2],[2,6],[3,1],[1,5],[2,0],[0,4],[0,1]];
const dims=[60.105,35.28,68.9535],span=dims.reduce((a,b)=>a+b,0),distance=i=>dims.reduce((sum,d,a)=>sum+((i&(1<<a))?0:d),0)/span;
const paths=edgeIndices.map(([a,b])=>{if(distance(a)>distance(b))[a,b]=[b,a];const p=document.createElementNS(contour.namespaceURI,'path'),A=phoneStudio.corners[a],B=phoneStudio.corners[b];p.setAttribute('d',`M${A[0]*720},${A[1]*900} L${B[0]*720},${B[1]*900}`);p.setAttribute('pathLength','1');p.style.strokeDasharray='1';p.style.strokeDashoffset='1';contour.append(p);return{p,start:distance(a),end:distance(b)}});
const hotspots=document.createElement('div');hotspots.className='phone-studio-hotspots';hotspots.inert=true;
const computer=document.createElement('button'),records=document.createElement('button'),film=document.createElement('button');
const objects={computer,records,film};
for(const [name,b] of Object.entries(objects)){b.type='button';b.className='phone-studio-object';b.dataset.object=name;const light=document.createElement('span');light.className='phone-object-light';light.setAttribute('aria-hidden','true');const dot=document.createElement('span');dot.className='phone-object-dot';dot.setAttribute('aria-hidden','true');b.append(light,dot);hotspots.append(b)}
// A few optical highlights follow the original projected shell; no new scene or decoder.
const shellLight=document.createElementNS(contour.namespaceURI,'svg');shellLight.classList.add('phone-shell-light');shellLight.setAttribute('viewBox','0 0 720 900');shellLight.setAttribute('aria-hidden','true');
for(const [i,indices]of [[2,3,7,6,2],[6,4,5,1,3],[7,5]].entries()){
 const d=indices.map((n,j)=>`${j?'L':'M'}${phoneStudio.corners[n][0]*720},${phoneStudio.corners[n][1]*900}`).join(' ');
 for(const glint of [false,true]){const path=document.createElementNS(contour.namespaceURI,'path');path.setAttribute('d',d);path.setAttribute('pathLength','1');path.setAttribute('class',glint?'phone-shell-glint':'phone-shell-edge');path.style.setProperty('--shell-delay',`${-i*2.1}s`);shellLight.append(path)}
}
surface.append(still,clip,contour,shellLight,hotspots);host.append(surface);
const wallFilm=mountPhoneFilmScreen(surface);
const header=document.querySelector('.header');
if(header)new ResizeObserver(()=>section.style.setProperty('--phone-header-height',`${header.getBoundingClientRect().height}px`)).observe(header);
const entry=document.getElementById('studio-entry'),openButton=document.getElementById('open-studio'),closeButton=document.getElementById('close-studio'),heading=stage.querySelector('.studio-brand-heading');
stage.classList.add('has-glass-entry');entry.hidden=false;
const entryLight=openButton.querySelector('[aria-hidden]');entryLight.textContent='';entryLight.className='phone-object-dot';
const toolbar=document.createElement('nav');toolbar.className='phone-studio-toolbar';toolbar.hidden=true;toolbar.setAttribute('aria-label','Studio views');stage.append(toolbar);
const buttons=new Map();for(const name of ['overview','desk','records']){const b=document.createElement('button');b.type='button';b.dataset.phoneView=name;b.setAttribute('aria-pressed',String(name==='overview'));b.onclick=()=>changeView(name);buttons.set(name,b);toolbar.append(b)}
const openFilm=()=>{if(phase==='open')openPhoneFilms()};film.onclick=()=>{if(phase==='open')openPhoneFilms({wall:true})};
const filmButton=document.createElement('button');filmButton.type='button';filmButton.className='phone-film-button';filmButton.onclick=openFilm;toolbar.append(filmButton);
const hint=document.createElement('p');hint.className='phone-studio-touch-hint';toolbar.append(hint);
let phase='closed',view='overview',operation=0,gateFrame=0,pulseFrame=0,visible=false,lastPulse=0,changingView=false,cancelClip=()=>{};
const photos=new Map();
function photo(name){if(photos.has(name))return photos.get(name);const image=new Image();image.decoding='async';image.src=asset(name+'.webp');photos.set(name,image);return image}
function labels(){
 openButton.querySelector('.studio-enter-label').textContent=zh()?'打开工作室':'OPEN STUDIO';openButton.setAttribute('aria-label',zh()?'打开玻璃工作室':'Open the glass studio');
 document.getElementById('studio-entry-note').textContent=zh()?'轻点盒子，进入音乐空间':'TAP THE CUBE TO STEP INSIDE';
 closeButton.textContent=zh()?'返回盒子':'BACK TO THE CUBE';
 const names=zh()?['工作室','电脑近景','唱片架']:['STUDIO VIEW','DESK CLOSE-UP','RECORD SHELF'];[...buttons.values()].forEach((b,i)=>b.textContent=names[i]);
 filmButton.textContent=zh()?'音乐影像':'MUSIC FILMS';computer.setAttribute('aria-label',zh()?'打开电脑音乐库':'Open computer music library');records.setAttribute('aria-label',zh()?'查看唱片收藏':'Browse studio records');film.setAttribute('aria-label',zh()?'播放右侧屏幕的音乐影像':'Play the music film on the right screen');
 hint.textContent=zh()?'轻触电脑、唱片或影像 · 左右滑动切换视角':'TAP THE SCREENS OR RECORDS · SWIPE TO EXPLORE';
 surface.setAttribute('aria-label',phase==='closed'?(zh()?'轻点打开玻璃工作室':'Tap to open the glass studio'):(zh()?'工作室，轻触电脑、唱片或右侧影像':'Studio. Tap the computer, records or right film screen.'));
}
new MutationObserver(labels).observe(html,{attributes:true,attributeFilter:['lang']});labels();
function placeHotspots(){
 for(const [name,b]of Object.entries(objects)){
  const points=phoneObjects[view][name];b.hidden=!points;if(!points)continue;
  const r=objectBounds(points);b.style.left=r.x*100+'%';b.style.top=r.y*100+'%';b.style.width=r.width*100+'%';b.style.height=r.height*100+'%';b.style.setProperty('--object-shape',r.clip);
 }
 hotspots.inert=phase!=='open'||changingView;hotspots.classList.toggle('is-visible',phase==='open'&&!changingView);ambient();
}
function ambient(){const awake=visible&&!document.hidden&&!document.querySelector('dialog[open]');stage.classList.toggle('phone-stage-awake',awake);hotspots.classList.toggle('is-awake',awake);wallFilm.setActive(awake&&phase==='open'&&view==='overview'&&!changingView)}
window.addEventListener('lotus-phone-film-close',ambient);
new MutationObserver(ambient).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});

function setPhase(value){phase=value;if(value==='open'||value==='closed')surface.style.setProperty('--phone-shell-form',value==='open'?'1':'0');if(value==='open'||value==='closed')stage.style.setProperty('--phone-room-mix',value==='open'?'1':'0');surface.style.setProperty('--phone-cube-scale','1');surface.dataset.phase=value;host.dataset.roomState=value;const busy=value==='opening'||value==='closing';openButton.disabled=busy;closeButton.disabled=busy;toolbar.inert=busy;placeHotspots();labels()}
function stopClip(){cancelClip();cancelClip=()=>{};clip.pause();clip.classList.remove('is-playing');}
function settled(open){stopClip();stopViewMotion(false);surface.querySelectorAll('.phone-studio-blend').forEach(layer=>layer.remove());buttons.forEach((b,name)=>b.setAttribute('aria-pressed',String(name===view)));still.style.opacity='1';still.style.transform='';still.src=asset((open?view:'closed')+'.webp');setPhase(open?'open':'closed');stage.classList.toggle('is-room-open',open);stage.classList.remove('is-opening-room');section.classList.toggle('room-is-open',open);entry.hidden=open;closeButton.hidden=!open;toolbar.hidden=!open;if(open){revealContent(toolbar);decode(photo('desk'));decode(photo('records'))}if(heading)heading.style.opacity=open?'0':'1';window.dispatchEvent(new Event('lotus-room-settled'));pulse();}
function frame(){const height=header?.getBoundingClientRect().height||112,top=stage.getBoundingClientRect().top;if(top<height-80||top>height+80)scrollToPosition(top+scrollY-height)}
function preloadClip(){if(phase==='closed'&&clip.getAttribute('src')!==asset('enter.mp4')){clip.src=asset('enter.mp4');clip.preload='auto';clip.load()}}
async function fallback(open,token){
 stopClip();const next=open?photo('overview'):photo('closed'),ready=await decode(next);if(token!==operation)return;
 if(!ready){settled(false);document.getElementById('studio-entry-note').textContent=zh()?'画面尚未加载，轻点重试':'IMAGE NOT READY — TAP TO RETRY';return}
 // Already-decoded layers keep slow video downloads from blocking navigation.
 const layer=next.cloneNode();layer.className='phone-studio-image phone-studio-blend';layer.style.cssText='z-index:1;transition:none';surface.insertBefore(layer,clip);
 const duration=reduced?0:780,options={duration,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'};
 const arrive=layer.animate([{opacity:0,transform:'scale(1.035)'},{opacity:1,transform:'scale(1)'}],options),depart=still.animate([{opacity:1},{opacity:0}],options);
 const start=performance.now(),from=Number(stage.style.getPropertyValue('--phone-room-mix'))||0,target=open?1:0;
 let fadeFrame=0;const blend=now=>{if(token!==operation)return;const p=duration?Math.min(1,(now-start)/duration):1,ease=1-Math.pow(1-p,3);surface.style.setProperty('--phone-shell-form',String(from+(target-from)*ease));stage.style.setProperty('--phone-room-mix',String(from+(target-from)*ease));if(p<1)fadeFrame=requestAnimationFrame(blend)};fadeFrame=requestAnimationFrame(blend);
 await arrive.finished.catch(()=>{});cancelAnimationFrame(fadeFrame);if(token===operation)settled(open);arrive.cancel();depart.cancel();layer.remove();
}
function playTransition(open,token){
 stopClip();let warm=false,blue=false;
 cancelClip=playPhoneTransition(clip,{
  src:asset(open?'enter.mp4':'return.mp4'),
  onStart:()=>{if(token===operation)clip.classList.add('is-playing')},
  onEnd:()=>{if(token===operation)settled(open)},
  onFallback:()=>{if(token===operation)fallback(open,token).then(()=>{if(open&&phase==='open'&&token===operation)window.dispatchEvent(new Event('lotus-studio-reveal'))})},
  onProgress:t=>{
   if(token!==operation)return;
   const form=Math.max(0,Math.min(1,open?t/1.8:(5.8-t)/1.8));surface.style.setProperty('--phone-shell-form',String(form*form*(3-2*form)));
   const mix=Math.max(0,Math.min(1,(t-1.7)/1.8));stage.style.setProperty('--phone-room-mix',String(open?mix:1-mix));
   if(open&&t>=1.148&&!warm){warm=true;window.lotusStudioMedia?.warmupEntrance()}
   if(open&&t>=2.015&&!blue){blue=true;window.dispatchEvent(new Event('lotus-studio-reveal'))}
  }
 });
}
async function enter(){
 if(phase!=='closed'||['waiting','starting','preparing','retry','revealing'].includes(html.dataset.soundEntry))return;
 wallFilm.prime();const token=++operation;setPhase('opening');entry.hidden=true;stage.classList.add('is-opening-room');if(heading)heading.style.opacity='0';frame();window.dispatchEvent(new CustomEvent('lotus-room-change',{detail:true}));window.lotusStudioMedia?.armEntrance();view='overview';
 if(reduced){settled(true);window.dispatchEvent(new Event('lotus-studio-reveal'));return}
 playTransition(true,token);
}
async function leave(){
 if(phase!=='open')return;stopViewMotion();const token=++operation;setPhase('closing');toolbar.hidden=true;window.dispatchEvent(new CustomEvent('lotus-room-change',{detail:false}));
 if(reduced||view!=='overview'){view='overview';await fallback(false,token);return}
 playTransition(false,token);
}
let wantedView=null,viewAnimations=[],viewLayer=null;
function stopViewMotion(invalidate=true){
 if(invalidate)operation++;wantedView=null;for(const animation of viewAnimations)animation.cancel();viewAnimations=[];viewLayer?.remove();viewLayer=null;changingView=false;
}
async function changeView(next){
 if(phase!=='open')return;
 wantedView=next;buttons.forEach((b,name)=>b.setAttribute('aria-pressed',String(name===next)));
 if(changingView||next===view)return;
 changingView=true;placeHotspots();const token=++operation;
 while(token===operation&&phase==='open'&&wantedView!==view){
  const destination=wantedView,image=photo(destination);
  const ready=await decode(image);if(token!==operation)return;
  if(!ready){wantedView=view;break}
  if(destination!==wantedView)continue;
  const direction=['overview','desk','records'].indexOf(destination)>['overview','desk','records'].indexOf(view)?1:-1;
  const layer=image.cloneNode();viewLayer=layer;layer.className='phone-studio-image phone-studio-blend';layer.style.cssText='z-index:1;transition:none';surface.insertBefore(layer,clip);
  const options={duration:reduced?0:540,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'};
  const arrive=layer.animate([{opacity:0,transform:`translateX(${direction*7}px) scale(1.018)`},{opacity:1,transform:'translateX(0) scale(1)'}],options);
  const depart=still.animate([{opacity:1,transform:'scale(1)'},{opacity:.18,transform:`translateX(${-direction*4}px) scale(.994)`}],options);viewAnimations=[arrive,depart];
  await arrive.finished.catch(()=>{});if(token!==operation)return;
  still.src=image.src;await decode(still);if(token!==operation)return;
  view=destination;surface.dataset.view=view;arrive.cancel();depart.cancel();layer.remove();viewLayer=null;viewAnimations=[];
 }
 if(token!==operation)return;
 changingView=false;buttons.forEach((b,name)=>b.setAttribute('aria-pressed',String(name===view)));placeHotspots();
}
// Native vertical scrolling remains untouched; a deliberate horizontal gesture
// changes the room view and must never activate the object under the finger.
let pointer=null,suppressClickUntil=0;
surface.addEventListener('pointerdown',e=>{if(phase==='open')pointer={id:e.pointerId,x:e.clientX,y:e.clientY}},{passive:true});
surface.addEventListener('pointerup',e=>{
 if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;
 if(Math.hypot(dx,dy)>14)suppressClickUntil=performance.now()+400;
 const direction=swipeDirection(dx,dy),views=['overview','desk','records'];
 if(direction)changeView(views[(views.indexOf(wantedView||view)+direction+views.length)%views.length]);
},{passive:true});
surface.addEventListener('pointercancel',()=>{pointer=null;suppressClickUntil=performance.now()+400},{passive:true});
surface.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
openButton.addEventListener('click',enter);surface.addEventListener('click',event=>{if(event.target.closest('button'))return;enter()});surface.addEventListener('keydown',event=>{if(event.target!==surface)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();enter()}});closeButton.addEventListener('click',leave);
computer.onclick=()=>window.lotusDesktop?.open();
let recordDialog,recordMotion,recordClosing=false;
function closeRecords(){if(recordClosing||!recordDialog?.open)return;recordClosing=true;recordMotion.depart(()=>{recordDialog.close();recordClosing=false;records.focus({preventScroll:true})})}
records.onclick=()=>{
 if(!recordDialog){
  recordDialog=document.createElement('dialog');recordDialog.className='phone-record-picker';recordDialog.setAttribute('aria-label',zh()?'唱片收藏':'Studio records');
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent='CD collection';const heading=document.createElement('div'),eyebrow=document.createElement('p');eyebrow.className='phone-record-eyebrow';heading.append(eyebrow,title);close.className='phone-record-close';close.textContent='×';close.type='button';close.setAttribute('aria-label','Close record collection');close.onclick=closeRecords;header.append(heading,close);
  const list=document.createElement('div');list.className='phone-record-list';
  for(const track of window.lotusCatalog||[]){const b=document.createElement('button');b.type='button';const img=new Image();img.src=mobileAsset(track.image);img.alt='';img.loading='lazy';img.decoding='async';img.width=320;img.height=320;const t=document.createElement('strong'),a=document.createElement('small');t.textContent=track.title;a.textContent=track.artist;b.append(img,t,a);b.onclick=()=>{recordMotion.depart(()=>recordDialog.close(),true);recordClosing=false;window.lotusPortfolio?.openTrack(track.id,records)};list.append(b)}
  recordDialog.append(header,list);document.body.append(recordDialog);recordMotion=createDialogMotion(recordDialog);recordDialog.addEventListener('cancel',e=>{e.preventDefault();closeRecords()});recordDialog.addEventListener('click',e=>{if(e.target===recordDialog){const r=recordDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRecords()}});
 }
 recordDialog.querySelector('h2').textContent=zh()?'唱片收藏':'CD collection';recordDialog.querySelector('.phone-record-eyebrow').textContent=zh()?`工作室 / ${window.lotusCatalog?.length||0} 张唱片`:`STUDIO / ${window.lotusCatalog?.length||0} RECORDS`;recordDialog.querySelector('header button').setAttribute('aria-label',zh()?'关闭唱片收藏':'Close record collection');recordDialog.showModal();recordMotion.arrive();
};
function pulse(){cancelAnimationFrame(pulseFrame);pulseFrame=0;if(!visible||document.hidden||phase!=='closed'||html.dataset.soundEntry!=='entered'||reduced)return;
 const tick=now=>{if(!visible||document.hidden||phase!=='closed'||html.dataset.soundEntry!=='entered'){pulseFrame=0;return}if(now-lastPulse>=24){surface.style.setProperty('--phone-cube-scale',String(phoneHeartbeatScale(heartbeatTime(),heartbeatEntryGain())));lastPulse=now}pulseFrame=requestAnimationFrame(tick)};pulseFrame=requestAnimationFrame(tick);
}
new IntersectionObserver(([e])=>{visible=e.isIntersecting;ambient();pulse()}).observe(stage);
window.addEventListener('lotus-entry-reveal',event=>{
 const at=performance.now(),duration=event.detail.durationMs;
 const animate=now=>{const p=Math.min(1,(now-at)/duration),f=entryRevealFrame(p),scale=.66+.34*f.approach;surface.style.setProperty('--phone-entry-red',f.red);stage.style.setProperty('--phone-entry-glow',f.red);surface.style.setProperty('--phone-entry-scale',scale);surface.style.setProperty('--phone-entry-contour',f.outline*(1-Math.min(1,f.red/.22)));html.style.setProperty('--entry-ui',f.copy);
 for(const {p:path,start,end} of paths)path.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,(f.trace-start)/(end-start))));
 const bounds=surface.getBoundingClientRect(),corner=phoneStudio.corners[7];window.dispatchEvent(new CustomEvent('lotus-entry-target',{detail:{x:bounds.left+((corner[0]-.5)*scale+.5)*bounds.width,y:bounds.top+((corner[1]-.5)*scale+.5)*bounds.height,seed:f.seed,trace:f.trace}}));if(p<1)gateFrame=requestAnimationFrame(animate);
 };if(!reduced)gateFrame=requestAnimationFrame(animate);
},{once:true});
window.addEventListener('lotus-entry-complete',()=>{cancelAnimationFrame(gateFrame);html.style.removeProperty('--entry-ui');preloadClip();pulse()},{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(changingView){stopViewMotion();placeHotspots()}if(phase==='opening'||phase==='closing'){operation++;settled(phase==='opening')}cancelAnimationFrame(gateFrame)}ambient();pulse()});
window.addEventListener('pageshow',pulse);
window.addEventListener('pagehide',()=>{stopViewMotion();stopClip();cancelAnimationFrame(pulseFrame);cancelAnimationFrame(gateFrame)});
if(!await decode(still))throw new Error('Studio image could not load');loading.hidden=true;host.dataset.firstFrameMs=performance.now().toFixed(0);window.dispatchEvent(new Event('lotus-studio-ready'));
// Prepare one modest video and the destination still, never the original model.
decode(photo('overview'));window.addEventListener('lotus-entry-audible',preloadClip,{once:true});if(html.dataset.soundEntry==='entered')preloadClip();
