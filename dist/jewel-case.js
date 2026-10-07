import {loadHook} from './preview-hooks.js?v=20261006-lake-surface1';
import * as THREE from 'three';
import {collaboratorFiles,artistPortrait,artistSocials} from './collaborators.js?v=20261006-lake-surface1';
import {createMusicSignal} from './music-signal.js';
import {batchMeshes,discReflection,coverColor,createLidSignal} from './jewel-surface.js?v=20261006-lake-surface1';
import {mountRecognition} from './recognition.js?v=20261006-lake-surface1';
const host=document.querySelector('#case-stage'),experience=document.querySelector('#experience'),toggle=document.querySelector('#toggle-case'),hint=document.querySelector('#case-hint'),info=document.querySelector('#record-info'),audio=document.querySelector('#case-audio');
const params=new URLSearchParams(location.search),track=window.lotusCatalog.find(t=>t.id===params.get('record'))||window.lotusCatalog.find(t=>t.id==='news');
const people=collaboratorFiles[track.id];
document.body.dataset.release=track.id;
document.title=track.title+' — CD Case / Lotus Flow';
document.querySelector('.edition h1').textContent=track.title;document.querySelector('.edition>span').textContent=track.artist+' · '+track.year;
document.querySelector('#panel-record h2').textContent=track.title;document.querySelector('#panel-record .eyebrow').textContent=track.artist+' / '+track.year;document.querySelector('#panel-record .credits').textContent=track.credits;
loadHook(audio,track,{full:true});audio.setAttribute('aria-label',track.title+' '+(track.audioKind==='full'?'full track':'official preview'));
const note=document.createElement('p');note.className='audio-kind';note.textContent=track.audioKind==='full'?'FULL TRACK':'OFFICIAL PREVIEW / APPLE MUSIC';audio.after(note);
const official=document.createElement('a');official.className='detail-link';official.href=track.url;official.target='_blank';official.rel='noopener noreferrer';official.textContent='OFFICIAL RELEASE ↗';note.after(official);
const artistPanel=document.querySelector('#panel-artist');
function showArtist(i){const person=people[i];artistPanel.innerHTML=`${people.length>1?`<nav class="case-artist-select" aria-label="Choose collaborator">${people.map((p,j)=>`<button data-artist="${j}" aria-pressed="${i===j}">${p.name}</button>`).join('')}</nav>`:''}${artistPortrait(person)}<span class="eyebrow">${track.categories.includes('artist')?'THE ARTIST':'THE COLLABORATOR'}</span><h2>${person.name}</h2>${artistSocials(person)}<p class="artist-bio">${person.bio}</p>`;artistPanel.querySelectorAll('[data-artist]').forEach(b=>b.addEventListener('click',()=>showArtist(Number(b.dataset.artist))))}
showArtist(0);
const detailsLink=document.querySelector('#panel-record .detail-link:last-child');detailsLink.href='works/'+track.id+'.html#production';
if(params.has('embed')){document.body.classList.add('embedded');detailsLink.target='_parent';detailsLink.innerHTML='查看下面的制作细节 <span>↓</span>'}
const recognition=document.createElement('section');document.querySelector('#panel-record').append(recognition);mountRecognition(recognition,track,{compact:true});
const signal=createMusicSignal(audio);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let opened=false,revealTimer,progress=0,from=0,target=0,start=0;
function setOpen(value,autoplay=true){opened=value;from=progress;target=value?1:0;start=performance.now();clearTimeout(revealTimer);experience.classList.toggle('is-open',value);experience.classList.remove('revealed');info.inert=true;info.setAttribute('aria-hidden','true');host.setAttribute('aria-expanded',String(value));toggle.setAttribute('aria-expanded',String(value));host.setAttribute('aria-label',`${value?'合上':'打开'} ${track.title} 透明 CD 盒`);toggle.innerHTML=value?'合上 CD 盒 <span>↙</span>':'打开 CD 盒 <span>↗</span>';hint.textContent=value?'再次点击盒面即可合上':'触碰盒面，打开这张唱片';if(value){if(autoplay){signal.arm();audio.play().catch(()=>{});}revealTimer=setTimeout(()=>{experience.classList.add('revealed');info.inert=false;info.setAttribute('aria-hidden','false')},reduced?0:1450)}else audio.pause();}
toggle.addEventListener('click',()=>setOpen(!opened));host.addEventListener('click',()=>setOpen(!opened));host.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();setOpen(!opened)}});document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened)setOpen(false)});
const tabs=[...document.querySelectorAll('[role=tab]')];function selectTab(t){for(const b of tabs){const active=b===t;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;document.getElementById(b.getAttribute('aria-controls')).hidden=!active}}for(const t of tabs){t.addEventListener('click',()=>selectTab(t));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const next=tabs[1-tabs.indexOf(t)];selectTab(next);next.focus()}})}
try{init();if(params.has('open'))setOpen(true,false)}catch(error){document.querySelector('#loading').textContent='3D 预览暂时无法加载';console.error(error)}
function init(){
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,100);camera.position.set(0,0,10.8);
 scene.add(new THREE.AmbientLight(0xffffff,1.8));for(const [x,y,z,power]of[[-5,7,8,3],[7,-2,5,1.6]]){const light=new THREE.DirectionalLight(0xffffff,power);light.position.set(x,y,z);scene.add(light)}
 const env=document.createElement('canvas');env.width=1024;env.height=512;const ec=env.getContext('2d');ec.fillStyle='#17171b';ec.fillRect(0,0,1024,512);ec.fillStyle='#ffffff';ec.fillRect(100,45,110,410);ec.fillRect(710,20,200,55);ec.fillRect(450,310,45,180);ec.fillStyle='#9fa8af';ec.fillRect(920,180,70,260);const et=new THREE.CanvasTexture(env);et.mapping=THREE.EquirectangularReflectionMapping;et.colorSpace=THREE.SRGBColorSpace;const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(et).texture;et.dispose();pm.dispose();
 const root=new THREE.Group();scene.add(root);const base=new THREE.Group();root.add(base);
 const glass=new THREE.MeshPhysicalMaterial({color:0xf1f5f4,metalness:.05,roughness:.07,clearcoat:1,transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.25});
 const edge=new THREE.MeshPhysicalMaterial({color:0x9eafaf,metalness:.40,roughness:.15,clearcoat:1,transparent:true,opacity:.40,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:1.35});
 const bright=new THREE.MeshBasicMaterial({color:0xeaf2f1,transparent:true,opacity:.55,depthWrite:false});
 const dim=new THREE.MeshBasicMaterial({color:0xbfc9c9,transparent:true,opacity:.25,depthWrite:false});
 function mesh(parent,geo,mat,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m}
 function box(parent,w,h,d,mat,x,y,z){return mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z)}
 function frame(parent,w,h,z,mat,thickness=.035,x=0){const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();const hole=new THREE.Path();hole.moveTo(-w/2+thickness,-h/2+thickness);hole.lineTo(-w/2+thickness,h/2-thickness);hole.lineTo(w/2-thickness,h/2-thickness);hole.lineTo(w/2-thickness,-h/2+thickness);hole.closePath();s.holes.push(hole);return mesh(parent,new THREE.ExtrudeGeometry(s,{depth:.025,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.008,bevelThickness:.008}),mat,x,0,z)}
 function ring(parent,r,t,mat,x,y,z,arc=Math.PI*2){return mesh(parent,new THREE.TorusGeometry(r,t,6,100,arc),mat,x,y,z)}
 // Molded rear shell, with real depth and narrow double rim.
 box(base,4.83,4.27,.028,glass,0,0,-.085);frame(base,4.9,4.34,-.10,edge,.048);frame(base,4.77,4.20,-.015,dim,.022);
 const liner=new THREE.MeshPhysicalMaterial({color:0x111114,metalness:.03,roughness:.48,clearcoat:.18});box(base,4.27,4.10,.026,liner,.27,0,-.044);
 const trayLip=new THREE.MeshPhysicalMaterial({color:0x252529,roughness:.32,metalness:.12});ring(base,2.035,.022,trayLip,.25,0,-.005);
 for(const x of[-1.56,2.06])for(const y of[-1.85,1.85])ring(base,.085,.014,trayLip,x,y,-.004,Math.PI);
 // Original artwork fills the CD; a separate specular layer provides the clear disc coating.
 const photo=new THREE.TextureLoader().load(track.image,()=>{document.querySelector('#loading')?.remove();lidSignal.setColor(track.id==='news'?new THREE.Color('#e7a0bb'):coverColor(photo.image));renderer.compileAsync?.(scene,camera).catch(()=>{})});photo.colorSpace=THREE.SRGBColorSpace;photo.anisotropy=8;
 const disc=new THREE.Group();disc.position.set(.25,0,.025);base.add(disc);
 const print=new THREE.MeshBasicMaterial({map:photo,side:THREE.DoubleSide,toneMapped:false});mesh(disc,new THREE.RingGeometry(.20,1.985,160),print,0,0,.01);
 const coating=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.16,metalness:.08,clearcoat:1,clearcoatRoughness:.08,transparent:true,opacity:.018,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:.7});mesh(disc,new THREE.RingGeometry(.20,1.985,160),coating,0,0,.019);ring(disc,1.985,.009,edge,0,0,.02);
 const hub=new THREE.MeshPhysicalMaterial({color:0xaebaba,metalness:.18,roughness:.17,transparent:true,opacity:.48,depthWrite:false,envMapIntensity:1.1});for(const r of [.21,.265,.32])ring(disc,r,.009,hub,0,0,.036);mesh(disc,new THREE.RingGeometry(.20,.29,96),hub,0,0,.03);
 const reflection=discReflection(2,track.id);mesh(disc,new THREE.RingGeometry(.20,1.984,128),reflection,0,0,.027);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=box(base,.037,.067,.035,edge,.25+Math.cos(a)*.155,Math.sin(a)*.155,.026);tooth.rotation.z=a-Math.PI/2}
 // Cover strip inside the transparent left spine, using the original photograph without added type.
 const strip=new THREE.TextureLoader().load(track.image);strip.colorSpace=THREE.SRGBColorSpace;strip.repeat.set(.105,1);strip.offset.set(.025,0);box(base,.43,4.10,.022,new THREE.MeshBasicMaterial({map:strip,toneMapped:false}),-2.18,0,-.018);
 for(let i=0;i<36;i++)box(base,.028,.012,.035,dim,-2.42,-1.96+i*.112,.026);
 box(base,.025,4.14,.072,edge,-1.935,0,.005);
 for(const y of[-1.89,1.89]){const arc=ring(base,.19,.013,edge,-1.69,y,.04,Math.PI);arc.rotation.z=y>0?Math.PI:0;box(base,.20,.065,.11,glass,2.30,y,.02)}
 // Two hinge barrels keep the lid attached along the spine while it opens.
 for(const y of[-1.69,1.69]){const hinge=mesh(base,new THREE.CylinderGeometry(.054,.054,.39,16),edge,-1.91,y,.115);hinge.rotation.z=0;ring(base,.047,.008,bright,-1.91,y+.15,.16)}
 const pivot=new THREE.Group();pivot.position.set(-1.91,0,.11);root.add(pivot);const lid=new THREE.Group();lid.position.x=2.16;pivot.add(lid);
 const lidGlass=glass.clone();lidGlass.opacity=.018;box(lid,4.34,4.29,.022,lidGlass,0,0,.022);frame(lid,4.37,4.33,.008,edge,.03);frame(lid,4.25,4.20,.037,dim,.018);
 const lidSignal=createLidSignal(lid,scene,signal,reduced);
 for(const y of[-1.93,1.93]){box(lid,.40,.036,.050,edge,-1.68,y,.055);box(lid,.34,.032,.05,edge,1.68,y,.055)}
 for(const y of[-.63,.63])box(lid,.085,.29,.065,glass,2.16,y,.045);
 // Thin diagonal surface reflection instead of a cloudy overlay across the cover.
 const shineCanvas=document.createElement('canvas');shineCanvas.width=256;shineCanvas.height=256;const sc=shineCanvas.getContext('2d');const grad=sc.createLinearGradient(0,256,256,0);grad.addColorStop(0,'#ffffff00');grad.addColorStop(.45,'#ffffff00');grad.addColorStop(.50,'#ffffff0b');grad.addColorStop(.53,'#ffffff22');grad.addColorStop(.56,'#ffffff00');grad.addColorStop(1,'#ffffff00');sc.fillStyle=grad;sc.fillRect(0,0,256,256);mesh(lid,new THREE.PlaneGeometry(4.27,4.21),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shineCanvas),transparent:true,depthWrite:false,side:THREE.DoubleSide}),0,0,.061);
 batchMeshes(base);batchMeshes(disc);batchMeshes(lid);
 const pointer=new THREE.Vector2();host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5)});host.addEventListener('pointerleave',()=>pointer.set(0,0));
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=14;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(host);resize();
 // Fit the complete hinged object into its own layout region, including tall windows.
 const bounds=new THREE.Box3(),size=new THREE.Vector3(),center=new THREE.Vector3();
 const baseBounds=new THREE.Box3().setFromObject(base),lidBounds=new THREE.Box3().setFromObject(lid);
 const corners=box=>Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z));
 const baseCorners=corners(baseBounds),lidCorners=corners(lidBounds).map(p=>p.sub(pivot.position)),point=new THREE.Vector3(),hingeRotation=new THREE.Matrix4();
 const layout={width:host.clientWidth,height:host.clientHeight},poses=[];
 // Compute only the two resting poses on resize. A moving bounding box would
 // change scale around the edge-on hinge angle and make the opening seem to catch.
 function layoutPoses(){
  const w=layout.width,h=layout.height,stacked=w<=900;
  const fullHeight=2*camera.position.z*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),pxToWorld=fullHeight/h;
  for(let p=0;p<=1;p++){
   bounds.makeEmpty();hingeRotation.makeRotationY(-p*Math.PI*.95);
   for(const v of baseCorners)bounds.expandByPoint(v);
   for(const v of lidCorners)bounds.expandByPoint(point.copy(v).applyMatrix4(hingeRotation).add(pivot.position));
   bounds.getSize(size);bounds.getCenter(center);
   const boxW=(p?(stacked?w*.86:w*.52):Math.min(w*.68,590))*pxToWorld,boxH=h*(p?.65:.73)*pxToWorld,z=camera.position.z;
   const scale=.95*Math.min(boxW*z/(size.x*z+boxW*size.z/2),boxH*z/(size.y*z+boxH*size.z/2));
   poses[p]={scale,position:new THREE.Vector3(((p&&!stacked?.315:.5)-.5)*w*pxToWorld-center.x*scale,.045*h*pxToWorld-center.y*scale,-center.z*scale)};
  }
 }
 new ResizeObserver(()=>{layout.width=host.clientWidth;layout.height=host.clientHeight;layoutPoses()}).observe(host);layoutPoses();
 let frameCount=0,frameTotal=0,slowFrames=0;
 function smooth(t){return t*t*t*(t*(t*6-15)+10)}let last=0;
 function animate(now){
  requestAnimationFrame(animate);if(document.hidden)return;
  const elapsed=last?now-last:16.67,dt=Math.min(.05,elapsed/1000);last=now;frameCount++;frameTotal+=elapsed;if(elapsed>34)slowFrames++;
  const t=reduced?1:Math.min(1,(now-start)/1950);progress=from+(target-from)*smooth(t);
  pivot.rotation.y=-progress*Math.PI*.95;
  root.rotation.x+=((.035+(reduced?0:pointer.y*.07))-root.rotation.x)*Math.min(1,dt*4);
  root.rotation.y+=((-.08+(reduced?0:pointer.x*.12))-root.rotation.y)*Math.min(1,dt*4);
  root.rotation.z=-.025;root.scale.setScalar(THREE.MathUtils.lerp(poses[0].scale,poses[1].scale,progress));root.position.lerpVectors(poses[0].position,poses[1].position,progress);
  reflection.uniforms.angle.value=.78+root.rotation.y*2.6-root.rotation.x*1.5;
  const energy=lidSignal.update(dt,progress);
  renderer.render(scene,camera);
  if(now-(animate.reported||0)>500){host.dataset.openProgress=progress.toFixed(3);host.dataset.signalLevel=energy.toFixed(3);host.dataset.drawCalls=String(renderer.info.render.calls);host.dataset.fps=(frameCount*1000/frameTotal).toFixed(1);host.dataset.slowFrames=String(slowFrames);frameCount=0;frameTotal=0;slowFrames=0;animate.reported=now}
 }requestAnimationFrame(animate);
}
