const link=document.querySelector('.record-portal'),canvas=link?.querySelector('canvas');
if(link&&canvas){
 const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const seeds=Array.from({length:840},(_,i)=>({a:i*2.399963,r:Math.sqrt((i+.5)/840),phase:(i*17.31)%6.28,size:i%19===0?2.0:i%3===0?1.25:.75}));
 let w=1,h=1,visible=false,hover=false,gather=0,last=0,frame=0,opened=0,mx=0,my=0;
 const resize=()=>{w=link.clientWidth;h=link.clientHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);if(reduced)draw(0)};
 new ResizeObserver(resize).observe(link);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(draw)}).observe(link);
 const active=value=>{hover=value;link.dataset.particleState=value?'gathering':'drifting';if(visible&&!frame)frame=requestAnimationFrame(draw)};
 link.addEventListener('pointerenter',()=>active(true));link.addEventListener('pointerleave',()=>{mx=my=0;active(false)});link.addEventListener('focus',()=>active(true));link.addEventListener('blur',()=>active(false));
 link.addEventListener('pointermove',e=>{const b=link.getBoundingClientRect();mx=(e.clientX-b.left-w/2)*.06;my=(e.clientY-b.top-h*.43)*.04});
 link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||reduced)return;e.preventDefault();if(opened)return;opened=performance.now();link.classList.add('is-entering');link.dataset.particleState='opening';window.lotusPageTransition?.preload(link.href);const b=link.getBoundingClientRect();if(window.lotusPageTransition)window.lotusPageTransition.navigate(link.href,{origin:{x:b.left+b.width/2,y:b.top+b.height*.42}});else location.assign(link.href)});
 function draw(now){frame=0;if(!visible&&!reduced)return;const dt=Math.min(.05,(now-last)*.001||.016);last=now;gather+=(Number(hover)-gather)*(1-Math.exp(-dt*3.8));const t=reduced?0:now*.001,exit=opened?Math.min(1,(now-opened)/1000):0;
  ctx.clearRect(0,0,w,h);const r=Math.min(w*.22,119),cx=w/2+mx,cy=h*.42+my;
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.9);glow.addColorStop(0,'rgba(186,44,13,.10)');glow.addColorStop(.45,'rgba(186,44,13,.035)');glow.addColorStop(1,'rgba(186,44,13,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='lighter';
  for(let i=0;i<seeds.length;i++){const p=seeds[i],a=p.a+t*(.08+(i%3)*.02),wave=Math.sin(a*3+t*.6+p.phase)*9;const ring=r*(.58+p.r*.43),loose=r*(.3+p.r*1.15)+wave;const radius=(loose*(1-gather)+ring*gather)*(1-exit*.88);const angle=a+gather*Math.sin(p.phase)*.18+exit*1.2;
   const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*(.69+.09*Math.sin(t*.35)) + Math.sin(a*2+t)*4*(1-gather);
   const bright=.24+.46*(.5+.5*Math.sin(p.phase+t))+.20*gather;ctx.globalAlpha=bright*(1-exit*.55);ctx.fillStyle=i%11===0?'#ffeac7':i%3===0?'#fa6c28':'#d93819';ctx.beginPath();ctx.arc(x,y,p.size*(1+gather*.16),0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=.6+gather*.35;ctx.strokeStyle='#ffe3b8';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cx-6,cy);ctx.lineTo(cx+6,cy);ctx.moveTo(cx,cy-6);ctx.lineTo(cx,cy+6);ctx.stroke();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  if(visible&&!document.hidden&&!reduced)frame=requestAnimationFrame(draw);
 }
 addEventListener('pageshow',()=>{opened=0;link.classList.remove('is-entering')});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!frame)frame=requestAnimationFrame(draw)});
}
