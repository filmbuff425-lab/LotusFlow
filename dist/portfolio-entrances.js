// Shared particle glyphs on the Discography chapter and its archive pages.
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=[];let frame=0,last=0;
function shape(kind){
 const points=[];const line=(a,b,n=24)=>{for(let i=0;i<n;i++){const t=i/(n-1);points.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}};
 const arc=(cx,cy,rx,ry,from=0,to=Math.PI*2,n=42)=>{for(let i=0;i<n;i++){const a=from+(to-from)*i/(n-1);points.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry])}};
 if(kind==='films'){
  line([12,19],[50,19]);line([50,19],[50,47],18);line([50,47],[12,47]);line([12,47],[12,19],18);
  line([27,26],[39,33],14);line([39,33],[27,40],14);line([27,40],[27,26],16);
  line([12,15],[47,8]);line([13,12],[48,5]);for(let i=0;i<5;i++)line([16+i*7,12-i*1.4],[18+i*7,15-i*1.4],5);
 }else if(kind==='collaborators'){
  arc(24,23,7,8);arc(43,25,5.8,6.8);arc(24,47,13,14,Math.PI,Math.PI*2);arc(43,48,10,12,Math.PI*1.35,Math.PI*2);
  line([27,37],[35,33],14);line([33,31],[35,33],5);
 }else{arc(32,32,23,23,0,Math.PI*2,100);arc(32,32,15,15,0,Math.PI*2,70);arc(32,32,3,3,0,Math.PI*2,20)}
 return points.map(([x,y],i)=>({x,y,phase:i*2.3999,size:i%13===0?.75:.45}));
}
function wake(){if(!frame&&!document.hidden&&items.some(i=>i.visible))frame=requestAnimationFrame(draw)}
function draw(now){frame=0;if(document.hidden)return;if(now-last<32){wake();return}last=now;
 for(const item of items){if(!item.visible)continue;const {canvas,ctx,points}=item,t=reduced.matches?0:now*.001;ctx.clearRect(0,0,128,128);ctx.globalCompositeOperation='lighter';
  for(const p of points){const wave=Math.sin(t*1.6+p.phase),spread=item.hover?.35:.8,x=p.x+Math.cos(p.phase+t*.6)*spread,y=p.y+Math.sin(p.phase+t*.9)*spread;
   ctx.globalAlpha=.42+.52*(.5+.5*wave);ctx.fillStyle=p.phase%3<1?'#e8cfb2':'#f8eee1';ctx.beginPath();ctx.arc(x*2,y*2,(p.size+(item.hover?.12:0))*2,0,Math.PI*2);ctx.fill();
   if(p.size>.7){ctx.globalAlpha*=.14;ctx.beginPath();ctx.arc(x*2,y*2,5,0,Math.PI*2);ctx.fill()}
  }
 }
 if(!reduced.matches)wake();
}
const observer=new IntersectionObserver(entries=>{for(const e of entries){const item=items.find(i=>i.link===e.target);if(item)item.visible=e.isIntersecting}wake()});
for(const a of document.querySelectorAll('a[href]')){
 const u=new URL(a.href,location.href),kind=/\/films\/$/.test(u.pathname)?'films':/\/collaborators\/$/.test(u.pathname)?'collaborators':/\/works\/$/.test(u.pathname)?'music':null;
 if(!kind||a.closest('.header,.archive-header')||a.classList.contains('skip')||a.hasAttribute('data-discography-back')||a.classList.contains('record-portal')||a.classList.contains('visual-entrance')||a.classList.contains('archive-brand'))continue;
 a.classList.add('visual-entrance',`entrance-${kind}`);a.dataset.iconStyle='particle-glyph';const canvas=document.createElement('canvas');canvas.width=canvas.height=128;canvas.className='entrance-symbol';canvas.setAttribute('aria-hidden','true');a.prepend(canvas);
 const item={link:a,canvas,ctx:canvas.getContext('2d'),points:shape(kind),visible:false,hover:false};if(!item.ctx)continue;items.push(item);observer.observe(a);
 for(const event of ['pointerenter','focus'])a.addEventListener(event,()=>{item.hover=true;wake()});for(const event of ['pointerleave','blur'])a.addEventListener(event,()=>{item.hover=false;wake()});
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else wake()});reduced.addEventListener('change',wake);
