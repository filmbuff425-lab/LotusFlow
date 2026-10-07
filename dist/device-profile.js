import {mobileImages} from './mobile-images.js';

// Choose the rendering budget once per page. Desktop assets and framing stay independent.
export const handheld=typeof matchMedia==='function'&&matchMedia('(max-width:700px), (max-width:1024px) and (pointer:coarse)').matches;
export const deviceProfile={handheld,pixelRatio:handheld?1.25:1.5,panelWidth:handheld?1024:4096,screenFPS:handheld?20:30};
export function mobileAsset(url,base=import.meta.url){
 if(!handheld)return url;
 const absolute=new URL(url,base),site=new URL('.',import.meta.url);
 if(absolute.origin!==site.origin)return url;
 const key=absolute.pathname.slice(site.pathname.length),variant=mobileImages[key];
 return variant?new URL(variant,site).href:url;
}
export function canvasScale(width,height){return handheld?Math.min(1,Math.max(width,height)>=512?.5:1):1}
// Replace the static archive images before they scroll into view. Dynamic image
// owners call mobileAsset directly; no site-wide mutation watcher is needed.
export function applyMobileImages(root=document){
 if(!handheld)return;
 for(const image of root.querySelectorAll('img[src]')){const src=mobileAsset(image.src);if(src!==image.src)image.src=src}
 for(const spine of root.querySelectorAll('[style*="--spine-cover"]')){
  const source=spine.style.getPropertyValue('--spine-cover').match(/url\(["']?(.*?)["']?\)/)?.[1];
  if(source){const src=mobileAsset(source);if(src!==source)spine.style.setProperty('--spine-cover',`url("${src}")`)}
 }
}
