import {createVisibleFrameLoop} from './visible-frame-loop.js?v=20261007-deploy1';
import {deviceProfile,handheld} from './device-profile.js';
import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
import {createSoundcube} from './soundcube.js?v=20261007-mobile3';
import {warmStudioTextures,warmStudioGeometry,studioTextureFootprint} from './studio-prewarm.js?v=20261007-mobile3';
if (!window.lotusSession) await new Promise(resolve => window.addEventListener('lotus-session-ready', resolve, { once: true }));
const api = window.lotusSession, host = document.getElementById('studio-canvas'), loading = document.getElementById('studio-loading');
let selected = api.channels[0].id;
document.querySelector('.studio-channel-select').innerHTML = api.channels.map((c, i) => `<button data-select-channel="${c.id}" aria-pressed="${i === 0}" class="${i === 0 ? 'active' : ''}">${String(i + 1).padStart(2, '0')} ${c.name}</button>`).join('');
function selectChannel(id) { selected = id; document.querySelectorAll('[data-select-channel]').forEach(b => { const on = b.dataset.selectChannel === id; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); }); syncControls(); }
let controlsStamp='';
function syncControls() { const c = api.channels.find(c => c.id === selected),stamp=`${selected}/${c.value}/${c.mute}/${c.solo}/${api.audioState.playing}`;if(stamp===controlsStamp)return;controlsStamp=stamp; document.getElementById('studio-channel-name').textContent = c.name; document.getElementById('studio-volume').value = c.value; document.getElementById('studio-volume').setAttribute('aria-label', `${c.name} volume`); document.getElementById('studio-volume-value').textContent = `${c.value>0?(20*Math.log10(Math.pow(c.value/100,1.4))).toFixed(1):'−∞'} dB`; document.getElementById('studio-mute').setAttribute('aria-pressed', String(c.mute)); document.getElementById('studio-solo').setAttribute('aria-pressed', String(c.solo)); document.getElementById('studio-play').textContent = api.audioState.playing ? 'Ⅱ PAUSE' : '▶︎ PLAY'; }
document.querySelectorAll('[data-select-channel]').forEach(b => b.addEventListener('click', () => selectChannel(b.dataset.selectChannel)));
const channelInspector=document.createElement('details');channelInspector.className='studio-channel-inspector';channelInspector.innerHTML='<summary>CHANNEL STRIP <span id="studio-meter-readout">OUTPUT —</span></summary><div class="channel-parameters"></div>';document.querySelector('.studio-control-strip').after(channelInspector);
const paramSpecs=[['pan','PAN',-1,1,.01],['hpf','HIGH PASS · Hz',20,1000,1],['low','LOW · 120 Hz',-12,12,.1],['mid','MID · 1.2 kHz',-12,12,.1],['high','HIGH · 8 kHz',-12,12,.1],['room','SEND A · ROOM',-60,0,1],['delay','SEND B · DELAY',-60,0,1]];
channelInspector.querySelector('.channel-parameters').innerHTML=paramSpecs.map(([k,label,min,max,step])=>`<label><span>${label}</span><input type="range" data-channel-param="${k}" min="${min}" max="${max}" step="${step}" aria-label="${label}"><output data-param-output="${k}"></output></label>`).join('');
channelInspector.querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{api.setChannel(selected,{[el.dataset.channelParam]:Number(el.value)});syncParameters()}));
function syncParameters(){const c=api.channels.find(c=>c.id===selected);for(const [key] of paramSpecs){const el=channelInspector.querySelector(`[data-channel-param="${key}"]`);if(document.activeElement!==el)el.value=c[key];const output=channelInspector.querySelector(`[data-param-output="${key}"]`);output.textContent=key==='pan'?(Math.abs(c[key])<.01?'C':`${c[key]<0?'L':'R'} ${Math.round(Math.abs(c[key])*100)}`):key==='hpf'?`${c[key]} Hz`:c[key]<=-60?'OFF':`${c[key]>0?'+':''}${c[key].toFixed(1)} dB`;}const levels=api.readMeters(performance.now());const peak=Math.max(...levels.master.map(m=>m.peakDb));document.getElementById('studio-meter-readout').textContent=`STEREO OUT  ${Number.isFinite(peak)?peak.toFixed(1):'−∞'} dBFS`;}
let studioOnScreen=false;new IntersectionObserver(([e])=>studioOnScreen=e.isIntersecting,{rootMargin:'100px'}).observe(host);
setInterval(()=>{if(studioOnScreen&&!document.hidden&&channelInspector.open)syncParameters()},160);

document.getElementById('studio-volume').addEventListener('input', e => { api.setChannel(selected, { volume: Number(e.target.value) }); syncControls(); });
for (const action of ['mute', 'solo']) document.getElementById(`studio-${action}`).addEventListener('click', () => { const c = api.channels.find(c => c.id === selected); api.setChannel(selected, { [action]: !c[action] }); syncControls(); });
document.getElementById('studio-play').addEventListener('click', () => api.togglePlayback());
setInterval(()=>{if(studioOnScreen&&!document.hidden)syncControls()},250);
try { setupStudio(); } catch (error) { console.warn('3D studio unavailable:', error.message); loading.hidden = false; loading.textContent = '3D is unavailable on this device. The mixer controls below still work.'; host.parentElement.classList.add('no-webgl'); document.querySelectorAll('.studio-view-buttons button').forEach(b => b.disabled = true); }
function setupStudio() {
 const setupStarted=performance.now();
 const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer = new THREE.WebGLRenderer({ antialias: !handheld, alpha: false, powerPreference: handheld?'default':'high-performance' });
 renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25)); renderer.setClearColor(0x060608); renderer.outputColorSpace = THREE.SRGBColorSpace;
 renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.00; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
 renderer.transmissionResolutionScale=.5;
 const canvas = renderer.domElement; canvas.tabIndex = 0; canvas.setAttribute('aria-label', 'Eight-channel 3D studio. Drag to orbit, use + / − to zoom, drag a metal fader to mix. Arrow keys rotate; plus and minus zoom.'); host.append(canvas);
 const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x07070b, .008);
 const camera = new THREE.PerspectiveCamera(37, 1, 1.25, 480); camera.position.set(58, 40, 80);
 const controls = new OrbitControls(camera, canvas); controls.target.set(0, 6.5, 0); controls.enableDamping = !reduced; controls.dampingFactor = .06; controls.enablePan = true; controls.panSpeed=.7; controls.rotateSpeed=.5; controls.screenSpacePanning=true; controls.enableZoom = false; canvas.style.touchAction="pan-y"; controls.minDistance = 28; controls.maxDistance = 165; controls.enabled = true; controls.minPolarAngle = .02; controls.maxPolarAngle = Math.PI - .02; controls.autoRotateSpeed = .18;
 scene.add(new THREE.HemisphereLight(0xdbe5ff, 0x121b34, .70));
 const softbox = new THREE.DirectionalLight(0xd4e8ff, 1.22); softbox.position.set(-18, 43, 8); softbox.castShadow = true; softbox.shadow.mapSize.set(handheld?512:1024,handheld?512:1024); Object.assign(softbox.shadow.camera, { left: -44, right: 44, top: 44, bottom: -44, near: .1, far: 95 }); softbox.shadow.normalBias = .08; softbox.shadow.bias = -.0003; scene.add(softbox);
 const fill = new THREE.DirectionalLight(0x7accc7, .55); fill.position.set(9, 7, -3); scene.add(fill);
 const frontBounce = new THREE.DirectionalLight(0xf5eee0, .72); frontBounce.position.set(28,25,35); scene.add(frontBounce);
 const redLight = new THREE.PointLight(0xffb258, 48, 25, 2); redLight.position.set(-7, 6, -5); scene.add(redLight);
 const redLight2 = new THREE.PointLight(0xffba68, 42, 20, 2); redLight2.position.set(7, 3, -4); scene.add(redLight2);
 const root = new THREE.Group();root.visible=false;scene.add(root);
 const touchables=[];
 const soundcube=createSoundcube({scene,root,camera,renderer});
 let details={soundcube,update:now=>soundcube.update(now),keys:[],press(){}};
 let desk,faders=[],leds=[],channelButtons=[],selectionLights=[],oleds=[],soundSystem,archive,synths,consoleExtension,sessionScreens,backdrop;
 let interiorTask=null;
 async function prepareInterior(){
  if(interiorTask)return interiorTask;
  host.dataset.roomState='preparing';
  const preparingAt=performance.now();
  interiorTask=(async()=>{
   const phases={},phaseStart=performance.now();
   const {createStudioInterior}=await import('./studio-interior.js?v=20261007-mobile3');
   phases.import=+(performance.now()-phaseStart).toFixed(1);const buildAt=performance.now();
   const parts=await createStudioInterior({scene,root,renderer,api,camera,soundcube,host,touchables,selected:()=>selected});
   phases.build=+(performance.now()-buildAt).toFixed(1);const compileAt=performance.now();
   ({desk,faders,leds,channelButtons,selectionLights,oleds,details,soundSystem,archive,synths,consoleExtension,sessionScreens,backdrop}=parts);
   if(new URLSearchParams(location.search).has('perf'))host.dataset.textureFootprint=JSON.stringify(studioTextureFootprint([root,scene.getObjectByName('Studio cosmos')]));
   // Include the hidden sky in shader preparation, then warm geometry uploads
   // offscreen. The first visible reveal keeps the same full-quality renderer.
   const sky=scene.getObjectByName('Studio cosmos'),wasSkyVisible=sky.visible,wasVisible=root.visible;
   // Phones upload only what the opening camera actually renders. Warming all
   // 450+ textures, hidden models and shader variants at once can evict WebKit's
   // graphics context before the visitor even enters. Keep every source texel.
   if(!handheld){root.visible=true;sky.visible=true;
   const compilation=renderer.compileAsync(scene,camera);root.visible=wasVisible;sky.visible=wasSkyVisible;
   await compilation;phases.compile=+(performance.now()-compileAt).toFixed(1);
   const textureAt=performance.now();
   const textureUploads=await warmStudioTextures(renderer,[root,sky]);
   phases.textures=+(performance.now()-textureAt).toFixed(1);
   if(new URLSearchParams(location.search).has('perf'))host.dataset.textureUploads=JSON.stringify(textureUploads);
   await new Promise(resolve=>requestAnimationFrame(resolve));
   const uploadAt=performance.now();
   const warmTarget=new THREE.WebGLRenderTarget(128,128),previousTarget=renderer.getRenderTarget();
   const geometryUploads=await warmStudioGeometry(renderer,scene,camera,[root,sky],warmTarget);
   phases.geometry=+(performance.now()-uploadAt).toFixed(1);
   if(new URLSearchParams(location.search).has('perf'))host.dataset.geometryUploads=JSON.stringify(geometryUploads);
   const finalAt=performance.now();
   root.visible=true;sky.visible=true;
   try{renderer.setRenderTarget(warmTarget);renderer.render(scene,camera)}finally{renderer.setRenderTarget(previousTarget);root.visible=wasVisible;sky.visible=wasSkyVisible;warmTarget.dispose()}
   phases.finalFrame=+(performance.now()-finalAt).toFixed(1);if(new URLSearchParams(location.search).has('perf'))host.dataset.preparationTimings=JSON.stringify(phases);
   }
   host.dataset.loadingProfile=handheld?'on-demand':'prewarmed';
   soundcube.setInteriorReady();renderer.shadowMap.needsUpdate=true;host.dataset.warmed='true';host.dataset.roomState='ready';
   host.dataset.preparationMs=(performance.now()-preparingAt).toFixed(0);
   Object.assign(window.lotusStudio,{desk,faders,details});
  })().catch(error=>{interiorTask=null;throw error});
  return interiorTask;
 }
 const stage=document.getElementById('studio-stage'),studioSection=document.getElementById('studio'),entry=document.getElementById('studio-entry'),openButton=document.getElementById('open-studio'),closeButton=document.getElementById('close-studio');
 const strip=document.querySelector('.studio-control-strip');
 let roomOpen=false,transition=null,entrance=0,openedAt=0;
 // Room presets face their subject squarely. The exterior cube keeps its own orbit.
 const views = {
  perspective:{position:[0,15.5,handheld?116:92],target:[0,15.5,-6]},
  console:{position:[0,18,43],target:[0,7,-2]},
  room:{position:[0,15.5,118],target:[0,15.5,-3]},
  listening:{position:[4,19,26],target:[studioLayout.synths[0],5.9,studioLayout.synths[2]]}
 };
 const cubeView={position:new THREE.Vector3(58,40,80),target:new THREE.Vector3(0,6.5,0)},insideView={position:new THREE.Vector3(...views.perspective.position),target:new THREE.Vector3(...views.perspective.target)};
 // Interpolate around the subject, never through the room when returning from a rear view.
 function travelAround(fromPosition,fromTarget,toPosition,toTarget,q){
  const a=new THREE.Spherical().setFromVector3(fromPosition.clone().sub(fromTarget)),b=new THREE.Spherical().setFromVector3(toPosition.clone().sub(toTarget));
  const delta=Math.atan2(Math.sin(b.theta-a.theta),Math.cos(b.theta-a.theta));
  const spherical=new THREE.Spherical(THREE.MathUtils.lerp(a.radius,b.radius,q),THREE.MathUtils.lerp(a.phi,b.phi,q),a.theta+delta*q);
  controls.target.lerpVectors(fromTarget,toTarget,q);camera.position.setFromSpherical(spherical).add(controls.target);camera.lookAt(controls.target);
 }
 let preparingRoom=false;
 let warmTimer=0;
 function warmVisibleStudio(){if(handheld||warmTimer||interiorTask||!host.dataset.firstFrameMs||document.hidden||!studioOnScreen)return;warmTimer=setTimeout(()=>{warmTimer=0;if(studioOnScreen&&!document.hidden)prepareInterior().catch(error=>console.warn('Studio preparation failed:',error))},120)}
 new IntersectionObserver(([e])=>{if(e.isIntersecting)warmVisibleStudio()},{rootMargin:'100px'}).observe(host);
 let previewTimer=0,previewHover=false;
 function setPreviewHover(on){
  details.soundcube.setHover(on);if(on===previewHover)return;previewHover=on;clearTimeout(previewTimer);
  // Preserve the glass reveal when the visitor deliberately approaches the cube.
  if(on&&!handheld&&host.dataset.roomState!=='ready')previewTimer=setTimeout(()=>prepareInterior().catch(error=>{host.dataset.roomState='error';console.warn('Studio preview preparation failed:',error)}),750);
 }
 function frameStudio(behavior='smooth'){const header=document.querySelector('.header'),offset=header?.getBoundingClientRect().height||92;window.scrollTo({top:stage.getBoundingClientRect().top+window.scrollY-offset,behavior})}
 async function setRoom(open){if(preparingRoom||transition||roomOpen===open)return;if(open){window.lotusStudioMedia?.armEntrance();preparingRoom=true;openButton.disabled=true;openButton.setAttribute('aria-busy','true');if(host.dataset.roomState!=='ready')openButton.textContent='PREPARING STUDIO…';try{await prepareInterior()}catch(error){window.lotusStudioMedia?.cancelEntrance();console.warn('Studio preparation failed:',error);host.dataset.roomState='error';loading.hidden=false;loading.textContent='The room could not load. Refresh to try again.';return}finally{preparingRoom=false;openButton.disabled=false;openButton.removeAttribute('aria-busy');openButton.innerHTML='OPEN STUDIO <span>＋</span>'}}roomOpen=open;window.dispatchEvent(new CustomEvent('lotus-room-change',{detail:open}));frameStudio();controls.enableDamping=false;controls.update();controls.enabled=false;controls.autoRotate=false;cameraMove=null;openButton.disabled=true;closeButton.disabled=true;stage.classList.toggle('is-opening-room',open);strip.inert=true;
  if(!open&&api.audioState.playing)api.togglePlayback();
  transition={at:performance.now(),from:entrance,to:open?1:0,position:camera.position.clone(),target:controls.target.clone(),destination:open?insideView:cubeView};
  if(reduced)transition.at-=5800;
 }
 function finishRoom(){window.dispatchEvent(new Event('lotus-room-settled'));renderer.shadowMap.needsUpdate=true;transition=null;openedAt=performance.now();controls.enabled=true;controls.enableDamping=!reduced;controls.minPolarAngle=roomOpen?.35:.02;controls.maxPolarAngle=roomOpen?Math.PI*.5:Math.PI-.02;controls.minDistance=roomOpen?16:28;controls.maxDistance=roomOpen?145:165;entry.hidden=roomOpen;openButton.disabled=false;closeButton.disabled=false;closeButton.hidden=!roomOpen;stage.classList.toggle('is-room-open',roomOpen);document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('active',b.dataset.camera==='perspective'));stage.classList.remove('is-opening-room');studioSection.classList.toggle('room-is-open',roomOpen);strip.inert=!roomOpen;strip.hidden=!roomOpen;canvas.setAttribute('aria-label',roomOpen?'Recording studio. Drag to orbit; right-drag or Shift-drag to pan. Use + / − to zoom, drag faders to mix. Space plays, 1 through 8 select channels.':'Glowing glass cube containing a recording studio. Drag to rotate 360 degrees and use + / − to zoom. Click the cube or press Enter to open it.');}
 openButton.addEventListener('click',()=>setRoom(true));openButton.addEventListener('pointerenter',()=>setPreviewHover(true));openButton.addEventListener('pointerleave',()=>setPreviewHover(false));openButton.addEventListener('focus',()=>setPreviewHover(true));openButton.addEventListener('blur',()=>setPreviewHover(false));closeButton.addEventListener('click',()=>setRoom(false));
 stage.classList.add('has-glass-entry');strip.hidden=true;strip.inert=true;entry.hidden=false;

 const floor = new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.ShadowMaterial({color:0x080d1b,opacity:0,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.03;floor.receiveShadow=true;scene.add(floor);
 let cameraMove=null;
 controls.addEventListener('start',()=>{cameraMove=null;controls.autoRotate=false;document.getElementById('auto-rotate').setAttribute('aria-pressed','false')});
 const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2(); let down = null, faderDrag = null, paramDrag=null, cdVolumeDrag=null, visible = false, last = 0, lastDaw = 0;
 const point = new THREE.Vector3(), dragPlane = new THREE.Plane();
 function hit(e) { const b = canvas.getBoundingClientRect(); pointer.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1); raycaster.setFromCamera(pointer, camera); return raycaster.intersectObjects(touchables, false)[0]?.object; }
 canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, moved: false }; if(!roomOpen||transition)return; const object = hit(e); if(object?.userData.action==='cd-volume'){window.lotusSfx?.play('slider');cdVolumeDrag={value:window.lotusStudioMedia?.listeningVolume??.7,x:e.clientX,y:e.clientY};controls.enabled=false;canvas.setPointerCapture(e.pointerId);e.stopImmediatePropagation();e.preventDefault();return;} if(object?.userData.action==='param'){window.lotusSfx?.play('slider');selectChannel(object.userData.channel);const c=api.channels.find(c=>c.id===selected);paramDrag={key:object.userData.key,value:c[object.userData.key],x:e.clientX,y:e.clientY};controls.enabled=false;canvas.setPointerCapture(e.pointerId);e.stopImmediatePropagation();e.preventDefault();return;} if (['fader','bus-fader'].includes(object?.userData.action)) { window.lotusSfx?.play('slider'); if(object.userData.channel)selectChannel(object.userData.channel); const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(desk.quaternion); object.getWorldPosition(point); dragPlane.setFromNormalAndCoplanarPoint(normal, point); faderDrag = object; controls.enabled = false; canvas.setPointerCapture(e.pointerId); e.stopImmediatePropagation(); e.preventDefault(); } }, { capture: true });
 canvas.addEventListener('pointermove', e => { if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true; if(cdVolumeDrag){window.lotusStudioMedia?.volume(THREE.MathUtils.clamp(cdVolumeDrag.value+(e.clientX-cdVolumeDrag.x+cdVolumeDrag.y-e.clientY)/180,0,1));e.stopImmediatePropagation();return;} if(paramDrag){const spec=paramSpecs.find(s=>s[0]===paramDrag.key);const delta=paramDrag.key==='pan'?e.clientX-paramDrag.x:paramDrag.y-e.clientY;api.setChannel(selected,{[paramDrag.key]:THREE.MathUtils.clamp(paramDrag.value+delta/160*(spec[3]-spec[2]),spec[2],spec[3])});syncParameters();e.stopImmediatePropagation();return;} if (!faderDrag) return; hit(e); if (raycaster.ray.intersectPlane(dragPlane, point)) { const local = desk.worldToLocal(point.clone()); const volume=THREE.MathUtils.clamp((1.65-local.z)/1.68*100,0,100);if(faderDrag.userData.action==='bus-fader')api.setBus(faderDrag.userData.bus,volume);else api.setChannel(faderDrag.userData.channel,{volume}); syncControls(); } e.stopImmediatePropagation(); }, { capture: true });
 for (const event of ['pointerup', 'pointercancel']) canvas.addEventListener(event, e => { if (!faderDrag&&!paramDrag&&!cdVolumeDrag) return; faderDrag = null;paramDrag=null;cdVolumeDrag=null; controls.enabled = true; down = null; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); e.stopImmediatePropagation(); }, { capture: true });
 canvas.addEventListener('pointerup', e => { if (!down || down.moved || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) {down=null;return;} down = null; if(!roomOpen&&!transition){const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObjects(details.soundcube.hitTargets,false).length)setRoom(true);return}if(transition||performance.now()-openedAt<600)return; const object = hit(e); if (!object) return; const data = object.userData;window.lotusSfx?.play(data.action==='studio-record'?'case-lift':data.action==='computer'?'glass':data.action==='release'?'case-lift':'tap');if(data.action==='computer'){window.lotusDesktop?.open();return}if(data.action==='studio-record'){details.soundcube.glassRecords.take(data.release,canvas);return}if(data.action==='mv-wall'){details.soundcube.mvWall.open();return}if(data.action==='release'){window.lotusPortfolio.openTrack(data.release,canvas);return}details.press(object); if(data.action==='bus-fader')return; if (data.channel) selectChannel(data.channel); if(data.action==='next-channel'){selectChannel(api.channels[(api.channels.findIndex(c=>c.id===selected)+1)%api.channels.length].id)}
  if(data.action?.startsWith('selected-')){const action=data.action.slice(9),c=api.channels.find(c=>c.id===selected);api.setChannel(selected,{[action]:!c[action]});syncControls()}
  if(data.action==='note')api.playNote(data.note);
  if (data.action === 'play') api.togglePlayback(); if (data.action === 'stop' && api.audioState.playing) api.togglePlayback(); if (['mute', 'solo'].includes(data.action)) { const c = api.channels.find(c => c.id === data.channel); api.setChannel(c.id, { [data.action]: !c[data.action] }); } });
 canvas.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(!roomOpen||transition){if(key==='enter'||key===' '){e.preventDefault();setRoom(true)}return}if(window.lotusStudioMedia&&window.lotusStudioMedia.mode!=='session'){if([' ','m','arrowleft','arrowright'].includes(key)){e.preventDefault();if(key===' ')window.lotusStudioMedia.toggle();else if(key==='m')window.lotusStudioMedia.mute();else window.lotusStudioMedia.seekBy(key==='arrowleft'?-5:5)}return}if(key===' '||/^[1-8]$/.test(key)||key==='m'||key==='s'){e.preventDefault();if(key===' '){if(window.lotusStudioMedia&&window.lotusStudioMedia.mode!=='session')window.lotusStudioMedia.toggle();else api.togglePlayback();}else if(/^[1-8]$/.test(key))selectChannel(api.channels[Number(key)-1].id);else{const action=key==='m'?'mute':'solo',c=api.channels.find(c=>c.id===selected);api.setChannel(selected,{[action]:!c[action]})}const k=details.keys.find(k=>k.userData.key.toLowerCase()===(key===' '?'space':key));details.press(k);syncControls()}});
 canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);details.soundcube.setPointer(pointer.x,pointer.y);if(faderDrag||cdVolumeDrag)return;if(!roomOpen){raycaster.setFromCamera(pointer,camera);setPreviewHover(!!raycaster.intersectObjects(details.soundcube.hitTargets,false).length);return}const object=hit(e);details.soundcube.glassRecords?.setHover(object?.userData.action==='studio-record'?object.userData.release:null);document.getElementById('studio-object-note').textContent=object?.userData.label||''});
 canvas.addEventListener('pointerleave',()=>{document.getElementById('studio-object-note').textContent='';setPreviewHover(false);details.soundcube.clearPointer();details.soundcube.glassRecords?.setHover(null)});
 canvas.addEventListener('keydown', e => { if(transition)return; if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '-'].includes(e.key)) return; e.preventDefault(); const offset = camera.position.clone().sub(controls.target); if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), e.key === 'ArrowLeft' ? .15 : -.15); if (e.key === 'ArrowUp') offset.y = Math.min(25, offset.y + 1); if (e.key === 'ArrowDown') offset.y = Math.max(.8, offset.y - 1); if (e.key === '+') offset.multiplyScalar(.92); if (e.key === '-') offset.multiplyScalar(1.08); camera.position.copy(controls.target).add(offset); controls.update(); });
 document.querySelectorAll('[data-camera]').forEach(b => b.addEventListener('click', () => { if(!roomOpen||transition)return; frameStudio();const view = views[b.dataset.camera];controls.autoRotate=false;controls.enableDamping=false;controls.update();controls.enabled=false; cameraMove={from:camera.position.clone(),fromTarget:controls.target.clone(),to:new THREE.Vector3(...view.position),target:new THREE.Vector3(...view.target),at:performance.now()}; if(reduced){camera.position.copy(cameraMove.to);controls.target.copy(cameraMove.target);cameraMove=null;controls.enabled=true;controls.enableDamping=!reduced} controls.update(); document.querySelectorAll('[data-camera]').forEach(x => x.classList.toggle('active', x === b)); controls.autoRotate = false; document.getElementById('auto-rotate').setAttribute('aria-pressed', 'false'); }));
 function moveCamera(position,target){controls.autoRotate=false;controls.enableDamping=false;controls.update();controls.enabled=false;cameraMove={from:camera.position.clone(),fromTarget:controls.target.clone(),to:position,target,at:performance.now()};if(reduced){camera.position.copy(position);controls.target.copy(target);cameraMove=null;controls.enabled=true;controls.enableDamping=false}controls.update();}
 document.querySelectorAll('[data-studio-zoom]').forEach(button=>button.addEventListener('click',()=>{if(transition)return;const offset=(cameraMove?.to||camera.position).clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*(button.dataset.studioZoom==='in'?.84:1.19),controls.minDistance,controls.maxDistance));moveCamera(controls.target.clone().add(offset),controls.target.clone())}));
 document.getElementById('studio-reset-view').addEventListener('click',()=>{if(transition)return;const view=roomOpen?insideView:cubeView;moveCamera(view.position.clone(),view.target.clone());document.querySelectorAll('[data-camera]').forEach(b=>b.classList.toggle('active',b.dataset.camera==='perspective'))});
 document.getElementById('auto-rotate').addEventListener('click', e => { if(!roomOpen||transition)return; controls.autoRotate = !controls.autoRotate; e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate)); });
 function resize() { const w = host.clientWidth, h = host.clientHeight; if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio,deviceProfile.pixelRatio,2200/w));renderer.setSize(w, h); camera.aspect = w / h; camera.fov = handheld ? 62 : 37; camera.updateProjectionMatrix();host.dataset.deviceProfile=handheld?'phone':'desktop'; }
 new ResizeObserver(resize).observe(host); resize(); let frameLoop;new IntersectionObserver(e => { visible = e[0].isIntersecting;frameLoop?.wake(); }, { rootMargin: '0px' }).observe(host);
 let contextLost=false;
 canvas.addEventListener('webglcontextlost', e => { e.preventDefault();contextLost=true;visible=false;host.dataset.graphicsState='recovering';loading.hidden=false;loading.textContent='RESTORING STUDIO…'; });
 canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;visible=studioOnScreen;host.dataset.graphicsState='ready';renderer.shadowMap.needsUpdate=true;loading.hidden=true;frameLoop?.wake()});
 let interactionUntil=0;
 for(const event of ['pointerdown','pointermove','keydown'])canvas.addEventListener(event,()=>{interactionUntil=performance.now()+1200},{passive:true});
 const measure=new URLSearchParams(location.search).has('perf'),perfFrames=[];let perfAt=0,previousFrame=0;
 function animate(now) { if (contextLost || !visible || document.hidden || document.body.classList.contains('desktop-open')){previousFrame=0;return;} const interval=transition||cameraMove||(roomOpen&&(controls.autoRotate||now<interactionUntil))?1000/60:1000/30;const elapsed=now-last;if(elapsed<interval-.5)return; const cpuStart=performance.now();if(measure){renderer.info.autoReset=false;renderer.info.reset()}const frameInterval=previousFrame?now-previousFrame:16.7;previousFrame=now;last+=interval*Math.max(1,Math.floor((elapsed+.5)/interval));if(transition){const raw=THREE.MathUtils.clamp((now-transition.at)/5800,0,1),q=raw*raw*raw*(raw*(raw*6-15)+10);entrance=THREE.MathUtils.lerp(transition.from,transition.to,q);travelAround(transition.position,transition.target,transition.destination.position,transition.destination.target,q);details.soundcube.setProgress(entrance);if(q===1)finishRoom()}if(cameraMove){const t=THREE.MathUtils.smoothstep((now-cameraMove.at)/1450,0,1);travelAround(cameraMove.from,cameraMove.fromTarget,cameraMove.to,cameraMove.target,t);if(t===1){cameraMove=null;controls.enabled=true;controls.enableDamping=!reduced}} if(controls.enabled)controls.update();if(roomOpen||transition){details.update(now);soundSystem?.update(now);archive?.update(now);synths?.update(now);if(roomOpen)consoleExtension?.update(now)}else soundcube.update(now);if(backdrop)backdrop.visible = true;
  const soloing = api.channels.some(c => c.solo),frameMeters=api.readMeters(now); if(roomOpen)api.channels.forEach((c, i) => { faders[i].position.z += (1.65-c.value/100*1.68-faders[i].position.z)*.28;
   const oled=oleds[i],stamp=`${c.value}/${selected===c.id}/${c.mute}/${c.solo}`;if(oled.last!==stamp){oled.last=stamp;const image=oled.screen.material.map.image,g=image.getContext('2d');image.width=512;image.height=224;g.fillStyle=selected===c.id?'#18252c':'#091318';g.fillRect(0,0,512,224);g.fillStyle=selected===c.id?'#e83324':'#94c3d6';g.fillRect(0,0,512,7);g.font='600 46px Arial';g.fillText(c.name,30,66);g.fillStyle='#e1e8ec';g.font='52px monospace';g.fillText(c.value===0?'−∞':`${(20*Math.log10(Math.pow(c.value/100,1.4))).toFixed(1)} dB`,30,145);g.font='23px monospace';g.fillStyle='#86a1b5';g.fillText(`${c.mute?'MUTED':c.solo?'SOLO':'STEREO'}    CH ${i+1}`,30,198);oled.screen.material.map.needsUpdate=true}
    const enabled = !c.mute && (!soloing || c.solo), level = api.audioState.playing && enabled && !api.audioState.muted ? THREE.MathUtils.clamp((frameMeters.channels[i].peakDb+60)/60,0,1) : 0; leds[i].forEach((led, k) => { const lit = k < level * 16; led.material.color.set(lit ? (k > 13 ? 0xf5ba54 : 0x73d9d2) : 0x17292c); led.material.emissiveIntensity = lit ? 1.7 : .015; }); selectionLights[i].material.emissiveIntensity = c.id === selected ? 3.3 : .6; selectionLights[i].material.color.set(c.id === selected ? 0xb5ecff : 0x407582); channelButtons[i].mute.material.color.set(c.mute ? 0xef4352 : 0xa9bcc4); channelButtons[i].solo.material.color.set(c.solo ? 0xf7c56b : 0xa9bcc4); });
  if (roomOpen && now - lastDaw >= 1000/deviceProfile.screenFPS) { sessionScreens.update(now); lastDaw = now; } renderer.render(scene, camera);
  if(!host.dataset.firstFrameMs){
   host.dataset.firstFrameMs=performance.now().toFixed(0);loading.hidden=true;
   window.dispatchEvent(new Event('lotus-studio-ready'));
   // Paint the entrance first, then prepare the original room while this chapter is visible.
   host.dataset.roomState='waiting';
   warmVisibleStudio();
  }
  if(measure){perfFrames.push({ms:frameInterval,cpu:performance.now()-cpuStart,calls:renderer.info.render.calls});if(now-perfAt>1800){const samples=perfFrames.splice(0);const sort=samples.map(s=>s.ms).sort((a,b)=>a-b);host.dataset.performance=JSON.stringify({frames:samples.length,medianMs:+sort[Math.floor(sort.length*.5)].toFixed(1),p95Ms:+sort[Math.floor(sort.length*.95)].toFixed(1),cpuMs:+(samples.reduce((n,s)=>n+s.cpu,0)/samples.length).toFixed(1),drawCalls:Math.round(samples.reduce((n,s)=>n+s.calls,0)/samples.length)});perfAt=now}}
 }
 host.dataset.setupMs=(performance.now()-setupStarted).toFixed(0);host.dataset.roomState='waiting';camera.position.copy(cubeView.position);controls.target.copy(cubeView.target);controls.update();camera.lookAt(controls.target);finishRoom();frameLoop=createVisibleFrameLoop({update:animate,active:()=>!contextLost&&visible&&!document.hidden&&!document.body.classList.contains('desktop-open')&&!document.body.classList.contains('prologue-open'),onPause:()=>previousFrame=0,watchBodyClasses:true});frameLoop.wake(); window.lotusStudio = { renderer, camera, controls, selectChannel, scene, desk, faders, touchables, details };
}
