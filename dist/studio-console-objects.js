import * as THREE from 'three';
import {createReferenceStereo} from './studio-panasonic-stereo.js?v=20261006-lake-surface1';

export function createConsoleObjects({cabinet,texture}){
 const chrome=new THREE.MeshPhysicalMaterial({color:0xd0d2cb,metalness:1,roughness:.19,clearcoat:.24});
 const satin=new THREE.MeshStandardMaterial({color:0xb9bdb8,metalness:.85,roughness:.30});
 const black=new THREE.MeshStandardMaterial({color:0x101514,roughness:.44,metalness:.14});
 const add=(p,g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
 const box=(p,w,h,d,x,y,z,m)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(p,r,h,x,y,z,m)=>add(p,new THREE.CylinderGeometry(r,r,h,48),m,x,y,z);
 const lathe=(p,points,m,x=0,y=0,z=0)=>add(p,new THREE.LatheGeometry(points.map(v=>new THREE.Vector2(...v)),64),m,x,y,z);
 const radio=createReferenceStereo({cabinet,texture});

 const lamp=new THREE.Group();lamp.name='Glossy orange donut mushroom table lamp';lamp.position.set(11.65,7.20,.12);cabinet.add(lamp);
 const orange=new THREE.MeshPhysicalMaterial({color:0xec5415,roughness:.20,metalness:0,clearcoat:1,clearcoatRoughness:.085});
 lathe(lamp,[[0,0],[.68,0],[.70,.06],[.63,.16],[.31,.22],[.22,.44],[.23,1.10],[.38,1.37],[.49,1.45]],orange);
 lathe(lamp,[[.32,1.42],[.93,1.40],[1.29,1.47],[1.44,1.67],[1.47,1.90],[1.36,2.15],[1.15,2.33],[.80,2.43],[.52,2.43],[.29,2.30],[.245,2.17],[.245,1.97],[.31,1.95],[.35,2.11],[.51,2.21],[.79,2.23],[1.06,2.12],[1.22,1.97],[1.25,1.78],[1.14,1.63],[.81,1.57],[.32,1.58],[.32,1.42]],orange);
 const glow=new THREE.MeshStandardMaterial({color:0xffdf94,emissive:0xffaf48,emissiveIntensity:1.15,side:THREE.DoubleSide});
 const ring=add(lamp,new THREE.RingGeometry(.29,1.23,64),glow,0,1.48,0);ring.rotation.x=Math.PI/2;
 const light=new THREE.PointLight(0xffad63,6,7,2);light.position.set(0,1.32,0);lamp.add(light);
 const lampCord=new THREE.CatmullRomCurve3([[0,.035,-.1],[.5,.032,-.7],[.4,.032,-1.6],[.36,-.4,-2.24],[.36,-3.1,-2.24]].map(v=>new THREE.Vector3(...v)));
 add(lamp,new THREE.TubeGeometry(lampCord,28,.021,6,false),black);

 function book({x,y,z,w=.38,h=2.5,d=1.85,title,color,lean=0}){
  const b=new THREE.Group();b.name=title;b.position.set(x,y,z);b.rotation.z=lean;cabinet.add(b);
  const cover=new THREE.MeshStandardMaterial({color,roughness:.70});
  const pages=texture(128,512,(g,ww,hh)=>{g.fillStyle='#ddd7c6';g.fillRect(0,0,ww,hh);for(let i=0;i<170;i++){g.fillStyle=i%4?'#c7c4b5':'#eee8d7';g.fillRect(0,i*3,ww,1)}});
  box(b,w-.035,h-.065,d-.065,0,h/2,-.005,new THREE.MeshStandardMaterial({map:pages,roughness:.93}));
  for(const xx of[-w/2,w/2])box(b,.026,h,d,xx,h/2,0,cover);
  box(b,w+.02,h,.05,0,h/2,d/2,cover);
  const type=texture(256,1024,(g,ww,hh)=>{g.fillStyle=new THREE.Color(color).getStyle();g.fillRect(0,0,ww,hh);g.fillStyle=new THREE.Color(color).r>.6&&new THREE.Color(color).g>.6?'#172622':'#fbf0d5';g.save();g.translate(ww/2,hh/2);g.rotate(-Math.PI/2);g.font='bold 58px Georgia';g.textAlign='center';g.fillText(title,0,18,860);g.restore();g.fillStyle='#d1ad75';g.fillRect(30,880,196,6);});
  add(b,new THREE.PlaneGeometry(w+.015,h-.03),new THREE.MeshStandardMaterial({map:type,roughness:.73}),0,h/2,d/2+.027);return b;
 }
 [{title:'SOUND & SPACE',color:0x173f47,h:2.82,w:.42},{title:'RECORD CULTURE',color:0xe4dfce,h:3.02,w:.48},{title:'JAZZ / BLUE NOTES',color:0x233754,h:2.64,w:.35},{title:'DESIGN OBJECTS',color:0xb73d20,h:2.86,w:.31}].forEach((b,i)=>book({...b,x:-3.7+i*.43,y:7.20,z:.18,lean:i===0?.04:0}));
 const bookend=box(cabinet,.055,1.9,1.65,-1.9,8.15,.18,chrome);box(cabinet,.80,.04,1.65,-2.27,7.22,.18,chrome);
 // Sparse lower shelves: readable spines and the party glassware have separate bays.
 for(let i=0;i<3;i++){const b=book({x:-7.2,y:.37,z:0,w:.28,h:3.2,d:2.25,title:['ARCHITECTURE','THE ART OF LISTENING','PHOTOGRAPHY'][i],color:[0xc4b9a2,0x263b35,0xc26736][i]});b.rotation.z=-Math.PI/2;b.position.y=.51+i*.31;b.position.x=-8.82;}
 return{radio,lamp};
}
