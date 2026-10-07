import * as THREE from 'three';
// A deep field of distant stars; the logo occasionally resolves out of sparse starlight.
export function createCosmos({scene,camera}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,group=new THREE.Group();group.visible=false;scene.add(group);
 const rnd=n=>{const v=Math.sin(n*127.1+47.7)*43758.5453;return v-Math.floor(v)};
 const orbitPhoto=new THREE.TextureLoader().load('assets/studio-earth-rim.png');orbitPhoto.colorSpace=THREE.SRGBColorSpace;orbitPhoto.anisotropy=4;
 const uniforms={time:{value:0},reveal:{value:0},orbitPhoto:{value:orbitPhoto}};
 // Camera-centred opaque sky renders before the room. It cannot intersect the room
 // or expose a low-poly silhouette when the camera crosses its old world-space edge.
 const sky=new THREE.Mesh(new THREE.SphereGeometry(260,48,32),new THREE.ShaderMaterial({uniforms,side:THREE.BackSide,depthWrite:false,depthTest:false,toneMapped:false,
 vertexShader:'varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`varying vec3 direction;uniform float reveal,time;uniform sampler2D orbitPhoto;
 void main(){
  vec3 d=normalize(direction);float longitude=atan(d.x,-d.z),latitude=asin(d.y);
  // The photograph is a distant orbital horizon, not a room-sized light wall.
  // Preserve the wide photograph's proportions and place its horizon behind the room.
  // Independent, very slow orbital drift: no texture regeneration or frame stepping.
  vec2 orbitDrift=vec2(sin(time*.082)*.048,sin(time*.061)*.014);
  vec2 uv=vec2(.5+longitude/2.8,.49+latitude/1.575)+orbitDrift;
  float photoMask=smoothstep(0.,.10,uv.x)*(1.-smoothstep(.90,1.,uv.x))*smoothstep(0.,.10,uv.y)*(1.-smoothstep(.90,1.,uv.y));
  vec3 c=vec3(.00045,.00065,.0010);
  vec3 photo=texture2D(orbitPhoto,clamp(uv,0.,1.)).rgb;
  // Keep the photographic blacks dense, with exposure confined to the thin rim.
  photo=pow(max(photo-vec3(.001),vec3(0.)),vec3(2.2))*.72;
  float atmosphere=smoothstep(.025,.24,max(photo.r,max(photo.g,photo.b)));
  float breathe=.95+.13*sin(time*.46+uv.x*4.8);
  photo*=mix(1.,breathe,atmosphere);
  c=mix(c,photo,photoMask);
  gl_FragColor=vec4(mix(vec3(.001,.001,.0016),c,reveal),1.);
  #include <colorspace_fragment>
 }`}));sky.renderOrder=-90;sky.frustumCulled=false;group.add(sky);
 const count=2900,positions=new Float32Array(count*3),sizes=new Float32Array(count),colors=new Float32Array(count*3),seeds=new Float32Array(count);
 for(let i=0;i<count;i++){const a=rnd(i*7+1)*Math.PI*2,v=rnd(i*7+2)*2-1,r=125+rnd(i*7+3)*230,q=Math.sqrt(1-v*v);positions.set([Math.cos(a)*q*r,v*r+12,Math.sin(a)*q*r],i*3);seeds[i]=rnd(i*7+4);sizes[i]=i%67===0?4.5:.55+rnd(i*7+5)*1.7;new THREE.Color(i%9===0?0xe8bc82:i%5===0?0x96b6e2:0xd4dce5).multiplyScalar(.4+rnd(i*7+6)*.5).toArray(colors,i*3)}
 function attributes(position,size,color,seed){const g=new THREE.BufferGeometry();for(const[name,array,n]of[['position',position,3],['size',size,1],['color',color,3],['seed',seed,1]])g.setAttribute(name,new THREE.BufferAttribute(array,n));return g}
 const fragment=`uniform float reveal;varying vec3 vColor;varying float vAlpha,vFlare;void main(){vec2 p=(gl_PointCoord-.5)*2.;float d=length(p);if(d>1.)discard;float glow=exp(-d*d*6.);float flare=(exp(-abs(p.x)*42.)+exp(-abs(p.y)*42.))*pow(1.-d,2.)*.22*vFlare;gl_FragColor=vec4(vColor,(glow+flare)*vAlpha*reveal);}`;
 const stars=new THREE.Points(attributes(positions,sizes,colors,seeds),new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
 vertexShader:`attribute float size,seed;attribute vec3 color;uniform float time;varying vec3 vColor;varying float vAlpha,vFlare;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(size*410./max(60.,-p.z),1.0,5.5);vColor=color;vAlpha=.28+.72*pow(.5+.5*sin(seed*97.+time*(.45+seed*.38)),2.);vFlare=step(3.,size);}`,fragmentShader:fragment}));stars.frustumCulled=false;group.add(stars);
 const logoUniforms={time:uniforms.time,reveal:uniforms.reveal,gather:{value:0}};
 let logoPoints;
 const logo=new Image();logo.onload=()=>{const c=document.createElement('canvas');c.width=160;c.height=106;const g=c.getContext('2d');g.drawImage(logo,0,0,160,106);const data=g.getImageData(0,0,160,106).data,points=[];
  for(let y=2;y<104;y+=2)for(let x=2;x<158;x+=2){const k=(y*160+x)*4;if(data[k+3]>100&&Math.max(data[k],data[k+1],data[k+2])>60&&rnd(k)>.37)points.push([x,y])}
  const n=points.length,pos=new Float32Array(n*3),origin=new Float32Array(n*3),size=new Float32Array(n),color=new Float32Array(n*3),seed=new Float32Array(n);
  points.forEach(([x,y],i)=>{pos.set([(x/160-.5)*74,(.5-y/106)*49,0],i*3);const a=rnd(i+4)*6.283,r=19+rnd(i+9)*55;origin.set([Math.cos(a)*r,Math.sin(a)*r*.7,(rnd(i+17)-.5)*24],i*3);size[i]=i%49===0?5:1+rnd(i+29)*1.7;seed[i]=rnd(i+36);new THREE.Color(i%12===0?0xe1cbc0:0xb3c1ec).toArray(color,i*3)});
  const geo=attributes(pos,size,color,seed);geo.setAttribute('origin',new THREE.BufferAttribute(origin,3));
  logoPoints=new THREE.Points(geo,new THREE.ShaderMaterial({uniforms:logoUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:`attribute vec3 origin,color;attribute float size,seed;uniform float time,gather;varying vec3 vColor;varying float vAlpha,vFlare;void main(){vec3 dest=position+vec3(sin(time*.13+seed*12.),cos(time*.15+seed*9.),0.)*.23;vec3 p=mix(origin,dest,gather);p.z+=sin(seed*19.+time*.24)*(1.-gather)*3.;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(size*250./max(60.,-mv.z),.8,7.);vColor=color;vAlpha=(.08+.15*gather)*(.50+.50*pow(sin(time*.56+seed*67.)*.5+.5,3.));vFlare=step(3.,size);}`,fragmentShader:fragment}));logoPoints.position.set(-8,36,-102);logoPoints.rotation.z=-.12;logoPoints.frustumCulled=false;group.add(logoPoints);
 };logo.src='assets/lotus-flow-wordmark.png';
 function setReveal(v){uniforms.reveal.value=v;group.visible=v>.001}
 function update(now){const t=reduced?0:now*.001;uniforms.time.value=t;sky.position.copy(camera.position);const orbitAngle=-t*.014;sky.rotation.z=orbitAngle;stars.rotation.y=Math.sin(t*.046)*.045;stars.rotation.z=orbitAngle+Math.sin(t*.021)*.006;const phase=t%27;logoUniforms.gather.value=reduced?.72:THREE.MathUtils.smoothstep(phase,3,10)*(1-THREE.MathUtils.smoothstep(phase,15,23));}
 return{group,update,setReveal};
}
