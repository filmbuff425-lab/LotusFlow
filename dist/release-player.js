import {mobileAsset} from './device-profile.js';
import {loadHook,previewEnded,cancelHook} from './preview-hooks.js?v=20261007-mobile3';
import {mountCollaborators} from './collaborators.js?v=20261006-lake-surface1';
import {createMusicSignal} from './music-signal.js?v=20261007-mobile3';
import {mountRecognition} from './recognition.js?v=20261006-lake-surface1';
export function initReleasePlayer(api){
 const dialog=document.querySelector('#track-dialog'),content=document.querySelector('#dialog-content'),audio=document.createElement('audio');
 audio.controls=true;audio.preload='none';audio.id='release-audio';audio.volume=.65;audio.hidden=true;document.body.append(audio);
 const signal=createMusicSignal(audio);
 let closingTimer=0;
 let current=null,trigger=null,request=0,hoverTimer=0,leaveTimer=0,fadeFrame=0,unlocked=false,previewing=false,hoverMuted=false,arming=false,hookLoop=false;
 const soundButton=document.createElement('button');soundButton.className='hover-sound mono';soundButton.textContent='HOVER SOUND / ENABLE';soundButton.setAttribute('aria-pressed','false');document.querySelector('.work-controls').append(soundButton);
 const live=document.createElement('span');live.className='hover-listening mono';live.setAttribute('role','status');document.querySelector('.vinyl-footnote').append(live);
 const status=text=>{const el=content.querySelector('.release-status');if(el)el.textContent=text};
 const listening=text=>{live.textContent=text;document.querySelector('#work').classList.toggle('is-previewing',!!text)};
 function cancel(){hookLoop=false;clearTimeout(hoverTimer);clearTimeout(leaveTimer);cancelAnimationFrame(fadeFrame);request++}
 function fadeTo(value,done){cancelAnimationFrame(fadeFrame);const from=audio.volume,at=performance.now();function frame(now){const q=Math.min(1,(now-at)/210);audio.volume=from+(value-from)*q;if(q<1)fadeFrame=requestAnimationFrame(frame);else done?.()}fadeFrame=requestAnimationFrame(frame)}
 function rememberUnlocked(){unlocked=true;soundButton.classList.remove('needs-gesture');soundButton.textContent='HOVER SOUND / ON';soundButton.setAttribute('aria-pressed','true')}
 function silence(){const b=new Uint8Array(844),v=new DataView(b.buffer);for(const [s,o]of[['RIFF',0],['WAVE',8],['fmt ',12],['data',36]])for(let i=0;i<s.length;i++)b[o+i]=s.charCodeAt(i);v.setUint32(4,836,true);v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);v.setUint32(40,800,true);b.fill(128,44);return 'data:audio/wav;base64,'+btoa(String.fromCharCode(...b))}
 function unlock(){
  if(hoverMuted||arming)return;signal.arm();if(unlocked)return;
  // The same media element is unlocked on the first real gesture, before a record is opened.
  if(current){if(previewing&&audio.paused)play(true);return}
  arming=true;audio.src=silence();audio.volume=0;const ticket=request;
  audio.play().then(()=>{rememberUnlocked();if(request===ticket&&!current)audio.pause()}).catch(()=>{}).finally(()=>{arming=false});
 }
 soundButton.addEventListener('click',()=>{if(unlocked&&!hoverMuted){hoverMuted=true;unlocked=false;stopPreview();soundButton.textContent='HOVER SOUND / ENABLE';soundButton.setAttribute('aria-pressed','false')}else{hoverMuted=false;unlock()}});
 const gesture=e=>{if(e.type==='keydown'&&!['Enter',' ','ArrowDown','ArrowUp','Tab'].includes(e.key))return;if(e.target.closest?.('.hover-sound'))return;unlock()};
 document.addEventListener('pointerdown',gesture,{capture:true,passive:true});document.addEventListener('keydown',gesture,{capture:true});
 if(navigator.userActivation?.hasBeenActive)unlock();
 async function play(isPreview=false){signal.arm();const ticket=++request;window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'release'}));status('LOADING AUDIO…');try{await audio.play();if(ticket!==request)return;rememberUnlocked();if(isPreview){listening(`♫ ${current.title} / ${current.audioKind==='preview'?'OFFICIAL PREVIEW':'LISTENING'}`);fadeTo(.55)}else{audio.volume=.65;status(current.audioKind==='preview'?'OFFICIAL PREVIEW · APPLE MUSIC':'FULL TRACK · PRESS PAUSE TO STOP')}}catch(e){if(ticket!==request||e.name==='AbortError')return;if(isPreview){listening(e.name==='NotAllowedError'?'ENABLE HOVER SOUND TO LISTEN':'AUDIO COULD NOT LOAD — TOUCH TO RETRY');if(e.name==='NotAllowedError')soundButton.classList.add('needs-gesture')}else status('Press ▶︎ below to play. If unavailable, open the official release.')}}
 function close(){if(!dialog.open||dialog.classList.contains('is-closing'))return;dialog.classList.remove('album-open');dialog.classList.add('is-closing');audio.pause();closingTimer=setTimeout(()=>{dialog.close();dialog.classList.remove('is-closing')},matchMedia('(prefers-reduced-motion: reduce)').matches?0:390)}
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 function stopPreview(){clearTimeout(hoverTimer);clearTimeout(leaveTimer);if(dialog.open)return;cancel();previewing=false;listening('');fadeTo(0,()=>{audio.pause();cancelHook(audio)})}
 function preview(id,{gesture=false}={}){
  if(dialog.open)return;clearTimeout(hoverTimer);clearTimeout(leaveTimer);
  if(!id){leaveTimer=setTimeout(stopPreview,550);return}
  const t=api.tracks.find(t=>t.id===id);if(!t)return;
  if(current?.id===id&&previewing&&!audio.paused)return;
  const begin=()=>{cancel();if(hoverMuted){listening('HOVER SOUND IS OFF');return}previewing=true;current=t;audio.pause();audio.volume=.08;loadHook(audio,t);play(true)};
  if(gesture){signal.arm();begin()}else hoverTimer=setTimeout(begin,55);
 }
 function open(id,source){const t=api.tracks.find(t=>t.id===id);if(!t)return;cancel();const continuing=current?.id===id&&!audio.paused&&audio.dataset.previewMode==='full';current=t;trigger=source;previewing=false;listening('');if(!continuing){audio.pause();loadHook(audio,t,{full:true})}audio.hidden=false;audio.volume=.65;dialog.classList.add('release-dialog');dialog.classList.remove('album-open','is-closing');clearTimeout(closingTimer);
  audio.dataset.highlightActive='false';dialog.dataset.release=t.id;dialog.classList.toggle('cover-only',['news','airtight','bridge','juliet','flow','feed-on','show-me-love','summer'].includes(t.id));
  content.innerHTML=`<div class="album-object" aria-hidden="true"><div class="release-orbit orbit-a"></div><div class="release-orbit orbit-b"></div><div class="album-disc" style="--album-art:url('${mobileAsset(t.image)}')"><span>LOTUS FLOW / ${t.year}</span></div><div class="album-sleeve"><img style="view-transition-name:cover-${t.id}" src="${mobileAsset(t.image)}" alt=""><span>LF / ARCHIVE — ${String(api.tracks.indexOf(t)+1).padStart(2,'0')}</span></div><span class="album-coordinate mono">SIGNAL ${String(api.tracks.indexOf(t)+1).padStart(2,'0')} / CONNECTED</span></div><div class="release-copy"><span class="mono release-kicker">ON THE RECORD / ${t.year}</span><h2 id="dialog-title">${t.title}</h2><p class="release-artist">${t.artist}</p><div class="release-credit"><span class="mono">LOTUS FLOW / ${t.role}</span><p>${t.credits}</p></div><div class="release-audio-slot"></div><p class="release-status mono" role="status"></p><a class="release-link case-link" href="works/${t.id}.html">EXPLORE THE COMPLETE RELEASE</a><a class="release-link" href="${t.url}" target="_blank" rel="noopener noreferrer">${t.audioKind==='preview'?'FULL RELEASE ON APPLE MUSIC':'VIEW OFFICIAL RELEASE'} ↗</a>${t.id==='airtight'?'<small class="release-source">Credits verified against the supplied performance video, 00:01. Artwork adapted from the performance still.</small>':''}</div>`;
  mountCollaborators(content,dialog,t);
  const recognition=document.createElement('section');content.querySelector('.release-audio-slot').before(recognition);mountRecognition(recognition,t,{compact:true});
  const fold=document.createElement('button');fold.className='fold-album';fold.textContent='RETRACT DISC';fold.setAttribute('aria-expanded','true');fold.addEventListener('click',()=>{const opened=dialog.classList.toggle('album-open');fold.textContent=opened?'RETRACT DISC':'OPEN DISC';fold.setAttribute('aria-expanded',String(opened))});content.querySelector('.release-tabs').append(fold);
  dialog.scrollTop=0;content.querySelector('.release-audio-slot').append(audio);audio.setAttribute('aria-label',`${t.title} — ${t.audioKind==='preview'?'official preview':'full track'}`);if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('album-open')));play();
 }
 audio.addEventListener('play',()=>{if(!current)return;window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'release'}));dialog.classList.add('is-playing')});audio.addEventListener('playing',()=>{if(current)status(current.audioKind==='preview'?'OFFICIAL PREVIEW · APPLE MUSIC':'FULL TRACK')});audio.addEventListener('pause',()=>{dialog.classList.remove('is-playing');if(current)status('PAUSED')});audio.addEventListener('timeupdate',()=>{if(previewing&&!dialog.open&&!hookLoop&&previewEnded(audio)){hookLoop=true;fadeTo(0,()=>{hookLoop=false;if(!previewing)return;audio.currentTime=Number(audio.dataset.previewStart);audio.play().then(()=>{if(previewing)fadeTo(.55)}).catch(()=>{})})}});
 audio.addEventListener('ended',()=>{if(previewing&&!dialog.open)return;listening('');status(current?.audioKind==='preview'?'PREVIEW ENDED · HEAR THE FULL RELEASE BELOW':'TRACK ENDED · PLAY AGAIN')});audio.addEventListener('error',()=>{if(current)status('Audio unavailable here. Open the official release below.')});
 dialog.addEventListener('close',()=>{cancel();audio.pause();audio.hidden=true;document.body.append(audio);clearTimeout(closingTimer);trigger?.focus({preventScroll:true});dialog.classList.remove('album-open')});
 window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='release'){cancel();previewing=false;listening('');audio.pause()}});document.addEventListener('visibilitychange',()=>{if(document.hidden){cancel();audio.pause();listening('')}});
 new IntersectionObserver(([e])=>{if(!e.isIntersecting)stopPreview()}).observe(document.querySelector('#work'));
 document.querySelectorAll('#track-list .track').forEach(card=>{card.addEventListener('pointerenter',()=>preview(card.dataset.id));card.addEventListener('pointerleave',()=>preview(null));card.addEventListener('focus',()=>preview(card.dataset.id));card.addEventListener('blur',()=>preview(null))});
 window.addEventListener('lotus-view-change',stopPreview);window.addEventListener('lotus-filter-change',stopPreview);
 dialog.addEventListener('pointermove',e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=dialog.getBoundingClientRect();dialog.style.setProperty('--tilt-x',`${-(e.clientY-r.top-r.height/2)/r.height*7}deg`);dialog.style.setProperty('--tilt-y',`${(e.clientX-r.left-r.width/2)/r.width*7}deg`)});
 dialog.addEventListener('pointerleave',()=>{dialog.style.setProperty('--tilt-x','0deg');dialog.style.setProperty('--tilt-y','0deg')});
 window.lotusReleasePlayer={open,close,preview,unlock,getSignal:()=>({...signal.read(),id:current?.id}),pause:()=>{cancel();audio.pause()}};
}
