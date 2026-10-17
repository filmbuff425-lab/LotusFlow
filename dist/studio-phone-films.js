import {createDialogMotion} from './ui-motion.js';
import {createPhoneFilmPlayback,screenTransform} from './studio-phone-interactions.js';

let viewer;
const player=()=>viewer??=createPhoneFilms();
export function openPhoneFilms(options){player().open(options)}
export function mountPhoneFilmScreen(host){return player().mountScreen(host)}

// The room always plays Show Me Love. The film library retains the selected
// films, while sharing this same native video with the room and enlarged view.
export function createPhoneFilms(){
 const zh=()=>document.documentElement.lang.startsWith('zh');
 const ids=['show-me-love','mirror','juliet','say-it-to-me','feed-on','airtight','wya'];
 const fallback={id:'show-me-love',title:'Show Me Love',artist:'WizTheMc · bees & honey · Tia Ray'};
 const films=ids.map(id=>(window.lotusFilms||[]).find(f=>f.id===id)).filter(Boolean);
 if(!films.some(f=>f.id===fallback.id))films.unshift(fallback);
 const wallFilm=films.find(f=>f.id===fallback.id);
 const source=film=>new URL(`./assets/phone-films53/${film.id}-mobile53.mp4`,import.meta.url).href;
 const poster=film=>new URL(`./assets/phone-films53/${film.id}-mobile53.jpg`,import.meta.url).href;
 const dialog=document.createElement('dialog');dialog.className='phone-film-viewer';
 dialog.innerHTML='<header><span>LOTUS FLOW / ON SCREEN</span><button type="button" data-close>×</button></header><div class="phone-film-media"></div><div class="phone-film-caption"><h2></h2><p></p></div><select class="phone-film-select"></select><p class="phone-film-status" role="status"></p><button type="button" class="phone-film-retry" hidden>PLAY FILM</button><a class="phone-film-credit"></a>';
 const motion=createDialogMotion(dialog);
 const video=document.createElement('video'),status=dialog.querySelector('[role=status]'),link=dialog.querySelector('a'),retry=dialog.querySelector('.phone-film-retry'),select=dialog.querySelector('select');
 video.className='phone-film-video';video.playsInline=true;video.loop=true;video.preload='none';video.muted=true;video.defaultMuted=true;video.volume=.7;video.disablePictureInPicture=true;video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 video.poster=new URL('./assets/phone-films53/show-me-love-mobile53.jpg',import.meta.url).href;
 dialog.querySelector('.phone-film-media').append(video);
 for(const film of films){const option=document.createElement('option');option.value=film.id;option.textContent=film.title+' — '+film.artist;select.append(option)}
 let lastFocus,closing=false,screen=null,screenActive=false,priming=false,primeTimer=0,currentFilm=wallFilm,libraryId=wallFilm.id;
 const playback=createPhoneFilmPlayback(video,{
  announce:()=>{if(!video.muted&&dialog.open)window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'phone-film'}))},
  onState:state=>{
   dialog.dataset.playback=state;if(screen)screen.dataset.playback=state;
   retry.hidden=!['stalled','gesture','error'].includes(state);retry.textContent=zh()?'重新播放':'PLAY FILM';
   status.textContent=({loading:zh()?'正在载入影像…':'Loading film…',gesture:zh()?'轻点播放，开始影像':'Tap play to start the film',stalled:zh()?'影像加载停住了，轻点重新播放':'The film stopped loading. Tap to retry.',error:zh()?'影像暂时无法播放，请重试。':'This film could not play. Tap to retry.'})[state]||'';
  }
 });
 function updateCaption(film){
  currentFilm=film;video.poster=poster(film);video.setAttribute('aria-label',film.title+' — music video');
  dialog.querySelector('h2').textContent=film.title;dialog.querySelector('.phone-film-caption p').textContent=film.artist;
  select.value=film.id;link.href=new URL(`./works/${film.id}.html`,import.meta.url).href;
 }
 function play(film=currentFilm){
  updateCaption(film);const src=source(film);
  if(video.getAttribute('src')===src){if(video.paused)playback.resume()}
  else playback.play(src);
 }
 function endPrime(){priming=false;clearTimeout(primeTimer);primeTimer=0}
 function resize(){if(!screen||dialog.open||closing)return;video.style.transform=screenTransform(screen.clientWidth,screen.clientHeight)}
 function syncScreen(){
  if(!screen||dialog.open||closing)return;
  video.controls=false;video.muted=true;video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  if(video.parentNode!==screen)screen.append(video);
  resize();screen.classList.toggle('is-visible',screenActive&&!document.hidden);
  if(!document.hidden&&(screenActive||priming))play(wallFilm);
  else if(video.hasAttribute('src'))playback.release();
 }
 // Call synchronously in OPEN STUDIO's trusted click, before an animation or
 // image decode. Keep the silent decoder alive until the room is revealed.
 function prime(){
  if(!screen||dialog.open||document.hidden)return;
  endPrime();priming=true;video.muted=true;syncScreen();
  primeTimer=setTimeout(()=>{endPrime();syncScreen()},12000);
 }
 function close(immediate=false){
  if(!dialog.open||closing)return;closing=true;playback.pause();video.muted=true;
  const finish=()=>{
   dialog.close();document.body.classList.remove('phone-film-open');closing=false;
   if(screen){
    // Studio recomputes its unobscured visibility before release decisions.
    window.dispatchEvent(new Event('lotus-phone-film-close'));syncScreen();
   }else playback.release();
   lastFocus?.focus({preventScroll:true});
  };
  motion.depart(finish,immediate);
 }
 select.onchange=()=>{
  const film=films.find(f=>f.id===select.value);if(!film)return;
  libraryId=film.id;video.muted=false;play(film);
 };
 dialog.querySelector('[data-close]').onclick=()=>close();
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
 retry.onclick=()=>{video.muted=false;playback.play(source(currentFilm))};
 window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='phone-film'&&dialog.open)playback.pause()});
 window.addEventListener('lotus-effects-change',e=>{if(!e.detail&&dialog.open)playback.pause()});
 window.addEventListener('lotus-room-change',e=>{if(!e.detail){endPrime();screenActive=false;close(true);syncScreen()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){endPrime();close(true)}syncScreen()});
 window.addEventListener('pagehide',()=>{endPrime();screenActive=false;close(true);playback.release()});
 // Low Power Mode may reject even muted autoplay. The next ordinary Studio
 // interaction retries in its real gesture; no overlay or extra tap target.
 document.addEventListener('pointerdown',()=>{if(screenActive&&!document.hidden&&!dialog.open&&video.paused)play(wallFilm)},{capture:true,passive:true});
 document.body.append(dialog);updateCaption(wallFilm);
 return{
  mountScreen(host){
   if(screen)throw new Error('Phone film screen is already mounted');
   screen=document.createElement('div');screen.className='phone-studio-film';screen.setAttribute('aria-hidden','true');host.append(screen);screen.append(video);new ResizeObserver(resize).observe(screen);syncScreen();
   return{prime,setActive(value){
    // Opening our own viewer is not leaving the room; retain its visibility
    // until the observer runs again after the viewer closes.
    if(dialog.open&&!value)return;
    screenActive=Boolean(value);if(screenActive)endPrime();syncScreen();
   }};
  },
  open({wall=false}={}){
   if(dialog.open||closing)return;lastFocus=document.activeElement;endPrime();dialog.dataset.mode=wall?'wall':'library';
   const film=wall?wallFilm:films.find(f=>f.id===libraryId)||wallFilm;
   dialog.setAttribute('aria-label',zh()?'音乐影像':'Music films');dialog.querySelector('[data-close]').setAttribute('aria-label',zh()?'关闭音乐影像':'Close music films');link.textContent=zh()?'作品与署名 ↗':'PROJECT & CREDITS ↗';select.hidden=wall;select.setAttribute('aria-label',zh()?'选择音乐影像':'Choose a music film');
   screen?.classList.remove('is-visible');dialog.querySelector('.phone-film-media').append(video);video.style.removeProperty('transform');video.controls=true;video.removeAttribute('aria-hidden');video.tabIndex=0;
   document.body.classList.add('phone-film-open');dialog.showModal();motion.arrive();video.muted=false;play(film);
   // Unmuting an already-playing wall does not dispatch another native play.
   window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'phone-film'}));
  }
 };
}
