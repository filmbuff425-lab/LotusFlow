import {mobileAsset} from './device-profile.js';
import {loadHook,previewEnded,cancelHook} from './preview-hooks.js?v=20261007-mobile3';
import {createMusicSignal} from './music-signal.js?v=20261007-mobile3';
import {drawerReflection} from './pressing-profiles.js?v=20261006-lake-surface1';
import {mountRecognition} from './recognition.js?v=20261006-lake-surface1';
const tracks=window.lotusCatalog,rack=document.querySelector('#shop-rack'),spines=[...rack.querySelectorAll('.cd-spine')],panel=document.querySelector('#record-inspector'),audio=document.querySelector('#collection-audio'),note=document.querySelector('#collection-audio-note'),caption=document.querySelector('#shelf-caption'),canvas=document.querySelector('#case-voice'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,signal=createMusicSignal(audio);
// Two clear glass shelves; original accessible cases keep their pickup gestures.
const middle=Math.ceil(spines.length/2),shelfGroups=[spines.slice(0,middle),spines.slice(middle)];
const sleeve=id=>{const t=tracks.find(t=>t.id===id);return `<div class="shelf-sleeve"><img src="${mobileAsset(t.image)}" alt="" loading="eager"><i></i></div>`};
const shelfScenes=[
 `<div class="shelf-objects objects-left">${sleeve('flow')}<span class="shelf-notebook"></span><canvas class="shelf-ceramic shelf-blue-addition" data-shelf-object="love" aria-label="Blue Love Myself ceramic sculpture"></canvas></div><div class="shelf-objects objects-right"><div class="shelf-flat-stack">${['news','juliet','lov','airtight'].map(id=>`<i style="--flat-art:url('${tracks.find(t=>t.id===id).image}')"></i>`).join('')}</div><span class="shelf-paper-sleeves"></span></div>`,
 `<div class="shelf-objects objects-left"><canvas class="shelf-ceramic shelf-glass-buddha" data-shelf-object="crystal" aria-label="Seated glass Buddha"></canvas>${sleeve('summer')}</div><div class="shelf-objects objects-right"><span class="shelf-photo-frame">${sleeve('feed-on')}</span><span class="shelf-metal-canister"></span><canvas class="shelf-ceramic shelf-candle" data-shelf-object="candle" aria-label="Lit wax candle in a ceramic holder"></canvas></div>`
];
const wall=document.createElement('div');wall.className='shelf-wall-tracks';wall.setAttribute('aria-hidden','true');wall.innerHTML='<i></i><i></i>';rack.before(wall);
rack.replaceChildren();
for(const [index,group] of shelfGroups.entries()){
 const row=document.createElement('div');row.className='wood-shelf-row glass-shelf-row';
 const objects=document.createElement('div');objects.className='shelf-vignette';objects.setAttribute('aria-hidden','true');objects.innerHTML=shelfScenes[index];
 const cases=document.createElement('div');cases.className='shelf-records';cases.append(...group);
 row.append(objects.firstElementChild,cases,objects.lastElementChild);rack.append(row);
}
// A decorative WebGL failure must not block the shelves or record controls.
import('./record-shelf-objects.js?v=20261007-seam-soft11').then(({mountShelfObjects})=>mountShelfObjects(rack)).catch(error=>console.warn('Shelf decoration unavailable:',error));
document.querySelector('.shelf-scroll').setAttribute('aria-label','Two shelves of CDs. Use arrow keys to browse the records, or scroll horizontally on a small screen.');
let motion=0,flight=null,flightRaf=0,hoverId=null,hoverTimer=0,hoverTicket=0,hoverPlaying=false,hoverEnabled=true;
const hoverButton=document.createElement('button');hoverButton.className='collection-hover-sound';hoverButton.textContent='HOVER SOUND / ON';hoverButton.setAttribute('aria-pressed','true');document.querySelector('.library-caption').append(hoverButton);
const arm=()=>signal.arm();document.addEventListener('pointerdown',arm,{once:true,capture:true});document.addEventListener('keydown',arm,{once:true,capture:true});
function stopHover(){clearTimeout(hoverTimer);hoverTicket++;if(!active){hoverPlaying=false;audio.pause()}hoverId=null}
function preview(track){if(active||!hoverEnabled)return;clearTimeout(hoverTimer);const ticket=++hoverTicket;hoverId=track.id;hoverTimer=setTimeout(async()=>{if(ticket!==hoverTicket||active)return;hoverPlaying=true;audio.pause();loadHook(audio,track);audio.volume=.50;try{signal.arm();await audio.play();if(ticket!==hoverTicket){if(!active)audio.pause();return}hoverButton.textContent='HOVER SOUND / ON';hoverButton.setAttribute('aria-pressed','true');window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'collection'}))}catch{if(ticket===hoverTicket){hoverPlaying=false;hoverButton.classList.add('needs-gesture');hoverButton.textContent='ENABLE HOVER SOUND'}}},65)}
hoverButton.addEventListener('click',()=>{if(hoverButton.classList.contains('needs-gesture')){signal.arm();audio.play().then(()=>{hoverButton.classList.remove('needs-gesture');hoverButton.textContent='HOVER SOUND / ON';hoverEnabled=hoverPlaying=true;hoverButton.setAttribute('aria-pressed','true')}).catch(()=>{});return}hoverEnabled=!hoverEnabled;hoverButton.setAttribute('aria-pressed',String(hoverEnabled));hoverButton.textContent=hoverEnabled?'HOVER SOUND / ON':'HOVER SOUND / OFF';if(!hoverEnabled)stopHover();else signal.arm()});

let active=null,lastFocus=null,raf=0,last=0,time=0,tint='#e7a0bb',visible=true;
const setText=(id,text)=>document.getElementById(id).textContent=text;
function openRecord(track,source,updateURL=true){
 if(active?.id===track.id){closeRecord();return}
 stopHover();cancelHook(audio);
 const serial=++motion;cancelAnimationFrame(flightRaf);flight?.remove();panel.classList.remove('case-unfolded','case-arrived');
 audio.pause();active=track;lastFocus=source;panel.dataset.release=track.id;
 const finish=drawerReflection(track.id);panel.dataset.opticalFinish=finish.profile.name;panel.style.setProperty('--finish-angle',`${finish.profile.angle}rad`);panel.style.setProperty('--sheen-opacity',finish.profile.intensity);document.querySelector('.disc-sheen').style.background=finish.background;
 for(const spine of spines)spine.classList.remove('taken');
 for(const spine of spines)spine.setAttribute('aria-expanded',String(spine.dataset.record===track.id));
 setText('project-meta',`${track.year} / ${track.categories.includes('artist')?'ARTIST RELEASE':'COLLABORATION'}`);setText('project-title',track.title);setText('project-artist',track.artist);setText('project-role',track.role);setText('project-credit',track.credits);
 document.querySelector('#case-disc-art').src=mobileAsset(track.image);document.querySelector('#case-lid-art').src=mobileAsset(track.image);
 document.querySelector('#project-detail').href=track.detailUrl;document.querySelector('#project-official').href=track.url;
 let recognition=panel.querySelector('[data-recognition-host]');if(!recognition){recognition=document.createElement('section');recognition.dataset.recognitionHost='';panel.querySelector('.project-links').before(recognition)}mountRecognition(recognition,track,{compact:true});
 loadHook(audio,track,{full:true});audio.setAttribute('aria-label',`Listen to ${track.title} by ${track.artist}`);
 note.textContent=track.audioKind==='full'?'FULL TRACK':'OFFICIAL 30-SECOND PREVIEW';
 tint=track.id==='news'?'#e7a0bb':track.color;
 caption.textContent=`${track.title} / ${track.artist}`;rack.dataset.activeRecord=track.id;
 panel.inert=false;panel.setAttribute('aria-hidden','false');panel.classList.add('is-open');
 if(!raf)raf=requestAnimationFrame(draw);
 if(updateURL&&!reduced)requestAnimationFrame(()=>takeFromShelf(source,serial));else panel.classList.add('case-arrived','case-unfolded');
 if(updateURL){const url=new URL(location.href);url.searchParams.set('record',track.id);history.replaceState(null,'',url);signal.arm();audio.volume=.65;audio.play().then(()=>window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'collection'}))).catch(()=>{note.textContent='PRESS PLAY TO LISTEN'})}
}
function makeFlight(track){
 const el=document.createElement('div');el.className='flying-case';el.setAttribute('aria-hidden','true');
 const face=document.createElement('div');face.className='pickup-face';const img=new Image();img.src=mobileAsset(track.image);img.alt='';face.append(img);el.append(face);const edge=document.createElement('i');edge.className='pickup-spine';el.append(edge);document.body.append(el);return el;
}
const smooth=x=>x*x*(3-2*x),clamp=x=>Math.max(0,Math.min(1,x));
function takeFromShelf(source,serial,returning=false,done){
 const target=document.querySelector('.case-tray'),sr=source.getBoundingClientRect(),tr=target.getBoundingClientRect(),scrollStart=scrollY;
 const shelf={x:sr.left+sr.width/2,y:sr.top+scrollY+sr.height/2},tray={x:tr.left+tr.width/2,y:tr.top+scrollY+tr.height/2};
 const destinationScroll=returning?Math.max(0,sr.top+scrollY-innerHeight*.37):Math.max(0,Math.min(document.documentElement.scrollHeight-innerHeight,panel.getBoundingClientRect().top+scrollY-116));
 const a=returning?tray:shelf,b=returning?shelf:tray,begin=performance.now(),duration=returning?1500:1850;
 flight?.remove();flight=makeFlight(active);const el=flight;panel.classList.remove('case-arrived');source.classList.add('taken');
 function frame(now){if(serial!==motion){el.remove();return}const q=clamp((now-begin)/duration),move=smooth(clamp((q-.16)/.84)),lift=Math.sin(Math.PI*q)*96;
  window.scrollTo({top:scrollStart+(destinationScroll-scrollStart)*smooth(q),behavior:'instant'});
  const x=a.x+(b.x-a.x)*move,y=a.y+(b.y-a.y)*move-scrollY-lift;
  const size=returning?tr.width+(sr.height-tr.width)*move:sr.height+(tr.width-sr.height)*move;
  const rotate=returning?-82*move:-82*(1-move),roll=Math.sin(q*Math.PI)*(returning?5:-7);
  el.style.width=size+'px';el.style.height=size+'px';el.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%) perspective(1100px) rotateY(${rotate}deg) rotateZ(${roll}deg)`;
  if(q<1)flightRaf=requestAnimationFrame(frame);else{el.remove();flight=null;if(returning){source.classList.remove('taken');done?.()}else{panel.classList.add('case-arrived');window.lotusSfx?.play('case-open');requestAnimationFrame(()=>panel.classList.add('case-unfolded'))}}
 }flightRaf=requestAnimationFrame(frame);
}
function closeRecord(returnFocus=true){
 if(!active)return;const serial=++motion;cancelAnimationFrame(flightRaf);flight?.remove();flight=null;audio.pause();panel.classList.remove('case-unfolded');panel.inert=true;
 const finish=()=>{if(serial!==motion)return;active=null;panel.classList.remove('is-open','case-arrived');panel.setAttribute('aria-hidden','true');spines.forEach(s=>{s.setAttribute('aria-expanded','false');s.classList.remove('taken')});rack.dataset.activeRecord='';caption.textContent='Select a record to open.';const url=new URL(location.href);url.searchParams.delete('record');history.replaceState(null,'',url);if(returnFocus)lastFocus?.focus({preventScroll:true});cancelAnimationFrame(raf);raf=0;};
 if(reduced||!returnFocus){finish();return}
 setTimeout(()=>{if(serial===motion)takeFromShelf(lastFocus,serial,true,finish)},1250);
}
for(const [spineIndex,spine] of spines.entries()){
 spine.addEventListener('pointerenter',()=>spines.forEach((item,i)=>{const distance=item.parentElement===spine.parentElement?Math.abs(i-spineIndex):99;item.style.setProperty('--neighbor-lift',distance===1?14:distance===2?5:0);item.style.setProperty('--neighbor-roll',distance===1?(i<spineIndex?-1:1):0)}));
 spine.addEventListener('pointerleave',()=>spines.forEach(item=>{item.style.setProperty('--neighbor-lift',0);item.style.setProperty('--neighbor-roll',0)}));
 spine.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();openRecord(tracks.find(t=>t.id===spine.dataset.record),spine)});
 const hint=()=>{if(!active){const t=tracks.find(t=>t.id===spine.dataset.record);caption.textContent=`${t.title} / ${t.artist}`}};
 spine.addEventListener('pointerenter',()=>{hint();preview(tracks.find(t=>t.id===spine.dataset.record))});spine.addEventListener('focus',()=>{hint();preview(tracks.find(t=>t.id===spine.dataset.record))});spine.addEventListener('blur',stopHover);
 spine.addEventListener('pointerleave',()=>{stopHover();if(!active)caption.textContent='Select a record to open.'});
 spine.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const i=(spines.indexOf(spine)+(e.key==='ArrowRight'?1:-1)+spines.length)%spines.length;spines[i].focus();spines[i].scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced?'instant':'smooth'})}});
}
document.querySelector('.inspector-close').addEventListener('click',()=>closeRecord());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();closeRecord()}});
function filter(role,updateURL=true){
 const valid=['all','production','writing','artist'].includes(role)?role:'all';let count=0;
 for(const row of document.querySelectorAll('.credit-row')){row.hidden=valid!=='all'&&!row.dataset.categories.split(' ').includes(valid);if(!row.hidden)count++}
 document.querySelectorAll('[data-shop-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shopFilter===valid)));
 setText('shop-count',`${String(count).padStart(2,'0')} RELEASES`);
 if(updateURL){const url=new URL(location.href);valid==='all'?url.searchParams.delete('role'):url.searchParams.set('role',valid);history.replaceState(null,'',url)}
}
document.querySelectorAll('[data-shop-filter]').forEach(b=>b.addEventListener('click',()=>filter(b.dataset.shopFilter)));
function fromURL(){filter(new URLSearchParams(location.search).get('role')||'all',false);const id=new URLSearchParams(location.search).get('record'),track=tracks.find(t=>t.id===id);if(track&&active?.id!==id)openRecord(track,spines.find(s=>s.dataset.record===id),false);else if(!track&&active)closeRecord(false)}
fromURL();window.addEventListener('popstate',fromURL);
audio.addEventListener('play',()=>signal.arm());audio.addEventListener('timeupdate',()=>{if(hoverPlaying&&!active&&previewEnded(audio))audio.currentTime=Number(audio.dataset.previewStart)});window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='collection')stopHover()});audio.addEventListener('error',()=>note.textContent='Audio unavailable. Listen through the official release link.');
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause()});
new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(panel);
panel.addEventListener('pointermove',e=>{const r=panel.getBoundingClientRect();panel.style.setProperty('--reflection',`${-14+(e.clientX-r.left)/r.width*28}deg`)});
function draw(now){
 if(!active){raf=0;return}raf=requestAnimationFrame(draw);if(document.hidden||!visible)return;
 const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!reduced)time+=dt;
 const data=signal.read();canvas.dataset.playing=String(data.playing);ctx.clearRect(0,0,300,300);
 for(let strand=0;strand<5;strand++){
  ctx.beginPath();ctx.strokeStyle=tint;ctx.globalAlpha=.65-Math.abs(strand-2)*.12;ctx.lineWidth=strand===2?.9:.6;
  for(let i=0;i<150;i++){const y=i*2,envelope=Math.pow(Math.sin(i/149*Math.PI),1.5),sample=data.playing&&!reduced?data.samples[(i*3+strand*9)%512]:0,x=150+(strand-2)*3+envelope*(sample*66+(Math.sin(i*.19+time*1.3+strand*.6)*5+Math.sin(i*.41-time+strand)*3));i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
 }ctx.globalAlpha=1;
}
