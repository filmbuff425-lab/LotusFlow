// Dotted English display and lightly irregular printed Han display.
// Text remains native DOM text for language switching and accessibility.
(() => {
 const NS='http://www.w3.org/2000/svg';
 const headings='h1,h2,h3,.gate-title,.prologue-title,.vinyl-open strong,.track-title h3,.collaborator-file h3,.next-release strong,.portal-label strong';
 function clearGlass(el){
  el.querySelectorAll('.glass-lettering').forEach(w=>{const source=w.querySelector('.glass-lettering-source');if(source)w.replaceWith(...source.childNodes)});
  el.classList.remove('has-glass-lettering');
 }
 function mark(el){
  if(el.hasAttribute('data-art-custom'))return;
  const text=el.textContent.trim();if(!text)return;
  const han=/[\u3400-\u9fff]/.test(text);el.classList.add('art-display');el.dataset.artScript=han?'han':'latin';
  const isTitle=el.matches('h1,.gate-title,.prologue-title,.portal-label strong');
  el.dataset.artSize=!isTitle&&parseFloat(getComputedStyle(el).fontSize)<25?'label':'display';el.dataset.artStyle=han?'printed-black':'dots';
  const fingerprint=text+'|'+el.dataset.artSize;
  if(el.dataset.artFingerprint===fingerprint)return;
  el.dataset.artFingerprint=fingerprint;clearGlass(el);

 }
 function init(){
  document.querySelectorAll(headings).forEach(mark);let queued=false;const dirty=new Set();
  const observer=new MutationObserver(records=>{for(const r of records){const target=r.target.nodeType===3?r.target.parentElement:r.target;if(target?.closest?.('svg'))continue;const heading=target?.closest?.(headings);if(heading)dirty.add(heading);r.addedNodes.forEach(n=>{if(n.nodeType===1&&n.namespaceURI!==NS){if(n.matches(headings))dirty.add(n);n.querySelectorAll(headings).forEach(h=>dirty.add(h))}})}if(dirty.size&&!queued){queued=true;queueMicrotask(()=>{queued=false;dirty.forEach(mark);dirty.clear()})}});
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  window.addEventListener('lotus-language-change',()=>document.querySelectorAll(headings).forEach(mark));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
