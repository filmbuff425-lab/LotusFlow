// Independent luminous sand grains. Broad coherent waves keep the lettering
// floating on one surface; no raster lettering or image texture is displayed.
export async function mountNoiseParticles(title){
 const canvas=title.querySelector('.noise-particle-type');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const geometry=await fetch(new URL('assets/type/zaosheng-particles.json?v=20261006-lake-surface1',import.meta.url)).then(r=>{if(!r.ok)throw new Error('Particle geometry unavailable');return r.json()});
 const hash=n=>{const v=Math.sin(n*127.1+17.3)*43758.5453;return v-Math.floor(v)};
 const points=[],dust=[];const step=innerWidth<600?6:3;
 for(let i=0;i<geometry.points.length;i+=step){const id=i/3,p=geometry.points;points.push({ox:p[i]/geometry.quantization,oy:p[i+1]/geometry.quantization,alpha:p[i+2]/255,z:(hash(id+3)-.5)*12,r:.65+hash(id+8)*.7,phase:hash(id+6)*6.28,shine:id%3===0,x:0,y:0,vx:0,vy:0,red:0})}
 // Pale, progressively dispersed edge grains connect the words to the star field.
 const edges=points.filter(p=>p.alpha<.66);
 for(let i=0;i<(innerWidth<600?550:1150);i++){const source=edges[Math.floor(hash(i+400)*edges.length)]||points[Math.floor(hash(i)*points.length)],a=hash(i+300)*6.28,reach=8+hash(i+500)*49;dust.push({ox:source.ox+Math.cos(a)*reach,oy:source.oy+Math.sin(a)*reach*.8,phase:hash(i+80)*6.28,r:.16+hash(i+20)*.5,alpha:(1-reach/65)*(.06+hash(i+50)*.13),flow:1+hash(i+65)*4})}
 const colors=['#fff9ee','#f7e4dc','#efc5be','#eaa09c','#df797d','#fffdf7'],reaction=['#df5968','#ed727c','#f39599','#f7bbb8'];
 const glowAtlas=document.createElement('canvas');glowAtlas.width=16*(colors.length+reaction.length);glowAtlas.height=16;const ag=glowAtlas.getContext('2d');
 [...colors,...reaction].forEach((color,i)=>{const x=i*16+8,g=ag.createRadialGradient(x,8,0,x,8,8);g.addColorStop(0,color+'ca');g.addColorStop(.16,color+'a8');g.addColorStop(.42,color+'26');g.addColorStop(1,color+'00');ag.fillStyle=g;ag.fillRect(i*16,0,16,16)});
 let width=1,height=1,scale=1,visible=false,raf=0,last=0,time=0,pointer=null,lastBrush=0,lastWord=-1,lastSoundPoint=null,ripples=[];
 title.dataset.particleCount=String(points.length);title.dataset.particleRenderer='independent-vertices';title.dataset.particleMaterial='luminous-sand';canvas.dataset.surfaceMotion='coherent-water-waves';
 const isChinese=()=>document.documentElement.lang.startsWith('zh');
 const tide=(x,y,phase)=>({x:Math.sin(y*.012+time*.54)*5.4+Math.sin(time*.32+phase)*1.5,y:Math.sin(x*.010-time*.62)*7.5+Math.sin(y*.008+time*.43)*3.5+Math.sin(time*.45)*4.2});
 function paint(dt=0){
  ctx.clearRect(0,0,width,height);if(!isChinese())return;ctx.save();ctx.scale(scale,scale);
  for(const p of dust){const w=reduced.matches?{x:0,y:0}:tide(p.ox,p.oy,p.phase),drift=Math.sin(time*.23+p.phase)*p.flow;ctx.globalAlpha=p.alpha*(.7+.3*Math.sin(time*.31+p.phase));ctx.fillStyle=colors[Math.min(4,Math.floor(p.ox/220))];ctx.fillRect(p.ox+w.x+drift,p.oy+w.y+drift*.35,p.r,p.r)}
  let displaced=0,peak=0;
  for(const p of points){
   const w=reduced.matches?{x:0,y:0}:tide(p.ox,p.oy,p.phase),sx=p.ox+w.x,sy=p.oy+w.y;let fx=0,fy=0,heat=0;
   if(pointer&&!reduced.matches){const dx=sx+p.x-pointer.x,dy=sy+p.y-pointer.y,d=Math.hypot(dx,dy);heat=Math.max(0,1-d/90);const push=heat*heat*105;fx=dx/(d||1)*push;fy=dy/(d||1)*push*.75}
   let wave=0;for(const ripple of ripples){const dx=sx-ripple.x,dy=sy-ripple.y,d=Math.hypot(dx,dy),age=time-ripple.time,band=Math.exp(-Math.pow((d-age*235)/78,2)),strength=band*Math.max(0,1-age/2.3);wave=Math.max(wave,strength);const push=Math.sin((d-age*235)*.034)*strength*49;fx+=dx/(d||1)*push;fy+=dy/(d||1)*push*.68}
   if(dt&&!reduced.matches){p.vx+=(fx-p.x)*23*dt;p.vy+=(fy-p.y)*23*dt;const damping=Math.exp(-5.5*dt);p.vx*=damping;p.vy*=damping;p.x+=p.vx*dt;p.y+=p.vy*dt;p.red+=(Math.max(heat*.9,wave*.85)-p.red)*Math.min(1,dt*4)}
   const move=Math.hypot(p.x,p.y);if(move>2)displaced++;peak=Math.max(peak,move);
   const gradient=Math.max(0,Math.min(4,Math.floor((p.ox/geometry.width*.62+p.oy/geometry.height*.28+Math.sin(p.ox*.008-time*.21)*.12)*5))),tone=p.red>.1?colors.length+Math.min(3,Math.floor(p.red*4)):gradient;
   const size=p.r*(1+p.z*.018)*(1+wave*.1),x=sx+p.x,y=sy+p.y;
   ctx.globalAlpha=Math.min(1,p.alpha*(.85+hash(p.phase*13)*.3));ctx.fillStyle=tone>=colors.length?reaction[tone-colors.length]:colors[tone];ctx.fillRect(x,y,size,size*.85);
   // Fine cores with a restrained halo, rather than large solid beads.
   if(p.shine||p.red>.2){const glowSize=(p.shine?5.2:4)+p.red*2;ctx.globalAlpha=p.alpha*(.38+p.red*.30);ctx.drawImage(glowAtlas,tone*16,0,16,16,x-glowSize/2,y-glowSize/2,glowSize,glowSize)}
  }
  ctx.restore();ctx.globalAlpha=1;canvas.dataset.displaced=String(displaced);canvas.dataset.displacementPeak=peak.toFixed(1);ripples=ripples.filter(r=>time-r.time<2.4);
 }
 function loop(now){raf=0;if(!visible||document.hidden||!isChinese()||reduced.matches)return;if(now-last<30){raf=requestAnimationFrame(loop);return}const dt=Math.min(.05,(now-last)/1000||.033);last=now;time+=dt;paint(dt);raf=requestAnimationFrame(loop)}
 function start(){if(visible&&!document.hidden&&isChinese()&&!reduced.matches&&!raf){last=performance.now()-32;raf=requestAnimationFrame(loop)}else if(!raf)paint()}
 function pause(){cancelAnimationFrame(raf);raf=0}
 function resize(){width=canvas.clientWidth||title.clientWidth;height=width*geometry.height/geometry.width;const dpr=Math.min(devicePixelRatio,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);scale=width/geometry.width;paint();start()}
 function location(e){const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)/scale,y:(e.clientY-b.top)/scale}}
 canvas.addEventListener('pointermove',e=>{pointer=location(e);const word=pointer.x<515?0:1,now=performance.now(),travel=lastSoundPoint?Math.hypot(pointer.x-lastSoundPoint.x,pointer.y-lastSoundPoint.y):90;if((word!==lastWord||travel>90)&&now-lastBrush>900){lastWord=word;lastBrush=now;lastSoundPoint={...pointer};title.dispatchEvent(new CustomEvent('lotus-noise-brush',{detail:{voice:word?'rim':'hat',value:pointer.y/geometry.height,motion:Math.min(1,travel/160),x:(e.clientX-innerWidth/2)/innerWidth}}))}start()},{passive:true});
 canvas.addEventListener('pointerleave',()=>{pointer=null;lastWord=-1;lastSoundPoint=null});
 canvas.addEventListener('pointerdown',e=>{pointer=location(e);ripples.push({...pointer,time});ripples=ripples.slice(-4);canvas.dataset.touchCount=String(Number(canvas.dataset.touchCount||0)+1);start()},{passive:true});
 canvas.addEventListener('pointerup',e=>{if(e.pointerType==='touch')pointer=null},{passive:true});canvas.addEventListener('pointercancel',()=>pointer=null);
 title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){ripples.push({x:500,y:290,time});start()}});
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;visible?start():pause()},{rootMargin:'80px'}).observe(title);new ResizeObserver(resize).observe(canvas);document.addEventListener('visibilitychange',()=>document.hidden?pause():start());window.addEventListener('lotus-language-change',()=>{pause();resize()});reduced.addEventListener('change',()=>{pause();paint();start()});addEventListener('pagehide',pause);addEventListener('pageshow',start);resize();
}
