import {mountRecordingContext} from './recognition.js?v=20261006-lake-surface1';
import * as THREE from 'three';
import {handheld} from './device-profile.js';

// A dedicated, independently playing film screen; the desk retains its listening UI.
export function createMVWall({parent,texture,wallX}) {
 const films=window.lotusFilms,firstFilm=Math.max(0,films.findIndex(film=>film.id==='show-me-love'));
 const group=new THREE.Group();group.name='Right wall / large premium glass television';group.position.set(wallX-.50,19.6,-4.0);group.rotation.y=-Math.PI/2;group.scale.setScalar(1.49*.95);group.userData.dynamic=true;parent.add(group);
 const add=(geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m};
 // Keep the giant picture size, with a slim, solid television chassis.
 const screenWidth=27.8,screenHeight=screenWidth*9/16;
 const graphite=new THREE.MeshStandardMaterial({color:0x111418,metalness:.60,roughness:.38});
 const metalEdge=new THREE.MeshPhysicalMaterial({color:0x15191f,metalness:.68,roughness:.32,clearcoat:.28,clearcoatRoughness:.20});
 const blackGlass=new THREE.MeshPhysicalMaterial({color:0x050709,metalness:.05,roughness:.22,clearcoat:.26,clearcoatRoughness:.18,specularIntensity:.35});
 const housing=add(new THREE.BoxGeometry(screenWidth+.28,screenHeight+.28,.34),graphite,0,0,-.06);housing.name='Thin graphite television housing';housing.castShadow=true;
 function roundedPanel(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s}
 const face=roundedPanel(screenWidth+.32,screenHeight+.32,.09);face.holes.push(roundedPanel(screenWidth+.018,screenHeight+.018,.01));
 const edgeGeometry=new THREE.ExtrudeGeometry(face,{depth:.14,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:2,curveSegments:4,steps:1});edgeGeometry.translate(0,0,-.07);
 const bezel=add(edgeGeometry,[blackGlass,metalEdge],0,0,.17);bezel.name='Narrow black glass face and graphite metal chamfer';
 // A short wall standoff, visible from the side without adding a large surround.
 const mount=add(new THREE.BoxGeometry(5.6,3.2,.42),graphite,0,0,-.44);mount.name='Recessed television wall mount';mount.castShadow=true;
 const screenLight=new THREE.PointLight(0xc3d5e6,0,34,2);screenLight.name='Soft television light on nearby equipment';screenLight.position.set(0,-4,4);group.add(screenLight);
 const video=document.createElement('video');video.id='studio-wall-mv';video.playsInline=true;video.muted=true;video.preload='none';video.className='studio-video-source';video.tabIndex=-1;video.setAttribute('aria-hidden','true');document.querySelector('#studio').append(video);
 const filmTexture=new THREE.VideoTexture(video);filmTexture.colorSpace=THREE.SRGBColorSpace;filmTexture.generateMipmaps=false;filmTexture.minFilter=THREE.LinearFilter;filmTexture.magFilter=THREE.LinearFilter;
 const posters=[];function poster(i){if(posters[i])return posters[i];const f=films[i];
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const g=canvas.getContext('2d');g.fillStyle='#080b10';g.fillRect(0,0,1024,576);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const image=new Image();image.onload=()=>{const scale=Math.min(1024/image.width,576/image.height),w=image.width*scale,h=image.height*scale;g.drawImage(image,(1024-w)/2,(576-h)/2,w,h);map.needsUpdate=true};image.src=f.cover;posters[i]=map;return map;
 }
 // Opaque picture restores deep blacks and crisp colour without projection haze.
 const material=new THREE.MeshBasicMaterial({map:poster(firstFilm),toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const screen=add(new THREE.PlaneGeometry(screenWidth,screenHeight),material,0,0,.25);
 screen.userData={action:'mv-wall',label:'MUSIC VIDEOS / OPEN FILM CONTROLS'};
 const panel=document.createElement('details');panel.className='studio-wall-films';panel.hidden=true;panel.innerHTML='<summary>MUSIC VIDEOS / RIGHT SCREEN</summary><div class="studio-wall-film-controls"><label for="studio-wall-film">OFFICIAL MV</label><select id="studio-wall-film"></select><button type="button" id="studio-wall-play">PAUSE</button><button type="button" id="studio-wall-sound" aria-pressed="false">SOUND OFF</button><a id="studio-wall-credit">PROJECT DETAILS ↗</a><p class="mono" id="studio-wall-status" role="status"></p></div>';
 const selector=panel.querySelector('select');films.forEach(f=>{const option=document.createElement('option');option.value=f.id;option.textContent=f.title+' / '+f.artist;selector.append(option)});
 document.querySelector('#studio-stage').after(panel);
 const recordingContext=document.createElement('div');panel.querySelector('.studio-wall-film-controls').append(recordingContext);let contextId='';
 let index=firstFilm,room=false,onScreen=false,wanted=true,request=0,ready=false;
 const playButton=panel.querySelector('#studio-wall-play'),soundButton=panel.querySelector('#studio-wall-sound'),status=panel.querySelector('#studio-wall-status');
 function sync(){const film=films[index];if(contextId!==film.id){mountRecordingContext(recordingContext,film);contextId=film.id}selector.value=film.id;playButton.textContent=video.paused?'PLAY':'PAUSE';soundButton.textContent=video.muted?'SOUND OFF':'SOUND ON';soundButton.setAttribute('aria-pressed',String(!video.muted));panel.querySelector('a').href='works/'+film.id+'.html';video.dataset.currentTrack=film.id;video.dataset.playing=String(!video.paused);}
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
 // Average a tiny image at most twice a second. Smooth the result so cuts in the
 // MV do not flash the room, and never add another shadow or reflection pass.
 const lightCanvas=document.createElement('canvas');lightCanvas.width=8;lightCanvas.height=4;
 const lightContext=lightCanvas.getContext('2d',{willReadFrequently:true});
 const neutralLight=new THREE.Color(0xc3d5e6),lightColour=neutralLight.clone(),sampleColour=new THREE.Color();
 let lightSampleAt=0,lightUpdateAt=0,lightVideoTime=-1,lightIntensity=lightContext?0:12,canSample=Boolean(lightContext);
 function update(now){
  if(ready&&video.readyState>=2&&material.map!==filmTexture){material.map=filmTexture;material.needsUpdate=true;}
  const active=room&&onScreen&&!document.hidden;
  const delta=Math.min(Math.max((now-lightUpdateAt)/1000,0),.10);lightUpdateAt=now;
  if(active&&ready&&video.readyState>=2&&!video.seeking&&video.currentTime!==lightVideoTime&&now-lightSampleAt>=(handheld?1000:500)){
   lightSampleAt=now;lightVideoTime=video.currentTime;
   if(canSample){
    try{
     lightContext.drawImage(video,0,0,8,4);const pixels=lightContext.getImageData(0,0,8,4).data;
     let red=0,green=0,blue=0;for(let i=0;i<pixels.length;i+=4){red+=pixels[i];green+=pixels[i+1];blue+=pixels[i+2];}
     const scale=1/(32*255);sampleColour.setRGB(red*scale,green*scale,blue*scale,THREE.SRGBColorSpace);
     lightColour.copy(sampleColour).lerp(neutralLight,.30);
     lightIntensity=THREE.MathUtils.clamp((.2126*red+.7152*green+.0722*blue)*scale*76,3,34);
    }catch{canSample=false;lightIntensity=12;}
   }
  }
  const blend=1-Math.exp(-delta/1.1);
  screenLight.color.lerp(lightColour,blend);
  screenLight.intensity=THREE.MathUtils.lerp(screenLight.intensity,active?lightIntensity:0,blend);
 }
 function open(){panel.open=true;panel.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});selector.focus({preventScroll:true});}
 return{group,targets:[screen],update,open};
}
