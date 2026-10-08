import * as THREE from 'three';
import {updateHeartbeat} from './cube-heartbeat.js?v=20261007-mobile3';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
import {createCosmos} from './studio-cosmos.js?v=20261007-mobile3';

export function createSoundcube({scene,root,texture,camera,renderer,onBlueReveal=()=>{}}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 scene.background=new THREE.Color(0x16070b);scene.fog=null;
 const pointer=new THREE.Vector2(4,4),pointerTarget=new THREE.Vector2(4,4);
 let cosmos=null,roomScene=null,interiorReady=false,blueVisible=false;
 function attachRoom(room){roomScene=room;cosmos??=createCosmos({scene,camera})}
 const rnd=n=>{const q=Math.sin(n*127.1+41.1)*43758.5453;return q-Math.floor(q)};
 const grainUniforms={time:{value:0},open:{value:0}};
 const grain=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:grainUniforms,depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.99999,1.);}',fragmentShader:`varying vec2 vUv;uniform float open;void main(){vec2 p=vUv-vec2(.50,.28);float light=exp(-dot(p*vec2(1.15,1.4),p*vec2(1.15,1.4))*2.2);float top=1.-smoothstep(.68,1.,vUv.y);vec3 red=mix(vec3(.055,.001,.004),vec3(.62,.006,.013),light*top);red=mix(red,vec3(.004,.004,.009)+red*.018,open);gl_FragColor=vec4(red,1.);}`}));grain.frustumCulled=false;grain.renderOrder=-100;scene.add(grain);

 // The shell and room share the SAME bounds and transform for the entire journey.
 // No hinged faces, independently growing interior or visibility threshold can expose a gap.
 const dims=new THREE.Vector3(...studioLayout.shell),center=new THREE.Vector3(...studioLayout.center);
 const glassGroup=new THREE.Group();scene.add(glassGroup);
 const uniforms={time:{value:0},opacity:{value:1},hover:{value:0},beat:{value:0}};
 // The paired pulse lights the silhouette before any pointer interaction.
 const pulseUniforms={beat:{value:0},alpha:{value:1}};
 const pulseGlow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.ShaderMaterial({uniforms:pulseUniforms,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 v;uniform float beat,alpha;void main(){vec2 p=(v-.5)*2.;float r=length(p);float glow=exp(-r*r*4.6)*(1.-smoothstep(.58,1.,r));gl_FragColor=vec4(vec3(1.,.035,.065),glow*(.28+beat*.60)*alpha);}'}));
 pulseGlow.renderOrder=-5;scene.add(pulseGlow);const away=new THREE.Vector3();
 const frost=new THREE.ShaderMaterial({transparent:true,depthWrite:true,side:THREE.DoubleSide,uniforms,vertexShader:`varying vec2 vUv;varying vec3 vNormal,vView;void main(){vUv=uv;vec4 world=modelMatrix*vec4(position,1.);vNormal=normalize(mat3(modelMatrix)*normal);vView=normalize(cameraPosition-world.xyz);gl_Position=projectionMatrix*viewMatrix*world;}`,fragmentShader:`varying vec2 vUv;varying vec3 vNormal,vView;uniform float time,opacity,hover,beat;void main(){vec2 uv=vUv;float fresnel=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),3.);float edge=1.-smoothstep(.001,.012,min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y)));float formation=1.-smoothstep(hover-.10,hover+.10,uv.y);float sweep=exp(-pow((uv.x+uv.y*.30-.70)*19.,2.));float reflection=exp(-pow((uv.x-.22)*4.,2.))*pow(uv.y,2.);float glint=.10+beat*.86;vec3 black=vec3(.001,.001,.002)+vec3(.13,.002,.007)*beat*(.18+fresnel);vec3 glass=vec3(.025,.019,.024)+fresnel*vec3(.18,.19,.22)+reflection*vec3(.05,.075,.09)+sweep*vec3(.13,.12,.12);vec3 c=mix(black,glass,formation*hover);c+=edge*(hover*.46+glint)*mix(vec3(1.,.04,.08),vec3(.75,.64,.61),hover);float transmission=formation*hover;float glassAlpha=.16+fresnel*.28+edge*.12;gl_FragColor=vec4(c,opacity*mix(1.,glassAlpha,transmission));}`});
 const edgeMaterial=new THREE.LineBasicMaterial({color:0xf0c7b7,transparent:true,opacity:.45,depthWrite:false});
 const surfaces=[];
 const faceData=[[[0,0,dims.z/2],[0,0,0],[dims.x,dims.y]],[[0,0,-dims.z/2],[0,Math.PI,0],[dims.x,dims.y]],[[dims.x/2,0,0],[0,Math.PI/2,0],[dims.z,dims.y]],[[-dims.x/2,0,0],[0,-Math.PI/2,0],[dims.z,dims.y]],[[0,dims.y/2,0],[-Math.PI/2,0,0],[dims.x,dims.z]],[[0,-dims.y/2,0],[Math.PI/2,0,0],[dims.x,dims.z]]];
 for(const [position,rotation,size] of faceData){const panel=new THREE.Group();panel.position.set(...position);panel.rotation.set(...rotation);glassGroup.add(panel);const surface=new THREE.Mesh(new THREE.PlaneGeometry(size[0]+.02,size[1]+.02),frost);panel.add(surface);surfaces.push(surface);const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(...size)),edgeMaterial);edge.position.z=.012;panel.add(edge)}
 // Condensation detaches from the actual top edges, accelerates under gravity,
 // then settles on the cube floor. No looping hourglass or off-box waterfall.
 const count=420,dropPosition=new Float32Array(count*3),dropAlpha=new Float32Array(count),dropVelocity=new Float32Array(count),dropAge=new Float32Array(count).fill(-1);
 const dropGeo=new THREE.BufferGeometry();dropGeo.setAttribute('position',new THREE.BufferAttribute(dropPosition,3));dropGeo.setAttribute('alpha',new THREE.BufferAttribute(dropAlpha,1));
 const dropMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{opacity:{value:1}},vertexShader:'attribute float alpha;varying float a;void main(){a=alpha;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_PointSize=1.5;}',fragmentShader:'uniform float opacity;varying float a;void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;gl_FragColor=vec4(.94,.74,.72,a*opacity*(1.-r*r));}'});
 const droplets=new THREE.Points(dropGeo,dropMat);droplets.frustumCulled=false;scene.add(droplets);let emission=0,nextDrop=0,dropSerial=0,spawnAccumulator=0;
 function spawnDrop(){const i=nextDrop++%count,k=dropSerial++,side=k%4,u=(rnd(k+619)-.5),inset=.18;dropPosition[i*3]=side<2?u*(dims.x-.4):(side===2?-1:1)*(dims.x/2-inset);dropPosition[i*3+1]=dims.y/2-.15;dropPosition[i*3+2]=side<2?(side===0?-1:1)*(dims.z/2-inset):u*(dims.z-.4);dropAge[i]=0;dropVelocity[i]=.6+rnd(k+802)*1.1;dropAlpha[i]=0;}
 function updateDrops(dt,reveal){
  if(!reduced&&emission>0&&progress<.1){emission-=dt;spawnAccumulator+=dt*100;while(spawnAccumulator>=1){spawnDrop();spawnAccumulator--}}
  for(let i=0;i<count;i++){if(dropAge[i]<0)continue;dropAge[i]+=dt;const y=i*3+1,floor=-dims.y/2+.12;if(dropPosition[y]>floor){dropVelocity[i]+=dt*18;dropPosition[y]=Math.max(floor,dropPosition[y]-dropVelocity[i]*dt)}else dropVelocity[i]=0;dropAlpha[i]=Math.min(1,dropAge[i]*4)*Math.max(0,1-(dropAge[i]-1.9)/1.2)*.48;if(dropAge[i]>3.1){dropAge[i]=-1;dropAlpha[i]=0}}
  dropGeo.attributes.position.needsUpdate=true;dropGeo.attributes.alpha.needsUpdate=true;droplets.position.copy(glassGroup.position);droplets.rotation.copy(glassGroup.rotation);droplets.scale.copy(glassGroup.scale);dropMat.uniforms.opacity.value=1-reveal;droplets.visible=!reduced&&reveal<1;
 }
 let progress=0,hover=0,hoverSmooth=0,last=0,elapsed=0;
 function setProgress(p){progress=THREE.MathUtils.clamp(p,0,1)}
 function setHover(on){if(on&&!hover)emission=.8;hover=on?1:0}
 function setPointer(x,y){pointerTarget.set(x,y)}
 function clearPointer(){pointerTarget.set(4,4);hover=0}
 function update(now){
  const dt=Math.min(.05,Math.max(.001,(now-last)*.001||.016));last=now;elapsed+=dt;
  const ease=1-Math.exp(-dt*2.8),t=reduced?0:elapsed,p=progress,closed=1-p;
  const phase=t%1.85,beat=reduced?.28:Math.exp(-Math.pow((phase-.20)/.105,2))+.68*Math.exp(-Math.pow((phase-.49)/.14,2));
  // Preserve the requested screen-space reduction when the heading no longer
  // consumes its own block above the taller stage. The open room stays 1:1.
  const oldHeight=Math.max(innerWidth<=700?460:540,innerHeight-(innerWidth<=700?255:290));
  const closedScale=.34*.93*Math.min(1,oldHeight/(renderer.domElement.clientHeight||oldHeight));
  const scale=(closedScale+(1-closedScale)*p)*(1+.034*beat*closed*(1-hoverSmooth*.75));
  pointer.lerp(pointerTarget,ease);hoverSmooth+=((interiorReady?hover:0)-hoverSmooth)*ease;
  const yaw=Math.sin(t*.18)*.20,tilt=Math.sin(t*.15+1)*.055,roll=Math.sin(t*.13)*.018;
  root.scale.setScalar(scale);root.rotation.set(closed*tilt,closed*yaw,closed*roll);root.position.set(closed*Math.sin(t*.21)*.28,closed*(1.05+Math.sin(t*.42)*.68)+p*Math.sin(t*.32)*.16,closed*Math.sin(t*.19)*.20);root.visible=interiorReady&&(p>0||hoverSmooth>.12);
  glassGroup.rotation.copy(root.rotation);glassGroup.scale.copy(root.scale);glassGroup.position.copy(center).multiplyScalar(scale).applyEuler(root.rotation).add(root.position);glassGroup.visible=p<1;
  const reveal=THREE.MathUtils.smoothstep(p,.48,.98);cosmos?.setReveal(THREE.MathUtils.smoothstep(p,.22,.82));grainUniforms.open.value=THREE.MathUtils.smoothstep(p,0,.8);
  // Cue the downbeat from the same visibility change that paints the blue sky.
  const nextBlueVisible=cosmos?.group.visible||false;
  if(nextBlueVisible&&!blueVisible)onBlueReveal();
  blueVisible=nextBlueVisible;
  uniforms.beat.value=beat;uniforms.time.value=t;uniforms.hover.value=Math.max(hoverSmooth,THREE.MathUtils.smoothstep(p,0,.2));uniforms.opacity.value=1-reveal;frost.depthWrite=p<.49&&hoverSmooth<.025;edgeMaterial.opacity=(.13+beat*.65+hoverSmooth*.26)*(1-reveal);edgeMaterial.color.set(hoverSmooth>.5?0xf0c7b7:0xff3845);
  pulseGlow.position.copy(glassGroup.position).addScaledVector(camera.getWorldDirection(away),10*scale);pulseGlow.quaternion.copy(camera.quaternion);pulseGlow.scale.set(135*scale,112*scale,1);pulseUniforms.beat.value=beat;pulseUniforms.alpha.value=(1-reveal)*(1-hoverSmooth*.65);pulseGlow.visible=p<.98;
  updateDrops(dt,reveal);
  updateHeartbeat(elapsed,closed);
  grainUniforms.time.value=t;if(p>.001)cosmos?.update(reduced?0:elapsed*1000);
  if(root.visible)roomScene?.update(now,p);
 }
 return{get room(){return roomScene?.room},get recordTargets(){return roomScene?.recordTargets||[]},get glassRecords(){return roomScene?.glassRecords},get mvWall(){return roomScene?.mvWall},attachRoom,setInteriorReady(){interiorReady=true},update,setProgress,setHover,setPointer,clearPointer,hitTargets:surfaces};
}
