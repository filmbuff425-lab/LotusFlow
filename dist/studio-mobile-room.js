import * as THREE from 'three';
import {createSessionScreens} from './studio-session-screens.js';
import {createMVWall} from './studio-mv-wall.js';
import {studioLayout} from './studio-layout.js';
import {mobileAsset} from './device-profile.js';

// A separate phone model: desktop models, geometry and hotspots remain intact.
export async function createStudioInterior({scene,root,api,soundcube,host,touchables,selected}) {
 const material=color=>new THREE.MeshStandardMaterial({color,roughness:.8,metalness:.05});
 const graphite=material(0x202a32),silver=material(0x9aabb7),black=material(0x10161e),white=material(0xeeeae1);
 const glow=color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.5});
 function box(w,h,d,x,y,z,m,parent=root){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o}
 function register(o,data){o.userData={...data,dynamic:true};touchables.push(o);return o}
 function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
 function label(text,w,h,x,y,z,parent=root){const map=texture(512,128,g=>{g.fillStyle='#101b28';g.fillRect(0,0,512,128);g.fillStyle='#e7f4ff';g.font='600 40px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,64,480)});const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}));o.position.set(x,y,z);parent.add(o);return o}
 box(83,.3,69,0,-.2,0,graphite);
 box(83,35,.2,0,17.5,studioLayout.backWall,black);
 // No glazing layers, mirrors, environmental reflections, plants or sculpture.
 box(40,.3,15.8,0,2.65,-1,graphite);
 for(const x of[-18,18])box(.5,2.5,12,x,1.25,-1,silver);
 const desk=new THREE.Group();desk.position.set(0,3.42,.25);desk.rotation.x=.105;root.add(desk);
 box(14,.5,4.5,0,0,0,black,desk);
 const faders=[],leds=[],channelButtons=[],selectionLights=[],oleds=[];
 api.channels.forEach((c,i)=>{
  const x=-5.42+i*1.12;
  register(box(1,.04,3.9,x,.26,0,graphite,desk),{channel:c.id});
  const light=register(box(.5,.03,.14,x,.29,-1.75,glow(0x84dcff),desk),{channel:c.id});selectionLights.push(light);
  const screen=label(c.name,.9,.4,x,.28,-1.39,desk);screen.rotation.x=-Math.PI/2;register(screen,{channel:c.id});oleds.push({screen,last:null});
  const buttons={};for(const [j,action] of ['mute','solo'].entries())buttons[action]=register(box(.3,.08,.3,x+(j?.2:-.2),.32,-.38,white.clone(),desk),{channel:c.id,action});channelButtons.push(buttons);
  box(.07,.02,1.82,x,.28,.81,silver,desk);
  faders.push(register(box(.36,.15,.3,x,.35,1.65-c.value/100*1.68,silver,desk),{channel:c.id,action:'fader'}));
  // Compact faders retain their physical controls without decorative meter segments.
  leds.push([]);
 });
 register(box(.65,.1,.4,5.1,.3,1.65,glow(0x80e6bc),desk),{action:'play',label:'PLAY / PAUSE MIX'});
 register(box(.65,.1,.4,4.2,.3,1.65,white,desk),{action:'stop',label:'STOP MIX'});
 const canvases=[document.createElement('canvas'),document.createElement('canvas')];
 const maps=canvases.map(c=>{c.width=1280;c.height=720;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;return t});
 for(const [i,x] of[-6.35,6.35].entries()){
  box(12.5,7.1,.2,x,10.25,-7.6,silver);box(.4,4,.3,x,5.4,-7.6,silver);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(12.3,6.92),new THREE.MeshBasicMaterial({map:maps[i],toneMapped:false}));screen.position.set(x,10.25,-7.45);root.add(screen);register(screen,{action:'computer',label:'OPEN COMPUTER / MUSIC LIBRARY'});
 }
 const sessionScreens=createSessionScreens({api,arrange:canvases[0],mix:canvases[1],dawTexture:maps[0],mixerTexture:maps[1],selected});sessionScreens.update(0);
 label('COMPUTER / MUSIC',20,2,0,16,-7.4);
 for(const x of[-24,24]){register(box(4,10,4,x,5,-17,graphite),{action:'play',label:'PLAY / PAUSE MIX'});box(2.8,6,.05,x,5,-14.95,black)}
 const synth=new THREE.Group();synth.position.set(...studioLayout.synths);synth.rotation.y=studioLayout.synthRotation;root.add(synth);box(18,1,5,0,5,0,graphite,synth);
 for(let i=0;i<14;i++)register(box(1.05,.25,3,-7.15+i*1.1,5.6,.5,white,synth),{action:'note',note:48+i,label:'PLAY SYNTH / NOTE '+(48+i)});
 label('PLAY SYNTH',15,1.4,0,6.8,-2.5,synth);
 const mvWall=createMVWall({parent:root,texture,wallX:studioLayout.mvWallX});touchables.push(...mvWall.targets);
 // Keep the original video controls, replace their costly optical frame on phones.
 mvWall.group.traverse(o=>{if(o.isMesh){const materials=Array.isArray(o.material)?o.material:[o.material];for(const m of materials){if(m.transmission>0){m.transmission=0;m.transparent=false;m.opacity=1;m.roughness=.8;m.clearcoat=0;m.needsUpdate=true}}}});
 const releases=(window.lotusCatalog||[]).filter(t=>t.image);
 const loader=new THREE.TextureLoader();
 for(const [i,track] of releases.slice(0,8).entries()){
  const art=new THREE.MeshBasicMaterial({color:0xffffff});const cover=label(track.title,7,7,-30+i%4*20,26-Math.floor(i/4)*9,studioLayout.backWall+.3);
  register(cover,{action:'release',release:track.id,label:track.title+' / VIEW RELEASE'});
  loader.load(mobileAsset(track.image),t=>{const c=document.createElement('canvas');c.width=c.height=384;c.getContext('2d').drawImage(t.image,0,0,384,384);art.map=new THREE.CanvasTexture(c);art.map.colorSpace=THREE.SRGBColorSpace;art.needsUpdate=true;cover.material.map.dispose();cover.material.dispose();cover.material=art;t.dispose()});
 }
 let lastWall=0;const room={mobile:true,room:root,recordTargets:[],mvWall,update(now,p){scene.background.set(p>.22?0x0b1727:0x16070b);if(now-lastWall>100){mvWall.update();lastWall=now}}};soundcube.attachRoom(room);
 const details={soundcube,room:root,keys:[],update:now=>soundcube.update(now),press(){}};
 mountPhoneFunctions({api,releases,mvWall,host});
 host.dataset.roomObjects='mixer,computer,music-library,mv-screen,release-covers,speakers,synth';host.dataset.roomQuality='phone';
 return {desk,faders,leds,channelButtons,selectionLights,oleds,details,sessionScreens};
}

function mountPhoneFunctions({api,releases,mvWall,host}){
 const panel=document.createElement('nav');panel.className='studio-phone-functions';panel.setAttribute('aria-label','Studio functions');
 const style=document.createElement('style');style.textContent=`.studio-phone-functions{display:none}#studio.room-is-open .studio-phone-functions{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:16px;background:#101b28;color:#eef6ff}.studio-phone-functions button,.studio-phone-functions select{font:600 14px Arial;min-height:48px;border:1px solid #7491a9;border-radius:6px;padding:10px;background:#1c3043;color:#f4f8fc;text-align:left}.studio-phone-functions p,.studio-phone-functions label{grid-column:1/-1;margin:0;font:14px Arial;line-height:1.6}.studio-phone-functions select{width:100%;margin-top:6px}#studio .has-phone-room.is-room-open{height:60svh;min-height:420px}#studio .has-phone-room.is-room-open .studio-hint{display:none}#studio .has-phone-room.is-room-open .studio-view-buttons button{min-height:44px;font-size:11px}#studio .has-phone-room.is-room-open #auto-rotate{display:none}`;document.head.append(style);
 const button=(text,run)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.addEventListener('click',run);panel.append(b);return b};
 const note=document.createElement('p');note.textContent='STUDIO · 功能入口 / Tap a function below';panel.append(note);
 button('电脑 / 音乐库',()=>window.lotusDesktop?.open());
 button('MV / 视频',()=>mvWall.open());
 const playback=button('音乐 / 播放暂停',()=>window.lotusStudioMedia?.toggle());playback.setAttribute('aria-label','Toggle music playback');
 const label=document.createElement('label');label.textContent='作品 / Releases';const select=document.createElement('select');const placeholder=document.createElement('option');placeholder.textContent='选择作品查看详情 / Choose a release';placeholder.value='';select.append(placeholder);
 for(const track of releases){const option=document.createElement('option');option.value=track.id;option.textContent=track.title+' / '+track.artist;select.append(option)}
 select.addEventListener('change',()=>{if(select.value){window.lotusPortfolio?.openTrack(select.value,select);select.value=''}});label.append(select);panel.append(label);
 document.getElementById('studio-stage').after(panel);
 document.getElementById('studio-stage').classList.add('has-phone-room');
}
