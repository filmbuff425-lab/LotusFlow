import {entryRevealFrame} from './entry-reveal.js';
import {heartbeatTime,heartbeatEntryGain} from './cube-heartbeat.js?v=20261007-mobile3';
import {mobileAsset} from './device-profile.js';
import {phoneStudio} from './studio-phone-data.js';
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
const computer=document.createElement('button'),records=document.createElement('button');
for(const b of [computer,records]){b.type='button';b.className='phone-studio-hotspot';b.append(document.createElement('span'));hotspots.append(b)}
surface.append(still,clip,contour,hotspots);host.append(surface);
const entry=document.getElementById('studio-entry'),openButton=document.getElementById('open-studio'),closeButton=document.getElementById('close-studio'),heading=stage.querySelector('.studio-brand-heading');
stage.classList.add('has-glass-entry');entry.hidden=false;
const toolbar=document.createElement('nav');toolbar.className='phone-studio-toolbar';toolbar.hidden=true;toolbar.setAttribute('aria-label','Studio views');stage.after(toolbar);
const buttons=new Map();for(const name of ['overview','desk','records']){const b=document.createElement('button');b.type='button';b.dataset.phoneView=name;b.setAttribute('aria-pressed',String(name==='overview'));b.onclick=()=>changeView(name);buttons.set(name,b);toolbar.append(b)}
const library=document.createElement('button');library.type='button';library.onclick=()=>window.lotusDesktop?.open();toolbar.append(library);
let phase='closed',view='overview',operation=0,gateFrame=0,pulseFrame=0,visible=false,lastPulse=0,cancelClip=()=>{};
const photos=new Map();
function photo(name){if(photos.has(name))return photos.get(name);const image=new Image();image.decoding='async';image.src=asset(name+'.webp');photos.set(name,image);return image}
function labels(){
 openButton.querySelector('.studio-enter-label').textContent=zh()?'打开工作室':'OPEN STUDIO';openButton.setAttribute('aria-label',zh()?'打开玻璃工作室':'Open the glass studio');
 document.getElementById('studio-entry-note').textContent=zh()?'轻点盒子，进入音乐空间':'TAP THE CUBE TO STEP INSIDE';
 closeButton.textContent=zh()?'返回盒子':'BACK TO THE CUBE';
 const names=zh()?['工作室','电脑近景','唱片架']:['STUDIO VIEW','DESK CLOSE-UP','RECORD SHELF'];[...buttons.values()].forEach((b,i)=>b.textContent=names[i]);
 library.textContent=zh()?'打开电脑':'USE COMPUTER';computer.setAttribute('aria-label',zh()?'打开电脑音乐库':'Open computer music library');records.setAttribute('aria-label',zh()?'查看唱片收藏':'Browse studio records');computer.firstElementChild.textContent=zh()?'电脑':'MUSIC';records.firstElementChild.textContent=zh()?'唱片':'RECORDS';
 surface.setAttribute('aria-label',phase==='closed'?(zh()?'轻点打开玻璃工作室':'Tap to open the glass studio'):(zh()?'工作室，点击电脑或唱片':'Studio. Select the computer or records.'));
}
new MutationObserver(labels).observe(html,{attributes:true,attributeFilter:['lang']});labels();
function placeHotspots(){for(const [name,b]of [['computer',computer],['records',records]]){const [x,y]=phoneStudio.views[view][name];b.style.left=x*100+'%';b.style.top=y*100+'%';b.hidden=x<.05||x>.95||y<.08||y>.88}hotspots.inert=phase!=='open';hotspots.classList.toggle('is-visible',phase==='open');}
function setPhase(value){phase=value;surface.style.setProperty('--phone-cube-scale','1');surface.dataset.phase=value;host.dataset.roomState=value;const busy=value==='opening'||value==='closing';openButton.disabled=busy;closeButton.disabled=busy;toolbar.inert=busy;placeHotspots();labels()}
function stopClip(){cancelClip();cancelClip=()=>{};clip.pause();clip.classList.remove('is-playing');}
function settled(open){stopClip();surface.querySelectorAll('.phone-studio-blend').forEach(layer=>layer.remove());buttons.forEach((b,name)=>b.setAttribute('aria-pressed',String(name===view)));still.style.opacity='1';still.style.transform='';still.src=asset((open?view:'closed')+'.webp');setPhase(open?'open':'closed');stage.classList.toggle('is-room-open',open);stage.classList.remove('is-opening-room');section.classList.toggle('room-is-open',open);entry.hidden=open;closeButton.hidden=!open;toolbar.hidden=!open;if(heading)heading.style.opacity=open?'0':'1';window.dispatchEvent(new Event('lotus-room-settled'));pulse();}
function frame(){const height=document.querySelector('.header')?.getBoundingClientRect().height||112;window.scrollTo({top:stage.getBoundingClientRect().top+scrollY-height,behavior:reduced?'instant':'smooth'})}
function preloadClip(){if(phase==='closed'&&clip.getAttribute('src')!==asset('enter.mp4')){clip.src=asset('enter.mp4');clip.preload='auto';clip.load()}}
async function fallback(open,token){
 stopClip();const next=open?photo('overview'):photo('closed'),ready=await decode(next);if(token!==operation)return;
 if(!ready){settled(false);document.getElementById('studio-entry-note').textContent=zh()?'画面尚未加载，轻点重试':'IMAGE NOT READY — TAP TO RETRY';return}
 // Already-decoded layers keep slow video downloads from blocking navigation.
 const layer=next.cloneNode();layer.className='phone-studio-image phone-studio-blend';layer.style.cssText='opacity:0;transform:scale(1.035);z-index:1';surface.insertBefore(layer,clip);
 requestAnimationFrame(()=>{layer.style.opacity='1';layer.style.transform='scale(1)';still.style.opacity='0'});
 await new Promise(resolve=>setTimeout(resolve,reduced?0:700));if(token===operation)settled(open);layer.remove();
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
   if(open&&t>=1.148&&!warm){warm=true;window.lotusStudioMedia?.warmupEntrance()}
   if(open&&t>=2.015&&!blue){blue=true;window.dispatchEvent(new Event('lotus-studio-reveal'))}
  }
 });
}
async function enter(){
 if(phase!=='closed'||['waiting','starting','preparing','retry','revealing'].includes(html.dataset.soundEntry))return;
 const token=++operation;setPhase('opening');entry.hidden=true;stage.classList.add('is-opening-room');if(heading)heading.style.opacity='0';frame();window.dispatchEvent(new CustomEvent('lotus-room-change',{detail:true}));window.lotusStudioMedia?.armEntrance();view='overview';
 if(reduced){settled(true);window.dispatchEvent(new Event('lotus-studio-reveal'));return}
 playTransition(true,token);
}
async function leave(){
 if(phase!=='open')return;const token=++operation;setPhase('closing');toolbar.hidden=true;window.dispatchEvent(new CustomEvent('lotus-room-change',{detail:false}));
 if(reduced||view!=='overview'){view='overview';await fallback(false,token);return}
 playTransition(false,token);
}
async function changeView(next){
 if(phase!=='open'||next===view)return;const token=++operation;const image=photo(next);if(!await decode(image)||token!==operation)return;
 hotspots.inert=true;hotspots.classList.remove('is-visible');
 const layer=image.cloneNode();layer.className='phone-studio-image phone-studio-blend';layer.style.cssText='opacity:0;transform:scale(1.025);z-index:1';surface.insertBefore(layer,clip);
 requestAnimationFrame(()=>{layer.style.opacity='1';layer.style.transform='scale(1)'});
 await new Promise(resolve=>setTimeout(resolve,reduced?0:700));if(token!==operation){layer.remove();return}view=next;still.src=image.src;await decode(still);layer.remove();if(token!==operation)return;buttons.forEach((b,name)=>b.setAttribute('aria-pressed',String(name===view)));placeHotspots();
}
openButton.addEventListener('click',enter);surface.addEventListener('click',event=>{if(event.target.closest('button'))return;enter()});surface.addEventListener('keydown',event=>{if(event.target!==surface)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();enter()}});closeButton.addEventListener('click',leave);
computer.onclick=()=>window.lotusDesktop?.open();
let recordDialog;
records.onclick=()=>{
 if(!recordDialog){
  recordDialog=document.createElement('dialog');recordDialog.className='phone-record-picker';recordDialog.setAttribute('aria-label',zh()?'唱片收藏':'Studio records');
  const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent='CD COLLECTION';close.textContent='×';close.type='button';close.setAttribute('aria-label','Close record collection');close.onclick=()=>recordDialog.close();header.append(title,close);
  const list=document.createElement('div');list.className='phone-record-list';
  for(const track of window.lotusCatalog||[]){const b=document.createElement('button');b.type='button';const img=new Image();img.src=mobileAsset(track.image);img.alt='';img.loading='lazy';const t=document.createElement('strong'),a=document.createElement('small');t.textContent=track.title;a.textContent=track.artist;b.append(img,t,a);b.onclick=()=>{recordDialog.close();window.lotusPortfolio?.openTrack(track.id,records)};list.append(b)}
  recordDialog.append(header,list);document.body.append(recordDialog);
 }
 recordDialog.querySelector('h2').textContent=zh()?'唱片收藏':'CD COLLECTION';recordDialog.querySelector('header button').setAttribute('aria-label',zh()?'关闭唱片收藏':'Close record collection');recordDialog.showModal();
};
function pulse(){cancelAnimationFrame(pulseFrame);pulseFrame=0;if(!visible||document.hidden||phase!=='closed'||html.dataset.soundEntry!=='entered'||reduced)return;
 const tick=now=>{if(!visible||document.hidden||phase!=='closed'||html.dataset.soundEntry!=='entered'){pulseFrame=0;return}if(now-lastPulse>=32){const t=heartbeatTime()%1.85,beat=(Math.exp(-Math.pow((t-.20)/.105,2))+.68*Math.exp(-Math.pow((t-.49)/.14,2)))*heartbeatEntryGain();surface.style.setProperty('--phone-cube-scale',String(1+.012*beat));lastPulse=now}pulseFrame=requestAnimationFrame(tick)};pulseFrame=requestAnimationFrame(tick);
}
new IntersectionObserver(([e])=>{visible=e.isIntersecting;pulse()}).observe(stage);
window.addEventListener('lotus-entry-reveal',event=>{
 const at=performance.now(),duration=event.detail.durationMs;
 const animate=now=>{const p=Math.min(1,(now-at)/duration),f=entryRevealFrame(p),scale=.66+.34*f.approach;surface.style.setProperty('--phone-entry-red',f.red);surface.style.setProperty('--phone-entry-scale',scale);surface.style.setProperty('--phone-entry-contour',f.outline*(1-Math.min(1,f.red/.22)));html.style.setProperty('--entry-ui',f.copy);
 for(const {p:path,start,end} of paths)path.style.strokeDashoffset=String(1-Math.max(0,Math.min(1,(f.trace-start)/(end-start))));
 const bounds=surface.getBoundingClientRect(),corner=phoneStudio.corners[7];window.dispatchEvent(new CustomEvent('lotus-entry-target',{detail:{x:bounds.left+((corner[0]-.5)*scale+.5)*bounds.width,y:bounds.top+((corner[1]-.5)*scale+.5)*bounds.height,seed:f.seed,trace:f.trace}}));if(p<1)gateFrame=requestAnimationFrame(animate);
 };if(!reduced)gateFrame=requestAnimationFrame(animate);
},{once:true});
window.addEventListener('lotus-entry-complete',()=>{cancelAnimationFrame(gateFrame);html.style.removeProperty('--entry-ui');preloadClip();pulse()},{once:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(phase==='opening'||phase==='closing'){operation++;settled(phase==='opening')}cancelAnimationFrame(gateFrame)}pulse()});
window.addEventListener('pageshow',pulse);
window.addEventListener('pagehide',()=>{operation++;stopClip();cancelAnimationFrame(pulseFrame);cancelAnimationFrame(gateFrame)});
if(!await decode(still))throw new Error('Studio image could not load');loading.hidden=true;host.dataset.firstFrameMs=performance.now().toFixed(0);window.dispatchEvent(new Event('lotus-studio-ready'));
// Prepare one modest video and the destination still, never the original model.
decode(photo('overview'));window.addEventListener('lotus-entry-audible',preloadClip,{once:true});if(html.dataset.soundEntry==='entered')preloadClip();
