import {createSharedTextureLoader} from './texture-sources.js';
import * as THREE from 'three';
import {createH100} from './studio-h100.js?v=20261006-lake-surface1';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';

// A wall-mounted listening deck, modelled in world units independently of the glass room.
export function createStudioCDPlayer({root,texture,touchables}){
 const deck=new THREE.Group();deck.name='Brushed aluminium CD player and headphones';deck.scale.setScalar(.68);deck.position.set(studioLayout.cdPlayerX,10.5,studioLayout.listeningZ);deck.rotation.y=-Math.PI/2;root.add(deck);
 const grain=texture(512,512,g=>{g.fillStyle='#b8bcc0';g.fillRect(0,0,512,512);for(let x=0;x<512;x++){g.fillStyle=x%3?'#ffffff13':'#17202b18';g.fillRect(x,0,1,512)}const light=g.createLinearGradient(0,0,512,0);light.addColorStop(0,'#ffffff44');light.addColorStop(.28,'#ffffff00');light.addColorStop(.72,'#ffffff22');light.addColorStop(1,'#00000020');g.fillStyle=light;g.fillRect(0,0,512,512)});
 const silver=new THREE.MeshPhysicalMaterial({color:0xffffff,map:grain,bumpMap:grain,bumpScale:.009,metalness:.94,roughness:.31,anisotropy:.72,anisotropyRotation:Math.PI/2});
 const edge=new THREE.MeshStandardMaterial({color:0x9fa6aa,metalness:.86,roughness:.22});
 const black=new THREE.MeshStandardMaterial({color:0x17191b,metalness:.18,roughness:.48});
 const rubber=new THREE.MeshStandardMaterial({color:0x181b1e,roughness:.88});
 const add=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);m.castShadow=m.receiveShadow=true;return m};
 const box=(p,w,h,d,x,y,z,m)=>add(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
 const circle=(p,r,x,y,z,m)=>add(new THREE.CircleGeometry(r,64),m,p,x,y,z);
 const cylinder=(p,r,h,x,y,z,m)=>{const o=add(new THREE.CylinderGeometry(r,r,h,40),m,p,x,y,z);o.rotation.x=Math.PI/2;return o};
 function label(text,x,y,w,h,p=deck,color='#c2c4c3',font=28){const map=texture(512,128,g=>{g.fillStyle=color;g.font=`${font}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,64)});const o=add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false}),p,x,y,.47);o.castShadow=false;return o}
 function cable(p,points,r=.035){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),48,r,7,false),rubber,p)}
 box(deck,6.25,8.25,.33,0,0,0,black);
 // The round window is an actual cutout, with the mechanism recessed behind the aluminium.
 const face=new THREE.Shape();face.moveTo(-3.1,-4.1);face.lineTo(3.1,-4.1);face.lineTo(3.1,4.1);face.lineTo(-3.1,4.1);face.closePath();const hole=new THREE.Path();hole.absarc(0,-.13,1.84,0,Math.PI*2,true);face.holes.push(hole);
 const faceGeometry=new THREE.ExtrudeGeometry(face,{depth:.07,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,curveSegments:48});
 // ExtrudeGeometry uses unscaled XY coordinates on its front. Normalize them
 // so brushing covers the entire metal face instead of clamping at the edges.
 const faceUV=faceGeometry.attributes.uv,facePosition=faceGeometry.attributes.position;
 for(let i=0;i<faceUV.count;i++)faceUV.setXY(i,(facePosition.getX(i)+3.1)/6.2,(facePosition.getY(i)+4.1)/8.2);
 add(faceGeometry,silver,deck,0,0,.17);
 for(const x of [-3.04,3.04])for(let i=0;i<3;i++)box(deck,.023,8.12,.04,x+i*.022,0,.30,edge);
 circle(deck,1.81,0,-.13,.13,black);
 const rotor=new THREE.Group();rotor.position.set(0,-.13,.21);rotor.userData.dynamic=true;deck.add(rotor);
 const discMat=new THREE.MeshStandardMaterial({color:0xf07b51,metalness:.35,roughness:.26});
 const disc=circle(rotor,1.72,0,0,0,discMat);
 for(const r of [1.70,1.59,.58,.43])add(new THREE.TorusGeometry(r,.009,6,64),edge,rotor,0,0,.012);
 cylinder(rotor,.31,.09,0,0,.055,edge);cylinder(rotor,.105,.105,0,0,.078,black);
 const glass=new THREE.MeshPhysicalMaterial({color:0xff6540,transparent:true,opacity:.16,metalness:.12,roughness:.13,clearcoat:1,depthWrite:false});circle(deck,1.82,0,-.13,.35,glass).castShadow=false;
 const glintMap=texture(256,256,g=>{const a=g.createLinearGradient(0,0,256,256);a.addColorStop(0,'#ffffff00');a.addColorStop(.25,'#ffffff00');a.addColorStop(.32,'#ffffff46');a.addColorStop(.40,'#ffffff00');a.addColorStop(.76,'#ffffff00');a.addColorStop(.82,'#ffffff25');a.addColorStop(1,'#ffffff00');g.fillStyle=a;g.fillRect(0,0,256,256)});
 circle(deck,1.81,0,-.13,.365,new THREE.MeshBasicMaterial({map:glintMap,transparent:true,depthWrite:false,toneMapped:false})).castShadow=false;
 add(new THREE.TorusGeometry(1.84,.025,8,72),edge,deck,0,-.13,.32);
 cylinder(deck,.63,.03,0,2.77,.30,black);label('Nakamichi',0,2.77,1.05,.24,deck,'#b5b8b5',32);
 box(deck,5.59,1.47,.06,0,-3.07,.26,edge);box(deck,5.51,1.39,.035,0,-3.07,.303,black);
 const digitsCanvas=document.createElement('canvas');digitsCanvas.width=256;digitsCanvas.height=256;const dg=digitsCanvas.getContext('2d'),digitsMap=new THREE.CanvasTexture(digitsCanvas);digitsMap.colorSpace=THREE.SRGBColorSpace;
 const display=circle(deck,.66,-2.04,-3.07,.36,new THREE.MeshBasicMaterial({map:digitsMap,toneMapped:false}));display.userData.dynamic=true;display.castShadow=false;
 const keys=[];
 function key(x,y,command,text){const o=box(deck,.49,.35,.13,x,y,.395,edge.clone());o.userData={action:'cd-control',command,label:text,dynamic:true};touchables.push(o);keys.push(o);return o}
 for(let i=0;i<3;i++){key(-.98+i*.66,-2.86,'disc-'+(i+1),'CD / DISC '+(i+1));label(String(i+1),-.98+i*.66,-2.56,.25,.14,deck,'#b7b9b5',46)}
 for(const [x,command,text] of [[-.98,'previous','PREVIOUS TRACK'],[-.32,'next','NEXT TRACK'],[.34,'stop','STOP']])key(x,-3.38,command,'CD / '+text);
 label('Ⅰ◀︎',-.98,-3.68,.30,.16);label('▶︎Ⅰ',-.32,-3.68,.30,.16);label('■',.34,-3.68,.20,.14);
 const playTarget=circle(deck,1.82,0,-.13,.39,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));playTarget.castShadow=false;playTarget.userData={action:'cd-control',command:'toggle',label:'CD / PLAY · PAUSE',dynamic:true};touchables.push(playTarget);
 const knob=new THREE.Group();knob.position.set(1.96,-3.02,.39);knob.userData.dynamic=true;deck.add(knob);
 const volume=cylinder(knob,.44,.22,0,0,.10,silver);volume.userData={action:'cd-volume',label:'CD / DRAG TO CHANGE VOLUME',dynamic:true};touchables.push(volume);
 const marker=circle(knob,.035,-.23,.28,.222,new THREE.MeshBasicMaterial({color:0xd14222}));marker.castShadow=false;
 label('Volume',1.96,-2.43,.77,.17);label('Min',1.46,-3.57,.29,.14);label('Max',2.42,-3.57,.30,.14);label('Nakamichi',1.70,-3.87,1.39,.22,deck,'#c0c2be',36);label('MB-V300s',-2.08,-3.86,.92,.17,deck,'#969c9b',27);
 for(let i=0;i<9;i++){const a=(.18+i*.078)*Math.PI*2;circle(deck,.020,1.96+Math.cos(a)*.55,-3.02+Math.sin(a)*.55,.365,edge)}
 // Headphones hang from their band rather than floating in front of the wall.
 box(deck,.32,.30,.44,0,-4.35,.11,edge);
 const phones=createH100({parent:deck,texture,x:0,y:-5.69,z:.44,scale:1.1,angle:-.20});
 cable(deck,[[.6,-4.13,.1],[.66,-4.7,.42],[1.7,-5.4,.56],[1.6,-6.8,.42],[1.0,-7.45,.43],[.25,-8.1,.32],[-1.6,-9.4,.15],[-2,-11.8,.1]]);
 let previous=0,stamp='',artId='',pressAt=0,pressed=null;const maps=new Map(),loader=createSharedTextureLoader();
 function drawDisplay(number,playing,slot){dg.fillStyle='#191a1b';dg.fillRect(0,0,256,256);dg.fillStyle='#abb0aa';dg.font='16px Arial';dg.textAlign='center';dg.fillText('Disc',128,43);for(let i=0;i<3;i++){dg.fillStyle=i===slot?'#ef4c25':'#353431';dg.beginPath();dg.arc(84+i*44,65,5,0,Math.PI*2);dg.fill()}dg.fillStyle='#080807';dg.fillRect(42,98,174,100);dg.fillStyle='#ff3b16';dg.font='72px monospace';dg.fillText(String(number).padStart(2,'0'),128,174);dg.fillStyle='#b5b9b4';dg.font='15px Arial';dg.fillText(playing?'PLAYING':'STOP',128,220);digitsMap.needsUpdate=true;}
 const favorites=['summer','mirror','still-miss-you'];
 async function command(action){const media=window.lotusStudioMedia;if(!media)return;if(media.mode!=='music'&&!await media.setMode('music',{start:false}))return;if(action.startsWith('disc-'))media.choose(favorites[Number(action.slice(-1))-1]);else if(action==='toggle')media.toggle();else if(action==='stop'){media.pause();media.seekTo(0)}else media.advance(action==='next'?1:-1)}
 function press(object){pressed=object;pressAt=performance.now();command(object.userData.command)}
 function update(now){const media=window.lotusStudioMedia,dt=Math.min(.05,(now-previous)/1000||0);previous=now;if(!media)return;const t=media.track,playing=!media.media.paused;rotor.rotation.z-=playing?dt*1.3:0;knob.rotation.z=.9-media.listeningVolume*4.5;
  if(pressed){pressed.position.z=.395-Math.sin(Math.min(1,(now-pressAt)/230)*Math.PI)*.035;if(now-pressAt>230)pressed=null}
  const number=Math.max(0,media.collection.findIndex(x=>x.id===t.id))+1,nextStamp=[t.id,playing].join('/');if(stamp!==nextStamp){stamp=nextStamp;drawDisplay(number,playing,favorites.indexOf(t.id))}
  if(artId!==t.id){artId=t.id;if(maps.has(t.id)){discMat.map=maps.get(t.id);discMat.needsUpdate=true}else{const map=loader.load(t.image,()=>{if(artId===t.id){discMat.map=map;discMat.needsUpdate=true}});map.colorSpace=THREE.SRGBColorSpace;maps.set(t.id,map)}}
 }
 drawDisplay(1,false,0);
 return{deck,update,press,command};
}
