import * as THREE from 'three';
function mergeLeaves(group){group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map(),remove=[];group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(inverse.clone().multiply(o.matrixWorld));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);remove.push(o)});remove.forEach(o=>o.removeFromParent());for(const [material,parts] of batches){const geometry=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const arrays=parts.map(p=>p.getAttribute(name)?.array).filter(Boolean);if(arrays.length!==parts.length)continue;const values=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;arrays.forEach(a=>{values.set(a,offset);offset+=a.length});geometry.setAttribute(name,new THREE.BufferAttribute(values,name==='uv'?2:3))}parts.forEach(p=>p.dispose());group.add(new THREE.Mesh(geometry,material))}}
const rand=n=>{const s=Math.sin(n*72.38+19.1)*43758.54;return s-Math.floor(s)};
// An airy olive tree: exposed crooked trunk, tapered forks and silver-backed
// lanceolate leaves. The leaf meshes are merged per branch, not individual draws.
export function createSilverOlive(texture){
 const tree=new THREE.Group();tree.name='Silver-leaf olive tree';
 const ceramicMap=texture(256,256,g=>{g.fillStyle='#e3e5e0';g.fillRect(0,0,256,256);for(let i=0;i<7000;i++){g.fillStyle=i%2?'#ffffff0e':'#777c7609';g.fillRect(rand(i)*256,rand(i+34)*256,1,1)}});
 const ceramic=new THREE.MeshPhysicalMaterial({color:0xe5e8e3,map:ceramicMap,bumpMap:ceramicMap,bumpScale:.012,roughness:.38,clearcoat:.32,clearcoatRoughness:.30});
 const profile=[[0,.09],[.70,.09],[.91,.19],[1.03,.68],[.98,1.42],[.88,1.78],[.81,1.82],[.79,1.75],[.87,1.38],[.91,.69],[.80,.25],[0,.25]].map(([x,y])=>new THREE.Vector2(x,y));
 const pot=new THREE.Mesh(new THREE.LatheGeometry(profile,64),ceramic);pot.name='Satin porcelain planter';tree.add(pot);
 const soil=new THREE.Mesh(new THREE.CylinderGeometry(.78,.76,.13,40),new THREE.MeshStandardMaterial({color:0x292b23,roughness:1}));soil.position.y=1.65;tree.add(soil);
 const barkMap=texture(128,512,g=>{g.fillStyle='#898273';g.fillRect(0,0,128,512);for(let x=0;x<128;x++){g.strokeStyle=x%3?'#c5bd9b28':'#302f263c';g.lineWidth=.4+rand(x)*1.3;g.beginPath();g.moveTo(x,0);for(let y=0;y<=512;y+=16)g.lineTo(x+Math.sin(y*.03+x)*1.5,y);g.stroke()}});
 const bark=new THREE.MeshStandardMaterial({color:0xa3a091,map:barkMap,bumpMap:barkMap,bumpScale:.037,roughness:.92});
 const leafMap=texture(64,256,g=>{g.fillStyle='#8d9c8a';g.fillRect(0,0,64,256);g.strokeStyle='#d0d6c095';g.lineWidth=.65;g.beginPath();g.moveTo(32,0);g.lineTo(32,256);g.stroke();for(let i=0;i<16;i++){g.strokeStyle='#596d591e';g.beginPath();g.moveTo(32,i*16);g.lineTo(i%2?57:7,i*16-17);g.stroke()}});
 const leaves=[new THREE.MeshPhysicalMaterial({color:0x9cac94,map:leafMap,bumpMap:leafMap,bumpScale:.006,roughness:.58,clearcoat:.14,side:THREE.DoubleSide}),new THREE.MeshPhysicalMaterial({color:0xd3dacb,map:leafMap,roughness:.73,clearcoat:.07,side:THREE.DoubleSide})];
 const branch=(points,radius,parent=tree)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const geo=new THREE.TubeGeometry(curve,18,radius,7,false),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const t=Math.floor(i/8)/18,c=curve.getPointAt(t),factor=1-.77*t;pos.setXYZ(i,c.x+(pos.getX(i)-c.x)*factor,c.y+(pos.getY(i)-c.y)*factor,c.z+(pos.getZ(i)-c.z)*factor)}geo.computeVertexNormals();const m=new THREE.Mesh(geo,bark);parent.add(m);return curve};
 const trunk=branch([[0,1.65,0],[-.20,3.25,.05],[.22,5.20,-.12],[-.06,7.30,.08],[.28,9.82,-.03]],.14);
 const crowns=[];
 for(let b=0;b<7;b++){
  const t=.37+b*.085,start=trunk.getPoint(t),a=b*2.399+.4,reach=1.25+rand(b+50)*.75;
  const end=start.clone().add(new THREE.Vector3(Math.cos(a)*reach,1.1+rand(b+61)*1.1,Math.sin(a)*reach));
  branch([start.toArray(),start.clone().lerp(end,.45).add(new THREE.Vector3(0,.20,0)).toArray(),end.toArray()],.059-b*.003);
  const crown=new THREE.Group();crown.position.copy(end);tree.add(crown);crowns.push(crown);
  for(let q=0;q<4;q++){
   const aa=a+(q-1.5)*.72,length=.9+rand(b*7+q+105)*.6;
   const tip=new THREE.Vector3(Math.cos(aa)*length,.42+rand(q+b+95)*.7,Math.sin(aa)*length);
   const twig=branch([[0,0,0],[tip.x*.52,tip.y*.62,tip.z*.52],tip.toArray()],.025,crown);
   for(let j=0;j<9;j++)for(let side of [-1,1]){
    const at=twig.getPoint(.13+j*.09),l=.47+rand(b*110+q*17+j)*.24;
    const leaf=new THREE.Mesh(blade(l,.135+rand(j+42)*.045,.15,.013),leaves[(b+q+j+(side>0?1:0))%4===0?1:0]);
    leaf.position.copy(at);leaf.rotation.set(.9+rand(j+q)*.6,aa+side*(.62+rand(j+b)*.48),side*(.38+rand(j+71)*.25));crown.add(leaf);
   }
  }
  mergeLeaves(crown);
 }
 tree.userData.botanical={species:'Olea europaea',foliage:'Silver green / lanceolate leaves',leafCount:504};
 tree.userData.update=t=>crowns.forEach((g,i)=>{g.rotation.z=Math.sin(t*.31+i*.7)*.011;g.rotation.x=Math.sin(t*.23+i)*.006});
 return tree;
}
// Curved, tapered leaves with a folded midrib, rather than flattened spheres.
function blade(length,width,bend,fold=.09){const vertices=[],indices=[],uv=[];for(let j=0;j<=16;j++){const t=j/16,w=width*Math.sin(Math.PI*Math.pow(t,.63))*.5;for(let side=-1;side<=1;side++){vertices.push(side*w,length*(t-bend*t*t),length*.24*t*t+Math.abs(side)*fold*Math.sin(t*Math.PI));uv.push((side+1)/2,t)}if(j<16)for(let k=0;k<2;k++){const a=j*3+k;indices.push(a,a+3,a+1,a+1,a+3,a+4)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g}
export function createDracaena(texture){const plant=new THREE.Group();const potMap=texture(256,256,g=>{g.fillStyle='#82786a';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=3){g.fillStyle=y%2?'#a69b84':'#70675b';g.fillRect(0,y,256,1)}for(let i=0;i<6000;i++){g.fillStyle=i%2?'#00000014':'#ffffff17';g.fillRect(rand(i)*256,rand(i+1)*256,1,1)}});const glass=new THREE.MeshPhysicalMaterial({color:0xc9dfd4,metalness:0,roughness:.08,transmission:.85,thickness:.16,ior:1.48,transparent:true,opacity:.9,side:THREE.DoubleSide});const profile=[new THREE.Vector2(.76,.05),new THREE.Vector2(.87,.07),new THREE.Vector2(1.0,1.7),new THREE.Vector2(.94,1.7),new THREE.Vector2(.81,.18),new THREE.Vector2(0,.18)];const pot=new THREE.Mesh(new THREE.LatheGeometry(profile,80),glass);plant.add(pot);const soil=new THREE.Mesh(new THREE.CylinderGeometry(.83,.73,1.27,48),new THREE.MeshStandardMaterial({color:0x252319,roughness:1}));soil.position.y=.86;plant.add(soil);const rim=new THREE.Mesh(new THREE.TorusGeometry(.97,.035,8,80),glass);rim.rotation.x=Math.PI/2;rim.position.y=1.70;plant.add(rim);

const bark=new THREE.MeshStandardMaterial({color:0x8c8066,roughness:.92}),leaf=new THREE.MeshPhysicalMaterial({color:0x32472a,roughness:.55,clearcoat:.18,side:THREE.DoubleSide});const heads=[];
for(let b=0;b<7;b++){const a=b*2.39,h=4.7+rand(b+77)*5.2,foot=new THREE.Vector3(Math.cos(a)*.45,1.5,Math.sin(a)*.45),head=new THREE.Vector3(Math.cos(a)*(.7+rand(b)*.9),h,Math.sin(a)*.95);const curve=new THREE.CatmullRomCurve3([foot,new THREE.Vector3(foot.x*.9,h*.48,foot.z),head]);plant.add(new THREE.Mesh(new THREE.TubeGeometry(curve,20,.055+b%3*.012,8,false),bark));for(let q=0;q<2;q++){const center=head.clone().add(new THREE.Vector3(q?.25:0,q?-1.5:0,q?.2:0));const crown=new THREE.Group();crown.position.copy(center);plant.add(crown);for(let i=0;i<23;i++){const l=1.25+rand(i+b*33)*1.2,m=new THREE.Mesh(blade(l,.08+rand(i+80)*.08,.7+rand(i+72)*.8,.015),leaf);m.rotation.set(.2+rand(i+50)*.9,i*2.399+b,.08*Math.sin(i));crown.add(m)}mergeLeaves(crown);heads.push(crown)}}
plant.userData.update=t=>heads.forEach((g,i)=>{g.rotation.z=Math.sin(t*.36+i)*.008});return plant}
export function createPalm(height=70,seed=1){const tree=new THREE.Group(),bark=new THREE.MeshStandardMaterial({color:0x272a24,roughness:.98}),leaf=new THREE.MeshStandardMaterial({color:0x101e19,roughness:.85,side:THREE.DoubleSide}),dead=new THREE.MeshStandardMaterial({color:0x302c21,roughness:1,side:THREE.DoubleSide});const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(1.2,height*.48,0),new THREE.Vector3(2.5,height,1.0)]);tree.add(new THREE.Mesh(new THREE.TubeGeometry(curve,40,.63,12,false),bark));for(let i=0;i<50;i++){const p=curve.getPoint(i/50);const ring=new THREE.Mesh(new THREE.TorusGeometry(.65,.045,3,12),bark);ring.rotation.x=Math.PI/2;ring.position.copy(p);tree.add(ring)}const crown=new THREE.Group();crown.position.copy(curve.getPoint(1));tree.add(crown);
for(let i=0;i<35;i++){const fan=new THREE.Group();fan.rotation.set(.65+rand(i+seed)*1.4,i*2.399,0);crown.add(fan);const l=5.8+rand(i+80)*3.4;for(let j=0;j<13;j++){const m=new THREE.Mesh(blade(l*(.8+.2*Math.sin(j/12*Math.PI)),.28,.28+rand(i+70)*.8,.09),leaf);m.rotation.z=(j-6)*.075;fan.add(m)}}
for(let i=0;i<75;i++){const m=new THREE.Mesh(blade(4+rand(i+seed)*6,.22,1.5,.01),dead);m.rotation.set(1.3+rand(i)*.7,i*2.399,0);crown.add(m)}mergeLeaves(crown);tree.userData.update=t=>{crown.rotation.z=Math.sin(t*.4+seed)*.018;crown.rotation.x=Math.sin(t*.28+seed)*.012};return tree}
