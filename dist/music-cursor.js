// Iridescent light motes: curved momentum, tapered tails and pearlescent cores.
// The fixed pool sleeps when empty and never intercepts an interaction.
const fine=matchMedia('(hover: hover) and (pointer: fine)'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
const canvas=document.createElement('canvas');canvas.className='music-pointer-notes';canvas.dataset.effect='iridescent-particles';canvas.setAttribute('aria-hidden','true');
const ctx=canvas.getContext('2d');
if(ctx){
 document.body.append(canvas);
 const particles=Array.from({length:144},()=>({life:0,trail:[]}));
 const palette=[[255,194,165],[224,170,215],[176,188,245],[175,223,231],[247,224,184]];
 let width=0,height=0,raf=0,last=0,poolIndex=0,previous=null,lastEmit=0;
 const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
 const rgba=(c,a)=>`rgba(${c.join(',')},${a})`;
 function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function emit(x,y,count=1,vx=0,vy=0,burst=false){
  if(reduce.matches||!fine.matches||document.hidden)return;
  const heading=Math.atan2(vy,vx),velocity=Math.min(1,Math.hypot(vx,vy)/35);
  for(let i=0;i<count;i++){
   const p=particles[poolIndex++%particles.length],a=burst?i/count*Math.PI*2+Math.random()*.3:heading+Math.PI+(Math.random()-.5)*1.9,speed=burst?24+Math.random()*49:12+velocity*22+Math.random()*13;
   Object.assign(p,{x,y,life:1,max:burst?.9+Math.random()*.35:.68+Math.random()*.4,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,size:burst?1.2+Math.random()*1.7:.8+Math.random()*1.45+velocity*.65,phase:a,turn:(poolIndex%2?1:-1)*(1.1+Math.random()*1.5),tone:(poolIndex*.09+performance.now()*.00013)%palette.length,trail:[]});
  }
  canvas.dataset.active='true';start();
 }
 function frame(now){
  raf=0;if(document.hidden||canvas.hidden){clear();return}const dt=Math.min(.045,(now-last)/1000||.016);last=now;ctx.clearRect(0,0,width,height);let alive=0;ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(const p of particles){
   if(p.life<=0)continue;p.life-=dt/p.max;if(p.life<=0)continue;alive++;
   p.phase+=dt*p.turn;p.vx*=Math.exp(-dt*1.2);p.vy*=Math.exp(-dt*1.2);p.x+=(p.vx+Math.cos(p.phase)*10)*dt;p.y+=(p.vy+Math.sin(p.phase)*10-4)*dt;
   p.trail.push({x:p.x,y:p.y});if(p.trail.length>8)p.trail.shift();
   const progress=1-p.life,glint=Math.sin(Math.PI*Math.min(.98,progress+.12)),alpha=glint*.66,size=p.size*(.22+.78*Math.sin(Math.PI*p.life*.82));
   const tone=(p.tone+progress*1.65)%palette.length,first=Math.floor(tone),color=mix(palette[first],palette[(first+1)%palette.length],tone-first);
   // Each tail narrows into dust; the colour shifts from rose to violet to ice.
   for(let i=1;i<p.trail.length;i++){
    const a=p.trail[i-1],b=p.trail[i],t=i/p.trail.length,tail=mix(palette[(first+1)%palette.length],color,t);
    ctx.strokeStyle=rgba(tail,alpha*t*.30);ctx.lineWidth=Math.max(.12,size*t*.95);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   }
   const r=size*4.4,light=ctx.createRadialGradient(p.x-size*.2,p.y-size*.2,0,p.x,p.y,r);
   light.addColorStop(0,rgba([255,250,243],alpha*.86));light.addColorStop(.13,rgba(color,alpha*.75));light.addColorStop(.35,rgba(color,alpha*.23));light.addColorStop(1,rgba(color,0));
   ctx.fillStyle=light;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.8,p.phase,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=rgba(mix(color,[255,255,255],.6),alpha*.83);ctx.beginPath();ctx.ellipse(p.x-size*.12,p.y-size*.12,size*.55,size*.36,p.phase,0,Math.PI*2);ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';canvas.dataset.particleCount=String(alive);if(alive)raf=requestAnimationFrame(frame);else canvas.dataset.active='false';
 }
 function start(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
 function clear(){cancelAnimationFrame(raf);raf=0;particles.forEach(p=>p.life=0);ctx.clearRect(0,0,width,height);canvas.dataset.active='false';canvas.dataset.particleCount='0'}
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!fine.matches)return;const now=performance.now();if(previous){const dx=e.clientX-previous.x,dy=e.clientY-previous.y,d=Math.hypot(dx,dy);if(d>2&&now-lastEmit>13){const count=Math.min(6,Math.ceil(d/8));for(let i=1;i<=count;i++)emit(previous.x+dx*i/count,previous.y+dy*i/count,1,dx,dy);lastEmit=now}}previous={x:e.clientX,y:e.clientY}},{passive:true});
 document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest('a,button,summary,[role="button"]'))emit(e.clientX,e.clientY,9,0,0,true)},{passive:true});
 document.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')emit(e.clientX,e.clientY,26,0,0,true)},{passive:true});
 document.addEventListener('pointerleave',()=>previous=null,{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){previous=null;clear()}});
 const mode=()=>{canvas.hidden=!fine.matches||reduce.matches;if(canvas.hidden)clear()};fine.addEventListener('change',mode);reduce.addEventListener('change',mode);addEventListener('resize',resize,{passive:true});resize();mode();
}
