import * as THREE from 'three';
export function createStudioLamps({room,texture}){
const add=(g,m,p,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;p.add(o);return o};
const chrome=new THREE.MeshPhysicalMaterial({color:0xb5b9b8,metalness:1,roughness:.22}),black=new THREE.MeshStandardMaterial({color:0x121719,metalness:.7,roughness:.24}),glass=new THREE.MeshPhysicalMaterial({color:0xf3e9cc,transparent:true,opacity:.15,roughness:.09,metalness:.05,clearcoat:1,depthWrite:false});
const bulb=new THREE.MeshStandardMaterial({color:0xffe6b7,emissive:0xffb25b,emissiveIntensity:2.0}),rib=new THREE.MeshStandardMaterial({color:0xb59866,metalness:.5,roughness:.3});
const glow=texture(64,64,g=>{const a=g.createRadialGradient(32,32,0,32,32,32);a.addColorStop(0,'#ffe3a455');a.addColorStop(1,'#ffcc6600');g.fillStyle=a;g.fillRect(0,0,64,64)});
function tube(x,y,z){const lamp=new THREE.Group();lamp.position.set(x,y,z);room.add(lamp);const r=.33;add(new THREE.BoxGeometry(.27,3.35,.10),black,lamp,0,0,-.39);for(const yy of [-1.91,1.91]){add(new THREE.CylinderGeometry(.40,.40,.14,48),black,lamp,0,yy,0);add(new THREE.CylinderGeometry(.344,.344,.22,48),chrome,lamp,0,yy*.93,0);for(let i=0;i<28;i++){const a=i/28*Math.PI*2;const slot=add(new THREE.BoxGeometry(.015,.13,.02),black,lamp,Math.sin(a)*.35,yy*.93,Math.cos(a)*.35);slot.rotation.y=a}}add(new THREE.CylinderGeometry(r,r,3.55,64,1,true),glass,lamp);
for(let j=0;j<4;j++){const yy=-1.37+j*.92;add(new THREE.CylinderGeometry(.22,.22,.13,32),chrome,lamp,0,yy-.21,0);const b=add(new THREE.SphereGeometry(.14,20,14),bulb,lamp,0,yy+.06,0);b.scale.y=1.65;for(let i=0;i<16;i++){const a=i/16*Math.PI*2;add(new THREE.CylinderGeometry(.009,.009,.67,6),rib,lamp,Math.cos(a)*.247,yy,Math.sin(a)*.247)}const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));halo.position.set(0,yy,.05);halo.scale.set(1.8,1.8,1.8);lamp.add(halo)}const light=new THREE.PointLight(0xffc17d,92,15,2);light.position.set(0,0,.75);lamp.add(light);return lamp}
tube(-18,23,-29.8);tube(18,23,-29.8);
// Ambient fill without a physical shade occluding the console from above.
const fill=new THREE.PointLight(0xffcf97,88,25,2);fill.position.set(0,23.35,0);room.add(fill);
return{};
}
