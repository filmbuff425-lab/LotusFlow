// The archive creates its WebGL scene only when the visitor approaches it.
// A rejected import may be retried; concurrent observers share one import.
const host=document.getElementById('vinyl-viewport');
let pending=null,ready=false;
function prepare(){
 if(ready||pending)return pending;
 host.dataset.sceneState='loading';
 pending=import('./vinyl-room.js?v=20261007-mobile3').then(()=>{ready=true;host.dataset.sceneState='ready';observer.disconnect()}).catch(error=>{
  pending=null;host.dataset.sceneState='error';console.warn('Record archive unavailable:',error);
  document.getElementById('vinyl-loading').textContent='The record view could not load. Choose Grid or List to browse.';
 });return pending;
}
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))prepare()},{rootMargin:'400px'});observer.observe(host);
document.querySelector('[data-view="vinyl"]').addEventListener('click',prepare);
