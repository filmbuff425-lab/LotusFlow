import './interaction-sound.js?v=20261007-mobile3';
import './media-transitions.js?v=20261007-mobile3';
import './site-atmosphere.js?v=20261006-lake-surface1';
import './music-cursor.js?v=20261006-lake-surface1';
import './portfolio-entrances.js?v=20261007-layout7';
import {applyMobileImages} from './device-profile.js';
applyMobileImages();
// Same-origin navigation retains a calm visual bridge, including browsers without cross-document transitions.
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let leaving=false;
// Prefetch the current revision so a warmed older page cannot restore outdated copy or navigation.
const pageURL=href=>{const url=new URL(href,location.href);if(url.origin===location.origin){url.searchParams.set('rev','20261007-layout7');if(!url.searchParams.has('lang'))url.searchParams.set('lang',document.documentElement.lang.startsWith('zh')?'zh':'en')};return url};
const preload=href=>{const url=pageURL(href).href;if(document.querySelector(`link[data-page-prefetch="${CSS.escape(url)}"]`))return;const l=document.createElement('link');l.rel='prefetch';l.href=url;l.dataset.pagePrefetch=url;document.head.append(l)};
function navigate(href,{origin=null}={}){const url=pageURL(href);if(leaving)return;leaving=true;
 if(/\/(collaborators|films)\/?$/.test(url.pathname)&&!/\/(collaborators|films)\/?$/.test(location.pathname)){
  const returnURL=new URL(location.href);
  if(document.querySelector('#discography'))returnURL.hash='discography';
  if(/\/works\/?$/.test(returnURL.pathname))returnURL.searchParams.delete('record');
  if(document.querySelector('#discography')||/\/works\/?$/.test(returnURL.pathname))try{sessionStorage.setItem('lotus-discography-return',returnURL.href)}catch{}
 }

 if(reduced){location.assign(url.href);return}
 preload(url.href);
 if(origin){
  sessionStorage.setItem('lotus-record-entry',String(Date.now()));
  const veil=document.createElement('canvas');veil.className='record-entry-field';veil.setAttribute('aria-hidden','true');document.body.append(veil);
  const w=innerWidth,h=innerHeight,d=Math.min(devicePixelRatio,1.5);veil.width=w*d;veil.height=h*d;const g=veil.getContext('2d');g.setTransform(d,0,0,d,0,0);
  const start=performance.now(),seeds=Array.from({length:220},(_,i)=>({angle:i*2.399963,r:18+Math.sqrt(i/220)*110,phase:i*1.731,size:i%17===0?2.1:1.0}));
  const paint=now=>{const q=Math.min(1,(now-start)/1000),ease=1-Math.pow(1-q,3),spread=Math.pow(q,1.6)*Math.hypot(w,h)*.82;
   g.clearRect(0,0,w,h);g.fillStyle=`rgba(9,10,11,${Math.pow(q,.8)})`;g.fillRect(0,0,w,h);g.globalCompositeOperation='lighter';
   for(const p of seeds){const a=p.angle+ease*.45,r=p.r*(1-q*.2)+spread*(.3+.7*Math.abs(Math.sin(p.phase))),x=origin.x+Math.cos(a)*r,y=origin.y+Math.sin(a)*r*.72;g.globalAlpha=(.2+.65*Math.pow(Math.sin(p.phase+q*3),2))*(1-q*.65);g.fillStyle=p.size>2?'#fff':'#df684c';g.beginPath();g.arc(x,y,p.size*(1+q*.55),0,Math.PI*2);g.fill()}
   g.globalAlpha=1;g.globalCompositeOperation='source-over';if(q<1)requestAnimationFrame(paint);
  };requestAnimationFrame(paint);setTimeout(()=>location.assign(url.href),980);
 }else{document.documentElement.classList.add('page-departing');setTimeout(()=>location.assign(url.href),560)}
}
window.lotusPageTransition={navigate,preload};
if(document.documentElement.classList.contains('record-arriving')){
 requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('record-arriving')));
 sessionStorage.removeItem('lotus-record-entry');
}
document.addEventListener('pointerover',e=>{const a=e.target.closest('a[href]');if(!a)return;const u=new URL(a.href);if(u.origin===location.origin&&u.pathname!==location.pathname)preload(u.href)},{passive:true});
document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=e.target.closest('a[href]');if(!a||a.target||a.hasAttribute('download')||a.classList.contains('record-portal')||a.classList.contains('cd-spine'))return;const u=new URL(a.href);if(u.origin!==location.origin||!/^https?:$/.test(u.protocol)||u.pathname===location.pathname)return;e.preventDefault();navigate(u.href)});
addEventListener('pageshow',()=>{leaving=false;document.documentElement.classList.remove('page-departing')});

// Records contains the complete archive, videos and collaborators on every page.
for(const menu of document.querySelectorAll('.archive-header .records-menu')){
 document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))menu.open=false});
 menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary').focus()}});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));
}
