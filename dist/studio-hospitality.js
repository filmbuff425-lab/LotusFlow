import * as THREE from 'three';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
import {createWhiskyOnIce} from './studio-spirits.js?v=20261006-lake-surface1';
import {createCuratedObjects} from './studio-curated-objects.js?v=20261006-lake-surface1';
import {createRecordingMic} from './studio-recording-mic.js?v=20261006-lake-surface1';
import {createSculpturalEspresso} from './studio-espresso.js?v=20261006-lake-surface1';
import {createReferenceCoffeeCup} from './studio-coffee-cup.js?v=20261006-lake-surface1';
import {createConsoleObjects} from './studio-console-objects.js?v=20261006-lake-surface1';
import {createReferenceObjects} from './studio-reference-objects.js?v=20261007-mobile3';

export function createStudioHospitality({root,texture}){
 const group=new THREE.Group();group.name='Left wall modular glass console, circular coffee table and recording microphone';root.add(group);
 // Thin glass sheets stay optically clear; grazing reflections carry the material.
 const glass=new THREE.MeshPhysicalMaterial({color:0xd8e4df,roughness:.12,metalness:0,transparent:true,opacity:.105,depthWrite:false,ior:1.5,clearcoat:.42,clearcoatRoughness:.10,envMapIntensity:.65,side:THREE.DoubleSide});
 glass.forceSinglePass=true;
 glass.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`diffuseColor.a *= .55 + 2.5 * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 4.0);
#include <opaque_fragment>`)};
 glass.customProgramCacheKey=()=> 'thin-glass-fresnel-v1';
 const edge=new THREE.MeshStandardMaterial({color:0xb2cbc2,transparent:true,opacity:.40,roughness:.22,metalness:.25,depthWrite:false});
 const chrome=new THREE.MeshPhysicalMaterial({color:0xe1e1dc,metalness:1,roughness:.14,clearcoat:.25}),satin=new THREE.MeshStandardMaterial({color:0xa8aeaa,metalness:.9,roughness:.31}),dark=new THREE.MeshStandardMaterial({color:0x111516,roughness:.56,metalness:.12}),porcelain=new THREE.MeshPhysicalMaterial({color:0xf4eee2,roughness:.19,clearcoat:1,clearcoatRoughness:.13}),gold=new THREE.MeshStandardMaterial({color:0xb09b65,roughness:.28,metalness:.8}),coffee=new THREE.MeshStandardMaterial({color:0x25140a,roughness:.19}),paper=new THREE.MeshStandardMaterial({color:0xd8d1bc,roughness:.93});
 const add=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=!mat.transparent&&!mat.transmission;p.add(m);return m};
 const box=(p,w,h,d,x,y,z,mat)=>add(new THREE.BoxGeometry(w,h,d),mat,p,x,y,z);
 const cyl=(p,r,h,x,y,z,mat,rb=r)=>add(new THREE.CylinderGeometry(r,rb,h,48),mat,p,x,y,z);
 const ball=(p,r,x,y,z,mat)=>add(new THREE.SphereGeometry(r,14,10),mat,p,x,y,z);
 const lathe=(p,profile,mat,x=0,y=0,z=0)=>add(new THREE.LatheGeometry(profile.map(v=>new THREE.Vector2(...v)),48),mat,p,x,y,z);
 function outline(p,w,h,d,x,y,z){const l=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w,h,d)),new THREE.LineBasicMaterial({color:0xa9c5ba,transparent:true,opacity:.23}));l.position.set(x,y,z);p.add(l)}
 function rod(p,a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const o=cyl(p,r,delta.length(),...av.add(bv).multiplyScalar(.5).toArray(),m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o}
 const cup=(parent,x,y,z,scale=1)=>createReferenceCoffeeCup({parent,texture,x,y,z,scale});
 // Round glass top and a transparent cylindrical pedestal.
 const table=new THREE.Group();table.name='Circular glass coffee table';table.position.set(22.6,0,28.0);table.rotation.y=-.45;group.add(table);
 cyl(table,3.25,.17,0,2.62,0,glass);for(const y of[2.539,2.701]){const r=add(new THREE.TorusGeometry(3.24,.014,6,96),edge,table,0,y,0);r.rotation.x=Math.PI/2;}
 lathe(table,[[1.26,.09],[1.27,2.525],[1.18,2.525],[1.18,.09]],glass);for(const y of[.09,2.525]){const r=add(new THREE.TorusGeometry(1.23,.018,6,64),edge,table,0,y,0);r.rotation.x=Math.PI/2;}
 cyl(table,1.34,.035,0,.065,0,chrome);createWhiskyOnIce({parent:table,texture,x:.85,y:2.715,z:.28,scale:1.38});const book=box(table,1.8,.12,1.4,-1.2,2.77,-.23,paper);book.rotation.y=-.13;box(book,1.82,.019,1.42,0,.07,0,dark);
 // Two low tiers, six open bays. Long axis follows the left wall and vinyl display.
 const cabinet=new THREE.Group();cabinet.name='Low modular glass television console along the left wall';cabinet.position.set(studioLayout.mediaConsoleX,0,2.0);cabinet.rotation.y=Math.PI/2;group.add(cabinet);
 const span=4.8,levels=[.30,3.72,7.14],xs=Array.from({length:7},(_,i)=>-14.4+i*span);
 for(let bay=0;bay<6;bay++)for(const y of levels){const x=-12+bay*span;box(cabinet,4.73,.10,4.42,x,y,0,glass);outline(cabinet,4.73,.10,4.42,x,y,0);}
 for(const x of xs)for(const z of[-2.15,2.15])for(const offset of[-.062,.062]){rod(cabinet,[x+offset,.12,z],[x+offset,7.38,z],.032,chrome);for(const y of levels){cyl(cabinet,.072,.055,x+offset,y-.075,z,chrome);cyl(cabinet,.062,.075,x+offset,y+.085,z,chrome);}ball(cabinet,.069,x+offset,7.42,z,chrome);cyl(cabinet,.089,.08,x+offset,.08,z,dark);}
 for(const x of[-14.36,14.36]){box(cabinet,.07,6.83,4.36,x,3.72,0,glass);outline(cabinet,.07,6.83,4.36,x,3.72,0)}
 const machine=createSculpturalEspresso({parent:cabinet,texture});machine.position.set(-11.8,7.20,0);machine.scale.setScalar(.83);cup(cabinet,-7.6,7.20,.40,.90);
 const {radio,lamp}=createConsoleObjects({cabinet,texture});
 const objects=createReferenceObjects(texture);
 objects.pistachio(cabinet,-5.55,7.20,.16,.84,-.18);
 objects.crystal(cabinet,12.0,3.79,.16,1.27,-.15);
 const collection=createCuratedObjects(texture);
 collection.records(cabinet,-12.0,3.79,.05,{count:9,angle:.02});
 collection.records(cabinet,-7.2,3.79,-.17,{vinyl:true,count:7,angle:-.06});
 collection.spirits(cabinet,-2.4,3.79,-.15);
 collection.medal(cabinet,2.10,.37,.10,-.12);
 collection.records(cabinet,-12.0,.37,.04,{vinyl:true,count:10,angle:.04});
 collection.luxury(cabinet,-2.4,.37,.0);
 collection.records(cabinet,7.2,.37,-.10,{count:8,angle:.04});
 const mic=createRecordingMic({parent:group,texture});
 return{group,table,cabinet,mic,machine,radio,lamp};
}
