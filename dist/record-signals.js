// Optical ring and particulate ribbon studies from the client's two video references.
// The same live analyser drives both; only the audible, visible record is rendered.
export function signalStyle(id){return id==='im-falling'?'prismatic-ring':'particle-ribbon'}
// Art-directed complements keep the particles legible against each cover.
const palettes={
 ice:['#e8ffff','#74e9ef','#2bafcd'],violet:['#f1e9ff','#b69aff','#7858d4'],
 rose:['#fff0f4','#ff99b7','#df517f'],amber:['#fff1d4','#ffc67c','#df873d'],
 mint:['#effff4','#9debd0','#45bf9b'],pearl:['#ffffff','#dce7f6','#8aa9ca']
};
const coverPalettes={lov:'ice','show-me-love':'violet',mirror:'rose',bridge:'amber',juliet:'amber',cassette:'amber','pick-a-side':'rose',news:'mint','train-to-nowhere':'violet','red-flag-101':'ice',rendezvous:'amber',wya:'ice','feed-on':'rose','im-fine':'violet',flow:'mint',summer:'rose',adult:'amber',airtight:'ice','im-falling':'violet','right-here':'amber','midsummer-heat':'mint',endlessly:'rose',jellyfish:'amber','say-it-to-me':'ice','still-miss-you':'ice','unnamed-relationship':'amber'};
export function signalPalette(id){return coverPalettes[id]||'ice'}
export function createSignalPainter(canvas,style,palette='ice'){
 const g=canvas.getContext('2d'),bands=new Float32Array(64),colours=palettes[palette]||palettes.ice;let energy=0,phase=0;
 const dust=Array.from({length:1900},(_,i)=>({u:(i*.61803398875)%1,v:((i*.754877666)%1-.5)*2,a:i*2.399963}));
 return {draw(data,dt,reduced=false){
  const w=canvas.width,h=canvas.height,size=Math.min(w,h),cx=w*.5,cy=h*.5;
  g.clearRect(0,0,w,h);const blend=1-Math.exp(-dt*9),target=data.playing?Math.min(1,data.level*4):0;
  energy+=(target-energy)*blend;if(!reduced)phase+=dt*(.8+energy*.7);
  for(let i=0;i<64;i++)bands[i]+=(((data.spectrum?.[i*3]||0)/255)-bands[i])*blend;
  if(!data.playing)return;
  g.globalCompositeOperation='source-over';const shade=g.createRadialGradient(cx,cy,size*.12,cx,cy,size*.58);shade.addColorStop(0,style==='prismatic-ring'?'rgba(3,8,12,.38)':'rgba(3,8,12,.48)');shade.addColorStop(1,'rgba(3,8,12,0)');g.fillStyle=shade;g.fillRect(0,0,w,h);g.globalCompositeOperation='lighter';
  if(style==='prismatic-ring'){
   const r=size*(.21+energy*.025),pulse=reduced?0:energy;
   const halo=g.createRadialGradient(cx,cy,r*.7,cx,cy,r*1.65);halo.addColorStop(0,'rgba(130,223,224,0)');halo.addColorStop(.37,`rgba(154,226,229,${.13+pulse*.13})`);halo.addColorStop(.60,`rgba(241,183,105,${.09+pulse*.12})`);halo.addColorStop(1,'rgba(194,211,211,0)');g.fillStyle=halo;g.fillRect(cx-r*1.7,cy-r*1.7,r*3.4,r*3.4);
   const hues=['#81dee3','#f1c179','#e97048','#87b8ed','#f5e2b0','#55bdbb','#f9ece1'];
   for(let layer=0;layer<9;layer++){
    const grad=g.createLinearGradient(cx-r,cy-r,cx+r,cy+r);grad.addColorStop(0,hues[layer%7]);grad.addColorStop(.52,hues[(layer+2)%7]);grad.addColorStop(1,hues[(layer+4)%7]);g.strokeStyle=grad;g.globalAlpha=layer<3?.6:.32;g.lineWidth=size*(layer<3?.006:.003);
    g.beginPath();for(let k=0;k<=220;k++){const a=k/220*Math.PI*2,band=bands[Math.floor(k/220*63)],bend=Math.sin(a*3+phase*2+layer*.45)*(.07+pulse*.13)+Math.sin(a*5-phase+layer*.22)*.035;
     const rr=r*(1+(layer-4)*.026+bend+band*.11),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*(.85+.08*Math.sin(phase+layer*.2));k?g.lineTo(x,y):g.moveTo(x,y)}g.closePath();g.stroke();
   }
  }else{
   // Advected points form a loose, folding silk sheet; differently timed
   // currents deform its surface and peel off sparse drifting filaments.
   g.globalCompositeOperation='source-over';
   const t=phase,height=size*.78,width=size*(.25+energy*.075);
   const turn=Math.sin(t*.29)*.38+Math.sin(t*.63)*.12,co=Math.cos(turn),si=Math.sin(turn);
   for(let i=0;i<dust.length;i++){
    const p=dust[i],u=(p.u+t*(.045+(i%11)*.001))%1,v=p.v;
    const warp=Math.sin(u*8.4+t*.87)+.54*Math.sin(u*17.3-t*.61)+.3*Math.cos(v*5.1+t*1.19);
    const flutter=Math.sin(u*23+v*3.7+t*1.73)*.16+Math.sin(u*37-v*5-t*1.12)*.085;
    const loosen=i%7===0?1.9:1,envelope=Math.pow(Math.sin(Math.PI*u),.48),band=bands[Math.floor(u*63)];
    const twist=warp+v*.95,depth=Math.cos(twist),perspective=1/(1+depth*.23);
    const drift=Math.sin(p.a+t*(.36+(i%5)*.07))*.05;
    const xx=(Math.sin(warp)*.47+v*(.2+.75*Math.abs(Math.cos(warp)))*loosen+flutter+drift+band*Math.sin(p.a+t)*.18)*width*envelope;
    const yy=(u-.5)*height+Math.sin(twist+t*.43)*size*.038;
    const x=cx+(xx*co-yy*si)*perspective,y=cy+(xx*si+yy*co)*perspective;
    const fade=envelope*(.48+.52*(depth*.5+.5)),flicker=.84+.16*Math.sin(t*1.1+p.a);
    // Keep ordinary grains around one CSS pixel at gallery size. The original
    // subpixel grains disappeared into bright covers even with live audio.
    const glint=i%7===0;
    g.globalAlpha=fade*flicker*(.74+energy*.24);g.fillStyle=colours[glint?0:i%3?1:2];
    const dot=Math.max(.9,size*(glint?.0056:.004))*perspective;g.fillRect(x,y,dot,dot);
   }
  }
  g.globalAlpha=1;g.globalCompositeOperation='source-over';
 }};
}
export function mountRecordSignals({audio,signal,current,active}){
 const measure=new URLSearchParams(location.search).has('perf');
 const cards=[...document.querySelectorAll('#track-list .track')],items=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 for(const card of cards){
  card.querySelector('.track-preview')?.remove();const canvas=document.createElement('canvas');canvas.className='record-signal';canvas.setAttribute('aria-hidden','true');canvas.dataset.signalStyle=signalStyle(card.dataset.id);canvas.dataset.signalPalette=signalPalette(card.dataset.id);card.querySelector('.track-art').append(canvas);items.set(card.dataset.id,{card,canvas,painter:null,visible:false,resize:true});
 }
 let frame=0,last=0,previous=null;
 const clear=()=>{cancelAnimationFrame(frame);frame=0;last=0;if(previous){previous.card.classList.remove('is-signal-playing');previous=null}};
 const eligible=()=>{const item=items.get(current()?.id);return !audio.paused&&!audio.ended&&!document.hidden&&active()&&item?.visible?item:null};
 const wake=()=>{if(!eligible()){clear();return}if(!frame)frame=requestAnimationFrame(draw)};
 const observer=new IntersectionObserver(entries=>{for(const e of entries){const item=items.get(e.target.dataset.id);if(item)item.visible=e.isIntersecting}wake()});cards.forEach(card=>observer.observe(card));
 // A canvas can become measurable after its card intersects (view changes,
 // filtering and responsive layouts). Never lock in a 1px backing store.
 const resizeObserver=new ResizeObserver(entries=>{for(const e of entries){for(const item of items.values())if(item.canvas===e.target)item.resize=true}wake()});for(const item of items.values())resizeObserver.observe(item.canvas);
 function draw(now){frame=0;const item=eligible();if(!item){clear();return}
  const data=signal.read();if(measure){item.canvas.dataset.playing=String(data.playing);item.canvas.dataset.ready=String(data.ready??data.playing);item.canvas.dataset.level=data.level.toFixed(3)}
  // Ready/state subscriptions restart this loop when the real analyser is
  // available. In reduced motion this is also the first and only still frame.
  if(!data.playing){clear();return}
  if(previous!==item||item.resize){const r=item.canvas.getBoundingClientRect();if(!r.width||!r.height){clear();return}const d=Math.min(devicePixelRatio,1.5);item.canvas.width=Math.round(r.width*d);item.canvas.height=Math.round(r.height*d);item.resize=false;last=0}
  if(previous!==item){previous?.card.classList.remove('is-signal-playing');previous=item;item.card.classList.add('is-signal-playing')}
  item.painter??=createSignalPainter(item.canvas,item.canvas.dataset.signalStyle,item.canvas.dataset.signalPalette);
  const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;item.painter.draw(data,dt,reduced.matches);
  if(!reduced.matches)wake();
 }
 signal.subscribe?.(wake);
 for(const event of ['playing','play','seeked'])audio.addEventListener(event,wake);
 for(const event of ['pause','ended','emptied'])audio.addEventListener(event,clear);
 document.addEventListener('visibilitychange',()=>document.hidden?clear():wake());
 addEventListener('lotus-view-change',()=>{clear();wake()});addEventListener('resize',()=>{clear();wake()});addEventListener('pagehide',clear);reduced.addEventListener('change',()=>{clear();wake()});
 return {wake,clear};
}
