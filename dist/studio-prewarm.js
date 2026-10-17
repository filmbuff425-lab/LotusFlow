import {Group} from './vendor/three.module.js';
import {waitForIdentityMotion,identityMotionActive} from './chapter-priority.js';
// Count the original texels without encoding or copying any source canvas.
export function studioTextureFootprint(objects){
 const textures=new Set();
 for(const root of objects)root?.traverse(object=>{
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(!material)continue;
   for(const value of Object.values(material))if(value?.isTexture&&!value.isRenderTargetTexture)textures.add(value);
   for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture&&!uniform.value.isRenderTargetTexture)textures.add(uniform.value);
  }
 });
 let texels=0,sourceTexels=0;const largest=[],sources=new Set();
 for(const texture of textures){const image=texture.image,w=image?.width||image?.naturalWidth||0,h=image?.height||image?.naturalHeight||0;texels+=w*h;if(!sources.has(texture.source)){sources.add(texture.source);sourceTexels+=w*h}largest.push({width:w,height:h,name: texture.name||image?.src?.split('/').pop()||'canvas'})}
 return{textures:textures.size,uniqueSources:sources.size,sourceMiB:+(sourceTexels*4/1048576).toFixed(1),rgbaMiB:+(texels*4/1048576).toFixed(1),largest:largest.sort((a,b)=>b.width*b.height-a.width*a.height).slice(0,8)};
}

// Upload original textures in small batches instead of blocking the glass reveal.
export async function warmStudioTextures(renderer,objects,{now=()=>performance.now(),yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),budgetMs=5}={}){
 const textures=new Set();
 for(const root of objects)root?.traverse(object=>{
  for(const material of Array.isArray(object.material)?object.material:[object.material]){
   if(!material)continue;
   for(const value of Object.values(material))if(value?.isTexture&&!value.isRenderTargetTexture)textures.add(value);
   for(const uniform of Object.values(material.uniforms||{}))if(uniform.value?.isTexture&&!uniform.value.isRenderTargetTexture)textures.add(uniform.value);
  }
 });
 let sliceAt=now(),count=0,slices=0,longest=0;
 for(const texture of textures){
  if(identityMotionActive())await waitForIdentityMotion();
  const image=texture.image;
  if(!image||image.complete===false)continue;
  renderer.initTexture(texture);count++;
  const elapsed=now()-sliceAt;
  if(elapsed>=budgetMs){longest=Math.max(longest,elapsed);slices++;await yieldFrame();sliceAt=now()}
 }
 longest=Math.max(longest,now()-sliceAt);
 return{textures:count,slices,longestMs:+longest.toFixed(1)};
}

// Keep first-use buffer uploads out of a single long visible frame.
export async function warmStudioGeometry(renderer,scene,camera,roots,target,{yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),batchSize=24}={}){
 const objects=[];
 function visit(object){if(!object.visible)return;if(object.isMesh||object.isPoints||object.isLine)objects.push(object);for(const child of object.children)visit(child)}
 for(const root of roots)for(const child of root.children)visit(child);
 const previousTarget=renderer.getRenderTarget(),rootVisibility=roots.map(root=>root.visible),shadowUpdate=renderer.shadowMap.needsUpdate;
 try{
  for(let start=0;start<objects.length;start+=batchSize){
   if(identityMotionActive())await waitForIdentityMotion();
   // Change visibility only during this offscreen render, never across a yield.
   roots.forEach(root=>root.visible=true);objects.forEach(object=>object.visible=false);
   for(const object of objects.slice(start,start+batchSize)){
    object.visible=true;
    for(let parent=object.parent;parent&&!roots.includes(parent);parent=parent.parent)parent.visible=true;
   }
   renderer.shadowMap.needsUpdate=false;renderer.setRenderTarget(target);
   try{renderer.render(scene,camera)}finally{
    renderer.setRenderTarget(previousTarget);objects.forEach(object=>object.visible=true);
    roots.forEach((root,index)=>root.visible=rootVisibility[index]);renderer.shadowMap.needsUpdate=shadowUpdate;
   }
   await yieldFrame();
  }
 }finally{
  renderer.setRenderTarget(previousTarget);objects.forEach(object=>object.visible=true);
  roots.forEach((root,index)=>root.visible=rootVisibility[index]);renderer.shadowMap.needsUpdate=shadowUpdate;
 }
 return{objects:objects.length,batches:Math.ceil(objects.length/batchSize)};
}

// compileAsync still walks/prepares every material synchronously before its Promise.
// Bound that first pass too, using one representative of each distinct material.
export async function warmStudioPrograms(renderer,scene,camera,roots,{yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0))),batchSize=8,now=()=>performance.now()}={}){
 const representatives=[],materials=new Set();
 for(const root of roots)root.traverse(object=>{if(!object.isMesh&&!object.isPoints&&!object.isLine)return;const keys=Array.isArray(object.material)?object.material:[object.material];if(keys.some(m=>!materials.has(m))){representatives.push(object);keys.forEach(m=>materials.add(m))}});
 const visibility=roots.map(o=>o.visible);let longest=0;
 for(let start=0;start<representatives.length;start+=batchSize){
  if(identityMotionActive())await waitForIdentityMotion();
  // Three.compile traverses invisible children too. A separate, shallow batch
  // is essential; hiding the other meshes still recompiles the entire room.
  const batch=new Group();for(const object of representatives.slice(start,start+batchSize))batch.add(object.clone(false));
  let task;const at=now();
  try{roots.forEach(o=>o.visible=true);task=renderer.compileAsync(batch,camera,scene)}finally{roots.forEach((o,i)=>o.visible=visibility[i])}
  longest=Math.max(longest,now()-at);await task;await yieldFrame();
 }
 return{materials:materials.size,batches:Math.ceil(representatives.length/batchSize),longestMs:+longest.toFixed(1)};
}
