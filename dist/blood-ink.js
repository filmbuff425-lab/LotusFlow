// Restore the original wet, granular trace; keep the approved fast spray clock.
import {timing} from './cut-timing.js?v=20261006-lake-surface1';
import {createInkFlow} from './identity-ink-flow.js?v=20261007-mobile3';
const canvas=document.querySelector('.blood-field'),ctx=canvas.getContext('2d'),host=document.querySelector('#about');
const liquid=createInkFlow(),flow=liquid.svg;flow.classList.add('blood-flow');host.append(flow);
let onScreen=false;new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;host.classList.toggle('blood-awake',onScreen&&!document.hidden)}).observe(host);document.addEventListener('visibilitychange',()=>host.classList.toggle('blood-awake',onScreen&&!document.hidden));
let settled=false,flight,air,lastTime=-1,width=1400,height=900,seed=1973,sizeStamp='';
const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
const clamp=x=>Math.max(0,Math.min(1,x));
const colors=['#b5160c','#c72012','#920f09','#ad190d'];
// These seeded shapes and final coordinates are identical to the original trace.
const stains=Array.from({length:1900},(_,i)=>{const u=random(),thickness=Math.pow(1-u,.62),scatter=(random()-.5)*(random()<.14?63:14)*thickness;return{u,v:scatter,r:(.35+Math.pow(random(),3)*3.1)*(.35+thickness*.65),a:.45+random()*.5,lag:.03+u*.13+random()*.11,tone:i%4}});
const drops=Array.from({length:46},()=>({u:random()*.93,v:(random()-.5)*122,r:.6+Math.pow(random(),2)*3.4,lag:.18+random()*.60}));
const core=Array.from({length:91},(_,i)=>({u:i/90,v:Math.sin(i*.58)*2.1+(random()-.5)*2.6,w:(2.1+random()*2.4)*Math.pow(1-i/92,.66)}));
function size(){
 width=host.clientWidth;height=Math.min(host.clientHeight,innerHeight);const dpr=Math.min(devicePixelRatio,1.5),stamp=`${width}/${height}/${dpr}/${Boolean(flight)}`;if(stamp===sizeStamp)return;sizeStamp=stamp;settled=false;canvas.style.height=height+'px';flow.style.height=height+'px';
 for(const c of [canvas,flight]){if(!c)continue;c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0)}
 const spine=core.slice().reverse().map((p,i)=>{const q=coordinates(p.u,p.v);return `${i?'L':'M'} ${q.x} ${q.y}`}).join(' ');
 const falls=[.18,.29,.42,.54,.65,.77,.86].map((u,i)=>({...coordinates(u,0),length:22+(i*17%39),width:1.2+(i%3)*.55}));
 liquid.update({width,height,spine,thickness:7,falls});
}
function coordinates(u,v){const sceneHeight=Math.min(height,innerHeight),y0=width<650?Math.min(sceneHeight*.76,630):sceneHeight*.81;return{x:width*(-.04+u*.66),y:y0-u*(width<650?125:sceneHeight*.19)+v*(width<650?.7:1)}}
function paint(p,t,small=false){
 const age=t-p.lag*.28;if(age<0)return;
 const q=clamp(age/(small?.045:.030)),pos=coordinates(p.u,p.v),land=q===1,g=land?ctx:(air||ctx);
 g.globalAlpha=p.a||.85;g.fillStyle=colors[p.tone||0];g.beginPath();
 // Small rounded wet beads, never the long pointed streaks of the spray draft.
 const dx=(1-q)*(small?42:26),dy=-(1-q)*(small?47:20);
 g.ellipse(pos.x+dx,pos.y+dy,p.r*(land?1.32:.64),p.r*(land?.60:1.8),land?-.22:.72,0,Math.PI*2);g.fill();
}
export function renderBlood(time){
 lastTime=time;if(settled&&time>=timing.spray+310)return;settled=false;ctx.clearRect(0,0,width,height);air?.clearRect(0,0,width,height);
 const t=(time-timing.spray)/1000;
 if(t<0){canvas.dataset.phase='clear';return}
 // Same connected, uneven wet center and the same fine granular edge as before.
 for(let i=1;i<core.length;i++){
  const a=core[i-1],b=core[i],q=clamp((t-(.065+b.u*.14)*.28)/(.065*.28));if(!q)continue;
  const p=coordinates(a.u,a.v-(1-q)*15),n=coordinates(b.u,b.v-(1-q)*15);
  ctx.globalAlpha=.92*q;ctx.fillStyle=i%5?'#aa1209':'#c11e10';ctx.beginPath();
  ctx.moveTo(p.x,p.y-a.w*q);ctx.lineTo(n.x,n.y-b.w*q);ctx.lineTo(n.x,n.y+b.w*q);ctx.lineTo(p.x,p.y+a.w*q);ctx.closePath();ctx.fill();
 }
 for(const p of stains)paint(p,t);for(const p of drops)paint(p,t,true);
 ctx.globalAlpha=1;if(air)air.globalAlpha=1;
 settled=t>=.31;canvas.dataset.phase=t<.265?'jet':'settled';canvas.dataset.impactTime=t.toFixed(3);canvas.dataset.material='original-grain';
}
window.addEventListener('lotus-cut-ready',()=>{flight=document.querySelector('.blood-flight');air=flight?.getContext('2d');size();renderBlood(lastTime)});
window.addEventListener('lotus-cut-prepare',()=>{size();renderBlood(-1);host.classList.remove('ink-arrived')});
window.addEventListener('lotus-cut-frame',e=>{renderBlood(e.detail.time);host.classList.toggle('ink-arrived',e.detail.time>=timing.spray)});
new ResizeObserver(()=>{size();renderBlood(lastTime)}).observe(host);size();renderBlood(-1);
