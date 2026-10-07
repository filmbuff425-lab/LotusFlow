// A self-contained opening. Deep links keep their existing navigation and audio.
const root=document.querySelector('#impact-intro');
const canvas=root.querySelector('canvas');
const ctx=canvas.getContext('2d');
const button=root.querySelector('.impact-sphere');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const content=[...document.querySelectorAll('body > .skip,body > .header,body > main,body > footer,body > .transport')];
let w=0,h=0,raf=0,start=0,origin=0,active=false,pressed=false,hover=0,targetHover=0,grain;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
// Fixed seeds keep stars and surface texture stable; they never flicker randomly.
let seed=461;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const stars=Array.from({length:150},()=>({x:rand(),y:rand()*.74,r:.25+rand()*.55,p:rand()*6.28}));
const debris=Array.from({length:56},()=>({a:rand()*6.28,r:rand(),speed:.5+rand()}));
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);const tile=document.createElement('canvas');tile.width=tile.height=192;const g=tile.getContext('2d'),data=g.createImageData(192,192);for(let i=0;i<data.data.length;i+=4){const v=rand()*255;data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=13}g.putImageData(data,0,0);grain=ctx.createPattern(tile,'repeat')}
function lineEllipse(x,y,rx,ry,angle,alpha,width=1){ctx.beginPath();ctx.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),angle,0,Math.PI*2);ctx.strokeStyle=`rgba(224,232,243,${alpha})`;ctx.lineWidth=width;ctx.stroke()}
function draw(now){if(!active)return;const t=(now-origin)/1000;const elapsed=pressed?(now-start)/1000:0;const contact=reduced?.08:.66;const after=Math.max(0,elapsed-contact);const descent=smooth(elapsed/contact);const collision=pressed&&elapsed>=contact;hover+=(targetHover-hover)*.035;
ctx.clearRect(0,0,w,h);ctx.fillStyle='#020203';ctx.fillRect(0,0,w,h);
const horizon=h*.65;const radius=Math.min(w*(w<600?.18:.105),h*.135);const sx=w*.5;const sy=h*.34+(reduced?0:Math.sin(t*.7)*5);const orbY=pressed?sy+(horizon-radius-sy)*descent:sy;
// A restrained camera surge begins on contact, rather than zooming the button.
const surge=collision?Math.sin(Math.min(1,after/1.55)*Math.PI)*.14:0;
const shake=collision&&after<.4&&!reduced?Math.sin(after*76)*Math.exp(-after*11)*3:0;
ctx.save();ctx.translate(sx,horizon);ctx.scale(1+surge,1+surge);ctx.translate(-sx,-horizon+shake);
for(const s of stars){ctx.fillStyle=`rgba(224,233,245,${.12+(Math.sin(t*.4+s.p)+1)*.09})`;ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,7);ctx.fill()}
const orbitAlpha=pressed?.15*(1-descent):.12+hover*.1;
lineEllipse(sx,sy+radius*.18,radius*1.9,radius*.4,-.24,orbitAlpha);
lineEllipse(sx,sy,radius*.86,radius*1.78,.32,orbitAlpha*.65);
lineEllipse(sx,horizon-3,w*.32,h*.048,-.08,orbitAlpha*.6);
ctx.strokeStyle=`rgba(233,238,247,${orbitAlpha})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(w*.14,horizon-1);ctx.lineTo(w*.86,horizon-1);ctx.moveTo(sx,sy-radius*2.1);ctx.lineTo(sx,horizon+12);ctx.stroke();
for(const side of [-1,1]){const x=sx+side*radius*2.3;ctx.strokeRect(x-3,sy-3,6,6);ctx.beginPath();ctx.moveTo(x-9,sy);ctx.lineTo(x+9,sy);ctx.stroke()}
// Brushed silver sphere: a broad grazing light and deep graphite underside.
if(!collision||after<.32){ctx.save();ctx.translate(sx,orbY);const compression=collision?1-smooth(after/.32)*.35:1;ctx.scale(1,compression);const glow=ctx.createRadialGradient(-radius*.3,-radius*.45,0,0,0,radius);glow.addColorStop(0,'#f8fafc');glow.addColorStop(.38,'#d7dce0');glow.addColorStop(.67,'#899198');glow.addColorStop(.84,'#30383f');glow.addColorStop(1,'#06090d');ctx.beginPath();ctx.arc(0,0,radius,0,7);ctx.fillStyle=glow;ctx.fill();ctx.save();ctx.clip();ctx.globalAlpha=.32;ctx.fillStyle=grain;ctx.fillRect(-radius,-radius,radius*2,radius*2);ctx.restore();ctx.beginPath();ctx.arc(0,0,radius,-Math.PI*.95,-Math.PI*.02);ctx.strokeStyle='#f0f7ff86';ctx.lineWidth=.75;ctx.stroke();ctx.restore()}
// The planetary limb remains a curved surface, with a soft atmospheric edge.
const earthR=Math.max(w*.88,h*.9);ctx.save();ctx.beginPath();ctx.arc(sx,horizon+earthR,earthR,0,7);ctx.clip();const earth=ctx.createLinearGradient(0,horizon,0,h);earth.addColorStop(0,'#bbc6d0');earth.addColorStop(.012,'#7b8b99');earth.addColorStop(.06,'#2c3945');earth.addColorStop(.2,'#10171f');earth.addColorStop(.6,'#030609');earth.addColorStop(1,'#020203');ctx.fillStyle=earth;ctx.fillRect(0,horizon,w,h);ctx.globalAlpha=.19;ctx.fillStyle=grain;ctx.fillRect(0,horizon,w,h);ctx.restore();
ctx.save();ctx.beginPath();ctx.arc(sx,horizon+earthR,earthR,Math.PI*1.18,Math.PI*1.82);ctx.strokeStyle='#dae8ff90';ctx.lineWidth=1.2;ctx.shadowColor='#bccfff';ctx.shadowBlur=15;ctx.stroke();ctx.restore();
if(collision){const envelope=Math.exp(-after*2.4);const flash=ctx.createRadialGradient(sx,horizon,0,sx,horizon,Math.max(w,h)*.62);flash.addColorStop(0,`rgba(255,255,255,${envelope})`);flash.addColorStop(.08,`rgba(230,240,255,${envelope*.7})`);flash.addColorStop(.38,`rgba(140,179,220,${envelope*.12})`);flash.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=flash;ctx.fillRect(0,0,w,h);
for(let i=0;i<3;i++){const age=after-i*.14;if(age>0){const spread=age*Math.max(w,h)*.48;lineEllipse(sx,horizon,spread,spread*.2,0,Math.max(0,.6-age*.45),1.2)}}
for(const p of debris){const distance=after*(100+p.speed*210);const x=sx+Math.cos(p.a)*distance,y=horizon+Math.sin(p.a)*distance*.42;ctx.strokeStyle=`rgba(234,244,255,${Math.max(0,.6-after*.38)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(p.a)*(3+after*9),y+Math.sin(p.a)*after*4);ctx.stroke()}}
ctx.restore();
if(pressed){const revealAt=reduced?.22:1.85;const duration=reduced?.35:1.1;if(elapsed>=revealAt){root.dataset.phase='reveal';document.documentElement.classList.remove('impact-intro-active');const progress=smooth((elapsed-revealAt)/duration);root.style.clipPath=`circle(${150*(1-progress)}% at 50% 65%)`;root.style.opacity=String(1-progress*.45);if(progress===1){finish();return}}}
raf=requestAnimationFrame(draw)}
function open(){if(!ctx)return;cancelAnimationFrame(raf);active=true;pressed=false;origin=performance.now();root.hidden=false;root.dataset.phase='idle';root.style.clipPath='';root.style.opacity='';button.disabled=false;document.documentElement.classList.add('impact-intro-active');content.forEach(el=>el.inert=true);resize();window.scrollTo({top:0,behavior:'instant'});raf=requestAnimationFrame(draw);button.focus({preventScroll:true})}
function finish(){cancelAnimationFrame(raf);active=false;root.hidden=true;document.documentElement.classList.remove('impact-intro-active');content.forEach(el=>el.inert=false);try{sessionStorage.setItem('lotus-impact-seen','1')}catch{}document.querySelector('#enter-universe')?.focus({preventScroll:true})}
button.addEventListener('click',()=>{if(pressed)return;pressed=true;start=performance.now();button.disabled=true;root.dataset.phase='impact'});
button.addEventListener('pointerenter',()=>targetHover=1);button.addEventListener('pointerleave',()=>targetHover=0);
root.querySelector('.impact-skip').addEventListener('click',finish);
document.querySelector('#replay-impact-intro')?.addEventListener('click',open);
addEventListener('keydown',e=>{if(active&&e.key==='Escape')finish()});
addEventListener('resize',()=>{if(active)resize()});
addEventListener('hashchange',()=>{if(active&&location.hash&&location.hash!=='#home')finish()});
if(document.documentElement.classList.contains('impact-intro-active')){if(ctx)open();else document.documentElement.classList.remove('impact-intro-active')}
