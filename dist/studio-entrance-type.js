import * as THREE from 'three';

// Keep the print centered on the front edge in the shell's local coordinates.
// Orbiting the camera changes its perspective without moving it around the box.
export function createEntrancePrint(glassGroup,dims,renderer){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;
 const context=canvas.getContext('2d');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=Math.min(matchMedia('(max-width:700px)').matches?4:8,renderer.capabilities.getMaxAnisotropy());
 const glowTime={value:0};
 const material=new THREE.MeshBasicMaterial({map:texture,color:0xfff0df,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 // A soft highlight travels through the existing lettering in the same pass.
 material.onBeforeCompile=shader=>{
  shader.uniforms.entranceTime=glowTime;
  shader.fragmentShader='uniform float entranceTime;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float breath=.98+.025*sin(entranceTime*.9);
   float shimmerOffset=(vMapUv.x-(.5+.58*sin(entranceTime*.34)))*10.;
   float highlight=exp(-shimmerOffset*shimmerOffset);
   diffuseColor.rgb*=breath+highlight*.22;`);
 };
 const print=new THREE.Mesh(new THREE.PlaneGeometry(dims.x*.92,20),material);
 print.name='studio-entrance-slogan';print.rotation.x=-Math.PI/2;
 print.position.set(0,-dims.y/2+.12,dims.z/2+17);
 print.castShadow=print.receiveShadow=false;glassGroup.add(print);
 function paint(){context.clearRect(0,0,1024,128);context.fillStyle='#fff';context.textAlign='center';context.textBaseline='middle';context.font='850 58px LotusDotDisplay, monospace';context.fillText('EXPRESSION OVER IMPRESSION',512,64,984);texture.needsUpdate=true}
 paint();document.fonts.load('850 58px LotusDotDisplay').then(paint).catch(()=>{});
 return{update(progress,time){
  glowTime.value=time;
  material.opacity=.92*(1-THREE.MathUtils.smoothstep(progress,.01,.20));print.visible=material.opacity>.001;
 }};
}

// The alternate local composition uses the same artwork on the glass face.
// It inherits the shell transform and fade, with no additional light or pass.
export function createCubeBrand(glassGroup,dims){
 if(document.documentElement.dataset.entranceBrand!=='cube')return null;
 const map=new THREE.TextureLoader().load(new URL('./assets/lotus-original-red-gold-web.webp',import.meta.url).href);
 map.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,toneMapped:false});
 const logo=new THREE.Mesh(new THREE.PlaneGeometry(54,36),material);
 logo.name='studio-shell-logo';logo.position.set(0,1,dims.z/2+.08);
 glassGroup.add(logo);
 return logo;
}
