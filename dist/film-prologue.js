import {timing} from './cut-timing.js?v=20261006-lake-surface1';
import './blood-ink.js?v=20261007-mobile3';
import {createIdentityScore,audioVisualTime} from './identity-score.js?v=20261007-mobile3';
import {createInkFlow} from './identity-ink-flow.js?v=20261007-mobile3';
const artistSection=document.querySelector('#about'),gate=document.querySelector('.artist-gate');
const seam=document.createElementNS('http://www.w3.org/2000/svg','svg');seam.classList.add('gate-seam-light');seam.setAttribute('aria-hidden','true');seam.setAttribute('preserveAspectRatio','xMidYMid slice');
seam.innerHTML='<defs><linearGradient id="identity-seam-glow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f5e8d0" stop-opacity="0"/><stop offset=".25" stop-color="#f0d8b4" stop-opacity=".4"/><stop offset=".51" stop-color="#fff3dc"/><stop offset=".76" stop-color="#e7bfa1" stop-opacity=".4"/><stop offset="1" stop-color="#f5e8d0" stop-opacity="0"/></linearGradient></defs><path class="seam-trace" pathLength="1000"/><path class="seam-aura"/><path class="seam-core"/><path class="seam-glimmer" pathLength="1000"/>';
gate.append(seam);
const gateInk=createInkFlow();gate.append(gateInk.svg);
const profileChildren=[...artistSection.children].filter(el=>el!==gate);
profileChildren.forEach(el=>el.inert=true);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const dialog=document.createElement('dialog');dialog.id='film-prologue';dialog.setAttribute('aria-label','Lotus Flow opening. Open the identity profile.');
dialog.innerHTML='<div class="poster-half poster-left"><canvas></canvas></div><div class="poster-half poster-right"><canvas></canvas></div><div class="prologue-edition mono">02 / IDENTITY</div><div class="prologue-title" aria-label="Identity"><span>IDENTITY.</span></div><div class="prologue-instruction mono">OPEN PROFILE <span>↗</span></div><button class="prologue-enter mono">VIEW PROFILE ↗</button><button class="cut-sound-toggle" aria-pressed="false">BLADE SOUND / ENABLE</button><svg class="blade-effects" aria-hidden="true"><defs><linearGradient id="blade-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f8f7dc"/><stop offset=".18" stop-color="#a6b6b9"/><stop offset=".32" stop-color="#323b3e"/><stop offset=".43" stop-color="#c3ccd0"/><stop offset=".8" stop-color="#e3e6e3"/><stop offset="1" stop-color="#657476"/></linearGradient><linearGradient id="steel-cut" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset=".32" stop-color="#fbf3d7"/><stop offset=".47" stop-color="#7e878a"/><stop offset=".53" stop-color="#fff"/><stop offset="1" stop-color="#fffdf4" stop-opacity="0"/></linearGradient></defs><path class="edge-glint"/><path class="cut-incision"/><path class="blade-afterimage"/><g class="katana-motion"><image href="assets/cinema/katana.png" x="0" y="-340" width="2172" height="724" /></g><g class="knife-body"><path class="blade-steel steel-body"/><path class="steel-bevel"/><path class="steel-spine"/></g><path class="blade-white"/><path class="blade-impact"/></svg>';
const flight=document.createElement('canvas');flight.className='blood-flight';flight.setAttribute('aria-hidden','true');dialog.append(flight);
document.body.append(dialog);const canvases=[...dialog.querySelectorAll('.poster-half canvas')],effects=dialog.querySelector('.blade-effects'),glint=dialog.querySelector('.edge-glint'),incision=dialog.querySelector('.cut-incision'),steel=dialog.querySelector('.blade-steel'),white=dialog.querySelector('.blade-white'),afterimage=dialog.querySelector('.blade-afterimage'),impact=dialog.querySelector('.blade-impact');
const openingInk=canvases.map(canvas=>{const ink=createInkFlow();canvas.after(ink.svg);return ink});
let cutting=false,openedAt=0,animation=0;
const katana=dialog.querySelector('.katana-motion');
const katanaAsset=new Image();katanaAsset.src='assets/cinema/katana.png';
const bevel=dialog.querySelector('.steel-bevel'),spine=dialog.querySelector('.steel-spine'),soundToggle=dialog.querySelector('.cut-sound-toggle');
let audioContext,muted=false,scoreMuted=false,knifeBuffer,decodeTask,activeSource,activeGain,preparing=false;
const musicToggle=document.createElement('button');musicToggle.className='identity-score-toggle';musicToggle.type='button';musicToggle.setAttribute('aria-pressed','false');artistSection.append(musicToggle);
function musicLabel(){const playing=identityScore.playing;musicToggle.textContent=(document.documentElement.lang.startsWith('zh')?'音乐 / ':'MUSIC / ')+(playing?(document.documentElement.lang.startsWith('zh')?'开':'ON'):(document.documentElement.lang.startsWith('zh')?'开启':'ENABLE'));musicToggle.setAttribute('aria-pressed',String(playing));}
const identityScore=createIdentityScore({
 getContext:()=>audioContext??=new(window.AudioContext||window.webkitAudioContext)(),
 loadBuffer:ctx=>fetch('./assets/audio/identity-bgm.mp3').then(r=>{if(!r.ok)throw new Error('Identity score unavailable');return r.arrayBuffer()}).then(bytes=>ctx.decodeAudioData(bytes)),
 announce:()=>window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'identity-score'})),
 onState:(state,info)=>{artistSection.dataset.identityScoreState=state;artistSection.dataset.identityMusicPhase=info.phase;artistSection.dataset.identityBeatCue=String(info.cue);if(info.at)artistSection.dataset.identityBeatAt=String(info.at);musicLabel();}
});
window.lotusIdentityAudio=identityScore;
musicLabel();new MutationObserver(musicLabel).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
musicToggle.addEventListener('click',()=>{if(identityScore.playing){scoreMuted=true;identityScore.pause()}else{scoreMuted=false;foregroundClaimed=false;if(window.lotusSfx?.enabled===false)document.querySelector('.interaction-sound-toggle')?.click();identityScore.enter(artistSection.dataset.artistLocked==='false')}});
let identityVisible=false,visibilityFrame=0,foregroundClaimed=false;
const scoreEnabled=()=>!muted&&!scoreMuted&&window.lotusSfx?.enabled!==false;
function syncIdentityVisibility(){
 visibilityFrame=0;const r=artistSection.getBoundingClientRect();identityVisible=!document.hidden&&r.bottom>innerHeight*.2&&r.top<innerHeight*.75;
 gate.classList.toggle('seam-awake',identityVisible&&artistSection.dataset.artistLocked==='true');
 if(dialog.open&&cutting)return;
 if(!identityVisible){foregroundClaimed=false;identityScore.pause()}else if(!scoreEnabled()||foregroundClaimed)identityScore.pause();else identityScore.enter(artistSection.dataset.artistLocked==='false');
}
function scheduleIdentityVisibility(){if(!visibilityFrame)visibilityFrame=requestAnimationFrame(syncIdentityVisibility)}
addEventListener('scroll',scheduleIdentityVisibility,{passive:true});addEventListener('resize',scheduleIdentityVisibility);
document.addEventListener('pointerdown',e=>{const entering=e.target.closest('a[href="#about"],.artist-gate');if(entering)foregroundClaimed=false;if(entering||identityVisible&&!foregroundClaimed&&!e.target.closest('.cut-sound-toggle,.identity-score-toggle')){if(scoreEnabled())identityScore.enter(artistSection.dataset.artistLocked==='false')}},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if(identityVisible&&(e.key==='Enter'||e.key===' ')&&scoreEnabled())identityScore.enter(artistSection.dataset.artistLocked==='false')},{capture:true});
window.addEventListener('lotus-effects-change',()=>syncIdentityVisibility());
window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='identity-score'){foregroundClaimed=true;identityScore.pause()}});
window.addEventListener('lotus-room-change',e=>{if(e.detail)identityScore.pause()});
window.addEventListener('lotus-prologue-end',()=>{artistSection.dataset.identityScoreState=identityScore.playing?'reveal':'paused';syncIdentityVisibility()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)identityScore.pause();else scheduleIdentityVisibility()});
window.addEventListener('pagehide',()=>identityScore.pause());
let knifeTask;const knifeBytes=()=>knifeTask??=fetch('./assets/audio/knife-A-blood-approved.wav').then(r=>{if(!r.ok)throw new Error('Knife sound unavailable');return r.arrayBuffer()}).catch(()=>null);
dialog.dataset.audioMix='A-blood-approved';
async function armSound(){
 try{
  audioContext??=new(window.AudioContext||window.webkitAudioContext)();
  await audioContext.resume();
  if(!knifeBuffer){
   decodeTask??=knifeBytes().then(data=>data?audioContext.decodeAudioData(data.slice(0)):null);
   knifeBuffer=await decodeTask;
  }
  if(!knifeBuffer)throw new Error('Sound not ready');
  soundToggle.textContent=muted?'SOUND / OFF':'SOUND / ON';soundToggle.setAttribute('aria-pressed',String(!muted));
  dialog.dataset.audioState=muted?'muted':'ready';return audioContext.state==='running';
 }catch{decodeTask=null;dialog.dataset.audioState='unavailable';soundToggle.textContent='SOUND / RETRY';return false}
}
function stopCutSound(){
 if(activeSource){const source=activeSource;activeSource=null;try{source.stop()}catch{}source.disconnect();}
 if(activeGain){activeGain.disconnect();activeGain=null}
}
function cutSound(at){
 stopCutSound();if(!audioContext||audioContext.state!=='running'||muted||!knifeBuffer)return;
 const source=audioContext.createBufferSource(),gain=audioContext.createGain();source.buffer=knifeBuffer;
 gain.gain.setValueAtTime(.72,at);source.connect(gain).connect(audioContext.destination);
 activeSource=source;activeGain=gain;source.start(at);
 dialog.dataset.audioState='scheduled';dialog.dataset.audioDuration=String(knifeBuffer.duration);
 source.onended=()=>{source.disconnect();gain.disconnect();if(activeSource===source){activeSource=null;activeGain=null;dialog.dataset.audioState='played'}};
}
soundToggle.addEventListener('click',()=>{
 if(audioContext?.state==='running'&&!muted){muted=true;identityScore.pause();if(activeGain)activeGain.gain.setTargetAtTime(0,audioContext.currentTime,.015);soundToggle.textContent='SOUND / OFF';soundToggle.setAttribute('aria-pressed','false');dialog.dataset.audioState='muted'}
 else{muted=false;armSound();syncIdentityVisibility()}
});
const clamp=x=>Math.max(0,Math.min(1,x)),easeOut=x=>1-Math.pow(1-clamp(x),4);
function geometry(){const w=innerWidth,h=innerHeight,thick=Math.max(27,w*.046),a={x:w*.836+thick*.05,y:-h*.12},b={x:w*.154+thick*.05,y:h*1.12},dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);return{a,b,dx,dy,len,nx:-dy/len,ny:dx/len}}
function point(g,t,n=0){return `${g.a.x+g.dx*t+g.nx*n} ${g.a.y+g.dy*t+g.ny*n}`}
function blade(g,p,length,width){return `M ${point(g,p)} L ${point(g,p-length,width)} L ${point(g,p-length*.77,0)} L ${point(g,p-length,-width*.18)} Z`}
let posterSize='';
function draw(){const w=innerWidth,h=innerHeight,scale=Math.min(devicePixelRatio,1.5),stamp=`${w}/${h}/${scale}`;if(posterSize===stamp)return;posterSize=stamp;const source=document.createElement('canvas');source.width=w*scale;source.height=h*scale;const c=source.getContext('2d');c.scale(scale,scale);let seed=1973;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646};const bg=c.createRadialGradient(w*.28,h*.4,0,w*.6,h*.4,w*.9);bg.addColorStop(0,'#40110f');bg.addColorStop(.48,'#160908');bg.addColorStop(1,'#060606');c.fillStyle=bg;c.fillRect(0,0,w,h);
 for(let i=0;i<15000;i++){c.fillStyle=rand()>.48?'#8d292515':'#eee0c608';c.fillRect(rand()*w,rand()*h,rand()*1.8+.4,rand()*1.8+.4)}
 const atY=y=>w*(.77-.55*y/h),thick=Math.max(27,w*.046);dialog.style.setProperty("--seam-top",`${atY(0)+thick*.05}px`);dialog.style.setProperty("--seam-bottom",`${atY(h)+thick*.05}px`);
 // Dry ink, red flecks and the very thin white cut follow the supplied poster's diagonal.
 for(let i=0;i<2600;i++){const y=rand()*h,x=atY(y)+(rand()-.5)*thick*2.2;c.fillStyle=rand()>.15?'#b7241c80':'#71181140';c.fillRect(x,y,rand()*2+.3,rand()*3+.3)}
 c.fillStyle='#aa241c';c.beginPath();c.moveTo(atY(-30)-thick*.35,-30);for(let y=-30;y<h+30;y+=9)c.lineTo(atY(y)-thick*.4-rand()*4,y);for(let y=h+30;y>-30;y-=9)c.lineTo(atY(y)+thick*.5+rand()*6,y);c.closePath();c.fill();
 for(let i=0;i<250;i++){const y=h*(.32+rand()*.53),x=atY(y)-thick*(.4+Math.pow(rand(),2)*1.4),r=rand()<.09?2+rand()*5:rand()*1.7;c.fillStyle=i%12===0?'#c9a938':i%3?'#b72b20':'#7b1b15';c.beginPath();c.ellipse(x,y,r,r*(.7+rand()),-.2,0,Math.PI*2);c.fill()}
 c.strokeStyle='#e7ded1';c.lineWidth=Math.max(1,w*.0012);c.beginPath();c.moveTo(atY(-20)+thick*.05,-20);c.lineTo(atY(h+20)+thick*.05,h+20);c.stroke();
 for(const canvas of canvases){canvas.width=source.width;canvas.height=source.height;canvas.getContext('2d').drawImage(source,0,0)}
 const spine=`M ${atY(0)+thick*.05} 0 L ${atY(h)+thick*.05} ${h}`;
 const falls=[.25,.4,.54,.7,.84].map((u,i)=>({x:atY(h*u)+thick*.22,y:h*u,length:38+(i*19%50),width:1.7+i%2}));
 for(const ink of [gateInk,...openingInk])ink.update({width:w,height:h,spine,thickness:thick*.48,falls});
}
function open(){
 if(dialog.open)return;cancelAnimationFrame(animation);cutting=false;openedAt=performance.now();dialog.classList.remove('cutting','blade-near');dialog.dataset.phase='waiting';dialog.style.setProperty('--cut-progress',0);dialog.style.setProperty('--cut-shock',0);effects.removeAttribute('style');katana.style.opacity='0';[incision,steel,white,afterimage,impact,bevel,spine].forEach(p=>p.setAttribute('d',''));dialog.showModal();document.body.classList.add('prologue-open');draw();dialog.querySelector('.prologue-enter').focus({preventScroll:true});idle(openedAt);
}
function idle(now){
 if(cutting||!dialog.open)return;const g=geometry(),p=((now-openedAt)/4400)%1;
 glint.setAttribute('d',`M ${point(g,clamp(p-.075))} L ${point(g,p)}`);glint.style.opacity=String(Math.sin(p*Math.PI)*.85);animation=requestAnimationFrame(idle);
}
function finish(){dialog.close();document.body.classList.remove('prologue-open');history.replaceState(null,'','#about');const heading=document.querySelector('#about-title');heading.tabIndex=-1;heading.focus({preventScroll:true});window.dispatchEvent(new Event('lotus-prologue-end'))}
function renderFrame(t){
 const {strikeStart,contact,release,spray,settle,duration}=timing,g=geometry();
 if(reduced){dialog.style.setProperty('--cut-progress',clamp(t/180));window.dispatchEvent(new CustomEvent('lotus-cut-frame',{detail:{time:t<180?-1:duration}}));return}
 let tip;
 if(t<strikeStart){tip=-.30+.38*easeOut(t/strikeStart);dialog.dataset.phase='draw'}
 else if(t<contact){const q=clamp((t-strikeStart)/(contact-strikeStart));tip=.08+1.25*(q*q*(2-q));dialog.dataset.phase='strike'}
 else{tip=1.33+1.65*easeOut((t-contact)/140);dialog.dataset.phase=t<spray?'contact':t<settle?'spray':'settle'}
 const axis=Math.atan2(g.dy,g.dx)*180/Math.PI;
 const length=Math.min(innerWidth*.85,innerHeight*1.40),scale=length/2118;
 const tx=g.a.x+g.dx*tip,ty=g.a.y+g.dy*tip;
 katana.setAttribute('transform',`translate(${tx} ${ty}) rotate(${axis}) scale(${scale}) translate(-2146 0)`);
 katana.style.opacity=String(clamp(t/140)*(1-clamp((t-contact-50)/100)));
 const q=clamp((t-strikeStart)/(contact-strikeStart));
 white.setAttribute('d',t>=strikeStart&&t<contact?`M ${point(g,Math.max(0,tip-.26))} L ${point(g,clamp(tip))}`:'');
 white.style.opacity=String(.8*Math.sin(q*Math.PI));
 afterimage.setAttribute('d',t>=strikeStart&&t<contact?`M ${point(g,Math.max(0,tip-.32),6)} L ${point(g,clamp(tip),6)}`:'');
 afterimage.style.opacity=String(.28*Math.sin(q*Math.PI));
 incision.setAttribute('d',`M ${point(g,0)} L ${point(g,clamp(tip))}`);incision.style.opacity=t<strikeStart?0:String(1-clamp((t-release)/210));
 impact.setAttribute('d',t>=contact&&t<release?`M ${point(g,0)} L ${point(g,1)}`:'');impact.style.opacity=String(1-clamp((t-contact)/70));
 const split=t<contact?0:easeOut((t-contact)/310);dialog.style.setProperty('--cut-progress',split);
 const shock=t-contact;dialog.style.setProperty('--cut-shock',shock>=0&&shock<110?Math.sin(shock*.08)*Math.exp(-shock/35)*3.8:0);
 dialog.dataset.elapsed=String(Math.round(t));
 window.dispatchEvent(new CustomEvent('lotus-cut-frame',{detail:{time:t}}));
}
async function slash(){
 if(cutting||preparing)return;preparing=true;
 // A real click resumes Web Audio; complete decoding before starting either clock.
 const [ready,scoreReady]=await Promise.all([muted?false:armSound(),scoreEnabled()?identityScore.prepare().catch(()=>false):false]);
 if(!dialog.open||document.hidden){preparing=false;return}
 cutting=true;preparing=false;cancelAnimationFrame(animation);window.lotusReleasePlayer?.unlock();
 artistSection.dataset.artistLocked='false';profileChildren.forEach(el=>el.inert=false);
 artistSection.scrollIntoView({behavior:'instant',block:'start'});
 window.dispatchEvent(new Event('lotus-cut-prepare'));dialog.classList.add('cutting');glint.style.opacity=0;
 await new Promise(resolve=>requestAnimationFrame(resolve));
 if(!dialog.open||document.hidden){stopCutSound();identityScore.pause();return}
 // Schedule the approved complete mix and all visual frames from one shared start.
 const audioAt=audioContext?.state==='running'?audioContext.currentTime+.040:null;
 const at=audioAt===null?performance.now()+40:audioVisualTime(audioContext,audioAt);
 dialog.dataset.visualStart=String(at);if(audioAt!==null)dialog.dataset.bladeAt=String(audioAt);
 if(ready&&!reduced)cutSound(audioAt);
 if(scoreReady)identityScore.reveal(audioAt+(reduced ? .12 : timing.contact/1000));
 function animate(now){const t=Math.max(0,now-at);renderFrame(t);if(t<(reduced?180:timing.duration))animation=requestAnimationFrame(animate);else finish()}
 animation=requestAnimationFrame(animate);
}
dialog.addEventListener('pointermove',e=>{
 if(cutting||preparing||e.pointerType==='touch')return;const g=geometry(),u=clamp(((e.clientX-g.a.x)*g.dx+(e.clientY-g.a.y)*g.dy)/(g.len*g.len)),distance=Math.hypot(e.clientX-g.a.x-g.dx*u,e.clientY-g.a.y-g.dy*u),near=distance<Math.max(45,innerWidth*.045);
 dialog.classList.toggle('blade-near',near);if(near&&performance.now()-openedAt>250&&(muted||audioContext?.state==='running'))slash();
});
dialog.addEventListener('pointerdown',e=>{if(!e.target.closest('.cut-sound-toggle'))armSound();if(e.pointerType==='touch'&&!e.target.closest('button'))slash()});
dialog.addEventListener('click',e=>{if(!e.target.closest('button'))slash()});
dialog.querySelector('.prologue-enter').addEventListener('click',()=>{armSound();slash()});dialog.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('.cut-sound-toggle')){e.preventDefault();armSound();slash()}});dialog.addEventListener('cancel',e=>{e.preventDefault();slash()});window.addEventListener('resize',()=>{if(dialog.open&&!cutting)draw()});

document.querySelector('#replay-opening')?.addEventListener('click',open);
gate.addEventListener('click',()=>{const rect=gate.getBoundingClientRect();open();armSound();if(reduced){slash();return}dialog.animate([{clipPath:`inset(${Math.max(0,rect.top)}px ${Math.max(0,innerWidth-rect.right)}px ${Math.max(0,innerHeight-rect.bottom)}px ${Math.max(0,rect.left)}px)`},{clipPath:'inset(0px)'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});setTimeout(slash,430);});

// The black/red chapter cover gates the artist with small yellow wayfinding.
function drawGate(){draw();const target=gate.querySelector('canvas');target.width=canvases[0].width;target.height=canvases[0].height;target.getContext('2d').drawImage(canvases[0],0,0);const w=innerWidth,h=innerHeight,thick=Math.max(27,w*.046),x=y=>w*(.77-.55*y/h)+thick*.05;seam.setAttribute('viewBox',`0 0 ${w} ${h}`);for(const p of seam.querySelectorAll('path')){const n=0;p.setAttribute('d',`M ${x(0)+n} 0 L ${x(h)+n} ${h}`)}}
drawGate();let gateResize;addEventListener('resize',()=>{clearTimeout(gateResize);gateResize=setTimeout(drawGate,180)});
new IntersectionObserver(scheduleIdentityVisibility,{threshold:.08}).observe(artistSection);scheduleIdentityVisibility();

window.dispatchEvent(new Event('lotus-cut-ready'));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cutting&&dialog.open){cancelAnimationFrame(animation);stopCutSound();renderFrame(timing.duration);finish();}});
window.addEventListener('pagehide',stopCutSound);
