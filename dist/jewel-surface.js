import * as THREE from 'three';
import {pressingProfile} from './pressing-profiles.js?v=20261006-lake-surface1';

// Static molded details share draw calls; hinge and waveform remain independent.
export function batchMeshes(parent){
 const groups=new Map();
 for(const m of [...parent.children]){
  if(!m.isMesh||m.material.isShaderMaterial)continue;
  const key=m.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(m);
 }
 for(const meshes of groups.values()){
  if(meshes.length<2)continue;
  const geometries=meshes.map(m=>{m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();return g.applyMatrix4(m.matrix)});
  const merged=new THREE.BufferGeometry();
  for(const key of ['position','normal','uv']){
   if(!geometries.every(g=>g.attributes[key]))continue;
   const arrays=geometries.map(g=>g.attributes[key].array),out=new Float32Array(arrays.reduce((n,a)=>n+a.length,0));let offset=0;
   for(const a of arrays){out.set(a,offset);offset+=a.length}
   merged.setAttribute(key,new THREE.BufferAttribute(out,geometries[0].attributes[key].itemSize));
  }
  merged.computeBoundingBox();merged.computeBoundingSphere();
  for(const m of meshes){parent.remove(m);m.geometry.dispose()}for(const g of geometries)g.dispose();
  parent.add(new THREE.Mesh(merged,meshes[0].material));
 }
}

export function discReflection(radius=2,edition='news'){
 const p=pressingProfile(edition);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,
 uniforms:{angle:{value:.78},radius:{value:radius},strength:{value:1},finish:{value:p.mode},offset:{value:p.angle},spread:{value:p.spread},density:{value:p.grain},intensity:{value:p.intensity},phase:{value:p.phase}},
 vertexShader:`varying vec2 point;void main(){point=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`varying vec2 point;uniform float angle,radius,strength,finish,offset,spread,density,intensity,phase;
 float bell(float x,float w){return exp(-x*x/(w*w));}
 void main(){
  vec2 v=point/radius;float r=length(v),theta=angle+offset;
  vec2 q=mat2(cos(theta),-sin(theta),sin(theta),cos(theta))*v;
  float a=atan(q.y,q.x),w=spread,light=0.;vec3 tint=vec3(1.);
  float gp=r*density,aa=max(fwidth(gp),.1);
  float grooves=1.-smoothstep(.2-aa,.8+aa,abs(sin(gp)));
  float grain=fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);
  if(finish<.5){
   // Pearl: a soft off-axis pool and a curved, feathered rim.
   vec2 d=q-vec2(-.32,.39);light=exp(-dot(d*d,vec2(5.,13.))/w)*.30;
   light+=bell(r-.79,.11)*pow(max(0.,cos(a+1.1)),8.)*.16;
  }else if(finish<1.5){
   // Brushed metal catches a single narrow strip light, never a mirrored X.
   light=(bell(q.x+.16,.038*w)*.5+bell(q.x+.31,.011*w)*.22)*(.7+.3*bell(q.y,.7));
  }else if(finish<2.5){
   float c=length(q-vec2(-.3,.05));
   light=bell(c-.93,.026*w)*.35*smoothstep(-.35,.6,q.y);
   light+=exp(-dot((q-vec2(.53,-.51))*(q-vec2(.53,-.51)),vec2(20.,32.)))*.22;
  }else if(finish<3.5){
   // Curved caustics give a liquid coating a different light response.
   float wave=q.x+.22*sin(q.y*3.2+phase)+.04*sin(q.y*8.+phase);
   light=bell(wave-.22,.027*w)*.31+bell(wave+.31,.058*w)*.13;
   light*=.38+.62*bell(q.y,.78);
  }else if(finish<4.5){
   vec2 d=q-vec2(-.37,.59);light=exp(-dot(d*d,vec2(80.,240.))/(w*w))*.58;
   light+=bell(r-.91,.018*w)*pow(max(0.,cos(a-2.1)),20./w)*.28;
   light+=exp(-dot((q-vec2(.45,-.48))*(q-vec2(.45,-.48)),vec2(7.,11.)))*.035;
  }else if(finish<5.5){
   light=bell(q.x+.18,.43*w)*(.1+.06*bell(q.y-.2,.65));
  }else if(finish<6.5){
   float wave=q.x+.17*sin(q.y*4.+phase);
   light=(bell(wave-.22,.026*w)*.36+bell(wave+.43,.054*w)*.22)*smoothstep(.45,.8,r);
   light+=bell(r-.93,.035)*pow(max(0.,cos(a-.5)),6.)*.18;
  }else if(finish<7.5){
   float facet=q.x+q.y*.2+sin(q.y*2.2+phase)*.025;
   float band=bell(facet-.2,.13*w),filament=bell(facet+.38,.017*w);
   vec3 spectrum=.64+.36*cos(facet*21.+phase+vec3(0.,2.1,4.2));
   tint=mix(vec3(1.),spectrum,band*.92);light=band*.4+filament*.30;
   light*=.65+.35*bell(q.y,.7);
  }else if(finish<8.5){
   light=bell(q.x+.48,.48*w)*.17+bell(r-.94,.028*w)*pow(max(0.,cos(a-.5)),7.)*.26;
   light+=grain*.013;
  }else{
   float arc=a+.35+(r-.5)*.3;
   light=pow(max(0.,cos(arc)),240./w)*.52+bell(r-.8,.009)*pow(max(0.,cos(a+1.)),12.)*.17;
  }
  float alpha=(light*(.84+grooves*.16)+grooves*.009+grain*.003)*strength*intensity;
  alpha*=smoothstep(.13,.22,r);gl_FragColor=vec4(tint,min(alpha,.62));
 }`});
 material.userData.finish=p.name;return material;
}

// The image itself determines the signal tint: no global red overlay on every release.
export function coverColor(image){
 const canvas=document.createElement('canvas');canvas.width=40;canvas.height=40;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,40,40);
 const pixels=ctx.getImageData(0,0,40,40).data,buckets=Array.from({length:24},()=>({weight:0,r:0,g:0,b:0})),color=new THREE.Color(),hsl={};
 for(let i=0;i<pixels.length;i+=4){color.setRGB(pixels[i]/255,pixels[i+1]/255,pixels[i+2]/255,THREE.SRGBColorSpace);color.getHSL(hsl);if(hsl.s<.22||hsl.l<.04||hsl.l>.8)continue;const b=buckets[Math.floor(hsl.h*24)%24],weight=hsl.s*(1-Math.abs(hsl.l-.36));b.weight+=weight;b.r+=color.r*weight;b.g+=color.g*weight;b.b+=color.b*weight}
 const b=buckets.sort((a,b)=>b.weight-a.weight)[0];return b.weight?new THREE.Color(b.r/b.weight,b.g/b.weight,b.b/b.weight).lerp(new THREE.Color('white'),.18):new THREE.Color('#dea0b9');
}

// Vertical, fine voice threads dissolve at the ends, like the supplied Mantra film.
// One dynamic buffer and one draw call per layer keep the hinge animation lightweight.
export function createLidSignal(lid,scene,signal,reduced){
 const surface=new THREE.Group();surface.position.z=-.025;surface.rotation.y=Math.PI;lid.add(surface);
 const color=new THREE.Color('#e7a0bb'),count=180,voices=5;
 function bundle(parent,background=false){
  const geometry=new THREE.BufferGeometry(),positions=new Float32Array(voices*(count-1)*6),fades=new Float32Array(voices*(count-1)*2);
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  for(let j=0;j<voices;j++)for(let k=0;k<count-1;k++)for(let e=0;e<2;e++)fades[(j*(count-1)+k)*2+e]=Math.pow(Math.sin((k+e)/(count-1)*Math.PI),.65)*(j===2?1:.55);
  geometry.setAttribute('fade',new THREE.BufferAttribute(fades,1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:!background,toneMapped:false,blending:THREE.AdditiveBlending,
   uniforms:{tint:{value:color.clone()},opacity:{value:background?0:.65}},
   vertexShader:'attribute float fade;varying float f;void main(){f=fade;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'uniform vec3 tint;uniform float opacity;varying float f;void main(){gl_FragColor=vec4(tint,opacity*f);}' });
  const lines=new THREE.LineSegments(geometry,material);lines.frustumCulled=false;if(background)lines.renderOrder=-2;parent.add(lines);return lines;
 }
 const local=bundle(surface),background=bundle(scene,true);background.position.set(-4,0,-3);background.scale.set(1.7,3.7,1);
 const smoothed=new Float32Array(128);let energy=0,phase=0;
 return{setColor(c){local.material.uniforms.tint.value.copy(c);background.material.uniforms.tint.value.copy(c)},update(dt,progress){
  const data=signal.read(),live=data.playing&&!reduced,blend=1-Math.exp(-dt*8);
  energy+=((live?Math.min(1,data.level*4):0)-energy)*(1-Math.exp(-dt*6));
  if(live)phase+=dt*.6;
  for(let i=0;i<128;i++){const v=live?(data.samples[i*4]+data.samples[i*4+1]+data.samples[i*4+2]+data.samples[i*4+3])*.25:0;smoothed[i]+=(v-smoothed[i])*blend}
  for(const [layer,wide] of [[local,false],[background,true]]){
   const a=layer.geometry.attributes.position.array;
   for(let j=0;j<voices;j++)for(let k=0;k<count-1;k++)for(let e=0;e<2;e++){
    const u=(k+e)/(count-1),y=(u-.5)*4.7,v=smoothed[Math.floor(u*127)];
    const wave=Math.sin(u*28+phase*2.1+j*.85)*.17+Math.sin(u*61-phase*1.7+j*.36)*.085+Math.sin(u*113+phase*2.8-j*.5)*.03;
    const x=(j-2)*.065+(wave+v*.25)*(.15+energy*1.7);
    const n=(j*(count-1)+k)*6+e*3;a[n]=x+(wide?Math.sin(u*6+phase*.35)*.25:0);a[n+1]=y;a[n+2]=.006;
   }
   layer.geometry.attributes.position.needsUpdate=true;
  }
  local.material.uniforms.opacity.value=.32+energy*.5;
  background.material.uniforms.opacity.value=progress*(.025+energy*.075);
  surface.visible=progress>.02;background.visible=progress>.01;
  return energy;
 }};
}
