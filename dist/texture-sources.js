import * as THREE from 'three';
import {mobileAsset} from './device-profile.js';
// Share original decoded pixels. Each use keeps its own UVs, sampler and colour space.
// Three also shares the GPU allocation when source and sampler parameters match.
export function createTextureSourcePool(load,base=()=>document.baseURI){
 const sources=new Map();
 return function shared(url,onLoad,onProgress,onError){
  const key=new URL(url,base()).href;let entry=sources.get(key);
  if(!entry){entry={texture:null,ready:false,pending:[]};sources.set(key,entry);
   entry.texture=load(key,()=>{entry.ready=true;for(const item of entry.pending){item.texture.needsUpdate=true;item.onLoad?.(item.texture)}entry.pending.length=0},onProgress,error=>{sources.delete(key);for(const item of entry.pending)item.onError?.(error);entry.pending.length=0});
  }
  const texture=new THREE.Texture();texture.source=entry.texture.source;
  if(entry.ready){texture.needsUpdate=true;queueMicrotask(()=>onLoad?.(texture))}else entry.pending.push({texture,onLoad,onError});
  return texture;
 };
}
const loader=new THREE.TextureLoader(),shared=createTextureSourcePool((url,...args)=>loader.load(mobileAsset(url),...args));
export const createSharedTextureLoader=()=>({load:shared,loadAsync:url=>new Promise((resolve,reject)=>shared(url,resolve,undefined,reject))});
