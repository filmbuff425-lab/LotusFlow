import * as THREE from 'three';
// Consolidate static opaque parts; keep controls, moving parents and optical surfaces independent.
export function batchStudio(root,interactive){
 const excluded=new Set(interactive),groups=new Map(),materialKeys=new WeakMap(),inverse=new THREE.Matrix4();root.updateMatrixWorld(true);inverse.copy(root.matrixWorld).invert();let before=0,removed=0;
 function materialKey(material){
  if(materialKeys.has(material))return materialKeys.get(material);
  // UUIDs separate otherwise identical static hardware into thousands of draw calls.
  // All optical parameters and texture identities remain part of the key.
  const data=material.toJSON();for(const key of ['metadata','uuid','name','textures','images'])delete data[key];
  const key=JSON.stringify(data);materialKeys.set(material,key);return key;
 }
 function visit(object,blocked=false){
  const skip=blocked||!object.visible||excluded.has(object)||object.userData.dynamic||!!object.userData.update;
  if(object.isMesh)before++;
  if(object.isMesh&&!skip&&!object.isInstancedMesh&&!Array.isArray(object.material)&&!object.material.transparent&&!object.material.transmission&&!object.material.isShaderMaterial&&!object.material.vertexColors&&object.material.onBeforeCompile===THREE.Material.prototype.onBeforeCompile&&object.onBeforeRender===THREE.Object3D.prototype.onBeforeRender&&!object.isSkinnedMesh&&!object.morphTargetInfluences&&Object.keys(object.geometry.attributes).every(name=>['position','normal','uv'].includes(name))&&object.geometry.attributes.normal&&object.geometry.attributes.uv){
   const key=materialKey(object.material)+'/'+object.castShadow+'/'+object.receiveShadow+'/'+object.renderOrder;
   if(!groups.has(key))groups.set(key,[]);groups.get(key).push(object);
  }
  for(const child of object.children)visit(child,skip);
 }
 for(const child of root.children)visit(child);
 for(const objects of groups.values()){
  if(objects.length<3)continue;const parts=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));return g});
  const geometry=new THREE.BufferGeometry();for(const name of ['position','normal','uv']){const itemSize=name==='uv'?2:3;const length=parts.reduce((n,g)=>n+g.attributes[name].array.length,0),array=new Float32Array(length);let offset=0;for(const g of parts){array.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length}geometry.setAttribute(name,new THREE.BufferAttribute(array,itemSize))}
  geometry.computeBoundingSphere();const sample=objects[0],mesh=new THREE.Mesh(geometry,sample.material);mesh.castShadow=sample.castShadow;mesh.receiveShadow=sample.receiveShadow;mesh.renderOrder=sample.renderOrder;mesh.name='Static studio batch';root.add(mesh);objects.forEach(o=>o.removeFromParent());parts.forEach(g=>g.dispose());removed+=objects.length-1;
 }
 return{before,after:before-removed};
}
