import * as THREE from 'three';
import {createReferenceObjects} from './studio-reference-objects.js?v=20261006-lake-surface1';

// All three shelf objects are actual volumes, with a shared studio reflection rig.
export function mountShelfObjects(host){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),items=[];
 for(const canvas of host.querySelectorAll('[data-shelf-object]')){
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
  const scene=new THREE.Scene(),env=new THREE.Scene();env.background=new THREE.Color(0x4b5057);
  const panel=(w,h,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=ry;env.add(m)};
  panel(4,7,-3,3,1,.6);panel(2,5,4,3,-1,-.8);panel(5,3,0,6,0,0);
  const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(env,0);scene.environment=environment.texture;pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xf4f5fa,0x514644,2.4));const key=new THREE.DirectionalLight(0xfff3e3,3.0);key.position.set(-3,5,5);scene.add(key);const rim=new THREE.DirectionalLight(0xc9deff,1.4);rim.position.set(4,2,-3);scene.add(rim);
  const texture=(w,h,draw)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
  const objects=createReferenceObjects(texture),kind=canvas.dataset.shelfObject,object=objects[kind](scene,0,0,0,1,kind==='cat'?-.26:kind==='love'?.12:0);
  const height=kind==='candle'||kind==='crystal'?1.65:kind==='lamp'?1.95:2.15,camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,20);camera.position.set(kind==='crystal'?.85:1.45,height*.72,7.5);camera.lookAt(0,height*.46,0);
  const resize=()=>{const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const half=height*.57;camera.top=half;camera.bottom=-half;camera.left=-half*w/h;camera.right=half*w/h;camera.updateProjectionMatrix();renderer.render(scene,camera)};
  const item={canvas,renderer,scene,camera,object,visible:false};items.push(item);new ResizeObserver(resize).observe(canvas);new IntersectionObserver(([e])=>{item.visible=e.isIntersecting;if(item.visible){resize();start()}},{rootMargin:'80px'}).observe(canvas);resize();canvas.dataset.materialReady='true';
 }
 let raf=0,last=0;function draw(now){raf=0;if(document.hidden||!items.some(i=>i.visible))return;if(now-last>33){last=now;for(const i of items)if(i.visible){i.object.userData.update?.(reduced.matches?0:now/1000);i.renderer.render(i.scene,i.camera)}}if(!reduced.matches)raf=requestAnimationFrame(draw)}
 function start(){if(!raf&&!document.hidden&&!reduced.matches)raf=requestAnimationFrame(draw)}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()});addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0});addEventListener('pageshow',start);
}
