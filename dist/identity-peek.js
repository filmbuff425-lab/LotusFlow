import {fittedScar,posterCover,posterBleed} from './identity-gesture.js';

// Reuse the opening's two existing poster canvases. The gap is only light;
// the profile stays covered and inert until the actual cut.
export function createIdentityPeek({gate,canvases,liquids}){
 const homes=canvases.map(canvas=>canvas.parentElement),panels=canvases.map((canvas,i)=>{
  const panel=document.createElement('span');panel.className=`gate-cover-half gate-cover-${i?'right':'left'}`;panel.setAttribute('aria-hidden','true');gate.append(panel);return panel;
 });
 const glow=document.createElementNS('http://www.w3.org/2000/svg','svg');glow.classList.add('gate-gap-light');glow.setAttribute('aria-hidden','true');
 glow.innerHTML='<defs><linearGradient id="gate-secret-light" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><path class="gap-halo"/><path class="gap-core"/>';
 gate.prepend(glow);
 const spill=document.createElementNS('http://www.w3.org/2000/svg','svg');spill.classList.add('gate-light-spill');spill.setAttribute('aria-hidden','true');gate.append(spill);
 let lightSize='',phase='gate',destination,entryLight=.5,entryDistance=3,lightAxis;
 function scatter(scar,w,h){
  const ax=scar.a?.x??scar.top,ay=scar.a?.y??0,bx=scar.b?.x??scar.bottom,by=scar.b?.y??h;
  const stamp=`${w}/${h}/${ax}/${ay}/${bx}/${by}`;if(lightSize===stamp)return;lightSize=stamp;
  const dx=bx-ax,dy=by-ay,length=Math.hypot(dx,dy),nx=dy/length,ny=-dx/length,phone=innerWidth<=700,spread=phone?150:310,rx=Math.SQRT1_2,ry=Math.SQRT1_2,cx=(ax+bx)/2,cy=(ay+by)/2;
  lightAxis={nx,ny,cx,cy};
  // A single continuous light field fades across and along the incision.
  // There are no separate spotlights or repeated cones.
  const defs=`<linearGradient id="gate-spill-width" gradientUnits="userSpaceOnUse" x1="${cx}" y1="${cy}" x2="${cx+nx*spread}" y2="${cy+ny*spread}"><stop stop-color="#fff" stop-opacity=".42"/><stop offset=".12" stop-color="#fff" stop-opacity=".20"/><stop offset=".42" stop-color="#fff" stop-opacity=".075"/><stop offset=".76" stop-color="#fff" stop-opacity=".014"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="gate-spill-length" gradientUnits="userSpaceOnUse" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"><stop stop-color="white" stop-opacity="0"/><stop offset=".12" stop-color="white" stop-opacity=".4"/><stop offset=".38" stop-color="white"/><stop offset=".65" stop-color="white"/><stop offset=".88" stop-color="white" stop-opacity=".4"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="gate-spill-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="url(#gate-spill-length)"/></mask>`;
  // One white source leaks diagonally into a continuous volume of air.
  // The two faint streaks belong to that volume; they are not separate lamps.
  const field=`M ${ax-nx*18} ${ay-ny*18} L ${ax+rx*spread*.5} ${ay+ry*spread*.5} L ${ax+dx*.38+rx*spread} ${ay+dy*.38+ry*spread} L ${ax+dx*.75+rx*spread*.95} ${ay+dy*.75+ry*spread*.95} L ${bx+rx*spread*.5} ${by+ry*spread*.5} L ${bx-nx*18} ${by-ny*18} Z`;
  const rays=[.32,.63].map((u,i)=>{const x=ax+dx*u,y=ay+dy*u;return `<path d="M ${x} ${y} L ${x+rx*spread*.98} ${y+ry*spread*.98}" stroke-width="${i?5:10}"/>`}).join('');
  let dust='';
  for(let i=0;i<(phone?8:12);i++){
   const u=.16+(i*37%71)/100,away=12+(i*17%131)*(phone?.6:1),x=ax+dx*u+rx*away,y=ay+dy*u+ry*away;
   dust+=`<circle class="gap-dust" cx="${x}" cy="${y}" r="${.55+(i%4)*.21}" style="--dust-x:${rx*(16+i%12)}px;--dust-y:${ry*(16+i%12)-6}px;animation-delay:${-i*.37}s;animation-duration:${3.8+i%4*.7}s"/>`;
  }
  spill.setAttribute('viewBox',`0 0 ${w} ${h}`);spill.innerHTML=`<defs>${defs}</defs><g class="gap-light-body" mask="url(#gate-spill-mask)"><path class="gap-spill-field" fill="url(#gate-spill-width)" d="${field}"/><path class="gap-spill-core" d="M ${ax} ${ay} L ${bx} ${by}"/><g class="gap-spill-rays">${rays}</g><g class="gap-dust-cloud">${dust}</g></g>`;
 }
 function slit(scar,w,h){glow.setAttribute('viewBox',`0 0 ${w} ${h}`);glow.querySelectorAll('path').forEach(path=>path.setAttribute('d',`M ${scar.top} 0 L ${scar.bottom} ${h}`))}
 function diffuse(p){
  if(!lightAxis)return;
  const {nx,ny,cx,cy}=lightAxis,s=2*p*p,a=1+s*nx*nx,b=s*nx*ny,d=1+s*ny*ny,field=spill.querySelector('.gap-spill-field');
  field.style.transform=`matrix(${a},${b},${b},${d},${cx*(1-a)-cy*b},${cy*(1-d)-cx*b})`;
  field.style.filter=`blur(${12+16*p}px)`;
  spill.querySelector('.gap-spill-core').style.opacity=String(.16*(1-p)*(1-p));spill.querySelector('.gap-spill-rays').style.opacity=String(1-p);
 }
 function size(){
  if(phase!=='gate'){
   const scar=fittedScar(innerWidth,innerHeight,innerWidth,innerHeight);
   scatter(scar,innerWidth,innerHeight);
   if(phase==='arrived'){spill.style.height=`${innerHeight}px`;diffuse(1)}
   else{slit(scar,innerWidth,innerHeight);const dx=scar.bottom-scar.top,len=Math.hypot(dx,innerHeight);destination.style.setProperty('--aperture-x',`${innerHeight/len*entryDistance}px`);destination.style.setProperty('--aperture-y',`${-dx/len*entryDistance}px`)}
   return;
  }
  const w=gate.clientWidth,h=gate.clientHeight;if(!w||!h)return;
  const scar=fittedScar(innerWidth,innerHeight,w,h),dx=scar.bottom-scar.top,length=Math.hypot(dx,h),distance=innerWidth<=700?4.5:6;
  const cover=posterCover(innerWidth,innerHeight,w,h),pad=cover.bleed;
  const top=scar.top-dx/h*pad+pad,bottom=scar.bottom+dx/h*pad+pad;
  panels.forEach((panel,i)=>{
   panel.style.inset=`${-pad}px`;panel.style.clipPath=i?`polygon(${top}px 0,100% 0,100% 100%,${bottom}px 100%)`:`polygon(0 0,${top}px 0,${bottom}px 100%,0 100%)`;
   Object.assign(canvases[i].style,{position:'absolute',inset:'auto',left:`${cover.imageLeft}px`,top:`${cover.imageTop}px`,width:`${cover.imageWidth}px`,height:`${cover.imageHeight}px`,maxWidth:'none',objectFit:'fill'});
   Object.assign(liquids[i].style,{inset:'auto',left:`${cover.imageLeft+pad}px`,top:`${cover.imageTop+pad}px`,width:`${innerWidth*cover.scale}px`,height:`${innerHeight*cover.scale}px`});
  });
  gate.style.setProperty('--peek-x',`${h/length*distance}px`);gate.style.setProperty('--peek-y',`${-dx/length*distance}px`);
  slit(scar,w,h);
  scatter(scar,w,h);
 }
 function mount(){phase='gate';gate.prepend(glow);gate.append(spill);glow.classList.remove('identity-carried-slit');glow.style.opacity='';spill.classList.remove('identity-carried-light','identity-arrived-light');spill.removeAttribute('style');lightSize='';canvases.forEach((canvas,i)=>panels[i].append(canvas,liquids[i]));gate.classList.add('has-peek-panels');gate.dataset.swipeCue='light-between-halves';size()}
 function close(){entryLight=Math.max(.4,Number(getComputedStyle(spill).opacity)||0);const movement=new DOMMatrixReadOnly(getComputedStyle(panels[0]).transform);entryDistance=Math.max(2.8,Math.hypot(movement.m41,movement.m42));canvases.forEach((canvas,i)=>{homes[i].append(canvas,liquids[i]);Object.assign(canvas.style,{position:'absolute',inset:'auto',left:`${-posterBleed}px`,top:`${-posterBleed}px`,width:`${innerWidth+posterBleed*2}px`,height:`${innerHeight+posterBleed*2}px`});liquids[i].removeAttribute('style')});gate.classList.remove('has-peek-panels')}
 function carry(target){phase='opening';destination=target;target.prepend(glow);target.append(spill);glow.classList.add('identity-carried-slit');spill.classList.remove('identity-arrived-light');spill.classList.add('identity-carried-light');spill.style.height='100%';spill.style.opacity=String(entryLight);size();window.lotusSfx?.play('seam-air')}
 function cut(time,{contact,duration}){
  const p=Math.max(0,Math.min(1,(time-contact)/(duration-contact))),warm=Math.min(1,time/contact),light=entryLight+(.85-entryLight)*warm;
  spill.style.opacity=String(light*(1-p)+.24*p);
  // The light disperses into the room, independently of the blood landing.
  diffuse(p);glow.style.opacity=String((1-p)*(1-p));
 }
 function arrive(target){phase='arrived';destination=target;target.append(spill);gate.prepend(glow);glow.classList.remove('identity-carried-slit');glow.style.opacity='';spill.classList.add('identity-arrived-light');spill.style.opacity='';size()}
 function breathe(){if(phase==='gate'&&gate.classList.contains('seam-awake'))window.lotusSfx?.play('seam-air',{delay:1.35})}
 panels[0].addEventListener('animationstart',breathe);panels[0].addEventListener('animationiteration',breathe);
 spill.addEventListener('animationend',()=>{if(phase==='arrived')spill.style.display='none'});
 new ResizeObserver(size).observe(gate);
 addEventListener('resize',size);
 return{mount,close,size,carry,cut,arrive};
}
