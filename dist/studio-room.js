import * as THREE from 'three';
import {createGlassRecords} from './studio-glass-records.js?v=20261006-lake-surface1';
import {createMVWall} from './studio-mv-wall.js?v=20261006-lake-surface1';
import {createArtRecord} from './record-design.js?v=20261006-lake-surface1';
import {createStudioLamps} from './studio-lights.js?v=20261006-lake-surface1';
import {createReferenceMarginata} from './studio-reference-plants.js?v=20261006-lake-surface1';
import {createGlazing} from './studio-glass.js?v=20261006-lake-surface1';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
import {createReferenceObjects} from './studio-reference-objects.js?v=20261007-mobile3';

export function createRecordingRoom({root,renderer,texture,camera,scene}){
 const room=new THREE.Group();root.add(room);const architecture=new THREE.Group();architecture.scale.set(...studioLayout.architectureScale);room.add(architecture);const back=new THREE.Group(),left=new THREE.Group(),ceiling=new THREE.Group();architecture.add(back,left,ceiling);
 const mesh=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m};
 const box=(w,h,d,x,y,z,mat,p=room)=>mesh(new THREE.BoxGeometry(w,h,d),mat,p,x,y,z);
 const rnd=n=>{const q=Math.sin(n*78.2+18)*43758.5;return q-Math.floor(q)};
 const brushed=texture(512,512,g=>{g.fillStyle='#8e9ca5';g.fillRect(0,0,512,512);for(let y=0;y<512;y++){g.fillStyle=y%3?'#ffffff09':'#07101d16';g.fillRect(0,y,512,1)}});
 const wood=new THREE.MeshStandardMaterial({color:0x52606c,map:brushed,bumpMap:brushed,bumpScale:.003,roughness:.28,metalness:.88});
 const darkWood=new THREE.MeshPhysicalMaterial({color:0x9ebfd0,roughness:.11,metalness:.05,transmission:.12,thickness:.24,ior:1.48,transparent:true,opacity:.22,depthWrite:false,clearcoat:1});
 const bronze=new THREE.MeshStandardMaterial({color:0x909fa8,metalness:.86,roughness:.25}),black=new THREE.MeshStandardMaterial({color:0x0e141b,roughness:.6});
 const floorGlass=new THREE.MeshPhysicalMaterial({color:0x92bdcf,roughness:.10,metalness:.04,transmission:.10,thickness:.5,ior:1.47,transparent:true,opacity:.13,clearcoat:1,depthWrite:false});
 const floor=box(35,.42,29,0,-.21,0,floorGlass,architecture);floor.castShadow=false;
 const edgeLight=new THREE.MeshBasicMaterial({color:0x728da6,transparent:true,opacity:.44});
 for(const x of [-17.47,17.47])box(.035,.06,28.96,x,-.19,0,edgeLight,architecture);
 for(const z of [-14.47,14.47])box(34.98,.06,.035,0,-.19,z,edgeLight,architecture);
 for(const x of [-16.9,16.9])for(const z of [-13.9,13.9]){box(.58,.08,.58,x,-.23,z,bronze,architecture);box(.12,.085,.12,x,-.23,z,black,architecture)}
 const glazing=createGlazing({renderer,scene,camera});
 const floorReflection=glazing.add(architecture,34.9,28.9);floorReflection.rotation.x=-Math.PI/2;floorReflection.position.set(0,.007,0);
 function windowPanel(w,h,x,y,z,rotation,parent){
  const group=new THREE.Group();group.position.set(x,y,z);group.rotation.y=rotation;parent.add(group);
  const frame=(ww,hh,xx,yy)=>box(ww,hh,.10,xx,yy,0,darkWood,group);
  for(const yy of [-h/2,h/2])frame(w+.04,.075,0,yy);
  // One uninterrupted pane: no internal mullions or transoms.
  glazing.add(group,w,h);
  box(w+.04,.07,.16,0,-h/2-.04,.02,darkWood,group);return group;
 }
 windowPanel(34.9,20.0,0,9.92,-14.47,0,back);
 const sideWindow=windowPanel(28.94,20.0,-17.47,9.92,0,Math.PI/2,left);
 // All six faces stay present. Thin, optically clear glass replaces the heavy wall band.
 const clearGlass=new THREE.MeshPhysicalMaterial({color:0xb3d1e0,transparent:true,opacity:.038,roughness:.075,metalness:.05,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
 function clearPane(w,h,x,y,z,rx,ry){const pane=mesh(new THREE.PlaneGeometry(w,h),clearGlass,architecture,x,y,z);pane.rotation.set(rx,ry,0);pane.castShadow=false;return pane}
 clearPane(34.9,20,0,9.92,14.47,0,Math.PI);
 clearPane(28.94,20,17.47,9.92,0,0,-Math.PI/2);
 clearPane(34.9,28.94,0,19.92,0,Math.PI/2,0);
 for(const x of [-17.47,17.47])for(const z of [-14.47,14.47])box(.035,20,.035,x,9.92,z,edgeLight,architecture);
 for(const z of [-14.47,14.47])box(34.94,.035,.035,0,19.92,z,edgeLight,architecture);
 for(const x of [-17.47,17.47])box(.035,.035,28.94,x,19.92,0,edgeLight,architecture);
 // Objects use world units independently from the glass architecture's scale.
 const coverLoader=new THREE.TextureLoader(),recordTargets=[];
 const acrylic=new THREE.MeshPhysicalMaterial({color:0xd9e5df,transparent:true,opacity:.11,metalness:.04,roughness:.09,clearcoat:1,depthWrite:false});
 const edge=new THREE.LineBasicMaterial({color:0xd2e2df,transparent:true,opacity:.55});
 const objects=createReferenceObjects(texture);
 const glassRecords=createGlassRecords({parent:room,texture,backWall:studioLayout.backWall,objects});
 const mvWall=createMVWall({parent:room,texture,wallX:studioLayout.mvWallX});
 recordTargets.push(...glassRecords.targets,...mvWall.targets);
 // A single raised listening shelf. Four open jackets have physical front
 // and back sheets, so the partially extracted record occupies their cavity.
 const vinylWall=new THREE.Group();vinylWall.name='Four selected records above centered wall player';vinylWall.position.set(studioLayout.rightWall-1.14,0,studioLayout.listeningZ);vinylWall.rotation.y=-Math.PI/2;room.add(vinylWall);
 box(33,.10,2.2,0,17.50,0,acrylic,vinylWall);
 for(const x of[-12.3,12.3]){box(.08,.09,1.7,x,17.40,-.28,bronze,vinylWall);box(.20,.8,.09,x,17.05,-1.09,bronze,vinylWall);}
 const sleevePaper=new THREE.MeshStandardMaterial({color:0xd6d0bf,roughness:.92});
 for(const [i,id] of ['bridge','train-to-nowhere','lov','juliet'].entries()){
  const track=window.lotusCatalog.find(t=>t.id===id),art=coverLoader.load(track.image);art.colorSpace=THREE.SRGBColorSpace;art.anisotropy=8;
  const g=new THREE.Group();g.name='Hollow record jacket / '+track.title;g.scale.setScalar(.82);g.position.set(-10.2+i*6.8,19.7025,.10);vinylWall.add(g);
  const backMap=texture(512,512,g=>{g.fillStyle='#ddd6c5';g.fillRect(0,0,512,512);g.fillStyle='#343937';g.font='20px monospace';g.fillText(track.title.toUpperCase(),42,68);g.font='13px monospace';g.fillText(track.artist.toUpperCase(),42,105);for(let n=0;n<6;n++){g.fillRect(42,160+n*27,130+n%3*36,3)}for(let n=0;n<35;n++)g.fillRect(380+n*2.2,407,n%3?1:2,46);});
  const front=mesh(new THREE.PlaneGeometry(5.25,5.25),new THREE.MeshStandardMaterial({map:art,roughness:.68,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),g,-.75,0,.13);
  const target=mesh(new THREE.PlaneGeometry(7.6,5.25),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),g,.25,0,.18);
  target.castShadow=target.receiveShadow=false;
  target.userData={action:'release',release:id,label:`${track.title} / ${track.artist} — VIEW DETAILS`,dynamic:true};
  recordTargets.push(target);
  const back=mesh(new THREE.PlaneGeometry(5.25,5.25),new THREE.MeshStandardMaterial({map:backMap,roughness:.86,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),g,-.75,0,-.13);back.rotation.y=Math.PI;
  box(.035,5.25,.26,-3.375,0,0,sleevePaper,g);for(const y of[-2.61,2.61])box(5.25,.028,.26,-.75,y,0,sleevePaper,g);
  const record=createArtRecord({image:track.image,id:track.id,index:i,radius:2.52});for(const m of record.materials){if(m.transparent&&m.opacity===1){m.transparent=false;m.depthWrite=true}if(m.map&&m.opacity===1){m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2}}record.group.position.set(1.65,0,0);g.add(record.group);
  box(7.6,.09,.72,.25,-2.58,.18,acrylic,g);
 }
 const candles=objects.candles(vinylWall,-15.20,17.555,.20,1.18,.16);
 objects.love(vinylWall,15.20,17.555,.22,.89,-.10);
 // Analogue outboard sits behind the left edge of the desk.
 const rack=new THREE.Group();rack.position.set(-17.5,0,-15.8);rack.rotation.y=.19;room.add(rack);box(3.8,4.1,4.1,0,2.1,0,black,rack);
 for(let j=0;j<6;j++){const y=.6+j*.61;box(3.52,.54,.10,0,y,2.08,j%2?black:bronze,rack);for(let k=0;k<5;k++){const knob=mesh(new THREE.CylinderGeometry(.10,.10,.09,14),black,rack,-1.3+k*.48,y,2.19);knob.rotation.x=Math.PI/2}box(.54,.22,.04,1.19,y,2.16,new THREE.MeshBasicMaterial({color:0xb6985e}),rack)}
 // The right-side tape machine and stand are removed for the lounge.
 createStudioLamps({root,room,texture});
 // Sparse curved stems reach the blade area of the rear Kill Bill poster.
 const rearPlant=createReferenceMarginata(texture);rearPlant.position.set(-33.0,0,studioLayout.backWall+3.287);rearPlant.rotation.y=.1;room.add(rearPlant);root.userData.rearPlant=({species:'Dracaena marginata',position:rearPlant.position.toArray(),height:19.1,bladeArea:[15.5,19.5]});
 function update(now,p=1){back.visible=left.visible=ceiling.visible=true;rearPlant.userData.update(now*.001);candles.userData.update(now*.001);glassRecords.update(now);mvWall.update();glazing.update(now,p>.995);}
 return{room,update,recordTargets,glassRecords,mvWall};
}
