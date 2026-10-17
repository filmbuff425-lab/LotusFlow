import {mobileAsset} from './device-profile.js';
import {createPhoneFilmPlayback} from './studio-phone-interactions.js';

// Instantiated on the first tap, not while loading or animating the room.
export function createPhoneFilms(){
 const zh=()=>document.documentElement.lang.startsWith('zh');
 const films=window.lotusFilms||[];
 const dialog=document.createElement('dialog');dialog.className='phone-film-viewer';
 dialog.innerHTML='<header><span>LOTUS FLOW / ON SCREEN</span><button type="button" data-close>×</button></header><video controls playsinline preload="none"></video><div class="phone-film-caption"><h2></h2><p></p></div><label><span></span><select></select></label><p class="phone-film-status" role="status"></p><a class="phone-film-credit"></a>';
 const video=dialog.querySelector('video'),title=dialog.querySelector('h2'),artist=dialog.querySelector('.phone-film-caption p'),select=dialog.querySelector('select'),status=dialog.querySelector('[role=status]'),link=dialog.querySelector('a');
 video.volume=.7;video.disablePictureInPicture=true;
 for(const f of films){const o=document.createElement('option');o.value=f.id;o.textContent=`${f.title} — ${f.artist}`;select.append(o)}
 const playback=createPhoneFilmPlayback(video,{
  announce:()=>window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'phone-film'})),
  onState:state=>{status.textContent=({loading:zh()?'正在载入影像…':'Loading film…',gesture:zh()?'轻点视频中的播放键':'Tap play on the video',error:zh()?'影像暂时无法播放，请重试或选择另一支。':'This film could not play. Retry or choose another film.'})[state]||''}
 });
 let lastFocus,closing=false,selected=films[0]?.id;
 function choose(id){const f=films.find(f=>f.id===id);if(!f)return;selected=id;select.value=id;title.textContent=f.title;artist.textContent=f.artist;video.poster=mobileAsset(f.cover||f.image);video.setAttribute('aria-label',f.title);link.href=`works/${f.id}.html`;playback.play(f.src)}
 function close(immediate=false){
  if(!dialog.open||closing)return;closing=true;playback.release();
  const finish=()=>{dialog.close();document.body.classList.remove('phone-film-open');lastFocus?.focus({preventScroll:true});closing=false};
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:220,easing:'ease-out'}).finished.then(finish,finish);
 }
 dialog.querySelector('[data-close]').onclick=()=>close();
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 select.onchange=()=>choose(select.value);
 window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='phone-film')playback.pause()});
 window.addEventListener('lotus-effects-change',e=>{if(!e.detail)playback.pause()});
 window.addEventListener('lotus-room-change',e=>{if(!e.detail)close(true)});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close(true)});
 window.addEventListener('pagehide',()=>close(true));
 document.body.append(dialog);
 return{open(){
  if(dialog.open||!films.length)return;
  lastFocus=document.activeElement;
  dialog.setAttribute('aria-label',zh()?'音乐影像':'Music films');
  dialog.querySelector('[data-close]').setAttribute('aria-label',zh()?'关闭音乐影像':'Close music films');
  dialog.querySelector('label span').textContent=zh()?'选择影像':'SELECT FILM';
  link.textContent=zh()?'作品与署名 ↗':'PROJECT & CREDITS ↗';
  document.body.classList.add('phone-film-open');dialog.showModal();choose(selected);
 }};
}
