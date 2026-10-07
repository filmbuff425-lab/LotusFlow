import {mountRecordingContext} from './recognition.js?v=20261006-lake-surface1';
import * as THREE from 'three';
import {createArtRecord} from './record-design.js?v=20261006-lake-surface1';
import {createRecordSpace} from './record-space.js?v=20261006-lake-surface1';
import { stepRecords } from './record-physics.js?v=20261006-lake-surface1';
if(!window.lotusPortfolio)await new Promise(resolve=>window.addEventListener('lotus-portfolio-ready',resolve,{once:true}));
const api=window.lotusPortfolio,host=document.getElementById('vinyl-viewport'),section=document.getElementById('work');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let filter=document.querySelector('[data-filter][aria-pressed="true"]')?.dataset.filter||'all';
let items=api.tracks.filter(t=>filter==='all'||t.categories.includes(filter)),index=0,captionId=items[0].id,centerRecord=()=>{},setFilter=()=>{};
const recordingContext=document.createElement('div');document.querySelector('#vinyl-caption').after(recordingContext);
function caption(id){const t=api.tracks.find(t=>t.id===id);if(!t)return;captionId=id;mountRecordingContext(recordingContext,t);document.getElementById('vinyl-title').textContent=t.title;document.getElementById('vinyl-artist').textContent=`${t.artist} · ${t.year}`;document.getElementById('vinyl-credit').textContent=t.role;document.getElementById('vinyl-index').textContent=String(items.findIndex(t=>t.id===id)+1).padStart(2,'0');document.getElementById('vinyl-total').textContent=String(items.length).padStart(2,'0');document.getElementById('vinyl-open').setAttribute('aria-label',`Open ${t.title} and play`)}
function select(next){index=(next+items.length)%items.length;caption(items[index].id);centerRecord(items[index].id)}
for(const [id,delta]of[['vinyl-prev',-1],['vinyl-next',1]])document.getElementById(id).addEventListener('click',()=>select(index+delta));
document.getElementById('vinyl-open').addEventListener('click',e=>api.openTrack(captionId,e.currentTarget));
window.addEventListener('lotus-filter-change',e=>{filter=e.detail;items=api.tracks.filter(t=>filter==='all'||t.categories.includes(filter));index=0;setFilter();select(0)});
try{setup()}catch(error){fallback();console.warn('Vinyl room unavailable:',error.message)}
function fallback(){api.setView('gallery');const b=document.querySelector('[data-view="vinyl"]');b.disabled=true;b.title='The vinyl view needs WebGL. Use Grid or List to explore every release.'}
function setup(){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 const scene=new THREE.Scene(),space=createRecordSpace(scene),gallery=new THREE.Group();scene.add(gallery);space.setOpacity(0);const camera=new THREE.OrthographicCamera(-9,9,3.5,-3.5,.1,100);camera.position.set(0,0,22);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Vinyl record room. Move against a record to nudge it, drag a record to move it, or drag the background to browse releases. Arrow keys select; Enter opens the album and plays the song.');host.append(canvas);
 scene.add(new THREE.AmbientLight(0xffffff,1.15));const light=new THREE.DirectionalLight(0xffffff,1.8);light.position.set(-4,6,12);scene.add(light);const rim=new THREE.DirectionalLight(0xe5eaff,2);rim.position.set(5,-3,8);scene.add(rim);
 const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const eg=envCanvas.getContext('2d');eg.fillStyle='#222';eg.fillRect(0,0,1024,512);eg.fillStyle='#fff';eg.fillRect(70,30,145,410);eg.fillRect(430,0,80,512);eg.fillRect(790,80,200,130);eg.fillStyle='#ddd';eg.fillRect(590,180,100,260);const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.colorSpace=THREE.SRGBColorSpace;envTexture.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(envTexture);scene.environment=environment.texture;envTexture.dispose();pmrem.dispose();
 const bodies=[],records=[],hitMeshes=[];
 api.tracks.forEach((track,i)=>{
  const group=new THREE.Group();gallery.add(group);const spinning=new THREE.Group();group.add(spinning);
  const art=createArtRecord({image:track.image,id:({bridge:'great-bridge',summer:'over-the-summer',adult:'imperfect-adult',lov:'1-of-lov',runaway:'runaway-bride',only:'only-you'}[track.id]||track.id),index:i,radius:2.04,glass:true});spinning.add(art.group);
  for(const face of [art.front,art.back]){face.userData.record=i;hitMeshes.push(face)}
  const body={x:(i-index)*4.55,y:0,homeX:(i-index)*4.55,homeY:0,vx:0,vy:0,spin:0,angle:(i%3-1)*.19,radius:2,active:true,cooldown:0};bodies.push(body);records.push({track,group,spinning,body,art,hoverLight:0,scale:1,targetScale:1,relative:0,yaw:0,pitch:0,targetYaw:0,targetPitch:0});
 });
 host.dataset.materialEditions=records.map(r=>r.track.id+':'+r.art.group.userData.materialEdition).join('|');host.dataset.opticalFinishes=records.map(r=>r.track.id+':'+r.art.group.userData.opticalFinish).join('|');
 let orbitMode=false,orbitYaw=0,orbitPitch=0;
 let transitioning=false,visible=false,view=document.querySelector('[data-view][aria-pressed="true"]')?.dataset.view||'vinyl',last=0,width=1,height=1,hover=-1,drag=null,worldWidth=18,worldHeight=8.2,offset=0,dragStartOffset=0,dragOriginX=0;
 const pointer={x:0,y:0,vx:0,vy:0,active:false,time:0},ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),world=new THREE.Vector3();
 let pinned=-1;
 const info=document.createElement('aside');info.className='glass-record-info';info.hidden=true;info.setAttribute('aria-live','polite');
 info.innerHTML='<span class="mono info-kicker">SELECTED FREQUENCY</span><h3></h3><p class="info-artist"></p><dl><dt>YEAR</dt><dd class="info-year"></dd><dt>LOTUS FLOW</dt><dd class="info-role"></dd></dl><div class="info-expanded" hidden><p class="info-credits"></p><a target="_blank" rel="noopener noreferrer">LISTEN / VIEW RELEASE ↗</a><button type="button" aria-label="Close record details">CLOSE −</button></div>';
 document.getElementById('vinyl-room').append(info);
 function showInfo(i,expanded=false){const t=records[i]?.track;if(!t)return;info.hidden=false;info.classList.toggle('is-expanded',expanded);info.querySelector('h3').textContent=t.title;info.querySelector('.info-artist').textContent=t.artist;info.querySelector('.info-year').textContent=t.year;info.querySelector('.info-role').textContent=t.role;info.querySelector('.info-credits').textContent=t.credits;info.querySelector('a').href=t.url;info.querySelector('.info-expanded').hidden=!expanded;if(expanded){pinned=i;ripple(i,bodies[i].x,bodies[i].y,.75);}}
 info.querySelector('button').addEventListener('click',()=>{pinned=-1;info.hidden=true;canvas.focus()});
 function openInfo(i){caption(records[i].track.id);api.openTrack(records[i].track.id,canvas);}
 let impactCount=0;function ripple(){impactCount++}
 // A field of open oscilloscope traces spans the whole room behind every record.
 const waveLines=[],waveCount=13,waveSamples=320;
 for(let j=0;j<waveCount;j++){const geometry=new THREE.BufferGeometry(),array=new Float32Array(waveSamples*3);geometry.setAttribute('position',new THREE.BufferAttribute(array,3));const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:j%3===1?0xf4bdc6:0xca7383,transparent:true,opacity:0,depthWrite:false}));line.position.z=-3;line.frustumCulled=false;scene.add(line);waveLines.push({line,array,j})}
 let wavePresence=0;
 const dustGeometry=new THREE.BufferGeometry(),dustPositions=[];for(let i=0;i<3200;i++){const r=n=>{const x=Math.sin(n*77.1)*43758.54;return x-Math.floor(x)};dustPositions.push((r(i)-.5)*75,(r(i+17)-.5)*17,-11+r(i+33)*17)}dustGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xd1a6a0,size:.038,transparent:true,opacity:.14,depthWrite:false,blending:THREE.AdditiveBlending}));gallery.add(dust);
 function anchors(){const active=records.filter(r=>items.some(t=>t.id===r.track.id)),n=active.length;
  active.forEach((r,k)=>{let relative=k-index;if(relative>n/2)relative-=n;if(relative< -n/2)relative+=n;r.relative=relative;r.targetScale=Math.max(.77,1.10-Math.abs(relative)*.11);r.body.radius=2.04*r.targetScale;const homeX=relative*4.55+offset;if(n>5&&Math.abs(homeX-r.body.homeX)>n*4.55*.5){r.body.x=homeX;r.body.vx=0}r.body.homeX=homeX;r.body.homeY=THREE.MathUtils.clamp(relative*.64,-1.7,1.7)+.03;});
 }
 centerRecord=()=>{offset=0;anchors()};setFilter=()=>{pinned=-1;info.hidden=true;records.forEach(r=>{r.body.active=items.some(t=>t.id===r.track.id);r.body.vx=r.body.vy=0;r.group.visible=r.body.active});anchors()};setFilter();records.forEach(r=>{r.body.x=r.body.homeX;r.body.y=r.body.homeY});
 function resize(){width=host.clientWidth;height=host.clientHeight;if(!width||!height)return;worldHeight=8.2*height/(document.getElementById('vinyl-room').clientHeight+140);worldWidth=worldHeight*width/height;camera.left=-worldWidth/2;camera.right=worldWidth/2;camera.top=worldHeight/2;camera.bottom=-worldHeight/2;camera.updateProjectionMatrix();renderer.setSize(width,height)}new ResizeObserver(resize).observe(host);resize();
 function point(e){const b=canvas.getBoundingClientRect();ndc.set((e.clientX-b.left)/width*2-1,-(e.clientY-b.top)/height*2+1);world.set(ndc.x,ndc.y,0).unproject(camera);return world}
 function hit(){ray.setFromCamera(ndc,camera);return ray.intersectObjects(hitMeshes.filter(m=>bodies[m.userData.record].active),false)[0]?.object.userData.record??-1}
 canvas.addEventListener('pointermove',e=>{const p=point(e),now=performance.now(),dt=Math.max(.012,(now-pointer.time)/1000);pointer.vx=THREE.MathUtils.lerp(pointer.vx,THREE.MathUtils.clamp((p.x-pointer.x)/dt,-12,12),.35);pointer.vy=THREE.MathUtils.lerp(pointer.vy,THREE.MathUtils.clamp((p.y-pointer.y)/dt,-12,12),.35);pointer.x=p.x;pointer.y=p.y;pointer.time=now;pointer.active=!reduced&&!orbitMode;
  if(drag){if(orbitMode){const dx=(e.clientX-drag.lastX)*.009,dy=(e.clientY-drag.lastY)*.009;drag.lastX=e.clientX;drag.lastY=e.clientY;drag.distance+=(Math.abs(dx)+Math.abs(dy))/.009;if(drag.record>=0){records[drag.record].targetYaw+=dx;records[drag.record].targetPitch+=dy}else{orbitYaw+=dx;orbitPitch+=dy}return}drag.distance+=Math.hypot(e.movementX||0,e.movementY||0);if(drag.record>=0){const b=bodies[drag.record];if(!reduced){b.x=p.x+drag.dx;b.y=p.y+drag.dy;b.vx=pointer.vx*.35;b.vy=pointer.vy*.35;b.spin=pointer.vx*.07}}else{offset=dragStartOffset+(p.x-dragOriginX);anchors()};return}
  const next=hit();if(next!==hover){hover=next;window.lotusReleasePlayer?.preview(hover>=0?records[hover].track.id:null);if(hover>=0){caption(records[hover].track.id);if(pinned<0)showInfo(hover);ripple(hover,bodies[hover].x,bodies[hover].y,.5)}else {caption(items[index].id);if(pinned<0)info.hidden=true}}
 });
 canvas.addEventListener('pointerleave',()=>{window.lotusReleasePlayer?.preview(null);if(!drag){pointer.active=false;hover=-1;if(pinned<0)info.hidden=true;caption(items[index].id)}});
 canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const p=point(e),record=hit();drag={record,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,distance:0,dx:record>=0?bodies[record].x-p.x:0,dy:record>=0?bodies[record].y-p.y:0};window.lotusReleasePlayer?.preview(record>=0?records[record].track.id:null,{gesture:record>=0});dragStartOffset=offset;dragOriginX=p.x;pointer.active=false;canvas.setPointerCapture(e.pointerId);if(record>=0)caption(records[record].track.id)});
 canvas.addEventListener('pointerup',e=>{if(!drag)return;const was=drag,moved=Math.hypot(e.clientX-was.startX,e.clientY-was.startY)>7||was.distance>10;drag=null;pointer.active=false;if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  if(orbitMode){if(was.record>=0&&!moved)openInfo(was.record);return}
  if(was.record>=0){if(!moved)openInfo(was.record);else{ripple(was.record,bodies[was.record].x,bodies[was.record].y,1);if(Math.abs(bodies[was.record].x)>worldWidth*.48)select(index+(bodies[was.record].x<0?1:-1))}}
  else{const delta=offset-dragStartOffset;if(Math.abs(delta)>.85)select(index+(delta<0?1:-1));else{offset=0;anchors()}}
 });
 document.getElementById('vinyl-reset-view').addEventListener('click',()=>{offset=0;anchors();records.forEach(r=>{r.body.x=r.body.homeX;r.body.y=r.body.homeY;r.body.vx=r.body.vy=r.body.spin=0})});
 canvas.addEventListener('pointercancel',()=>{drag=null;pointer.active=false;offset=0;anchors()});
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Enter',' '].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')select(index-1);else if(e.key==='ArrowRight')select(index+1);else openInfo(records.findIndex(r=>r.track.id===captionId))});
 let wheelAt=0;canvas.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)<Math.abs(e.deltaY)||Math.abs(e.deltaX)<5)return;e.preventDefault();if(performance.now()-wheelAt>900){select(index+(e.deltaX>0?1:-1));wheelAt=performance.now()}},{passive:false});
 window.addEventListener('lotus-view-change',e=>{view=e.detail;if(view==='vinyl')resize();document.body.classList.toggle('at-records',view==='vinyl'&&visible)});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;document.body.classList.toggle('at-records',visible&&view==='vinyl')},{threshold:.25}).observe(document.getElementById('vinyl-room'));
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;fallback()});
 host.dataset.materialEdition='optical-pressing';host.dataset.recordCount=String(records.length);document.getElementById('vinyl-loading').remove();caption(items[0].id);
 function animate(now){requestAnimationFrame(animate);if(!visible||view!=='vinyl'||document.hidden||transitioning){last=now;return}const dt=Math.min(.035,(now-last)/1000||.016);last=now;
  if(pointer.time&&now-pointer.time>90){pointer.vx*=Math.exp(-5*dt);pointer.vy*=Math.exp(-5*dt)}
  gallery.rotation.x+=(orbitPitch-gallery.rotation.x)*(1-Math.exp(-9*dt));gallery.rotation.y+=(orbitYaw-gallery.rotation.y)*(1-Math.exp(-9*dt));
  records.forEach(r=>{r.body.radius=2.045*Math.max(r.scale,r.targetScale);r.hoverLight+=(((records.indexOf(r)===hover||records.indexOf(r)===pinned)?1:0)-r.hoverLight)*(1-Math.exp(-4*dt));r.art.updateHover(r.hoverLight)});
  stepRecords(bodies,dt,{pointer,dragged:orbitMode?-1:drag?.record??-1,reduced,onImpact:ripple});
  records.forEach((r,i)=>{const b=r.body;if(!b.active)return;r.scale+=(r.targetScale-r.scale)*(1-Math.exp(-3.2*dt));r.group.scale.setScalar(r.scale);r.group.position.set(b.x,b.y,-Math.abs(r.relative)*.18);const tilt=reduced?0:Math.sin(now*.00022+i)*.022;r.yaw+=(r.targetYaw-r.yaw)*(1-Math.exp(-9*dt));r.pitch+=(r.targetPitch-r.pitch)*(1-Math.exp(-9*dt));r.group.rotation.x=.12+tilt+b.vy*.005;r.group.rotation.y=-.23+b.vx*.005;r.group.rotation.z=tilt*.5;r.spinning.rotation.z=b.angle+(reduced?0:Math.sin(now*.000075+i)*.025);r.art.updateLight(1.36-r.spinning.rotation.z+r.group.rotation.y*2.6-r.group.rotation.x*1.5)});
  const signal=window.lotusReleasePlayer?.getSignal(),signalColor=records.find(r=>r.track.id===signal?.id)?.art.design.signalColor;
  wavePresence+=((signal?.playing&&!reduced?1:0)-wavePresence)*(1-Math.exp(-dt*5));
  section.dataset.signalLevel=String(Math.round((signal?.level||0)*1000));
  waveLines.forEach(({line,array,j})=>{if(signalColor)line.material.color.lerp(signalColor,1-Math.exp(-dt*3));line.visible=wavePresence>.005;if(!line.visible)return;
   const level=signal?.level||0;line.material.opacity=wavePresence*Math.min(.42,.17+level*3.2)*(j%3===1?1:.68);
   for(let k=0;k<waveSamples;k++){const v=signal?.samples[(k+j*23)%512]||0,band=(signal?.spectrum[(k+j*7)%256]||0)/255,u=k/(waveSamples-1);array[k*3]=(j/(waveCount-1)-.5)*(worldWidth+4)+Math.sin(u*2.8+j*.73)*.85+(u-.5)*(j%3-1)*1.4+v*Math.min(8,Math.max(2,.12/Math.max(level,.008)))*(.72+band*.55);array[k*3+1]=(u-.5)*(worldHeight+5);array[k*3+2]=0;}line.geometry.attributes.position.needsUpdate=true;
  });
  dust.rotation.z=reduced?0:Math.sin(now*.000025)*.045;dust.position.x=reduced?0:Math.sin(now*.00008)*.22;space.update(reduced?0:now*.001,0,width/height);renderer.render(scene,camera);
 }
 window.addEventListener('lotus-journey-frame',e=>{const a=e.detail.arrival;gallery.scale.setScalar(.87+.13*a);gallery.position.z=(1-a)*-2;canvas.style.opacity='1'});window.addEventListener('lotus-enter-collection',()=>{gallery.scale.setScalar(1);gallery.position.z=0;canvas.style.opacity=''});requestAnimationFrame(animate);window.lotusVinyl={renderer,scene,camera,records,bodies,select,beginEntrance(){orbitYaw=orbitPitch=0;gallery.rotation.set(0,0,0);records.forEach(r=>{r.yaw=r.pitch=r.targetYaw=r.targetPitch=0});transitioning=true;pointer.active=false;hover=-1;drag=null;records.forEach(r=>{r.body.vx=r.body.vy=r.body.spin=0;r.body.x=r.body.homeX;r.body.y=r.body.homeY;r.scale=r.targetScale;r.group.scale.setScalar(r.scale);r.group.position.set(r.body.x,r.body.y,-Math.abs(r.relative)*.18);r.group.rotation.set(.12,-.23,0)});resize()},endEntrance(){transitioning=false;last=performance.now();space.update(last*.001,0,width/height);renderer.render(scene,camera)},get selected(){return items[index].id},get impacts(){return impactCount},get filter(){return filter}};
}
