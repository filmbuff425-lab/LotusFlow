// The cover, its opening halves and the revealed profile share one wet red
// material. SVG motion avoids repainting the large poster texture each frame.
let serial=0;
const ns='http://www.w3.org/2000/svg';
export function createInkFlow(){
 const svg=document.createElementNS(ns,'svg'),id=`ink-light-${++serial}`;svg.classList.add('identity-liquid');svg.setAttribute('aria-hidden','true');svg.setAttribute('preserveAspectRatio','xMidYMid slice');
 svg.innerHTML=`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f65643" stop-opacity=".08"/><stop offset=".32" stop-color="#ef3025" stop-opacity=".85"/><stop offset=".68" stop-color="#fa5541" stop-opacity=".75"/><stop offset="1" stop-color="#a91018" stop-opacity="0"/></linearGradient></defs><g class="ink-currents"></g><g class="ink-drips"></g>`;
 const currents=svg.querySelector('.ink-currents'),drips=svg.querySelector('.ink-drips');
 function path(host,d,cls,width,delay){const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('class',cls);p.setAttribute('stroke',`url(#${id})`);p.setAttribute('stroke-width',String(width));p.style.animationDelay=`${delay}s`;host.append(p)}
 return {svg,update({width,height,spine,thickness=8,falls=[]}){
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);currents.replaceChildren();drips.replaceChildren();
  path(currents,spine,'ink-aura',thickness*1.5,0);path(currents,spine,'ink-current ink-current-wide',thickness*.42,-4.5);path(currents,spine,'ink-current ink-current-fine',Math.max(1,thickness*.12),-11);
  falls.forEach((p,i)=>{const end=p.y+p.length;path(drips,`M ${p.x} ${p.y} C ${p.x+2} ${p.y+p.length*.3} ${p.x-3} ${end-8} ${p.x+1} ${end}`,'ink-drip',p.width||1.8,-i*2.7)});
 }};
}
