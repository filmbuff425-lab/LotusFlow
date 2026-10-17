const link=document.querySelector('.record-portal'),canvas=link?.querySelector('canvas');
if(link&&canvas){
 const beacon=link.querySelector('.portal-beacon'),ctx=canvas.getContext('2d'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 // Preserve the original golden-angle cloud; only its light and scale breathe.
 const seeds=Array.from({length:840},(_,i)=>({a:i*2.399963,r:Math.sqrt((i+.5)/840),layer:Math.min(3,Math.floor(Math.sqrt((i+.5)/840)*4)),phase:(i*17.31)%6.28,size:i%19===0?2:i%3===0?1.25:.75}));
 let w=1,h=1,visible=false,hover=false,gather=0,last=0,frame=0,opened=0,mx=0,my=0,tx=0,ty=0,time=0,beaconY=0,enteredAt=0,hinted=false,lastHint=-Infinity;
 const run=()=>{if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(draw)};
 const resize=()=>{w=link.clientWidth;h=link.clientHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);if(beacon){const b=beacon.getBoundingClientRect();beaconY=b.top-link.getBoundingClientRect().top+b.height/2}run()};
 const sizing=new ResizeObserver(resize);sizing.observe(link);sizing.observe(link.querySelector('.portal-label'));
 function invitation(intent=false){
  const now=performance.now();if(!visible||document.hidden||opened||now-lastHint<12000||(!intent&&hinted))return;
  if(window.lotusSfx?.play('archive-invite')){hinted=true;lastHint=now;link.dataset.soundCue='air-glass'}
 }
 new IntersectionObserver(([e])=>{visible=e.isIntersecting&&e.intersectionRatio>=.4;link.dataset.portalVisible=String(visible);last=0;if(visible){enteredAt=performance.now();window.lotusPageTransition?.preload(link.href);run()}else if(frame){cancelAnimationFrame(frame);frame=0}},{threshold:[0,.4]}).observe(link);
 const active=value=>{hover=value;link.dataset.particleState=value?'gathering':'breathing';if(value)invitation(true);run()};
 link.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')active(true)});link.addEventListener('pointerleave',()=>{tx=ty=0;active(false)});link.addEventListener('focus',()=>active(true));link.addEventListener('blur',()=>active(false));
 link.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const b=link.getBoundingClientRect();tx=(e.clientX-b.left-w/2)*.018;ty=(e.clientY-b.top-h*.5)*.014},{passive:true});
 link.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||motion.matches)return;e.preventDefault();if(opened)return;opened=performance.now();link.classList.add('is-entering');link.dataset.particleState='opening';window.lotusPageTransition?.preload(link.href);const b=link.getBoundingClientRect();if(window.lotusPageTransition)window.lotusPageTransition.navigate(link.href,{origin:{x:b.left+b.width/2,y:b.top+(beaconY||b.height*.5)}});else location.assign(link.href)});
 function draw(now){
  frame=0;if(!visible||document.hidden)return;
  const reduced=motion.matches,interval=hover||opened?1000/60:1000/30;
  if(last&&now-last<interval-.5){run();return}
  const dt=last?Math.min(.06,(now-last)*.001):0;last=now;time+=dt;
  gather+=(Number(hover)-gather)*(1-Math.exp(-dt*3.8));mx+=(tx-mx)*(1-Math.exp(-dt*4));my+=(ty-my)*(1-Math.exp(-dt*4));
  if(!hinted&&now-enteredAt>750)invitation();
  const t=reduced?1.8:time,exit=opened?Math.min(1,(now-opened)/850):0,breath=.5-.5*Math.cos(t*Math.PI*2/5.8);
  ctx.clearRect(0,0,w,h);const r=w>700?Math.min(w*.22,168):Math.min(w*.22,119),cx=w/2+mx,cy=h*.5+my;
  const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.9);glow.addColorStop(0,`rgba(186,44,13,${.08+.04*breath})`);glow.addColorStop(.45,'rgba(186,44,13,.035)');glow.addColorStop(1,'rgba(186,44,13,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='lighter';
  // Four overlapping diffuse light volumes follow the original cloud, not visible rings.
  for(let layer=3;layer>=0;layer--){
   const pulse=Math.pow(.5-.5*Math.cos((t-layer*.42)*Math.PI*2/5.8),2),radius=r*(.5+layer*.29);
   ctx.save();ctx.translate(cx,cy);ctx.scale(1,.72);const light=ctx.createRadialGradient(0,0,radius*.16,0,0,radius*1.18);
   light.addColorStop(0,'rgba(245,76,24,0)');light.addColorStop(.6,`rgba(255,${100+layer*18},54,${(.018+.10*pulse)*(1-exit)})`);light.addColorStop(1,'rgba(230,55,15,0)');
   ctx.fillStyle=light;ctx.fillRect(-radius*1.2,-radius*1.2,radius*2.4,radius*2.4);ctx.restore();
  }
  for(let i=0;i<seeds.length;i++){
   const p=seeds[i],pulse=.5-.5*Math.cos((t-p.layer*.38)*Math.PI*2/5.8),swell=.975+.05*pulse;
   const a=p.a+t*(.08+(i%3)*.02),wave=Math.sin(a*3+t*.6+p.phase)*9;
   const ring=r*(.58+p.r*.43),loose=r*(.3+p.r*1.15)+wave;
   const radius=(loose*(1-gather)+ring*gather)*swell*(1-exit*.88),angle=a+gather*Math.sin(p.phase)*.18+exit*1.2;
   const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*(.69+.09*Math.sin(t*.35))+Math.sin(a*2+t)*4*(1-gather);
   const bright=(.24+.46*(.5+.5*Math.sin(p.phase+t))+.20*gather)*(.85+.85*pulse);
   ctx.globalAlpha=Math.min(1,bright)*(1-exit*.55);ctx.fillStyle=i%11===0?'#ffeac7':i%3===0?'#fa6c28':'#d93819';ctx.beginPath();ctx.arc(x,y,p.size*(1+gather*.16),0,Math.PI*2);ctx.fill();
  }
  // A small amber constellation belongs to the surrounding cloud.
  const by=beaconY||cy+40,corePulse=.5+.5*Math.sin(t*1.8),coreRadius=(9+corePulse*2)*(1+gather*.12);
  const halo=ctx.createRadialGradient(w/2,by,0,w/2,by,29);halo.addColorStop(0,`rgba(255,225,176,${.10+corePulse*.07+gather*.06})`);halo.addColorStop(1,'rgba(255,198,140,0)');ctx.globalAlpha=1-exit;ctx.fillStyle=halo;ctx.fillRect(w/2-29,by-29,58,58);
  for(let i=0;i<17;i++){
   const a=i*2.399963+t*.18,rr=coreRadius*Math.sqrt((i+.5)/17),x=w/2+Math.cos(a)*rr,y=by+Math.sin(a)*rr*.62;
   const shine=.5+.5*Math.sin(t*2.1-i*.8);ctx.globalAlpha=(.35+.65*shine)*(1-exit);ctx.fillStyle=i%3?'#f6a365':'#ffe3bd';ctx.beginPath();ctx.arc(x,y,.55+shine*.6+gather*.2,0,Math.PI*2);ctx.fill();
   if(i%5===0){ctx.strokeStyle='#fff4dd';ctx.lineWidth=.55;const ray=1+shine*1.7;ctx.beginPath();ctx.moveTo(x-ray,y);ctx.lineTo(x+ray,y);ctx.moveTo(x,y-ray);ctx.lineTo(x,y+ray);ctx.stroke()}
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  link.style.setProperty('--portal-breath',String(breath));
  if(!reduced)run();
 }
 motion.addEventListener('change',run);
 addEventListener('pageshow',()=>{opened=0;link.classList.remove('is-entering');run()});
 document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0}else run()});
}
