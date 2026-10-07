import {createPortraitMemory} from './artist-echoes.js?v=20261006-lake-surface1';
export async function initArtist(){
 const host=document.querySelector('#portrait-wrap');host.className='artist-stage';host.innerHTML='<div class="artist-window-bar mono"><span class="artist-window-handle" tabindex="0" role="button" aria-label="Move portrait window. Arrow keys move, Home resets.">PORTRAIT / IDENTITY</span><button id="artist-reset-position" title="Reset window position" aria-label="Reset portrait window position">↺</button></div><div class="artist-view-switch" role="group" aria-label="Portrait view"><button data-portrait-view="body" aria-pressed="true">FULL BODY</button><button data-portrait-view="head" aria-pressed="false">HEAD</button></div><canvas id="artist-sprite" tabindex="0" aria-label="Lotus Flow pixel character. Left and right arrows to walk, Space to smile."></canvas><div class="artist-wardrobe" role="group" aria-label="Character outfit"><button data-outfit="yellow" aria-pressed="true">01 / YELLOW</button><button data-outfit="black" aria-pressed="false">02 / BLACK</button><a id="artist-smile" href="https://www.instagram.com/lotusflow__/" target="_blank" rel="noopener noreferrer">SAY HI <span aria-hidden="true">↗</span></a></div>';
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),frames=await(await fetch('assets/pixel/frames.json')).json(),images={};
 await Promise.all(['yellow','black'].map(k=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>{images[k]=image;resolve()};image.onerror=reject;image.src=`assets/pixel/${k}-sprites-v2.png`})));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let portraitView='body',headMix=0;let outfit='yellow',x=.5,target=.5,face=1,smile=0,blink=0,nextBlink=3,visible=false,last=0,time=0,key=0;
 const resize=()=>{canvas.width=Math.round(host.clientWidth/3);canvas.height=Math.round((host.clientHeight-140)/3);ctx.imageSmoothingEnabled=false};new ResizeObserver(resize).observe(host);resize();
 new IntersectionObserver(([entry])=>visible=entry.isIntersecting,{rootMargin:'50px'}).observe(host);
 host.querySelectorAll('[data-outfit]').forEach(b=>b.addEventListener('click',()=>{outfit=b.dataset.outfit;host.querySelectorAll('[data-outfit]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));smile=time+1.8}));
 host.addEventListener('lotus-artist-smile',()=>smile=time+2.4);
 canvas.addEventListener('pointermove',e=>{const box=canvas.getBoundingClientRect();target=Math.max(.25,Math.min(.75,(e.clientX-box.left)/box.width));if(Math.abs(target-x)<.12)smile=time+.7});canvas.addEventListener('pointerleave',()=>target=.5);
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();if(e.key===' ')smile=time+2;else key=e.key==='ArrowLeft'?-1:1}});canvas.addEventListener('keyup',()=>key=0);canvas.addEventListener('blur',()=>key=0);
 host.querySelectorAll('[data-portrait-view]').forEach(button=>button.addEventListener('click',()=>{
  portraitView=button.dataset.portraitView;target=.5;key=0;smile=time+1.8;
  host.dataset.portraitView=portraitView;
  canvas.setAttribute('aria-label',portraitView==='head'?'Lotus Flow pixel portrait. Move to look around, Space to smile.':'Lotus Flow pixel character. Left and right arrows to walk, Space to smile.');
  host.querySelectorAll('[data-portrait-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 }));
 host.dataset.portraitView='body';
 const bar=host.querySelector('.artist-window-bar'),handle=host.querySelector('.artist-window-handle');
 const memory=createPortraitMemory(host,canvas,reduced);
 let offsetX=0,offsetY=0,windowDrag=null,paintPending=false;
 const place=()=>{memory.remember(offsetX,offsetY);host.style.transform=`translate3d(${offsetX}px,${offsetY}px,0)`;host.dataset.windowPosition=`${Math.round(offsetX)},${Math.round(offsetY)}`;paintPending=false};
 const constrain=(x,y,base)=>{offsetX=Math.max(10-base.left,Math.min(innerWidth-base.right-10,x));offsetY=Math.max(82-base.top,Math.min(innerHeight-44-base.top,y))};
 bar.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('button'))return;e.preventDefault();
  const rect=host.getBoundingClientRect();windowDrag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:offsetX,dy:offsetY,base:{left:rect.left-offsetX,right:rect.right-offsetX,top:rect.top-offsetY}};
  bar.setPointerCapture(e.pointerId);host.classList.add('is-dragging');
 });
 bar.addEventListener('pointermove',e=>{if(!windowDrag)return;constrain(windowDrag.dx+e.clientX-windowDrag.x,windowDrag.dy+e.clientY-windowDrag.y,windowDrag.base);if(!paintPending){paintPending=true;requestAnimationFrame(place)}});
 const releaseWindow=e=>{if(!windowDrag)return;if(bar.hasPointerCapture(e.pointerId))bar.releasePointerCapture(e.pointerId);windowDrag=null;host.classList.remove('is-dragging')};
 bar.addEventListener('pointerup',releaseWindow);bar.addEventListener('pointercancel',releaseWindow);
 function resetPosition(){memory.reset();offsetX=offsetY=0;host.classList.add('returning-window');place();setTimeout(()=>host.classList.remove('returning-window'),400)}
 host.querySelector('#artist-reset-position').addEventListener('click',resetPosition);
 handle.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();resetPosition()}else if(e.key.startsWith('Arrow')){e.preventDefault();const r=host.getBoundingClientRect();constrain(offsetX+(e.key==='ArrowLeft'?-16:e.key==='ArrowRight'?16:0),offsetY+(e.key==='ArrowUp'?-16:e.key==='ArrowDown'?16:0),{left:r.left-offsetX,right:r.right-offsetX,top:r.top-offsetY});place()}});
 window.addEventListener('resize',resetPosition);
 canvas.addEventListener('click',()=>smile=time+2.4);
 const practice=document.querySelector('.practice-list');practice.innerHTML='<button data-instinct="production">01 / MUSIC PRODUCTION <span>↗</span></button><button data-instinct="writing">02 / SONGWRITING <span>↗</span></button><button data-instinct="arrangement">03 / ARRANGEMENT <span>↗</span></button><p class="instinct-caption" aria-live="polite">Sound as architecture. Production as storytelling.</p>';
 const lines={production:'Electronic music, pop and experimental sound.',writing:'Composition and lyrics across languages and genres.',arrangement:'Classical composition meets electronic experimentation.'};
 practice.querySelectorAll('button').forEach((b,i)=>{const react=()=>{practice.querySelector('.instinct-caption').textContent=lines[b.dataset.instinct];target=.32+i*.18;smile=time+1.6;practice.querySelectorAll('button').forEach(n=>n.classList.toggle('active',n===b))};b.addEventListener('pointerenter',react);b.addEventListener('focus',react);b.addEventListener('click',react)});
 function render(now){requestAnimationFrame(render);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!visible||document.hidden)return;time+=dt;if(time>nextBlink){blink=time+.14;nextBlink=time+3+Math.random()*2.8}if(key)target=Math.max(.22,Math.min(.78,target+key*dt*.2));const moving=Math.abs(target-x)>.012;if(moving&&!reduced){face=Math.sign(target-x);x+=face*Math.min(Math.abs(target-x),dt*.16)}
  headMix+=((portraitView==='head'?1:0)-headMix)*(reduced?1:1-Math.exp(-dt*10));
  const f=moving&&!reduced&&portraitView==='body'?4+Math.floor(time*8)%4:time<blink&&!reduced?1:time<smile?3:0;const [sx,sy,sw,sh]=frames[outfit][f],scale=(canvas.height-23)/498,dw=Math.round(sw*scale),dh=Math.round(sh*scale),bob=moving?Math.round(Math.sin(time*16)):!reduced?Math.round(Math.sin(time*2)*.7):0;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(headMix<.999){ctx.globalAlpha=1-headMix;ctx.fillStyle='#07020466';ctx.beginPath();ctx.ellipse(Math.round(canvas.width*x),canvas.height-9,25,3,0,0,Math.PI*2);ctx.fill();ctx.save();ctx.translate(Math.round(canvas.width*x),canvas.height-11+bob);ctx.scale(face,1);ctx.drawImage(images[outfit],sx,sy,sw,sh,-Math.round(frames.anchors[outfit][f]*scale),-dh,dw,dh);ctx.restore()}
  if(headMix>.001){
   const headFrame=time<blink&&!reduced?1:time<smile?3:0,[hx,hy]=frames[outfit][headFrame],anchor=frames.anchors[outfit][headFrame],size=Math.min(canvas.width*.70/168,canvas.height*.78/130);
   ctx.globalAlpha=headMix;ctx.save();ctx.translate(Math.round(canvas.width*(.5+(target-.5)*.14)),Math.round(canvas.height*.49+(reduced?0:Math.sin(time*1.6)*1.2)));ctx.rotate(reduced?0:(target-.5)*.10);
   ctx.drawImage(images[outfit],hx+anchor-84,hy,168,130,-Math.round(84*size),-Math.round(65*size),Math.round(168*size),Math.round(130*size));ctx.restore();
  }
  ctx.globalAlpha=1;canvas.dataset.pose=f<4?['idle','blink','soft-smile','smile'][f]:'walk';canvas.dataset.outfit=outfit;
 }requestAnimationFrame(render);
}
