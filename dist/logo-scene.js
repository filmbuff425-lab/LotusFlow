import * as THREE from 'three';
import {createVolume} from './logo-volume.js?v=20261006-lake-surface1';

let artwork;
const geometryCache=new Map();
export async function mountLogoMotion(host,{compact=false,resetButton=null,pauseButton=null}={}){

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,compact?1.75:2));
renderer.setClearColor(0,0);
renderer.outputColorSpace=THREE.SRGBColorSpace;
host.append(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(36,1,.1,100);
const root=new THREE.Group(),body=new THREE.Group();
scene.add(root);root.add(body);
artwork ||= new THREE.TextureLoader().loadAsync(new URL('./assets/lotus-motion-inlaid-star.png',import.meta.url).href);
const texture=await artwork;
texture.colorSpace=THREE.SRGBColorSpace;
texture.anisotropy=renderer.capabilities.getMaxAnisotropy();

const uniforms={map:{value:texture},time:{value:0},touch:{value:0},touchPoint:{value:new THREE.Vector2(-.8,.5)}};
const deformation=`
uniform float touch;
uniform vec2 touchPoint;
float influenceAt(vec2 p){float d=length(p-touchPoint);return touch*(1.-smoothstep(.18,.95,d));}
vec3 compress(vec3 p){p.z*=1.-.88*influenceAt(p.xy);return p;}
`;
const faceMaterial=new THREE.ShaderMaterial({
 uniforms,side:THREE.FrontSide,
 vertexShader:`${deformation}
varying vec2 vUv;varying vec2 vLocal;
void main(){vUv=uv;vLocal=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(compress(position),1.);}`,
 fragmentShader:`${deformation}
uniform sampler2D map;uniform float time;varying vec2 vUv;varying vec2 vLocal;
void main(){
 float local=influenceAt(vLocal);
 vec2 resolution=vec2(170.,96.);
 vec2 pixelUV=(floor(vUv*resolution)+.5)/resolution;
 vec3 smoothColor=texture2D(map,vUv).rgb;
 vec3 pixelColor=texture2D(map,pixelUV).rgb;
 if(pixelColor.g-max(pixelColor.r,pixelColor.b)>.10)pixelColor=smoothColor;
 // The same red/gold artwork, with a local six-level console palette and ordered dither.
 float checker=mod(floor(vUv.x*resolution.x)+floor(vUv.y*resolution.y),2.)-.5;
 vec3 retro=floor(clamp(pixelColor+checker*.035,0.,1.)*7.+.5)/7.;
 // Offset dark pixels supply a small stepped shadow inside the touched area.
 vec3 shifted=texture2D(map,pixelUV-vec2(1.,-1.)/resolution).rgb;
 float edge=step(.12,shifted.g-max(shifted.r,shifted.b));
 retro*=mix(1.,.5,edge);
 vec3 color=mix(smoothColor,retro,smoothstep(.10,.8,local));
 gl_FragColor=vec4(color,1.);
}`});

// Soft studio reflection cards give the curved sidewall a continuous lacquer highlight.
const reflectionFaces=Array.from({length:6},(_,i)=>{
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 x.fillStyle=i===3?'#100403':'#292128';x.fillRect(0,0,256,256);
 const glow=x.createRadialGradient(80+i*15,70,5,128,128,190);
 glow.addColorStop(0,i%2?'#eddccc':'#fff3e8');glow.addColorStop(.23,'#88818b');glow.addColorStop(.6,'#26222c');glow.addColorStop(1,'#10080d');
 x.fillStyle=glow;x.fillRect(0,0,256,256);return c;
});
const reflections=new THREE.CubeTexture(reflectionFaces);reflections.needsUpdate=true;reflections.colorSpace=THREE.SRGBColorSpace;
const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromCubemap(reflections);scene.environment=environment.texture;
const sideMaterial=new THREE.MeshPhysicalMaterial({color:0xc12513,metalness:.56,roughness:.23,clearcoat:1,clearcoatRoughness:.13,envMapIntensity:.85});
sideMaterial.onBeforeCompile=shader=>{
 shader.uniforms.touch=uniforms.touch;shader.uniforms.touchPoint=uniforms.touchPoint;
 shader.vertexShader=deformation+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','vec3 transformed=compress(position);');
};
sideMaterial.customProgramCacheKey=()=> 'lotus-local-compression-v7';
if(!geometryCache.has(compact)){const model=createVolume(texture.image,{compact});geometryCache.set(compact,model.geometry);model.material.dispose()}
const volume=new THREE.Mesh(geometryCache.get(compact),[faceMaterial,sideMaterial]);body.add(volume);

const globe=new THREE.Group();root.add(globe);
const count=compact?800:3200,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
let seed=814;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let i=0;i<count;i++){
 const y=random()*2-1,a=random()*Math.PI*2,r=4.05+random()*.10,q=Math.sqrt(1-y*y);
 positions.set([r*q*Math.cos(a),r*y,r*q*Math.sin(a)],i*3);
 colors.set([.55+random()*.3,.60+random()*.2,.8+random()*.2],i*3);
}
const particleGeo=new THREE.BufferGeometry();particleGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));particleGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
const globeDots=new THREE.Points(particleGeo,new THREE.PointsMaterial({size:compact?.065:.026,vertexColors:true,transparent:true,opacity:.76,depthWrite:false,blending:THREE.AdditiveBlending}));globe.add(globeDots);
const shell=new THREE.Mesh(new THREE.SphereGeometry(4.14,compact?40:72,compact?28:48),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
 vertexShader:`varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
 fragmentShader:`varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),3.4);gl_FragColor=vec4(.48,.68,1.,f*.48);}`}));globe.add(shell);
// A soft atmospheric falloff extends beyond the glass rim, without obscuring the lettering.
const atmosphereCanvas=document.createElement('canvas');atmosphereCanvas.width=atmosphereCanvas.height=128;
const atmosphereContext=atmosphereCanvas.getContext('2d');
const atmosphereGradient=atmosphereContext.createRadialGradient(64,64,0,64,64,64);
atmosphereGradient.addColorStop(0,'rgba(75,121,230,0)');
atmosphereGradient.addColorStop(.61,'rgba(75,121,230,0)');
atmosphereGradient.addColorStop(.73,'rgba(109,164,255,.06)');
atmosphereGradient.addColorStop(.79,'rgba(143,191,255,.3)');
atmosphereGradient.addColorStop(.87,'rgba(85,137,255,.11)');
atmosphereGradient.addColorStop(1,'rgba(75,121,230,0)');
atmosphereContext.fillStyle=atmosphereGradient;atmosphereContext.fillRect(0,0,128,128);
const atmosphereTexture=new THREE.CanvasTexture(atmosphereCanvas);
const atmosphere=new THREE.Sprite(new THREE.SpriteMaterial({map:atmosphereTexture,transparent:true,opacity:.85,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending}));
atmosphere.scale.setScalar(11);atmosphere.renderOrder=-1;root.add(atmosphere);

scene.add(new THREE.HemisphereLight(0xffe8d0,0x280d13,1.5));
const key=new THREE.DirectionalLight(0xffe5d0,2.2);key.position.set(-3,5,7);scene.add(key);
const fill=new THREE.DirectionalLight(0xe7dbff,1.15);fill.position.set(4,1,-3);scene.add(fill);
const orbit=new THREE.Group();root.add(orbit);orbit.rotation.order='ZYX';
const ringMaterial=new THREE.MeshStandardMaterial({color:0x89633f,metalness:.86,roughness:.34,emissive:0x5b2608,emissiveIntensity:.035});
const ring=new THREE.Mesh(new THREE.TorusGeometry(4.45,.008,12,240),ringMaterial);orbit.add(ring);
const bead=new THREE.Mesh(new THREE.SphereGeometry(.020,16,16),new THREE.MeshBasicMaterial({color:0xc7ae80}));orbit.add(bead);

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused=reduced,t=0,last=performance.now(),dragging=false,hover=false,keyboardPreview=false,touch=0,touchVelocity=0,visible=true,dragDistance=0;
const lastPointer=new THREE.Vector2(),rotation=new THREE.Vector2(),rotationTarget=new THREE.Vector2(),touchTarget=uniforms.touchPoint.value.clone();
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.position.z=compact?16.4:(camera.aspect<1?22:15.5);camera.updateProjectionMatrix();renderer.setSize(width,height,false)}
const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibilityObserver.observe(host);
function locate(event){
 const bounds=renderer.domElement.getBoundingClientRect();
 ndc.set((event.clientX-bounds.left)/bounds.width*2-1,1-(event.clientY-bounds.top)/bounds.height*2);
 root.updateMatrixWorld(true);ray.setFromCamera(ndc,camera);
 const hit=ray.intersectObject(volume)[0];
 if(hit){const local=volume.worldToLocal(hit.point.clone());touchTarget.set(local.x,local.y);return true}return false;
}
host.style.cursor='grab';
host.addEventListener('pointermove',event=>{
 keyboardPreview=false;
 if(dragging){dragDistance+=Math.hypot(event.clientX-lastPointer.x,event.clientY-lastPointer.y);rotationTarget.x+=(event.clientX-lastPointer.x)*.007;rotationTarget.y+=(event.clientY-lastPointer.y)*.007;lastPointer.set(event.clientX,event.clientY);hover=false;return}
 hover=locate(event);
});
host.addEventListener('pointerleave',()=>{hover=false});
host.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;dragDistance=0;hover=false;lastPointer.set(event.clientX,event.clientY);host.setPointerCapture(event.pointerId);host.style.cursor='grabbing'});
function release(event){dragging=false;hover=event.type==='pointerup'&&locate(event);host.style.cursor='grab';if(host.hasPointerCapture(event.pointerId))host.releasePointerCapture(event.pointerId)}
host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);
window.addEventListener('pointerup',()=>{dragging=false});window.addEventListener('blur',()=>{dragging=false;hover=false});host.addEventListener('lostpointercapture',()=>{dragging=false});
if(resetButton)resetButton.onclick=()=>{rotationTarget.set(0,0);dragging=false;hover=false};
const button=pauseButton;
function label(){if(!button)return;button.textContent=paused?'播放动画':'暂停动画';button.setAttribute('aria-pressed',String(paused))}label();
if(button)button.onclick=()=>{paused=!paused;label()};
// Keyboard access uses the same local patch, not a whole-logo mode.
renderer.domElement.tabIndex=compact?-1:0;renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','立体 Lotus Flow：拖动旋转，鼠标触碰局部变成彩色像素平面。按空格预览 O 的局部效果。');
const keyboardTarget=compact?host.closest('a'):renderer.domElement;
if(compact)renderer.domElement.setAttribute('aria-hidden','true');
host.addEventListener('click',event=>{if(dragDistance>5){event.preventDefault();event.stopPropagation()}},true);
keyboardTarget.addEventListener('keydown',event=>{if(event.code==='Space'){event.preventDefault();keyboardPreview=!keyboardPreview;touchTarget.set(-1.05,.78)}if(event.code==='Escape'){hover=false;keyboardPreview=false}});
function frame(now){
 requestAnimationFrame(frame);if(!visible||document.hidden){last=now;return}const dt=Math.min((now-last)/1000,.032);last=now;
 if(!paused)t+=dt;
 rotation.lerp(rotationTarget,1-Math.exp(-dt*14));root.rotation.y=rotation.x;root.rotation.x=rotation.y;
 const goal=(hover||keyboardPreview)&&!dragging?1:0;
 // A soft spring with small overshoot; compression never crosses through the back face.
 touchVelocity+=((goal-touch)*78-touchVelocity*15)*dt;touch+=touchVelocity*dt;
 uniforms.touch.value=THREE.MathUtils.clamp(touch,0,1);uniforms.touchPoint.value.lerp(touchTarget,1-Math.exp(-dt*16));uniforms.time.value=t;
 body.scale.set(1+Math.sin(t*1.1)*.004,1-Math.sin(t*1.1)*.003,1);
 body.position.y=Math.sin(t*.65)*.018;
 globeDots.rotation.y=t*.025;globeDots.rotation.z=Math.sin(t*.12)*.035;
 orbit.rotation.set(1.43+Math.sin(t*.32)*.07,.06+Math.sin(t*.25)*.08,.32+Math.sin(t*.22)*.08);
 const a=t*.65;bead.position.set(Math.cos(a)*4.45,Math.sin(a)*4.45,0);
 atmosphere.material.opacity=.84+Math.sin(t*.8)*.07;
 renderer.render(scene,camera);
}
requestAnimationFrame(frame);
host.classList.add('is-ready');
return {reset(){rotationTarget.set(0,0)},setPaused(value){paused=value;label()}};
}
