import * as THREE from 'three';
// Shared chromatic depth survives the home → archive handoff, including the bridging canvas.
export function createRecordSpace(scene){
 const uniforms={time:{value:0},warp:{value:0},aspect:{value:1},opacity:{value:1}};
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms,transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,.99999,1.);}',
 fragmentShader:`varying vec2 vUv;uniform float time,warp,aspect,opacity;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 p=(vUv-.5)*vec2(aspect,1.);float r=length(p),a=atan(p.y,p.x);vec3 c=vec3(.008,.010,.013);for(int i=0;i<3;i++){float fi=float(i);float scale=80.+fi*55.;vec2 q=p*scale/(1.+warp*.6)+vec2(time*(.2+fi*.08),time*.07);vec2 cell=floor(q),local=fract(q)-.5;float star=step(.995,hash(cell+fi));float d=max(abs(local.x),abs(local.y/(1.+warp*3.)));float s=step(d,.085)*star;float flicker=.55+.45*sin(time*.38+hash(cell)*27.);c+=s*flicker*vec3(.60,.64,.68)*(1.-fi*.18);}c+=(hash(gl_FragCoord.xy)-.5)*.004;gl_FragColor=vec4(c,opacity);}`}));mesh.frustumCulled=false;mesh.renderOrder=-100;scene.add(mesh);
 return{setOpacity(value){uniforms.opacity.value=value},update(time,warp=0,aspect=1){uniforms.time.value=time;uniforms.warp.value=warp;uniforms.aspect.value=aspect},mesh};
}
