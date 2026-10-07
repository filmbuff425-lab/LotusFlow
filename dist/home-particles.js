import * as THREE from 'three';

// The same warm light lives in the wordmark, the distant dust and the cell membrane.
export async function createHomeParticles(scene, map, reduced) {
 const root=new THREE.Group();scene.add(root);
 const image=new Image();image.src='./assets/lotus-flow-wordmark.png';await image.decode();
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=Math.round(600*image.height/image.width);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
 const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,samples=[];
 let minX=600,maxX=0,minY=canvas.height,maxY=0;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<600;x++){const k=(y*600+x)*4,r=data[k],g=data[k+1],b=data[k+2];if(data[k+3]>130&&((r>120&&g<Math.min(26,r*.13)&&b<26)||(r>226&&g>180&&b>145))){samples.push([x,y]);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
 const random=n=>{const f=Math.sin(n*127.1+47.7)*43758.5453;return f-Math.floor(f);};
 const layers=[];
 function layer(count,size,opacity,logo){
  const base=new Float32Array(count*3),positions=new Float32Array(count*3),colors=new Float32Array(count*3);
  for(let i=0;i<count;i++){const k=i*3;
   if(logo){const s=samples[Math.floor(random(i+7)*samples.length)];base[k]=(s[0]-(minX+maxX)/2)/(maxX-minX)*18;base[k+1]=((minY+maxY)/2-s[1])/(maxX-minX)*18+2.1;base[k+2]=-7+(random(i+2)-.5)*.38;}
   else{base[k]=(random(i+71)-.5)*46;base[k+1]=(random(i+42)-.5)*27;base[k+2]=-28+random(i+29)*37;}
   new THREE.Color(i%9===0?0xffffff:i%3===0?0xff819e:0xffc9d5).multiplyScalar(logo?1.2:.65+random(i+18)*.55).toArray(colors,k);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const material=new THREE.PointsMaterial({map,size,opacity,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false});
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;root.add(points);
  let halo=null;if(logo){halo=new THREE.Points(geometry,new THREE.PointsMaterial({map,size:.32,opacity:.25,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));halo.frustumCulled=false;root.add(halo);}
  layers.push({base,positions,geometry,material,halo,count,opacity,logo});
 }
 layer(19000,.115,.98,true);layer(12500,.047,.54,false);layer(1000,.105,.66,false);
 let epoch=null,wasDissolved=false;
 return{update(now,{burst=0,dissolve=0,pointer,reveal=0}={}){
  if(epoch===null||(wasDissolved&&dissolve===0&&reveal===0))epoch=now;wasDissolved=dissolve>.9;
  const t=reduced?0:now*.001,settle=reduced?1:THREE.MathUtils.smoothstep((now-epoch)/1000,0,5.5),scatter=(1-settle)*1.7;
  root.visible=dissolve<.999;root.position.set((pointer?.x||0)*.13,(pointer?.y||0)*.12,0);
  for(const l of layers){for(let i=0;i<l.count;i++){const k=i*3,drift=l.logo?.018:.10,spread=1+burst*(1.5+random(i)*2.5);
   l.positions[k]=l.base[k]*spread+Math.sin(i*2.3+t*.15)*(drift+(l.logo?scatter:0));
   l.positions[k+1]=l.base[k+1]*spread+Math.cos(i*1.9+t*.19)*(drift+(l.logo?scatter:0));
   l.positions[k+2]=l.base[k+2]+Math.sin(i+t*.14)*drift+burst*random(i+4)*20;
  }l.geometry.attributes.position.needsUpdate=true;l.material.opacity=l.opacity*(1-dissolve)*(l.logo?.75+settle*.25:1);if(l.halo)l.halo.material.opacity=(.25+Math.sin(t*.55)*.035)*(1-dissolve);}
 }};
}
