const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf=0;
function cancel(){cancelAnimationFrame(raf)}
function go(hash,historyMode='push'){
 const el=document.querySelector(hash);if(!el)return;cancel();window.dispatchEvent(new Event('lotus-navigation'));
 document.querySelectorAll('.file-menu[open]').forEach(d=>d.open=false);
 const start=scrollY,end=hash==='#home'||hash==='#studio'?0:Math.max(0,el.getBoundingClientRect().top+start-82),at=performance.now();
 if(historyMode==='push'&&location.hash!==hash)history.pushState(null,'',hash);
 function frame(now){const p=reduced?1:Math.min(1,(now-at)/Math.min(1650,900+Math.abs(end-start)*.16)),q=p*p*p*(p*(p*6-15)+10);scrollTo({top:start+(end-start)*q,behavior:'instant'});if(p<1)raf=requestAnimationFrame(frame)}raf=requestAnimationFrame(frame);
}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const hash=a.getAttribute('href');if(hash.length<2||!document.querySelector(hash))return;e.preventDefault();go(hash)});
window.addEventListener('popstate',()=>go(location.hash||'#home','none'));
window.addEventListener('wheel',cancel,{passive:true});window.addEventListener('touchstart',cancel,{passive:true});
window.lotusNavigation={go};
