import {scrollToPosition,cancelPageScroll as cancel} from './scroll-motion.js';
function go(hash,historyMode='push'){
 const el=document.querySelector(hash);if(!el)return;cancel();window.dispatchEvent(new Event('lotus-navigation'));
 document.querySelectorAll('.file-menu[open]').forEach(d=>d.open=false);
 const headerHeight=document.querySelector('.header')?.getBoundingClientRect().height||70;
 const start=scrollY,end=hash==='#home'||hash==='#studio'?0:Math.max(0,el.getBoundingClientRect().top+start-headerHeight-12);
 if(historyMode==='push'&&location.hash!==hash)history.pushState(null,'',hash);
 scrollToPosition(end);
}
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const hash=a.getAttribute('href');if(hash.length<2||!document.querySelector(hash))return;e.preventDefault();go(hash)});
window.addEventListener('popstate',()=>go(location.hash||'#home','none'));
window.lotusNavigation={go};
