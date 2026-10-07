import {createSharedTextureLoader} from './texture-sources.js';
import * as THREE from 'three';
import {createSpiritService} from './studio-spirits.js?v=20261006-lake-surface1';

// Small collected objects; all dimensions are shelf-scale, with distinct
// paper, cork, cut glass, leather, wood and cast-metal surfaces.
export function createCuratedObjects(texture){
 const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=!m.transparent;p.add(o);return o};
 const box=(p,w,h,d,x,y,z,m)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const ball=(p,x,y,z,a,b,c,m)=>{const o=add(p,new THREE.SphereGeometry(1,32,24),m,x,y,z);o.scale.set(a,b,c);return o};
 const cyl=(p,r,h,x,y,z,m)=>add(p,new THREE.CylinderGeometry(r,r,h,48),m,x,y,z);
 const lathe=(p,v,m)=>add(p,new THREE.LatheGeometry(v.map(a=>new THREE.Vector2(...a)),64),m);
 const tube=(p,v,r,m)=>add(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(v.map(a=>new THREE.Vector3(...a))),36,r,8,false),m);
 const make=(name,parent,x,y,z,s=1,a=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.scale.setScalar(s);g.rotation.y=a;parent.add(g);return g};
 const silver=new THREE.MeshPhysicalMaterial({color:0xdce1df,metalness:.96,roughness:.22,clearcoat:.4});
 const dark=new THREE.MeshStandardMaterial({color:0x101619,roughness:.72});
 const gold=new THREE.MeshStandardMaterial({color:0xbda36a,metalness:.85,roughness:.32});
 const glass=new THREE.MeshPhysicalMaterial({color:0xd5e7e1,transparent:true,opacity:.24,depthWrite:false,roughness:.08,clearcoat:1,side:THREE.DoubleSide,forceSinglePass:true});
 const rough=texture(256,256,(c,w,h)=>{c.fillStyle='#aab0aa';c.fillRect(0,0,w,h);for(let i=0;i<5000;i++){c.fillStyle=i%2?'#ffffff16':'#00000012';c.fillRect((i*73.17)%w,(i*19.61)%h,1,1)}});
 const loader=createSharedTextureLoader(),maps=new Map();
 const cover=id=>{const t=window.lotusCatalog.find(a=>a.id===id)||window.lotusCatalog[0];if(!maps.has(id)){const map=loader.load(t.image);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;maps.set(id,new THREE.MeshStandardMaterial({map,roughness:.77,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}))}return maps.get(id)};
 function records(parent,x,y,z,{vinyl=false,count=12,angle=0}={}){
  const g=make(vinyl?'Collected vinyl jackets in a clear holder':'Collected slim jewel cases',parent,x,y,z,1,angle),h=vinyl?2.8:1.65,d=vinyl?2.6:1.5,pitch=vinyl?.13:.125,w=count*pitch;
  box(g,w+.36,.055,d+.18,0,.035,0,glass);for(const side of[-1,1])box(g,.05,h*.55,d+.18,side*(w/2+.16),h*.275+.06,0,glass);
  const colors=[0xe8e1ca,0x2b344c,0x8c2f31,0x678481,0xd5aa61];
  for(let i=0;i<count;i++){const c=new THREE.Group();c.position.set(-w/2+pitch*(i+.5),.07,Math.sin(i*2.6)*.045);c.rotation.z=i===0?.035:i===count-1?-.03:0;g.add(c);const paper=new THREE.MeshStandardMaterial({color:colors[i%5],roughness:.85});box(c,pitch*.78,h,d,0,h/2,0,paper);if(!vinyl){for(const yy of[.025,h-.025])box(c,pitch,.025,d+.04,0,yy,0,glass)}box(c,pitch*.88,h-.04,.03,0,h/2,d/2+.025,paper);const print=texture(64,512,ctx=>{ctx.fillStyle=new THREE.Color(colors[i%5]).getStyle();ctx.fillRect(0,0,64,512);ctx.fillStyle=i%5===0?'#323932':'#eeeee8';ctx.save();ctx.translate(34,460);ctx.rotate(-Math.PI/2);ctx.font='18px Arial';ctx.fillText(window.lotusCatalog[i%window.lotusCatalog.length].title.toUpperCase(),0,0);ctx.restore()});add(c,new THREE.PlaneGeometry(pitch*.85,h-.05),new THREE.MeshStandardMaterial({map:print,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2}),0,h/2,d/2+.045);}
  // One small jacket sits at the front of the collection, with a real spine.
  const face=make('Face-out collected release',g,0,.065,d/2+.12,1,-.09);box(face,vinyl?2.65:1.55,h,.065,0,h/2,0,dark);add(face,new THREE.PlaneGeometry((vinyl?2.65:1.55)-.06,h-.06),cover(window.lotusCatalog[Math.floor(Math.abs(x*7+y*3))%window.lotusCatalog.length].id),0,h/2,.049);
  return g;
 }
 function spirits(parent,x,y,z){return createSpiritService({parent,texture,x,y,z}).group;}
 function luxury(parent,x,y,z){
  const g=make('Quiet collected design objects / leather box and wood knight',parent,x,y,z);
  const leather=new THREE.MeshPhysicalMaterial({color:0x7b5239,map:rough,bumpMap:rough,bumpScale:.009,roughness:.70,clearcoat:.08});
  const softBox=(w,h,d,r,px,py,pz)=>{const geo=new THREE.BoxGeometry(w,h,d,6,4,6),p=geo.attributes.position,limit=new THREE.Vector3(w/2-r,h/2-r,d/2-r);for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),base=v.clone().clamp(limit.clone().negate(),limit),edge=v.sub(base);if(edge.lengthSq())edge.normalize().multiplyScalar(r);v.copy(base).add(edge);p.setXYZ(i,v.x,v.y,v.z)}geo.computeVertexNormals();return add(g,geo,leather,px,py,pz)};
  softBox(3.10,.87,2.25,.052,0,.445,0);softBox(3.18,.12,2.33,.035,0,.945,0);box(g,.29,.12,.028,0,.70,1.14,gold);
  const thread=new THREE.MeshStandardMaterial({color:0x9b7b60,roughness:1});for(let i=0;i<35;i++)box(g,.034,.008,.008,-1.43+i*.084,.938,1.169,thread);

  const logo=texture(256,64,c=>{c.fillStyle='#b68c62';c.textAlign='center';c.font='16px Georgia';c.fillText('HERMÈS / PARIS',128,40)});add(g,new THREE.PlaneGeometry(.69,.17),new THREE.MeshStandardMaterial({map:logo,transparent:true,alphaTest:.1,depthWrite:false,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2}),0,.34,1.145);
  return g;
 }
 function horse(parent,x,y,z,s=.85,a=0){
  const g=make('Samarcande-inspired mahogany horse paperweight',parent,x,y,z,s,a),woodMap=texture(256,512,c=>{c.fillStyle='#664731';c.fillRect(0,0,256,512);for(let i=0;i<260;i++){c.strokeStyle=i%3?'#bda58b26':'#1c100c22';c.beginPath();c.moveTo(i,0);c.bezierCurveTo(i+7,160,i-4,330,i+1,512);c.stroke()}}),wood=new THREE.MeshStandardMaterial({color:0x987c63,map:woodMap,roughness:.57,bumpMap:woodMap,bumpScale:.005});
  const shape=new THREE.Shape();shape.moveTo(-.58,0);shape.lineTo(.51,0);shape.bezierCurveTo(.25,.42,.48,.89,.41,1.29);shape.lineTo(.56,1.75);shape.lineTo(.42,1.91);shape.lineTo(.28,1.62);shape.lineTo(.07,1.67);shape.lineTo(-.18,1.53);shape.lineTo(-.67,1.19);shape.lineTo(-.75,.95);shape.lineTo(-.49,.83);shape.lineTo(-.03,1.02);shape.bezierCurveTo(-.22,.62,-.61,.31,-.58,0);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:4,curveSegments:24});geo.translate(0,.06,-.21);add(g,geo,wood);ball(g,-.20,1.29,.285,.038,.038,.008,dark);box(g,1.35,.10,.73,-.06,.055,0,wood);return g;
 }
 function medal(parent,x,y,z,angle=.1){
  // An uninscribed festival keepsake; no invented award, recipient or year.
  const g=make('Uninscribed music-festival keepsake medal',parent,x,y,z,1,angle);box(g,1.05,.09,.75,0,.045,0,dark);box(g,.055,.78,.07,0,.43,-.13,silver);
  const disc=cyl(g,.44,.058,0,.92,0,gold);disc.rotation.x=Math.PI/2;const rim=add(g,new THREE.TorusGeometry(.38,.014,8,48),gold,0,.92,.041);
  const emblem=texture(128,128,c=>{c.strokeStyle='#776543';c.lineWidth=4;for(let i=0;i<7;i++){const x=28+i*12,h=13+25*Math.sin(i*.9)**2;c.beginPath();c.moveTo(x,64-h);c.lineTo(x,64+h);c.stroke()}});add(g,new THREE.PlaneGeometry(.60,.60),new THREE.MeshStandardMaterial({map:emblem,transparent:true,alphaTest:.1,depthWrite:false,roughness:.7,polygonOffset:true,polygonOffsetFactor:-2}),0,.92,.044);return g;
 }
 function phone(parent,x,y,z,a=.15){
  // Official iPhone 18 Pro proportions: 71.9 x 150 x 8.75 mm.
  // https://www.apple.com/iphone-18-pro/specs/
  const w=.84,h=w*150/71.9,depth=w*8.75/71.9;
  const g=make('Silver iPhone 18 Pro / rounded unibody, glass and machined controls',parent,x,y+.059,z,1,a);g.rotation.x=.054;
  const alloy=new THREE.MeshPhysicalMaterial({color:0xd8dcdf,metalness:.93,roughness:.26,clearcoat:.16});
  const ceramic=new THREE.MeshPhysicalMaterial({color:0xd6d9da,metalness:.06,roughness:.29,clearcoat:.56});
  const lens=new THREE.MeshPhysicalMaterial({color:0x071015,metalness:.25,roughness:.055,clearcoat:1});
  const line=new THREE.MeshStandardMaterial({color:0x8d9295,metalness:.5,roughness:.33});
  const round=(ww,hh,r)=>{const sh=new THREE.Shape(),xx=-ww/2,yy=-hh/2;sh.moveTo(xx+r,yy);sh.lineTo(xx+ww-r,yy);sh.quadraticCurveTo(xx+ww,yy,xx+ww,yy+r);sh.lineTo(xx+ww,yy+hh-r);sh.quadraticCurveTo(xx+ww,yy+hh,xx+ww-r,yy+hh);sh.lineTo(xx+r,yy+hh);sh.quadraticCurveTo(xx,yy+hh,xx,yy+hh-r);sh.lineTo(xx,yy+r);sh.quadraticCurveTo(xx,yy,xx+r,yy);return sh};
  const flat=(ww,hh,d,r,m,px=0,py=0,pz=0)=>{const geo=new THREE.ExtrudeGeometry(round(ww,hh,r),{depth:d,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:3,curveSegments:16});geo.rotateX(-Math.PI/2);return add(g,geo,m,px,py,pz)};
  flat(w,h,depth,.102,alloy);
  flat(w-.016,h-.016,.004,.099,ceramic,0,-.004,0);
  const face=texture(384,800,c=>{const grad=c.createLinearGradient(0,0,384,800);grad.addColorStop(0,'#18252e');grad.addColorStop(.55,'#482b34');grad.addColorStop(1,'#0c1118');c.fillStyle=grad;c.fillRect(0,0,384,800);c.fillStyle='#f2f4f7';c.textAlign='center';c.font='22px Arial';c.fillText('Monday, October 5',192,112);c.font='300 94px Arial';c.fillText('02:17',192,204);c.fillStyle='#000';c.beginPath();c.roundRect(153,17,78,22,11);c.fill();c.fillStyle='#20323e';c.beginPath();c.arc(216,28,5,0,7);c.fill();c.fillStyle='#ffffffc0';c.fillRect(126,775,132,5)});
  const geo=new THREE.ShapeGeometry(round(w-.032,h-.032,.094),24);const uv=geo.attributes.uv,pos=geo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/(w-.032)+.5,pos.getY(i)/(h-.032)+.5);geo.rotateX(-Math.PI/2);
  add(g,geo,new THREE.MeshPhysicalMaterial({map:face,roughness:.09,clearcoat:1,clearcoatRoughness:.035,metalness:.025}),0,depth+.006,0);
  // The camera plateau supports the far end of the face-up phone on the desk.
  const cameraZ=-h*.325;flat(w-.06,.46,.025,.08,alloy,0,-.030,cameraZ);
  for(const [px,pz]of[[-.225,cameraZ-.105],[-.225,cameraZ+.105],[-.02,cameraZ]]){
   cyl(g,.103,.030,px,-.047,pz,alloy);cyl(g,.087,.006,px,-.065,pz,dark);cyl(g,.065,.008,px,-.071,pz,lens);cyl(g,.030,.003,px,-.076,pz,lens);
  }
  cyl(g,.043,.005,.237,-.034,cameraZ-.105,new THREE.MeshStandardMaterial({color:0xe5e4d6,roughness:.30}));cyl(g,.029,.005,.237,-.034,cameraZ+.105,dark);
  // Independent tactile controls, fine antenna breaks and a recessed USB-C opening.
  for(const [side,pz,len]of[[-1,-.57,.105],[-1,-.34,.19],[-1,-.08,.19],[1,-.30,.26],[1,.35,.21]]){
   const key=box(g,.012,.034,len,side*(w/2+.005),depth*.5,pz,alloy);box(g,.015,.002,len*.78,side*(w/2+.006),depth*.5+.018,pz,line);
  }
  for(const side of[-1,1])for(const pz of[-h*.30,h*.30])box(g,.008,depth+.006,.011,side*w/2,depth/2,pz,new THREE.MeshStandardMaterial({color:0xb8bec1,roughness:.6}));
  const port=add(g,new THREE.ShapeGeometry(round(.13,.036,.015),12),dark,0,depth*.50,h/2+.004);
  for(const side of[-1,1])for(let i=0;i<5;i++){const hole=add(g,new THREE.CircleGeometry(.009,12),dark,side*(.12+i*.039),depth*.50,h/2+.005)}
  g.userData.dimensionsMM=[71.9,150,8.75];return g;
 }

 function bride(parent,x,y,z,s=1,a=0){
  const g=make('Kill Bill / yellow tracksuit collectible',parent,x,y,z,s,a),yellow=new THREE.MeshPhysicalMaterial({color:0xe5ba21,roughness:.62,bumpMap:rough,bumpScale:.006,clearcoat:.1}),skin=new THREE.MeshStandardMaterial({color:0xd5a989,roughness:.76}),hair=new THREE.MeshStandardMaterial({color:0xa6813c,roughness:.77});
  cyl(g,.51,.06,0,.03,0,dark);
  const limb=(pts,r,m)=>tube(g,pts,r,m);
  for(const side of[-1,1]){const px=side*.16;ball(g,px,.145,.055,.13,.095,.23,dark);limb([[px,.22,0],[px+side*.015,.57,0],[side*.12,1.04,0]],.105,yellow);limb([[px+side*.10,.23,-.025],[px+side*.115,.57,-.03],[side*.24,1.03,-.01]],.022,dark);}
  const body=lathe(g,[[0,.90],[.20,.90],[.22,1.04],[.17,1.18],[.23,1.48],[.26,1.59],[.12,1.67],[0,1.67]],yellow);body.scale.z=.68;
  limb([[-.24,1.58,0],[-.34,1.32,.015],[-.40,1.10,.06]],.08,yellow);limb([[.24,1.58,0],[.35,1.36,.04],[.43,1.20,.12]],.08,yellow);
  limb([[-.28,1.57,0],[-.39,1.32,.015],[-.45,1.13,.06]],.018,dark);limb([[.28,1.57,0],[.40,1.36,.04],[.47,1.22,.12]],.018,dark);
  for(const [px,py,pz]of[[-.40,1.06,.06],[.43,1.16,.12]])ball(g,px,py,pz,.052,.085,.048,skin);
  cyl(g,.075,.14,0,1.73,0,skin);ball(g,0,1.91,0,.145,.205,.138,skin);ball(g,0,1.98,-.03,.162,.20,.148,hair);
  // The face remains visible inside the shoulder-length bob.
  ball(g,0,1.91,.097,.122,.163,.048,skin);for(const side of[-1,1])ball(g,side*.133,1.85,-.009,.046,.18,.08,hair);
  ball(g,0,1.91,.151,.025,.025,.018,skin);for(const side of[-1,1])ball(g,side*.047,1.94,.143,.020,.009,.006,dark);
  limb([[0,1.65,.128],[0,1.38,.139],[0,.99,.154]],.006,silver);limb([[-.11,1.64,.079],[0,1.52,.158],[.11,1.64,.079]],.014,yellow);
  // A narrow sheathed katana, scaled to a hand-held collectible.
  const sword=make('Miniature katana',g,.43,1.13,.12,1,-.18);sword.rotation.z=.50;box(sword,.043,.70,.043,0,-.28,0,dark);box(sword,.072,.035,.093,0,.09,0,gold);box(sword,.045,.21,.047,0,.20,0,dark);return g;
 }
 return{records,spirits,luxury,horse,medal,phone,bride};
}
