// Upload original textures in small batches instead of blocking the glass reveal.
export async function warmStudioTextures(renderer,objects,{now=()=>performance.now(),yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve)),budgetMs=8}={}){
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
export async function warmStudioGeometry(renderer,scene,camera,roots,target,{yieldFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve)),batchSize=64}={}){
 const objects=[];
 function visit(object){if(!object.visible)return;if(object.isMesh||object.isPoints||object.isLine)objects.push(object);for(const child of object.children)visit(child)}
 for(const root of roots)for(const child of root.children)visit(child);
 const previousTarget=renderer.getRenderTarget(),rootVisibility=roots.map(root=>root.visible),shadowUpdate=renderer.shadowMap.needsUpdate;
 try{
  for(let start=0;start<objects.length;start+=batchSize){
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
