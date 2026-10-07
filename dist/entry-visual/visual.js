import * as THREE from '../vendor/three.module.js';

const stage=document.querySelector('#stage'),canvas=document.querySelector('#artwork');
const trigger=document.querySelector('#unfold'),identity=document.querySelector('#identity');
const finish=document.querySelector('#finish'),loading=document.querySelector('#loading');
const brand=document.querySelector('#brand');
const tagline=identity.querySelector('p');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(n)=>Math.max(0,Math.min(1,n));
const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n)};
const duration=2.4;
let renderer,scene,camera,field,sheet,distant,orb,passage,reverse;
let idleStart=performance.now(),start=0,elapsed=-1,mode='loading',raf=0,lastBrand=-1;
let markPixels=[],lastSize='',hiddenAt=0;
const stillFrame=Number(new URLSearchParams(location.search).get('frame'));
const inspect=new URLSearchParams(location.search).has('frame')&&Number.isFinite(stillFrame);

const surfaceVertex=`
  uniform float uFlip,uCurl,uTime;
  varying vec2 vUv;
  void main(){
    vUv=uv;
    vec3 p=position;
    float d=max(0.0,-p.y-0.045);
    float wave=sin(p.x*0.7+uTime*0.38)*0.008;
    float a=uFlip*3.28+uCurl*pow(d/2.4,1.3);
    p.y=-0.045-d*cos(a)+wave*(1.0-uFlip);
    p.z=d*sin(a);
    // The diagonal hinge and travelling bend create perspective within the surface.
    p.y-=p.x*0.014*uFlip;
    p.z+=sin(p.x*0.52)*uCurl*0.24;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
  }`;
const surfaceFragment=`
  uniform sampler2D uPlate;
  uniform float uOpacity,uFlip;
  varying vec2 vUv;
  void main(){
    vec2 q=vUv;
    float sphere=1.0-smoothstep(.88,1.18,length((q-vec2(.494,.499))/vec2(.024,.041)));
    vec3 c=mix(texture2D(uPlate,q).rgb,texture2D(uPlate,q+vec2(.08,0.)).rgb,sphere);
    float light=dot(c,vec3(.299,.587,.114));
    // The photographed light surface and black field are separate layers.
    float a=smoothstep(.026,.135,light)*uOpacity;
    a*=smoothstep(.12,.21,q.y)*(1.0-smoothstep(.471,.484,q.y));
    if(!gl_FrontFacing)c=mix(c,vec3(.96),.38);
    c*=1.0+uFlip*.34;
    gl_FragColor=vec4(c,a);
  }`;
const fieldVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.99,1.0);}`;
const fieldFragment=`
  uniform sampler2D uPlate;
  uniform vec2 uResolution;
  uniform float uTime,uSpeed;
  varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    vec2 pixel=vUv*uResolution;
    vec2 q=vec2(fract(pixel.x/1672.0+.065),.74+fract(pixel.y/225.0)*.24);
    vec3 c=min(texture2D(uPlate,q).rgb*.54,vec3(.018));
    float grain=hash(floor(vUv*uResolution)+floor(uTime*11.0));
    c+=(grain-.5)*.023;
    c*=1.0-.13*length(vUv-.5);
    if(uSpeed>.01){
      vec2 p=vUv-.5;
      float dust=pow(hash(floor(vec2(p.x+p.y*.38,p.y)*uResolution/vec2(1.,3.))),22.);
      c+=dust*uSpeed*.035;
    }
    gl_FragColor=vec4(c,1.);
  }`;
const orbVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const passageFragment=`
  uniform float uFront,uBack,uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    float y=1.0-vUv.y+.09*pow(vUv.x-.48,2.0)-vUv.x*.055;
    float coverage=smoothstep(uBack-.042,uBack+.042,y)*(1.0-smoothstep(uFront-.04,uFront+.04,y));
    float grain=hash(floor(vUv*uResolution)+floor(uTime*12.));
    gl_FragColor=vec4(vec3(.985-grain*.045),coverage);
  }`;
const reverseVertex=`
  uniform float uBend;
  varying vec2 vUv;
  varying vec3 vPosition;
  void main(){
    vUv=uv;vPosition=position;
    vec3 p=position;
    p.z+=sin(p.x*.38)*uBend*.85;
    p.y+=sin(p.x*.32)*uBend*.32;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
  }`;
const reverseFragment=`
  uniform sampler2D uMark,uPlate;
  uniform float uOpacity,uMarkReveal,uTime,uLogoScale;
  uniform vec4 uLogoRect;
  varying vec2 vUv;
  varying vec3 vPosition;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  void main(){
    float d=length((vUv-.5)*vec2(1.0,1.05));
    float coverage=1.0-smoothstep(.487,.499,d);
    vec2 q=vec2(fract(vUv.x*3.4),.76+fract(vUv.y*5.3)*.22);
    float grain=hash(floor(vUv*2400.)+floor(uTime*10.));
    vec3 c=min(texture2D(uPlate,q).rgb*.34,vec3(.013))+(grain-.5)*.019;
    c+=pow(smoothstep(.44,.493,d),8.)*.07;
    vec2 logoUv=(vPosition.xy-uLogoRect.xy)/(uLogoRect.zw*uLogoScale)+.5;
    float bounds=step(0.,logoUv.x)*step(logoUv.x,1.)*step(0.,logoUv.y)*step(logoUv.y,1.);
    vec4 logo=texture2D(uMark,clamp(logoUv,0.,1.));
    float threshold=abs(logoUv.x-.5)*.32+hash(floor(logoUv*vec2(144.,96.)))*.38;
    float ink=smoothstep(threshold,threshold+.15,uMarkReveal)*logo.a*bounds;
    c=mix(c,logo.rgb,ink);
    gl_FragColor=vec4(c,coverage*uOpacity);
  }`;
const orbFragment=`
  uniform sampler2D uPlate;
  uniform float uOpacity;
  varying vec2 vUv;
  void main(){
    vec2 q=vec2(.473+vUv.x*.043,.461+vUv.y*.076);
    vec3 c=texture2D(uPlate,q).rgb;
    float circle=1.-smoothstep(.477,.495,length(vUv-.5));
    gl_FragColor=vec4(c,circle*uOpacity);
  }`;

function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Asset could not load: '+src));im.src=src})}

function makeMark(image){
  const sample=document.createElement('canvas');sample.width=144;sample.height=96;
  const c=sample.getContext('2d');c.drawImage(image,0,0,144,96);
  const data=c.getImageData(0,0,144,96).data;
  brand.width=576;brand.height=384;
  for(let y=0;y<96;y++)for(let x=0;x<144;x++){
    const i=(y*144+x)*4;if(data[i+3]<110)continue;
    const star=(Math.abs(x-50)/12+Math.abs(y-33)/13<1)||(Math.abs(x-124)/12+Math.abs(y-32)/14<1);
    const tone=(data[i]*.3+data[i+1]*.5+data[i+2]*.2)/255;
    markPixels.push({x:x*4,y:y*4,color:star&&tone>.25?'#ffffff':tone>.1?'#f0202a':'#a61720',threshold:Math.abs(x-72)/144*.5+hash(x,y)*.45});
  }
}

function drawMark(p){
  if(Math.abs(p-lastBrand)<.002)return;lastBrand=p;
  const c=brand.getContext('2d');c.clearRect(0,0,576,384);
  for(const pixel of markPixels){
    const a=smooth(pixel.threshold,pixel.threshold+.18,p);if(a<=0)continue;
    c.globalAlpha=a*(.83+hash(pixel.x,pixel.y)*.17);c.fillStyle=pixel.color;
    c.fillRect(pixel.x,pixel.y,3.7,3.7);
  }
  c.globalAlpha=1;
}

function makeSurface(texture){
  const geometry=new THREE.PlaneGeometry(5.15,2.30,100,54);
  const pos=geometry.attributes.position,uv=geometry.attributes.uv;
  for(let i=0;i<pos.count;i++){
    const x=uv.getX(i),y=uv.getY(i);
    pos.setXYZ(i,(x-.5)*5.15,-.045-(1-y)*2.30,0);
    uv.setXY(i,x,.484-(1-y)*.775);
  }
  geometry.computeBoundingSphere();
  const material=new THREE.ShaderMaterial({
    uniforms:{uPlate:{value:texture},uFlip:{value:0},uCurl:{value:0},uTime:{value:0},uOpacity:{value:1}},
    vertexShader:surfaceVertex,fragmentShader:surfaceFragment,
    side:THREE.DoubleSide,transparent:true,depthWrite:false
  });
  const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;mesh.renderOrder=2;return mesh;
}

function resize(){
  if(!renderer)return;
  const w=stage.clientWidth,h=stage.clientHeight,key=w+'x'+h;if(key===lastSize)return;lastSize=key;
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setSize(w,h,false);
  camera.aspect=w/h;camera.updateProjectionMatrix();
  const widthFit=camera.aspect<1?Math.max(.32,camera.aspect/1.2):1;
  sheet.scale.x=widthFit;distant.scale.x=widthFit*1.6;
  field.material.uniforms.uResolution.value.set(w,h);
  const r=brand.getBoundingClientRect(),viewH=2*Math.tan(THREE.MathUtils.degToRad(19))*4.2;
  reverse.material.uniforms.uLogoRect.value.set(0,(h/2-r.top-r.height/2)/h*viewH,r.width/h*viewH,r.height/h*viewH);
}

function setState(next){mode=next;stage.dataset.state=next;canvas.dataset.state=next}

function play(){
  if(mode!=='idle')return;
  trigger.hidden=true;finish.hidden=true;identity.setAttribute('aria-hidden','true');
  start=performance.now();elapsed=0;lastBrand=-1;setState('playing');
}

function reset(){
  elapsed=-1;idleStart=performance.now();start=0;identity.style.opacity=0;tagline.style.opacity=0;
  trigger.hidden=false;trigger.disabled=false;finish.hidden=true;
  identity.setAttribute('aria-hidden','true');lastBrand=-1;drawMark(0);setState('idle');
}

function paint(now){
  const idle=(now-idleStart)/1000;
  const t=inspect?Math.max(0,stillFrame):mode==='playing'?(now-start)/1000:elapsed;
  const playing=t>=0;
  const move=playing?Math.pow(smooth(.20,.61,t),1.75):0;
  const rush=playing?Math.sin(Math.PI*smooth(.30,.75,t)):0;
  const settle=playing?smooth(1.65,2.3,t):0;
  const show=playing?smooth(1.25,1.85,t):0;
  const turn=playing?1-Math.pow(1-smooth(.61,1.35,t),3):0;
  field.material.uniforms.uTime.value=reduced.matches?0:idle;
  field.material.uniforms.uSpeed.value=reduced.matches?0:rush;
  const u=sheet.material.uniforms;
  u.uTime.value=reduced.matches?0:idle;u.uFlip.value=reduced.matches?0:move;
  u.uCurl.value=reduced.matches?0:rush*.86;
  u.uOpacity.value=playing?1-smooth(.61,.79,t):1;
  sheet.rotation.z=playing?-rush*.38:0;
  sheet.position.y=playing?smooth(.28,.56,t)*.68:0;
  sheet.position.z=playing?smooth(.28,.58,t)*1.74:0;
  camera.position.z=4.2-(reduced.matches?0:rush*2.15);
  camera.position.y=playing?-rush*.15:0;
  camera.rotation.z=playing?-rush*.12:0;
  orb.position.y=playing?-.13*smooth(0,.22,t)+.31*smooth(.26,.49,t):Math.sin(idle*.65)*.012;
  orb.position.x=-.032+(playing?rush*.08:Math.sin(idle*.28)*.009);
  orb.scale.setScalar(playing?1+move*.3:1);
  orb.material.uniforms.uOpacity.value=playing?1-smooth(.32,.49,t):1;
  distant.visible=false;distant.material.uniforms.uOpacity.value=settle*.18;
  distant.material.uniforms.uTime.value=reduced.matches?0:idle*.5;
  passage.visible=playing&&!reduced.matches&&t>.38&&t<1.52;
  passage.material.uniforms.uFront.value=smooth(.38,.54,t)*1.24-.12;
  passage.material.uniforms.uBack.value=smooth(1.18,1.51,t)*1.39-.12;
  passage.material.uniforms.uTime.value=idle;
  identity.style.opacity=String(show);
  identity.style.transform='none';
  tagline.style.opacity=String(playing?smooth(1.63,2.08,t):0);
  brand.style.opacity='0';
  reverse.visible=playing;
  const ru=reverse.material.uniforms;
  ru.uOpacity.value=reduced.matches?show:smooth(.59,.68,t);
  ru.uTime.value=reduced.matches?0:idle;
  ru.uBend.value=reduced.matches?0:(1-turn);
  ru.uMarkReveal.value=smooth(.68,.94,t);
  ru.uLogoScale.value=1+(1-turn)*.85;
  reverse.position.set((1-turn)*3.4,(1-turn)*.7,-(1-turn)*4.2);
  reverse.rotation.set(0,reduced.matches?0:-(1-turn)*1.15,reduced.matches?0:-(1-turn)*.54);
  reverse.scale.setScalar(1+Math.sin(Math.PI*turn)*.15);
  renderer.render(scene,camera);
  if(playing){canvas.dataset.progress=String(Math.min(duration,t).toFixed(2));}
  if(!inspect&&mode==='playing'&&t>=duration){
    elapsed=duration;identity.setAttribute('aria-hidden','false');finish.hidden=false;setState('finished');
  }
  if(!inspect)raf=requestAnimationFrame(paint);
}

async function init(){
  try{
    const [plate,logo]=await Promise.all([loadImage('light-plane-v3.png'),loadImage('../assets/lotus-original-red-gold.png')]);
    makeMark(logo);drawMark(1.18);
    renderer=new THREE.WebGLRenderer({canvas,alpha:false,antialias:true,powerPreference:'high-performance'});
    renderer.setClearColor(0x000000,1);scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(38,1,.04,25);camera.position.z=4.2;
    const texture=new THREE.Texture(plate);texture.needsUpdate=true;texture.minFilter=THREE.LinearFilter;
    texture.magFilter=THREE.LinearFilter;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
    field=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
      uniforms:{uPlate:{value:texture},uTime:{value:0},uResolution:{value:new THREE.Vector2(1,1)},uSpeed:{value:0}},
      vertexShader:fieldVertex,fragmentShader:fieldFragment,depthTest:false,depthWrite:false
    }));field.frustumCulled=false;field.renderOrder=0;scene.add(field);
    passage=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({
      uniforms:{uFront:{value:-1},uBack:{value:-1},uTime:{value:0},uResolution:field.material.uniforms.uResolution},
      vertexShader:fieldVertex,fragmentShader:passageFragment,transparent:true,depthTest:false,depthWrite:false
    }));passage.frustumCulled=false;passage.renderOrder=6;passage.visible=false;scene.add(passage);
    sheet=makeSurface(texture);scene.add(sheet);
    distant=makeSurface(texture);distant.position.y=-.96;distant.position.z=-1;
    distant.scale.set(1.6,.38,1);distant.visible=false;scene.add(distant);
    orb=new THREE.Mesh(new THREE.PlaneGeometry(.222,.222),new THREE.ShaderMaterial({
      uniforms:{uPlate:{value:texture},uOpacity:{value:1}},vertexShader:orbVertex,fragmentShader:orbFragment,
      transparent:true,depthWrite:false
    }));orb.position.x=-.032;orb.position.z=.01;orb.renderOrder=4;scene.add(orb);
    const markTexture=new THREE.CanvasTexture(brand);markTexture.minFilter=markTexture.magFilter=THREE.NearestFilter;
    reverse=new THREE.Mesh(new THREE.PlaneGeometry(12,10,90,64),new THREE.ShaderMaterial({
      uniforms:{uMark:{value:markTexture},uPlate:{value:texture},uLogoRect:{value:new THREE.Vector4(0,.08,1.58,1.05)},uOpacity:{value:0},uMarkReveal:{value:0},uLogoScale:{value:1},uTime:{value:0},uBend:{value:1}},
      vertexShader:reverseVertex,fragmentShader:reverseFragment,side:THREE.DoubleSide,transparent:true,depthWrite:false
    }));reverse.frustumCulled=false;reverse.renderOrder=7;reverse.visible=false;scene.add(reverse);
    new ResizeObserver(resize).observe(stage);resize();
    loading.hidden=true;trigger.disabled=false;canvas.dataset.ready='true';
    reset();drawMark(1.18);markTexture.needsUpdate=true;
    if(inspect){trigger.hidden=true;finish.hidden=stillFrame<duration;identity.setAttribute('aria-hidden',String(stillFrame<duration));setState('inspection')}
    paint(performance.now());
  }catch(error){
    loading.textContent='预览未能载入，请刷新重试';stage.dataset.state='error';console.error(error);
  }
}
trigger.addEventListener('click',play);
document.querySelector('#replay').addEventListener('click',()=>{if(inspect){location.href='./?rev=unfold2';return}reset();drawMark(1.18);reverse.material.uniforms.uMark.value.needsUpdate=true;play()});
finish.querySelector('a').addEventListener('click',()=>{try{sessionStorage.setItem('lotus-impact-seen','1')}catch{}});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hiddenAt=performance.now();cancelAnimationFrame(raf)}
  else if(renderer&&!inspect){
    const paused=hiddenAt?performance.now()-hiddenAt:0;
    if(mode==='playing')start+=paused;idleStart+=paused;hiddenAt=0;
    cancelAnimationFrame(raf);raf=requestAnimationFrame(paint);
  }
});
init();
