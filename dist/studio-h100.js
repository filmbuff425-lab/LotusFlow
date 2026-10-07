import * as THREE from 'three';

// H100 proportions: circular glass face, machined control ring, oval lambskin
// pads, short sliding stems and a broad, softly padded arch.
export function createH100({parent,texture,x=0,y=0,z=0,scale=1,angle=0}){
 const g=new THREE.Group();g.name='Silver Beoplay H100 / cognac leather crown and machined aluminum';g.position.set(x,y,z);g.rotation.y=angle;g.scale.setScalar(scale);parent.add(g);
 const grain=texture(256,256,(c,w,h)=>{const im=c.createImageData(w,h);for(let i=0;i<w*h;i++){const v=145+19*Math.sin(i*71.31);im.data.set([v,v,v,255],i*4)}c.putImageData(im,0,0)});
 const metal=new THREE.MeshPhysicalMaterial({color:0xdce2e5,metalness:.96,roughness:.25,anisotropy:.75,clearcoat:.3});
 const glass=new THREE.MeshPhysicalMaterial({color:0xd9dfe3,metalness:.48,roughness:.12,clearcoat:1,clearcoatRoughness:.06});
 const leather=new THREE.MeshPhysicalMaterial({color:0xa5a9aa,roughness:.69,bumpMap:grain,bumpScale:.009,sheen:.28,sheenRoughness:.9});
 const headbandLeather=new THREE.MeshPhysicalMaterial({color:0x825137,roughness:.60,bumpMap:grain,bumpScale:.005,sheen:.14,sheenRoughness:.85});
 const stitch=new THREE.MeshStandardMaterial({color:0xb38a68,roughness:1});
 const dark=new THREE.MeshStandardMaterial({color:0x14181c,roughness:.93}),fabric=new THREE.MeshStandardMaterial({color:0x4a5055,roughness:1,bumpMap:grain,bumpScale:.008});
 const add=(p,geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const tube=(p,pts,r,m)=>add(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(v=>new THREE.Vector3(...v))),48,r,10,false),m);
 // A swept rectangular pad, rather than a thin circular torus around the head.
 const arch=(r,t,width,start,end,m)=>{
  const n=72,pos=[],uv=[],ix=[],cross=[],bevel=Math.min(t*.32,width*.16);
  for(const [z,d,a]of[[width/2-bevel,t/2-bevel,0],[-width/2+bevel,t/2-bevel,90],[-width/2+bevel,-t/2+bevel,180],[width/2-bevel,-t/2+bevel,270]])for(let j=0;j<4;j++){const angle=(a+j*30)*Math.PI/180;cross.push([z+Math.cos(angle)*bevel,d+Math.sin(angle)*bevel])}
  const k=cross.length;for(let i=0;i<=n;i++){const a=start+(end-start)*i/n;for(const [j,[dz,dr]]of cross.entries()){pos.push(Math.cos(a)*(r+dr),.16+Math.sin(a)*(r+dr)*1.16,dz);uv.push(i/n,j/k)}}
  for(let i=0;i<n;i++)for(let j=0;j<k;j++){const a=i*k+j,b=i*k+(j+1)%k;ix.push(a,b,a+k,b,b+k,a+k)}
  for(let j=1;j<k-1;j++)ix.push(0,j+1,j,n*k,n*k+j,n*k+j+1);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(ix);geo.computeVertexNormals();return add(g,geo,m);
 };
 arch(1.03,.18,.45,-.12,Math.PI+.12,headbandLeather);
 for(const dz of[-.205,.205])tube(g,Array.from({length:65},(_,i)=>{const a=.14+i/64*(Math.PI-.28);return[Math.cos(a)*1.10,.16+Math.sin(a)*1.10*1.16,dz]}),.004,stitch);
 for(const side of[-1,1]){
  const cup=new THREE.Group();cup.position.set(side*1.035,-.64,0);cup.rotation.z=side*.08;g.add(cup);
  const cyl=(r,h,xx,m)=>{const o=add(cup,new THREE.CylinderGeometry(r,r,h,64),m,xx,0,0);o.rotation.z=Math.PI/2;return o};
  // Larger oval cushion surrounding a recessed blue-black acoustic fabric.
  const ring=add(cup,new THREE.TorusGeometry(.485,.125,20,64),leather,-side*.215);ring.rotation.y=Math.PI/2;ring.scale.set(1,1.24,1);
  const inner=add(cup,new THREE.CircleGeometry(.405,56),fabric,-side*.315);inner.rotation.y=-side*Math.PI/2;inner.scale.y=1.24;
  const chassis=cyl(.545,.27,0,metal);chassis.scale.x=1.05;
  cyl(.559,.055,side*.158,metal);cyl(.510,.014,side*.194,glass);
  for(let i=0;i<100;i++){const a=i/100*Math.PI*2;const rib=add(cup,new THREE.BoxGeometry(.030,.009,.010),metal,side*.157,Math.cos(a)*.561,Math.sin(a)*.561);rib.rotation.x=-a;}
  const map=texture(128,128,c=>{c.fillStyle='#aeb8bf';c.font='500 27px Arial';c.textAlign='center';c.fillText('B&O',64,75)});
  const mark=add(cup,new THREE.PlaneGeometry(.24,.24),new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.1,roughness:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),side*.204);mark.rotation.y=side*Math.PI/2;
  // Short pivots meet the outer ring, with the acoustic pad free to tilt.
  tube(g,[[side*.995,.26,0],[side*1.06,.03,0],[side*1.14,-.15,0],[side*1.16,-.30,0]],.055,metal);
  const pin=add(cup,new THREE.CylinderGeometry(.09,.09,.085,24),metal,side*.12,.49,0);pin.rotation.z=Math.PI/2;
  for(const zz of[-.23,.23])add(cup,new THREE.SphereGeometry(.022,8,6),dark,side*.152,-.18,zz);
 }
 return g;
}
