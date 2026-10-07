import * as THREE from 'three';
import {createRecordPrint} from './record-print.js?v=20261006-lake-surface1';
import {discReflection,coverColor} from './jewel-surface.js?v=20261006-lake-surface1';
import {resinPressing} from './record-finishes.js?v=20261006-lake-surface1';

// Different pressings, rather than one disc with nine substituted cover images.
const designs={
 flow:{edge:0x6ea7a1,tint:0xd2ebe5,finish:'clear',art:.83,iridescence:.45},
 'feed-on':{edge:0x7a9549,tint:0xd8e4b8,finish:'smoke',art:.89,iridescence:.30},
 'show-me-love':{edge:0xe7c343,tint:0xffefb5,finish:'full-print',art:.992,iridescence:.25},
 airtight:{edge:0xc96654,tint:0xffddcb,finish:'smoke',art:.70,iridescence:.35},
 news:{edge:0xf6bd79,tint:0xffe4c1,finish:'full-print',art: .992,iridescence:.18},
 'great-bridge':{edge:0xa4c4ed,tint:0xdbe8ff,finish:'split-marble',art:.69,iridescence:.40},
 juliet:{edge:0xe6a9da,tint:0xf5d8ef,finish:'clear',art:.68,iridescence:.68},
 'over-the-summer':{edge:0xf5dc31,tint:0xfff6a8,finish:'solid',art:.61,iridescence:.12},
 'imperfect-adult':{edge:0x9c91e4,tint:0xe6dcff,finish:'full-print',art:.992,iridescence:.75},
 '1-of-lov':{edge:0xa9e0a0,tint:0xd4efad,finish:'split-marble',art:.72,iridescence:.27},
 'runaway-bride':{edge:0x77d8d1,tint:0xc6fff2,finish:'liquid',art:.63,iridescence:.45},
 casual:{edge:0xbec8e8,tint:0xdcdff4,finish:'smoke',art:.77,iridescence:.56},
 'only-you':{edge:0xf14073,tint:0xffbed2,finish:'solid',art:.80,iridescence:.30}
};
export function createArtRecord({image,id,index=0,radius=1,glass=false}){
 if(id==='airtight')image='assets/airtight-clean.png';
 if(glass)return createGlassRecord({image,id,index,radius});
 const key=id||image?.split('/').pop()?.split('.')[0],design=designs[key]||Object.values(designs)[index%9],group=new THREE.Group(),materials=[];
 const keep=m=>{materials.push(m);return m},clear=['clear','liquid','smoke'].includes(design.finish),R=radius;
 const add=(geo,mat,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.z=z;group.add(m);return m};
 const map=new THREE.TextureLoader().load(image);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
 const outer=keep(new THREE.MeshPhysicalMaterial({color:design.edge,roughness:clear?.09:.29,metalness:clear?.13:.08,clearcoat:1,iridescence:design.iridescence,transparent:true,opacity:clear?.20:1,depthWrite:!clear,side:THREE.DoubleSide,envMapIntensity:.55}));
 const profile=[new THREE.Vector2(R*.04,-R*.015),new THREE.Vector2(R,-R*.015),new THREE.Vector2(R,R*.015),new THREE.Vector2(R*.04,R*.015)];
 const body=add(new THREE.LatheGeometry(profile,112),outer);body.rotation.x=Math.PI/2;
 const faceMaterial=keep(new THREE.MeshPhysicalMaterial({map,color:0xffffff,roughness:.37,metalness:.025,clearcoat:.65,clearcoatRoughness:.23,envMapIntensity:.15,iridescence:design.finish==='full-print'?design.iridescence:.05,transparent:true,opacity:1}));
 const artGeo=new THREE.RingGeometry(R*.04,R*design.art,112);
 add(artGeo,faceMaterial,R*.0165);const reverse=add(artGeo,faceMaterial,-R*.0165);reverse.rotation.y=Math.PI;
 const rim=keep(new THREE.MeshPhysicalMaterial({color:design.tint,metalness:.75,roughness:.19,transparent:true,opacity:clear?.63:.50,depthWrite:false,iridescence:.6}));
 for(const r of [.998,design.art+.002,.044])add(new THREE.TorusGeometry(R*r,R*(clear?.0025:.0017),5,112),rim,R*.017);
 const grooves=keep(new THREE.MeshBasicMaterial({color:design.tint,transparent:true,opacity:clear?.19:.13,depthWrite:false}));
 for(let r=design.art+.025;r<.99;r+=.016)add(new THREE.TorusGeometry(R*r,R*.0006,3,96),grooves,R*.018);
 if(design.finish==='full-print')for(let r=.20;r<.99;r+=.04)add(new THREE.TorusGeometry(R*r,R*.00055,3,96),grooves,R*.018);
 // Marbled two-tone resin remains outside the image, with its own asymmetric pattern.
 if(design.finish==='split-marble'){
  const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.clearRect(0,0,512,512);
  for(let i=0;i<30;i++){g.strokeStyle=i%3?'#efe8e680':'#5e487391';g.lineWidth=2+i%4;g.beginPath();g.moveTo(0,i*23-90);g.bezierCurveTo(180,i*13+50,310,i*24-170,512,i*17+80);g.stroke()}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  add(new THREE.RingGeometry(R*(design.art+.002),R*.996,112),keep(new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:.65,depthWrite:false})),R*.019);
 }
 // Clear liquid editions have a visible transparent outer chamber and suspended droplets.
 if(design.finish==='liquid'||design.finish==='smoke'){
  const gel=keep(new THREE.MeshPhysicalMaterial({color:design.edge,roughness:.10,metalness:.18,clearcoat:1,iridescence:.55,transparent:true,opacity:design.finish==='smoke'?.23:.46,depthWrite:false}));
  for(let i=0;i<13;i++){const a=i*2.399+index,r=design.art+.055+(i%3)*.075;const m=add(new THREE.SphereGeometry(R*(.025+(i%3)*.018),16,10),gel,R*.023);m.position.x=Math.cos(a)*R*r;m.position.y=Math.sin(a)*R*r;m.scale.set(1.8,1,.18);m.rotation.z=a;}
 }
 if(design.finish!=='full-print'){
  const tick=keep(new THREE.MeshBasicMaterial({color:design.tint,transparent:true,opacity:.68,depthWrite:false}));
  for(let i=0;i<9;i++){const a=2.2+i*.017,m=add(new THREE.PlaneGeometry(R*.003,R*(i%3===0?.045:.025)),tick,R*.019);m.position.x=Math.cos(a)*R*.958;m.position.y=Math.sin(a)*R*.958;m.rotation.z=a-Math.PI/2;}
 }
 const printMaterial=keep(new THREE.MeshStandardMaterial({map:createRecordPrint(key),transparent:true,roughness:.53,metalness:.04,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
 add(new THREE.RingGeometry(R*.04,R*.999,112),printMaterial,R*.024);
 const printedBack=add(new THREE.RingGeometry(R*.04,R*.999,112),printMaterial,-R*.024);printedBack.rotation.y=Math.PI;
 // Invisible complete silhouettes keep clicks on a transparent rim usable.
 const hitMaterial=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide});
 const front=add(new THREE.CircleGeometry(R,64),hitMaterial,R*.04),back=front;
 group.userData.finish=design.finish;group.userData.design=key;
 return{group,front,back,materials,design};
}

// A transparent printed disc: light passes through artwork and the clear outer rim.
function createGlassRecord({image,id,index,radius:R}){
 const key=id||image.split('/').pop().split('.')[0],design=designs[key]||Object.values(designs)[index%9],group=new THREE.Group(),materials=[];
 const keep=m=>(materials.push(m),m),add=(g,m,z=0)=>{const mesh=new THREE.Mesh(g,m);mesh.position.z=z;group.add(mesh);return mesh};
 const coverOnly=key!=='1-of-lov';
 const coloredWax=key==='over-the-summer'||key==='imperfect-adult',holographic=key==='1-of-lov'||key==='airtight',pinkHub=key==='news';
 const wideGlass=['airtight','juliet'].includes(key),borderless=['news','feed-on','show-me-love'].includes(key),artRadius=coloredWax?(key==='over-the-summer'?.58:.64):borderless?1:wideGlass?design.art:.955;
 const artworkImage=key==='airtight'?'assets/airtight-clean.png':image;
 design.signalColor=new THREE.Color(key==='news'?'#e7a0bb':'#cdbcc7');
 const map=new THREE.TextureLoader().load(artworkImage,texture=>{if(key!=='news')design.signalColor.copy(coverColor(texture.image))});map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
 const inkOpacity=coverOnly?1:.72;
 const resin=keep(new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.085,metalness:.04,clearcoat:1,clearcoatRoughness:.08,iridescence:.12,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,envMapIntensity:.8}));
 const body=add(new THREE.RingGeometry(R*.10,R,128),resin);
 // Print stays in its original color space; the separate clear coat catches light.
 const ink=keep(new THREE.MeshBasicMaterial({map,color:0xffffff,toneMapped:false,transparent:true,opacity:inkOpacity,depthWrite:false,side:THREE.DoubleSide}));
 add(new THREE.RingGeometry(R*(pinkHub?.215:.155),R*artRadius,128),ink,.016);
 const wax=coloredWax?keep(resinPressing(R,key==='over-the-summer'?0xe8d15c:0xabbade,key==='over-the-summer'?.24:.14)):null;
 if(wax)add(new THREE.RingGeometry(R*(artRadius+.004),R*.997,160),wax,.023);
 const innerWax=pinkHub?keep(resinPressing(R,0xe9a1bd,.50)):null;
 if(innerWax)add(new THREE.RingGeometry(R*.105,R*.212,96),innerWax,.029);
 // A beveled sidewall gives the pressing thickness, without a decorative border.
 const sidewall=keep(new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.16,metalness:.55,clearcoat:1,transparent:true,opacity:.48,depthWrite:false,envMapIntensity:.65}));
 const profile=[new THREE.Vector2(R*.996,-.014),new THREE.Vector2(R,-.008),new THREE.Vector2(R,.01),new THREE.Vector2(R*.997,.016)];
 const thickness=add(new THREE.LatheGeometry(profile,128),sidewall);thickness.rotation.x=Math.PI/2;
 const edge=keep(new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.34,depthWrite:false}));
 for(const [r,w] of (borderless?[]:[[.998,wideGlass?.0025:.0012],[artRadius+.008,.0008],[.145,.002],[.10,.0015]]))add(new THREE.TorusGeometry(R*r,R*w,6,128),edge,.026);
 if(!pinkHub)add(new THREE.RingGeometry(R*.105,R*.145,96),keep(new THREE.MeshPhysicalMaterial({color:0xc9d8e8,roughness:.17,metalness:.85,transparent:true,opacity:.42,depthWrite:false,iridescence:1})),.022);
 const print=keep(new THREE.MeshBasicMaterial({map:createRecordPrint(key),transparent:true,opacity:.82,depthWrite:false}));add(new THREE.RingGeometry(R*.155,R*.955,128),print,.03);
 const shine=keep(discReflection(R,key));add(new THREE.RingGeometry(R*.105,R*.998,128),shine,.036);
 group.userData.opticalFinish=shine.userData.finish;
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'#ffffff00');g.addColorStop(.53,'#c9dcff00');g.addColorStop(.68,'#c9dcff66');g.addColorStop(.82,'#b8cfff15');g.addColorStop(1,'#b8cfff00');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
 const glow=keep(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color:key==='feed-on'?0x9acb55:borderless?0xffffff:design.tint,transparent:true,opacity:key==='feed-on'?.065:0,depthWrite:false,blending:THREE.AdditiveBlending}));const aura=new THREE.Sprite(glow);aura.scale.setScalar(R*2.85);aura.position.z=-.08;group.add(aura);
 const hit=add(new THREE.CircleGeometry(R,96),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}),.05);
 group.userData.materialEdition=coloredWax?'translucent-colored-vinyl':pinkHub?'pink-resin-hub':holographic?'holographic-foil':key==='feed-on'?'soft-green-glow':'optical-pressing';
 return{group,front:hit,back:hit,materials,design,
  updateLight(angle){shine.uniforms.angle.value=angle;if(wax)wax.uniforms.angle.value=angle;if(innerWax)innerWax.uniforms.angle.value=angle;},
  updateHover(h){glow.opacity=key==='feed-on'?.065+h*.12:h*.10;edge.opacity=.34+h*.16;ink.opacity=Math.min(1,inkOpacity+h*.08);shine.uniforms.strength.value=1+h*.15;}};
}
