import {createPhoneFilmPlayback,screenTransform} from './studio-phone-interactions.js';

let viewer;
const player=()=>viewer??=createPhoneFilms();
export function openPhoneFilms(){player().open()}
export function mountPhoneFilmScreen(host){return player().mountScreen(host)}

// The wall and enlarged viewer share one native decoder. The phone plays only
// the updated Show Me Love MV; it never cycles through the desktop film library.
export function createPhoneFilms(){
 const zh=()=>document.documentElement.lang.startsWith('zh');
 const src=new URL('./assets/phone-films53/show-me-love-mobile53.mp4',import.meta.url).href;
 const dialog=document.createElement('dialog');dialog.className='phone-film-viewer';
 dialog.innerHTML='<header><span>LOTUS FLOW / ON SCREEN</span><button type="button" data-close>×</button></header><div class="phone-film-media"></div><div class="phone-film-caption"><h2>Show Me Love</h2><p>WizTheMc · bees &amp; honey · Tia Ray</p></div><p class="phone-film-status" role="status"></p><button type="button" class="phone-film-retry" hidden>PLAY FILM</button><a class="phone-film-credit" href="works/show-me-love.html"></a>';
 const video=document.createElement('video'),status=dialog.querySelector('[role=status]'),link=dialog.querySelector('a'),retry=dialog.querySelector('.phone-film-retry');
 video.className='phone-film-video';video.playsInline=true;video.loop=true;video.preload='none';video.muted=true;video.defaultMuted=true;video.volume=.7;video.disablePictureInPicture=true;video.setAttribute('webkit-playsinline','');video.setAttribute('aria-label','Show Me Love — official music video');
 video.poster=new URL('./assets/phone-films53/show-me-love-mobile53.jpg',import.meta.url).href;
 dialog.querySelector('.phone-film-media').append(video);
 const playback=createPhoneFilmPlayback(video,{
  announce:()=>{if(!video.muted)window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'phone-film'}))},
  onState:state=>{dialog.dataset.playback=state;retry.hidden=!['stalled','gesture','error'].includes(state);retry.textContent=zh()?'重新播放':'PLAY FILM';status.textContent=({loading:zh()?'正在载入影像…':'Loading film…',gesture:zh()?'轻点播放，开始影像':'Tap play to start the film',stalled:zh()?'影像加载停住了，轻点重新播放':'The film stopped loading. Tap to retry.',error:zh()?'影像暂时无法播放，请重试。':'This film could not play. Tap to retry.'})[state]||''}
 });
 let lastFocus,closing=false,screen=null,screenActive=false;
 function play(){if(video.getAttribute('src')===src)playback.resume();else playback.play(src)}
 function resize(){if(!screen||dialog.open)return;video.style.transform=screenTransform(screen.clientWidth,screen.clientHeight)}
 function syncScreen(){
  if(!screen||dialog.open||closing)return;
  video.controls=false;video.muted=true;video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  if(video.parentNode!==screen)screen.append(video);
  resize();screen.classList.toggle('is-visible',screenActive&&!document.hidden);
  if(screenActive&&!document.hidden){if(video.paused)play()}else if(video.hasAttribute('src'))playback.release();
 }
 function close(immediate=false){
  if(!dialog.open||closing)return;closing=true;playback.pause();video.muted=true;
  const finish=()=>{dialog.close();document.body.classList.remove('phone-film-open');lastFocus?.focus({preventScroll:true});closing=false;if(screen)syncScreen();else playback.release()};
  if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return}
  dialog.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:220,easing:'ease-out'}).finished.then(finish,finish);
 }
 dialog.querySelector('[data-close]').onclick=()=>close();
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 retry.onclick=()=>playback.play(src);
 window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='phone-film'&&dialog.open)playback.pause()});
 window.addEventListener('lotus-effects-change',e=>{if(!e.detail&&dialog.open)playback.pause()});
 window.addEventListener('lotus-room-change',e=>{if(!e.detail){screenActive=false;close(true);syncScreen()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close(true);syncScreen()});
 window.addEventListener('pagehide',()=>{screenActive=false;close(true);playback.release()});
 document.body.append(dialog);
 return{
  mountScreen(host){
   if(screen)throw new Error('Phone film screen is already mounted');
   screen=document.createElement('div');screen.className='phone-studio-film';screen.setAttribute('aria-hidden','true');host.append(screen);screen.append(video);new ResizeObserver(resize).observe(screen);syncScreen();
   return{setActive(value){screenActive=Boolean(value);syncScreen()}};
  },
  open(){
   if(dialog.open||closing)return;lastFocus=document.activeElement;
   dialog.setAttribute('aria-label',zh()?'音乐影像':'Music films');dialog.querySelector('[data-close]').setAttribute('aria-label',zh()?'关闭音乐影像':'Close music films');link.textContent=zh()?'作品与署名 ↗':'PROJECT & CREDITS ↗';
   screen?.classList.remove('is-visible');dialog.querySelector('.phone-film-media').append(video);video.style.removeProperty('transform');video.controls=true;video.removeAttribute('aria-hidden');video.tabIndex=0;
   document.body.classList.add('phone-film-open');dialog.showModal();video.muted=false;play();
  }
 };
}
