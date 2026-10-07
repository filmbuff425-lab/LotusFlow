import * as THREE from 'three';
import {flightDuration,startFlightSound,flightElapsed,stopFlightSound} from './universe-flight.js?v=20261006-lake-surface1';

const home=document.querySelector('#home'),work=document.querySelector('#work'),host=document.querySelector('#red-universe'),button=document.querySelector('#enter-universe');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let entering=false,preparing=false,backdropReady=false;
const backdrop=document.createElement('canvas');backdrop.className='journey-backdrop';backdrop.setAttribute('aria-hidden','true');
function clearJourney(){host.style.removeProperty('z-index');host.style.removeProperty('opacity');backdrop.remove()}
function arrive(){entering=false;preparing=false;stopFlightSound();clearJourney();home.classList.remove('travelling');document.body.classList.remove('universe-travelling');work.classList.remove('receiving-universe');work.style.removeProperty('--arrival');button.disabled=false;history.replaceState(null,'','#work');document.querySelector('#vinyl-open').focus({preventScroll:true});window.dispatchEvent(new Event('lotus-enter-collection'))}
try{setup()}catch(error){console.warn('Universe fallback',error);button.addEventListener('click',()=>{work.scrollIntoView({behavior:'smooth'});arrive()})}

function setup(){
 // One world remains behind both pages. The handoff never swaps canvases or backgrounds.
 document.body.prepend(host);host.classList.add('universe-continuum');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(39,1,.1,300);camera.position.z=18;
 const un={time:{value:0},aspect:{value:1},warp:{value:0}};
 const background=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:un,depthTest:false,depthWrite:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,.99999,1.);}',fragmentShader:'varying vec2 v;uniform float time,aspect,warp;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1)),f.x),f.y);}void main(){vec2 p=(v-.5)*vec2(aspect,1.);float r=length(p);vec2 q=p*3.;float cloud=0.;float weight=.5;for(int i=0;i<5;i++){cloud+=weight*n(q+vec2(time*.012,-time*.008));q=q*2.03+3.7;weight*=.5;}vec3 col=vec3(.009,.010,.013);col+=warp*vec3(.035,.040,.050)*exp(-r*r*2.);col+=(h(gl_FragCoord.xy)-.5)*.005;gl_FragColor=vec4(col,1.);}'}));background.frustumCulled=false;background.renderOrder=-100;scene.add(background);
 const count=3600,pos=new Float32Array(count*3),colors=new Float32Array(count*3);
 for(let i=0;i<count;i++){const a=i*2.399963,r=1.0+Math.random()*42;pos.set([Math.cos(a)*r,Math.sin(a)*r,(Math.random()-.7)*140],i*3);new THREE.Color(i%9===0?0xba4426:i%3===0?0xadb4cf:0xc7bdba).multiplyScalar(.28+Math.random()*.5).toArray(colors,i*3)}
 const starsG=new THREE.BufferGeometry();starsG.setAttribute('position',new THREE.BufferAttribute(pos,3));starsG.setAttribute('color',new THREE.BufferAttribute(colors,3));scene.add(new THREE.Points(starsG,new THREE.PointsMaterial({vertexColors:true,size:.072,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending})));
 // The mark is ink on the globe itself: one curved surface, one depth and one light model.
 const logoTexture=new THREE.TextureLoader().load('assets/lotus-original-red-gold.png');
 logoTexture.minFilter=logoTexture.magFilter=THREE.NearestFilter;
 const core=new THREE.Group(),planet=new THREE.Group();core.add(planet);scene.add(core);
 const orbUniform={time:{value:0},hover:{value:0},alpha:{value:1},logoMap:{value:logoTexture}};
 const orb=new THREE.Mesh(new THREE.SphereGeometry(2.82,64,48),new THREE.ShaderMaterial({uniforms:orbUniform,transparent:true,depthWrite:false,
 vertexShader:`varying vec2 tex;varying vec3 n,v,surface;void main(){tex=uv;surface=normalize(position);vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
 fragmentShader:`varying vec2 tex;varying vec3 n,v,surface;uniform float time,hover,alpha;uniform sampler2D logoMap;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){
  vec2 pixel=floor(gl_FragCoord.xy/3.);vec2 uv=floor(tex*vec2(128.,80.))/vec2(128.,80.);uv.x+=time*.018;
  float cloud=noise(uv*vec2(11.,9.))*.65+noise(uv*vec2(25.,17.))*.35;
  float light=max(0.,dot(normalize(n),normalize(vec3(-.7,.7,1.))));
  float dither=mod(pixel.x+pixel.y,2.)*.055;float level=floor((cloud*.7+light*.35+dither)*6.)/6.;
  vec3 c=vec3(.028,.009,.006);if(level>.33)c=vec3(.14,.018,.010);if(level>.5)c=vec3(.36,.034,.015);if(level>.66)c=vec3(.68,.075,.036);if(level>.83)c=vec3(.88,.18,.065);
  // Longitude and latitude keep the complete mark attached through every orbit angle.
  vec3 local=normalize(surface);
  vec2 markUV=vec2(atan(local.x,local.z)/1.46+.5,asin(clamp(local.y,-1.,1.))/0.98+.5);
  // A soft, curved dark ground separates the red lettering from the red atmosphere.
  float printGround=exp(-dot((markUV-.5)*vec2(1.8,2.3),(markUV-.5)*vec2(1.8,2.3))*1.5);
  c*=1.-printGround*.68;
  if(all(greaterThanEqual(markUV,vec2(0.)))&&all(lessThanEqual(markUV,vec2(1.)))){
   vec2 grid=vec2(150.,100.),sampleUV=(floor(markUV*grid)+.5)/grid;
   vec4 mark=texture2D(logoMap,sampleUV);
   vec2 edge=vec2(1.25)/grid;
   float border=max(max(texture2D(logoMap,sampleUV+vec2(edge.x,0.)).a,texture2D(logoMap,sampleUV-vec2(edge.x,0.)).a),max(texture2D(logoMap,sampleUV+vec2(0.,edge.y)).a,texture2D(logoMap,sampleUV-vec2(0.,edge.y)).a));
   c=mix(c,vec3(.016,.004,.012),border*(1.-mark.a)*.94);
   float lum=dot(mark.rgb,vec3(.3,.5,.2)),d=mod(floor(markUV.x*150.)+floor(markUV.y*100.),2.)*.06;
   vec3 ink=vec3(.51,.035,.015);if(lum+d>.16)ink=vec3(.94,.10,.045);if(lum+d>.36)ink=vec3(1.,.36,.17);if(lum+d>.66)ink=vec3(1.,.92,.76);
   ink*=.82+.18*floor(light*4.)/4.;
   c=mix(c,ink,mark.a*step(.28,mark.a));
  }
  float rim=pow(1.-max(0.,dot(normalize(n),v)),3.);c+=step(.65,rim)*vec3(.24,.048,.025);
  gl_FragColor=vec4(c,alpha*.94);
 }` }));planet.add(orb);
 // An opaque depth pass hides the rear orbit without flattening the translucent atmosphere.
 const globeDepth=new THREE.Mesh(orb.geometry,new THREE.MeshBasicMaterial({colorWrite:false}));planet.add(globeDepth);
 const dustP=new Float32Array(2200*3);for(let i=0;i<2200;i++){const y=1-i/1099.5,r=Math.sqrt(Math.max(0,1-y*y)),a=i*2.399963,s=2.86+Math.random()*.025;dustP.set([Math.cos(a)*r*s,y*s,Math.sin(a)*r*s],i*3)}
 const dustG=new THREE.BufferGeometry();dustG.setAttribute('position',new THREE.BufferAttribute(dustP,3));const dustM=new THREE.PointsMaterial({color:0xf6c9a0,size:.034,transparent:true,opacity:.66,depthWrite:false,blending:THREE.AdditiveBlending});const dust=new THREE.Points(dustG,dustM);planet.add(dust);
 const orbitRadius=3.63,orbitTilt=.26;
 const orbitPoints=[];for(let i=0;i<=240;i++){const a=i/240*Math.PI*2;orbitPoints.push(new THREE.Vector3(Math.cos(a)*orbitRadius,Math.sin(a)*orbitRadius*orbitTilt,Math.sin(a)*orbitRadius*Math.sqrt(1-orbitTilt*orbitTilt)))}const orbitM=new THREE.LineBasicMaterial({color:0xe06332,transparent:true,opacity:.34});const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints),orbitM);orbit.rotation.z=.22;planet.add(orbit);
 const trailP=new Float32Array(450*6),seeds=Array.from({length:450},(_,i)=>{const a=i*2.399963,r=1.5+Math.random()*32;return[Math.cos(a)*r,Math.sin(a)*r,Math.random()*90]});const trailG=new THREE.BufferGeometry();trailG.setAttribute('position',new THREE.BufferAttribute(trailP,3));const trailM=new THREE.LineBasicMaterial({color:0xe2ae86,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending});const trail=new THREE.LineSegments(trailG,trailM);trail.frustumCulled=false;scene.add(trail);
 const nucleusRay=new THREE.Raycaster(),nucleusPointer=new THREE.Vector2();
 let pointer={x:0,y:0},hover=false,start=0,last=0,travel=0,fromScroll=0,toScroll=0,homeMix=1,universeVisible=true,drag=null;
 const spin=new THREE.Vector2(),rotation=new THREE.Quaternion(),axisX=new THREE.Vector3(1,0,0),axisY=new THREE.Vector3(0,1,0);
 function rotatePlanet(x,y){rotation.setFromAxisAngle(axisY,x);planet.quaternion.premultiply(rotation);rotation.setFromAxisAngle(axisX,y);planet.quaternion.premultiply(rotation);home.dataset.planetRotation=planet.quaternion.toArray().map(n=>n.toFixed(3)).join(',')}
 const front=new THREE.Quaternion(),returnFrom=new THREE.Quaternion();let returning=false,returnAt=0;
 function resetPlanet(){spin.set(0,0);returnFrom.copy(planet.quaternion);returnAt=performance.now();returning=true;if(reduced){planet.quaternion.identity();returning=false;home.dataset.planetRotation='0.000,0.000,0.000,1.000'}}
 document.querySelector('#reset-planet').addEventListener('click',resetPlanet);
 const resize=()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();un.aspect.value=camera.aspect};new ResizeObserver(resize).observe(document.documentElement);resize();
 let visibleSections=new Set();new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visibleSections.add(e.target):visibleSections.delete(e.target));universeVisible=visibleSections.size>0}).observe(home);
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visibleSections.add(e.target):visibleSections.delete(e.target));universeVisible=visibleSections.size>0});observer.observe(work);
 async function enter(){if(entering||preparing)return;window.lotusReleasePlayer?.unlock();if(reduced){scrollTo({top:document.querySelector('#vinyl-room').getBoundingClientRect().top+scrollY-180,behavior:'instant'});arrive();return}preparing=true;const started=await startFlightSound();if(!started||!preparing)return;preparing=false;entering=true;start=performance.now();fromScroll=scrollY;toScroll=document.querySelector('#vinyl-room').getBoundingClientRect().top+scrollY+(document.querySelector('#vinyl-room').clientHeight-innerHeight)/2;backdropReady=false;backdrop.width=renderer.domElement.width;backdrop.height=renderer.domElement.height;document.body.prepend(backdrop);host.style.zIndex='201';home.classList.add('travelling');work.classList.add('receiving-universe');document.body.classList.add('universe-travelling');button.disabled=true;work.style.setProperty('--arrival','0');window.dispatchEvent(new Event('lotus-journey-start'))}
 button.addEventListener('click',enter);window.addEventListener('lotus-navigation',()=>{if(preparing){preparing=false;stopFlightSound()}if(entering)arrive();homeMix=0;pointer={x:0,y:0};resetPlanet()});
 function aim(e){const b=home.getBoundingClientRect();pointer={x:(e.clientX-b.left)/b.width-.5,y:(e.clientY-b.top)/b.height-.5};nucleusPointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);nucleusRay.setFromCamera(nucleusPointer,camera);hover=nucleusRay.intersectObject(orb,false).length>0;home.classList.toggle('on-nucleus',hover)}
 home.addEventListener('pointerdown',e=>{if(entering||e.button!==0||e.target.closest('a,button'))return;aim(e);if(!hover)return;returning=false;drag={id:e.pointerId,x:e.clientX,y:e.clientY,distance:0};spin.set(0,0);home.setPointerCapture(e.pointerId);home.classList.add('turning-planet');e.preventDefault()});
 home.addEventListener('pointermove',e=>{if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;drag.distance+=Math.hypot(dx,dy);rotatePlanet(dx*.009,dy*.009);spin.set(dx*.001,dy*.001);return}aim(e)});
 function release(e,cancel=false){if(!drag)return;const was=drag;drag=null;if(home.hasPointerCapture(e.pointerId))home.releasePointerCapture(e.pointerId);home.classList.remove('turning-planet');if(!cancel&&was.distance<7)enter()}
 home.addEventListener('pointerup',e=>release(e));home.addEventListener('pointercancel',e=>release(e,true));
 home.addEventListener('pointerleave',()=>{if(drag)return;pointer={x:0,y:0};hover=false;home.classList.remove('on-nucleus')});
 // Keyboard users can turn the same globe without triggering the journey.
 home.tabIndex=0;home.setAttribute('aria-description','Drag the planet to rotate freely. Arrow keys rotate; Home resets the front view; Enter travels to the records.');
 home.addEventListener('keydown',e=>{if(e.target!==home)return;if(e.key==='Home'){e.preventDefault();resetPlanet()}else if(e.key.startsWith('Arrow')){e.preventDefault();returning=false;spin.set(0,0);rotatePlanet(e.key==='ArrowLeft'?-.22:e.key==='ArrowRight'?.22:0,e.key==='ArrowUp'?-.22:e.key==='ArrowDown'?.22:0)}else if(e.key==='Enter'){e.preventDefault();enter()}});
 const smooth=(v,a,b)=>THREE.MathUtils.smoothstep(v,a,b);let floatWeight=1;
 function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-last)/1000||0);last=now;if(document.hidden||(!universeVisible&&!entering))return;const t=reduced?0:now/1000,p=entering?Math.min(1,flightElapsed((now-start)/1000)/flightDuration):0,warp=entering?Math.sin(smooth(p,0,1)*Math.PI)**2:0;
 if(entering){home.dataset.flightProgress=p.toFixed(3);home.dataset.flightSeconds=flightElapsed((now-start)/1000).toFixed(3)}
 const homeTarget=entering?1-smooth(p,.22,.51):THREE.MathUtils.clamp(1-scrollY/(home.offsetHeight*.52),0,1);homeMix+=(homeTarget-homeMix)*(1-Math.exp(-dt*8));un.time.value=t;un.warp.value=warp;travel+=dt*(.18+warp*62);
 for(let i=0;i<count;i++){pos[i*3+2]+=dt*(.12+warp*22);if(pos[i*3+2]>22)pos[i*3+2]-=140}starsG.attributes.position.needsUpdate=true;
 core.visible=homeMix>.004&&(entering||homeTarget>0);const mobile=innerWidth<600;
 // Keep the nucleus at the exact viewport centre; only its surface and orbit rotate.
 floatWeight+=((drag?.2:1)-floatWeight)*(1-Math.exp(-dt*4));const lift=reduced?0:(Math.sin(t*.58)*.16+Math.sin(t*.29)*.044)*floatWeight*(1-smooth(p,0,.28));core.position.set(0,lift,entering?smooth(p,0,.60)*23:0);home.dataset.planetFloat=lift.toFixed(3);core.rotation.z=reduced?0:Math.sin(t*.26)*.023;core.scale.setScalar((mobile?.72:1)*(1+orbUniform.hover.value*.04));
 if(returning&&!drag){const q=Math.min(1,(now-returnAt)/950),ease=1-Math.pow(1-q,3);planet.quaternion.slerpQuaternions(returnFrom,front,ease);home.dataset.planetRotation=planet.quaternion.toArray().map(n=>n.toFixed(3)).join(',');if(q===1)returning=false}
 if(!returning&&!drag&&!reduced&&!entering){rotatePlanet(spin.x*dt*60,spin.y*dt*60);spin.multiplyScalar(Math.exp(-dt*4.5))}
 dust.rotation.y=reduced?0:t*.12;dust.rotation.z=.2;orbit.rotation.y=reduced?0:t*.07;
 // A continuous forward flight with a soft deceleration; no camera reversal at arrival.
 camera.position.set(0,0,18);camera.lookAt(0,0,0);orbUniform.time.value=t;orbUniform.hover.value+=(Number(hover)-orbUniform.hover.value)*.05;orbUniform.alpha.value=homeMix;dustM.opacity=.66*homeMix;orbitM.opacity=.34*homeMix;trailM.opacity=warp*.6;
 seeds.forEach(([x,y,z],i)=>{const j=i*6,d=(z+travel)%90-75;trailP[j]=trailP[j+3]=x;trailP[j+1]=trailP[j+4]=y;trailP[j+2]=d;trailP[j+5]=d-warp*4.2-.02});trailG.attributes.position.needsUpdate=true;
 if(entering){if(p>.46&&scrollY!==toScroll)window.scrollTo({top:toScroll,behavior:'instant'});const arrival=smooth(p,.49,1);work.style.setProperty('--arrival',String(arrival));host.style.opacity=String(1-arrival);window.dispatchEvent(new CustomEvent('lotus-journey-frame',{detail:{progress:p,arrival}}));}
 renderer.render(scene,camera);
 // Capture once at the handoff; copying a WebGL canvas every frame stalls the GPU.
 // Only compositing order changes; intermediate sections never flash past.
 if(entering){backdrop.getContext('2d').drawImage(renderer.domElement,0,0);if(p===1)arrive()}
 }requestAnimationFrame(frame);
}
