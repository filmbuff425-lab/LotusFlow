import {mountRecordingContext} from './recognition.js?v=20261006-lake-surface1';
import * as THREE from 'three';

// A dedicated, independently playing film screen; the desk retains its listening UI.
export function createMVWall({parent,texture,wallX}) {
 const films=window.lotusFilms,firstFilm=Math.max(0,films.findIndex(film=>film.id==='show-me-love'));
 const group=new THREE.Group();group.name='Left wall / official music video screen';group.position.set(wallX,21.0,2.0);group.rotation.y=Math.PI/2;group.scale.setScalar(1.49);group.userData.dynamic=true;parent.add(group);
 const add=(geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m};
 const black=new THREE.MeshStandardMaterial({color:0x05090c,metalness:.05,roughness:.3}),chrome=new THREE.MeshStandardMaterial({color:0xaab9c4,metalness:.92,roughness:.21});
 // The video floats within a cut-glass panel, with no opaque metal bezel.
 // Keep the clear border open at the centre so it cannot soften the MV.
 add(new THREE.BoxGeometry(17.04,9.64,.028),black,0,0,.115);
 function panelPoints(w,h,c){return[[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]]}
 function panelShape(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
 const outer=panelPoints(19.12,11.72,.42),inner=panelPoints(17.24,9.84,.07);
 const frameShape=panelShape(outer);frameShape.holes.push(panelShape(inner));
 const frameGeometry=new THREE.ExtrudeGeometry(frameShape,{depth:.075,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1});frameGeometry.translate(0,0,-.0375);
 const opticalGlass=new THREE.MeshPhysicalMaterial({color:0xf5fdff,metalness:0,roughness:.035,transmission:.985,thickness:.09,ior:1.45,attenuationColor:0xd6f8ff,attenuationDistance:18,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:.8});
 opticalGlass.userData.preserveTransmission=true;
 const surround=add(frameGeometry,opticalGlass,0,0,.066);surround.name='Floating cut-glass MV panel / open centre';
 surround.userData.material='Optical glass / chamfered cold-light edge';
 const rimGeometry=new THREE.BufferGeometry().setFromPoints(outer.map(([x,y])=>new THREE.Vector3(x,y,.125)));
 const rim=new THREE.LineLoop(rimGeometry,new THREE.LineBasicMaterial({color:0xc5eefa,transparent:true,opacity:.30,depthWrite:false,toneMapped:false}));group.add(rim);
 // Four short facet highlights give the perimeter definition without a neon ring.
 const facets=[];for(const i of[1,3,5,7]){facets.push(new THREE.Vector3(...outer[i],.13),new THREE.Vector3(...outer[(i+1)%8],.13))}
 const accents=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(facets),new THREE.LineBasicMaterial({color:0xe3faff,transparent:true,opacity:.76,depthWrite:false,toneMapped:false}));group.add(accents);
 // A short VESA mount holds the display flush against the left side wall.
 add(new THREE.BoxGeometry(2.8,2.2,.07),chrome,0,0,-.098);
 add(new THREE.BoxGeometry(.55,.55,.14),chrome,0,0,-.20);
 add(new THREE.BoxGeometry(2.6,2.2,.07),chrome,0,0,-.305);
 const video=document.createElement('video');video.id='studio-wall-mv';video.playsInline=true;video.muted=true;video.preload='none';video.className='studio-video-source';video.tabIndex=-1;video.setAttribute('aria-hidden','true');document.querySelector('#studio').append(video);
 const filmTexture=new THREE.VideoTexture(video);filmTexture.colorSpace=THREE.SRGBColorSpace;filmTexture.generateMipmaps=false;filmTexture.minFilter=THREE.LinearFilter;filmTexture.magFilter=THREE.LinearFilter;
 const posters=[];function poster(i){if(posters[i])return posters[i];const f=films[i];
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const g=canvas.getContext('2d');g.fillStyle='#080b10';g.fillRect(0,0,1024,576);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const image=new Image();image.onload=()=>{const scale=Math.min(1024/image.width,576/image.height),w=image.width*scale,h=image.height*scale;g.drawImage(image,(1024-w)/2,(576-h)/2,w,h);map.needsUpdate=true};image.src=f.cover;posters[i]=map;return map;
 }
 const material=new THREE.MeshBasicMaterial({map:poster(firstFilm),toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const screen=add(new THREE.PlaneGeometry(16.88,9.495),material,0,0,.145);
 screen.userData={action:'mv-wall',label:'MUSIC VIDEOS / OPEN FILM CONTROLS'};
 const badge=texture(512,32,g=>{g.clearRect(0,0,512,32);g.fillStyle='#bedbe5';g.font='500 12px LotusInterface,Arial,sans-serif';g.fillText('LOTUS FLOW / MUSIC VIDEOS',20,22)});
 add(new THREE.PlaneGeometry(6.4,.4),new THREE.MeshBasicMaterial({map:badge,toneMapped:false,transparent:true,opacity:.65,depthWrite:false}),0,-5.39,.15);
 const indicator=add(new THREE.SphereGeometry(.023,8,6),new THREE.MeshBasicMaterial({color:0xb8edff,toneMapped:false}),8.91,-5.38,.151);
 const panel=document.createElement('details');panel.className='studio-wall-films';panel.hidden=true;panel.innerHTML='<summary>MUSIC VIDEOS / LEFT SCREEN</summary><div class="studio-wall-film-controls"><label for="studio-wall-film">OFFICIAL MV</label><select id="studio-wall-film"></select><button type="button" id="studio-wall-play">PAUSE</button><button type="button" id="studio-wall-sound" aria-pressed="false">SOUND OFF</button><a id="studio-wall-credit">PROJECT DETAILS ↗</a><p class="mono" id="studio-wall-status" role="status"></p></div>';
 const selector=panel.querySelector('select');films.forEach(f=>{const option=document.createElement('option');option.value=f.id;option.textContent=f.title+' / '+f.artist;selector.append(option)});
 document.querySelector('#studio-stage').after(panel);
 const recordingContext=document.createElement('div');panel.querySelector('.studio-wall-film-controls').append(recordingContext);let contextId='';
 let index=firstFilm,room=false,onScreen=false,wanted=true,request=0,ready=false;
 const playButton=panel.querySelector('#studio-wall-play'),soundButton=panel.querySelector('#studio-wall-sound'),status=panel.querySelector('#studio-wall-status');
 function sync(){const film=films[index];if(contextId!==film.id){mountRecordingContext(recordingContext,film);contextId=film.id}selector.value=film.id;playButton.textContent=video.paused?'PLAY':'PAUSE';soundButton.textContent=video.muted?'SOUND OFF':'SOUND ON';soundButton.setAttribute('aria-pressed',String(!video.muted));panel.querySelector('a').href='works/'+film.id+'.html';video.dataset.currentTrack=film.id;video.dataset.playing=String(!video.paused);indicator.visible=!video.paused;}
 async function play(){const token=++request;if(!room||!onScreen||document.hidden)return;if(!video.muted)window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'studio-wall-mv'}));try{await video.play();if(token===request)status.textContent=films[index].title+' / '+films[index].kind}catch(e){if(token===request&&e.name!=='AbortError')status.textContent='Press PLAY to start the music video.'}sync()}
 function pause(){request++;video.pause();sync()}
 function choose(id){const next=films.findIndex(f=>f.id===id);if(next<0)return;pause();index=next;ready=false;material.map=poster(index);material.needsUpdate=true;video.src=films[index].src;wanted=true;status.textContent=films[index].title+' / '+films[index].kind;sync();play()}
 selector.addEventListener('change',e=>choose(e.target.value));playButton.addEventListener('click',()=>{wanted=video.paused;if(wanted)play();else pause()});soundButton.addEventListener('click',()=>{video.muted=!video.muted;if(!video.muted){window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'studio-wall-mv'}));wanted=true;play()}sync()});
 ['play','pause','volumechange'].forEach(e=>video.addEventListener(e,sync));video.addEventListener('loadeddata',()=>{ready=true;sync()});video.addEventListener('ended',()=>choose(films[(index+1)%films.length].id));video.addEventListener('error',()=>{status.textContent='Video unavailable. Open PROJECT DETAILS for the official release.';material.map=poster(index);material.needsUpdate=true;sync()});
 window.addEventListener('lotus-room-change',e=>{room=e.detail;panel.hidden=!room;if(room&&wanted)play();else{panel.open=false;pause()}});
 window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='studio-wall-mv'&&!video.muted){video.muted=true;sync()}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(wanted)play()});
 new IntersectionObserver(([e])=>{onScreen=e.isIntersecting;if(onScreen&&wanted)play();else pause()}).observe(document.querySelector('#studio-stage'));
 video.src=films[index].src;sync();
 function update(){if(ready&&video.readyState>=2&&material.map!==filmTexture){material.map=filmTexture;material.needsUpdate=true;}}
 function open(){panel.open=true;panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});selector.focus({preventScroll:true});}
 return{group,targets:[screen],update,open};
}
