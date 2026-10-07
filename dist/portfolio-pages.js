import {mountRecordingContext} from './recognition.js?v=20261006-lake-surface1';
const video=document.querySelector('#film-player'),choices=[...document.querySelectorAll('.film-choice')];
if(video){
 const recordingContext=document.createElement('div');document.querySelector('.film-caption').after(recordingContext);
 const syncContext=button=>mountRecordingContext(recordingContext,{id:button.dataset.film});
 syncContext(choices.find(b=>b.getAttribute('aria-pressed')==='true')||choices[0]);
 const choose=(button,start=false)=>{video.pause();syncContext(button);video.src=button.dataset.src;video.poster=button.querySelector('img').src;video.setAttribute('aria-label',`${button.dataset.title} music film`);for(const k of ['title','artist','kind','credit'])document.querySelector('#film-'+k).textContent=button.dataset[k];document.querySelector('#film-project').href='../works/'+button.dataset.film+'.html';choices.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));const u=new URL(location.href);u.searchParams.set('film',button.dataset.film);history.replaceState(null,'',u);document.querySelector('#film-status').textContent='';if(start){video.play().catch(()=>document.querySelector('#film-status').textContent='Press play to begin.');document.querySelector('.film-theatre').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'})}};
 choices.forEach(b=>b.addEventListener('click',()=>choose(b,true)));const selected=choices.find(b=>b.dataset.film===new URL(location.href).searchParams.get('film'));if(selected)choose(selected);
 video.addEventListener('error',()=>document.querySelector('#film-status').textContent='This film could not load. Try selecting it again.');document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause()});
}
// Preserve the route back to the discography the visitor came from.
for(const back of document.querySelectorAll('[data-discography-back]')){
 try{const saved=sessionStorage.getItem('lotus-discography-return');if(saved){const u=new URL(saved,location.href);if(u.origin===location.origin&&(u.pathname==='/'||/\/works\/?$/.test(u.pathname))){u.searchParams.set('lang',document.documentElement.lang.startsWith('zh')?'zh':'en');u.searchParams.set('rev','20261006-lake-surface1');back.href=u.href}}}catch{}
}
const search=document.querySelector('#artist-search');
if(search){
 const cards=[...document.querySelectorAll('.roster-card')],result=document.querySelector('#artist-result');
 search.addEventListener('input',()=>{
  const q=search.value.trim().toLowerCase();let n=0;
  for(const c of cards){c.hidden=!c.dataset.search.includes(q);if(!c.hidden)n++}
  result.textContent=q?(document.documentElement.lang.startsWith('zh')?`找到 ${n} 位`:`${n} FOUND`):'';
  document.querySelector('.roster-empty').hidden=n!==0;
 });
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&matchMedia('(hover: hover)').matches){
  for(const card of cards){
   const photo=card.querySelector('.roster-photo');
   photo.addEventListener('pointermove',e=>{const r=photo.getBoundingClientRect();photo.style.setProperty('--portrait-x',`${(e.clientX-r.left)/r.width*2-1}deg`);photo.style.setProperty('--portrait-y',`${1-(e.clientY-r.top)/r.height*2}deg`)});
   photo.addEventListener('pointerleave',()=>{photo.style.setProperty('--portrait-x','0deg');photo.style.setProperty('--portrait-y','0deg')});
  }
 }
}
