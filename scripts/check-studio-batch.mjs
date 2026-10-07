import assert from 'node:assert/strict';
import fs from 'node:fs';

const threeURL=new URL('../dist/vendor/three.module.js',import.meta.url).href;
const THREE=await import(threeURL);
const source=fs.readFileSync(new URL('../dist/studio-batch.js',import.meta.url),'utf8').replace("from 'three'",`from '${threeURL}'`);
const {batchStudio}=await import('data:text/javascript,'+encodeURIComponent(source));
const root=new THREE.Group();root.position.set(8,-3,4);root.rotation.y=.3;
const geometry=new THREE.BoxGeometry(2,3,4);
const material=()=>new THREE.MeshStandardMaterial({color:0x78523a,roughness:.48,metalness:.12});
const add=(parent=root,mat=material())=>{const mesh=new THREE.Mesh(geometry,mat);parent.add(mesh);return mesh};
const group=new THREE.Group();group.rotation.z=.4;root.add(group);
for(let i=0;i<6;i++){const mesh=add(i%2?group:root);mesh.position.set(i*3,i/2,-i);mesh.scale.set(1+i*.1,1,1);}
function vertices(mesh){const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry;const p=g.attributes.position;return Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).toArray());}
root.updateMatrixWorld(true);
const before=root.children.flatMap(o=>o.isMesh?[o]:o.children).flatMap(vertices).sort();
const interactive=add();interactive.userData.action='note';
const glass=add(root,new THREE.MeshPhysicalMaterial({transmission:.7}));
const hidden=new THREE.Group();hidden.visible=false;root.add(hidden);const hiddenParts=[add(hidden),add(hidden),add(hidden)];
const dynamic=new THREE.Group();dynamic.userData.dynamic=true;root.add(dynamic);const moving=[add(dynamic),add(dynamic),add(dynamic)];
const custom=add();custom.material.onBeforeCompile=()=>{};
const extra=add();extra.geometry=geometry.clone();extra.geometry.setAttribute('uv1',extra.geometry.attributes.uv.clone());
const another=add(root,new THREE.MeshStandardMaterial({color:0xff0000}));
const sharedTexture=new THREE.Texture();sharedTexture.source.toJSON=()=>{throw new Error('Batching must never encode or serialize the texture image')};
for(let i=0;i<3;i++)add(root,new THREE.MeshStandardMaterial({map:sharedTexture,roughness:.5}));
const result=batchStudio(root,[interactive]);root.updateMatrixWorld(true);
const batch=root.children.find(o=>o.name==='Static studio batch');
assert.ok(batch.geometry.index,'Indexed geometry remains indexed');assert.ok(result.indexedBytes<result.expandedBytes,'Preserving indices uses less buffer memory');
assert.ok(batch,'Distinct material instances with identical optical properties merge');
assert.equal(result.before-result.after,7);
const after=vertices(batch);assert.equal(after.length,before.length);
for(const point of after){const i=before.findIndex(candidate=>point.every((v,axis)=>Math.abs(v-candidate[axis])<1e-5));assert.ok(i>=0,'World-space vertices match within Float32 precision');before.splice(i,1);}
assert.equal(batch.material.roughness,.48);assert.equal(batch.material.metalness,.12);
assert.equal(batch.matrixAutoUpdate,false,'A static batch keeps its fixed local transform');
assert.equal(interactive.matrixAutoUpdate,true,'Interactive transforms remain live');
for(const mesh of moving)assert.equal(mesh.matrixAutoUpdate,true,'Moving branches remain live');
const oldWorld=batch.matrixWorld.clone();root.position.x+=2;root.updateMatrixWorld(true);assert.ok(Math.abs(batch.matrixWorld.elements[12]-oldWorld.elements[12]-2)<1e-5,'Frozen local transforms still follow moving parents');
for(const mesh of [interactive,glass,custom,extra,another,...hiddenParts,...moving])assert.ok(mesh.parent,'Interactive, glass, dynamic, hidden, custom and different materials stay independent');
const hitOnly=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({transparent:true,opacity:0}));hitOnly.visible=false;hitOnly.updateMatrixWorld(true);
const ray=new THREE.Raycaster(new THREE.Vector3(0,0,5),new THREE.Vector3(0,0,-1));assert.ok(ray.intersectObject(hitOnly).length,'Hidden hit targets still receive pointer raycasts');
console.log('Studio batching checks passed: fewer draw calls, matching geometry/materials, preserved controls, glass, hidden and moving parts.');
