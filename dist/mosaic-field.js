// Three quiet depths of square light, shared by the record room and the archive.
export function mountMosaicField(host,{fixed=false}={}){
 if(host.querySelector(':scope > .mosaic-field'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas');canvas.className=`mosaic-field ${fixed?'archive-mosaic':'records-mosaic'}`;canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
 const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return}
 const hash=n=>{const x=Math.sin(n*127.1+47.7)*43758.5453;return x-Math.floor(x)};
 const shades=['#ffffff','#d9e9ff','#fff0dd','#ffffff'];
 let stars=[],width=1,height=1,raf=0,last=0,time=0,visible=fixed,mx=-999,my=-999;
 function paint(){
  ctx.clearRect(0,0,width,height);
  const scroll=reduced.matches?0:scrollY*.015;
  for(const s of stars){
   const twinkle=reduced.matches?.72:.18+.82*Math.pow(.5+.5*Math.sin(time*s.speed+s.phase),1.5);
   // Continuous subpixel drift is visible between glints, at three depths.
   const drift=reduced.matches?0:time;
   const x=((s.x*width+drift*s.depth*.48+(Math.sin(drift*.16+s.phase)-Math.sin(s.phase))*s.depth*17)%width+width)%width;
   const y=((s.y*height-scroll*s.depth-drift*s.depth*.22+(Math.cos(drift*.13+s.phase)-Math.cos(s.phase))*s.depth*13)%height+height)%height;
   const distance=Math.hypot(x-mx,y-my),response=reduced.matches?0:Math.max(0,1-distance/145)*.23;
   const bright=Math.min(1,s.alpha*twinkle+response),glint=s.size>2?Math.max(0,(twinkle-.70)/.30):0;
   if(glint>0){const radius=7+glint*5,halo=ctx.createRadialGradient(x,y,0,x,y,radius);halo.addColorStop(0,'#f1f8ff75');halo.addColorStop(.3,'#c5dfff1f');halo.addColorStop(1,'#a6ceff00');ctx.globalAlpha=glint*.7;ctx.fillStyle=halo;ctx.fillRect(x-radius,y-radius,radius*2,radius*2)}
   ctx.globalAlpha=bright;ctx.fillStyle=shades[s.color];ctx.fillRect(x,y,s.size,s.size);
   if(glint>.2){const arm=3+glint*4;ctx.globalAlpha=glint*.55;ctx.fillRect(x-arm,y+s.size/2-.35,s.size+arm*2,.7);ctx.fillRect(x+s.size/2-.35,y-arm,.7,s.size+arm*2)}
  }ctx.globalAlpha=1;
 }
 function resize(){
  width=host.clientWidth||innerWidth;height=fixed?innerHeight:host.clientHeight;
  const dpr=Math.min(devicePixelRatio,1.25);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.height=height+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
  const count=Math.min(1400,Math.max(390,Math.round(width*height/1650)));
  stars=Array.from({length:count},(_,i)=>{const near=i%14===0;return{x:hash(i*8),y:hash(i*8+1),size:near?2+hash(i*8+2)*1.25:1+hash(i*8+2)*.8,phase:hash(i*8+3)*6.28,speed:.7+hash(i*8+4)*1.1,alpha:near?.76+hash(i*8+5)*.24:.28+hash(i*8+5)*.47,depth:near?1:.3+hash(i*8+6)*.35,color:i%13===0?2:i%5===0?1:i%3===0?3:0}});
  paint();start();
 }
 function loop(now){raf=0;if(document.hidden||!visible||reduced.matches)return;if(now-last>=33){time+=Math.min((now-last)/1000,.1);last=now;paint()}raf=requestAnimationFrame(loop)}
 function start(){if(!document.hidden&&visible&&!reduced.matches&&!raf){last=performance.now();raf=requestAnimationFrame(loop)}}
 function pause(){cancelAnimationFrame(raf);raf=0}
 if(!fixed)new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():pause()},{rootMargin:'80px'}).observe(host);
 new ResizeObserver(resize).observe(fixed?document.documentElement:host);
 document.addEventListener('visibilitychange',()=>document.hidden?pause():start());
 reduced.addEventListener('change',()=>{pause();paint();start()});
 addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();mx=e.clientX-b.left;my=e.clientY-b.top},{passive:true});document.addEventListener('pointerleave',()=>{mx=my=-999});
 addEventListener('pageshow',start);addEventListener('pagehide',pause);resize();
 return{canvas,pause};
}
