import * as THREE from 'three';
import {createRecordSpace} from './record-space.js?v=20261006-lake-surface1';
import { createSoundCells } from './sound-cells.js?v=20261006-lake-surface1';
import { createFlowTransition } from './flow-transition.js?v=20261006-lake-surface1';
const host=document.getElementById('record-space'),section=document.getElementById('home'),openingUI=document.getElementById('opening-ui');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
new IntersectionObserver(entries=>document.body.classList.toggle('at-universe',entries[0].isIntersecting),{threshold:.35}).observe(section);
try{await setup()}catch(error){section.classList.remove('is-opening','is-entering');openingUI.hidden=true;document.getElementById('universe-loading').textContent='SOUND IN EVERY DIRECTION.';document.querySelectorAll('[data-replay-opening]').forEach(button=>button.hidden=true);console.warn('Sound cells unavailable:',error.message)}
async function setup(){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new THREE.Scene(),space=createRecordSpace(scene),camera=new THREE.PerspectiveCamera(37,1,.1,100);camera.position.set(0,0,20);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Living sound nucleus. Click a cell or press Enter to travel through the particles into the record collection. Drag to turn the nucleus.');host.append(canvas);
 const lighting = document.createElement('canvas'); lighting.width = 1024; lighting.height = 512;
 const ctx = lighting.getContext('2d'); ctx.fillStyle = '#161617'; ctx.fillRect(0, 0, 1024, 512);
 const gradient = ctx.createLinearGradient(0, 0, 0, 512); gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(.26, '#999999'); gradient.addColorStop(.48, '#171717'); gradient.addColorStop(.53, '#080808'); gradient.addColorStop(.8, '#a1a1a1'); gradient.addColorStop(1, '#e9e9e9'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1024, 512);
 ctx.fillStyle = '#fff'; ctx.fillRect(75, 30, 145, 400); ctx.fillRect(440, 20, 50, 380); ctx.fillRect(750, 40, 170, 200);
 ctx.fillStyle = '#020202'; ctx.fillRect(250, 30, 80, 460); ctx.fillRect(610, 10, 90, 500);
 ctx.fillStyle = '#ed1423'; ctx.fillRect(920, 190, 104, 230);
 const environment = new THREE.CanvasTexture(lighting); environment.mapping = THREE.EquirectangularReflectionMapping; environment.colorSpace = THREE.SRGBColorSpace;
 const pmrem = new THREE.PMREMGenerator(renderer); const env = pmrem.fromEquirectangular(environment); scene.environment = env.texture; environment.dispose(); pmrem.dispose();
 scene.add(new THREE.AmbientLight(0xffffff, 1.5)); const key = new THREE.DirectionalLight(0xffffff, 4); key.position.set(-4, 8, 10); scene.add(key);
 const rim = new THREE.PointLight(0xff2430, 150); rim.position.set(5, -3, 5); scene.add(rim);
 const soundCells = await createSoundCells(scene, reduced); const sculpture = soundCells.group;

 let intro=!location.hash||location.hash==='#home',openingAt=null,reveal=intro?0:1,burst=0,spin=0,tilt=0,targetSpin=0,targetTilt=0,drag=null,visible=true,last=0;
 // Real depth samples stream past the lens during the original central burst.
 const travelCount=1200,travelData=new Float32Array(travelCount*6),travelSeeds=[];
 for(let i=0;i<travelCount;i++){const a=i*2.399963,r=1.1+((Math.sin(i*17.37)+1)*.5)**.65*19;travelSeeds.push([Math.cos(a)*r,Math.sin(a)*r,(i*.61803398875%1)*80]);}
 const travelGeo=new THREE.BufferGeometry();travelGeo.setAttribute('position',new THREE.BufferAttribute(travelData,3));
 const travelMaterial=new THREE.LineBasicMaterial({color:0xbecbff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});
 const travel=new THREE.LineSegments(travelGeo,travelMaterial);travel.frustumCulled=false;scene.add(travel);
 const pointer=new THREE.Vector2(),flow=createFlowTransition({host,renderer});
 function setIntroHidden(hidden){openingUI.hidden=hidden;for(const el of section.querySelectorAll('.universe-bottom,.universe-scroll,#replay-opening'))el.inert=!hidden}
 setIntroHidden(!intro);section.classList.toggle('is-opening',intro);
 function complete(navigate){flow.finish();resize();intro=false;openingAt=null;reveal=1;burst=0;section.classList.remove('is-opening','is-entering');setIntroHidden(true);document.getElementById('enter-flow').disabled=false;if(navigate){history.pushState(null,'','#work');const work=document.getElementById('work');window.scrollTo({top:window.scrollY+work.getBoundingClientRect().top,behavior:'auto'});window.dispatchEvent(new Event('lotus-enter-collection'))}}
 function enter(skip=false,navigate=true){if(!intro)return;if(skip||reduced){complete(navigate);return}if(openingAt!==null)return;flow.begin();openingAt=performance.now();pointer.set(0,0);section.classList.add('is-entering');document.getElementById('enter-flow').disabled=true}
 function restartOpening(focus=true){
  flow.finish();resize();intro=true;reveal=0;burst=0;openingAt=null;spin=0;tilt=0;targetSpin=0;targetTilt=0;pointer.set(0,0);
  section.classList.add('is-opening');section.classList.remove('is-entering');setIntroHidden(false);
  const enterButton=document.getElementById('enter-flow');enterButton.disabled=false;
  if(location.hash!=='#home')history.pushState(null,'','#home');
  window.scrollTo({top:0,behavior:'auto'});
  if(focus)enterButton.focus({preventScroll:true});
 }
 document.getElementById('enter-flow').addEventListener('click',()=>enter());
 document.getElementById('skip-opening').addEventListener('click',()=>enter(true));
 document.querySelectorAll('[data-replay-opening],a[href="#home"]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();restartOpening()}));
 document.querySelectorAll('a[href^="#"]:not([href="#home"])').forEach(a=>a.addEventListener('click',event=>{
  const target=document.querySelector(a.getAttribute('href')==='#studio'?'#studio-stage':a.getAttribute('href'));if(!target)return;
  event.preventDefault();if(intro)complete(false);history.pushState(null,'',a.getAttribute('href'));if(target.id==='studio-stage')window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-12,behavior:'auto'});else window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top,behavior:'auto'});
 }));
 window.addEventListener('hashchange',()=>{if(location.hash==='#home'||!location.hash)restartOpening(false);else if(intro)complete(false)});
 // Opening the homepage must not inherit a previous scroll position in the archive.
 if(intro)window.scrollTo({top:0,behavior:'auto'});
 window.addEventListener('pageshow',()=>{if(intro)window.scrollTo({top:0,behavior:'auto'})});
 const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();let pointerStart=null;
 function pickCell(e){const b=canvas.getBoundingClientRect();ndc.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);raycaster.setFromCamera(ndc,camera);return raycaster.intersectObjects(soundCells.hitTargets,false)[0]?.object}
 canvas.addEventListener('pointermove',e=>{const b=canvas.getBoundingClientRect();if(!reduced)pointer.set(((e.clientX-b.left)/b.width-.5)*1.2,-((e.clientY-b.top)/b.height-.5)*.6);if(drag!==null){targetSpin+=(e.clientX-drag.x)*.008;targetTilt+=(e.clientY-drag.y)*.008;drag={x:e.clientX,y:e.clientY};if(pointerStart&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>6)pointerStart.moved=true}soundCells.hover(pickCell(e))});
 canvas.addEventListener('pointerleave',()=>{pointer.set(0,0);soundCells.hover(null)});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};pointerStart={x:e.clientX,y:e.clientY,cell:pickCell(e)};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointerup',e=>{const click=pointerStart&&!pointerStart.moved&&Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)<7&&pointerStart.cell;drag=null;pointerStart=null;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);if(click&&intro)enter()});
 canvas.addEventListener('pointercancel',()=>{drag=null;pointerStart=null});
 document.getElementById('cell-reset-view').addEventListener('click',()=>{targetSpin=targetTilt=0});
 canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')targetSpin-=.25;if(e.key==='ArrowRight')targetSpin+=.25;if(e.key==='ArrowUp')targetTilt-=.25;if(e.key==='ArrowDown')targetTilt+=.25}if(e.key==='Enter'){e.preventDefault();if(intro)enter();else location.hash='work'}});
 function resize(){renderer.setSize(host.clientWidth,host.clientHeight);camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();new IntersectionObserver(e=>visible=e[0].isIntersecting,{rootMargin:'100px'}).observe(host);document.getElementById('universe-loading').remove();
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;complete(false);canvas.hidden=true;document.querySelectorAll('[data-replay-opening]').forEach(button=>button.hidden=true)});
 function frame(now){
  requestAnimationFrame(frame);if((!visible&&!flow.active)||document.hidden||now-last<16)return;last=now;
  camera.position.x+=(pointer.x-camera.position.x)*.05;camera.position.y+=(pointer.y-camera.position.y)*.05;camera.lookAt(0,0,0);
  let p=0,dissolve=0;
  if(openingAt!==null){p=Math.min(1,(now-openingAt)/3400);burst=Math.sin(Math.min(1,p/.65)*Math.PI/2)**2;reveal=0;dissolve=THREE.MathUtils.smoothstep(p,.34,.76)}
  const flight=openingAt===null?0:Math.sin(Math.PI*p)**2;
  camera.position.z=20-flight*8;camera.lookAt(0,.5,0);
  travelMaterial.opacity=flight*.64;
  for(let i=0;i<travelCount;i++){const [x,y,z]=travelSeeds[i],k=i*6,depth=((z+p*115)%80)-62;travelData[k]=travelData[k+3]=x;travelData[k+1]=travelData[k+4]=y;travelData[k+2]=depth;travelData[k+5]=depth-.12-flight*3.8;}
  travelGeo.attributes.position.needsUpdate=true;
  spin+=(targetSpin-spin)*(reduced?1:.14);tilt+=(targetTilt-tilt)*(reduced?1:.14);soundCells.update(now,{reveal,burst,pointer,spin,tilt,dissolve,camera});space.update(reduced?0:now*.001,burst,camera.aspect);
  renderer.clear();renderer.render(scene,camera);if(flow.active)flow.render(p);
  if(openingAt!==null&&p===1)complete(true);
 }
 requestAnimationFrame(frame);
 window.lotusUniverse={renderer,scene,camera,soundCells,get opening(){return intro}};
}
