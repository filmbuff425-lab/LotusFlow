import * as THREE from 'three';

// A coherent, deforming cell body inspired by the supplied microscopy motion reference.
export function createLivingMembrane(parent,seed=0){
 const uniforms={time:{value:0},fade:{value:1},burst:{value:0},hover:{value:0}};
 const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,side:THREE.FrontSide,
 vertexShader:`uniform float time,burst;varying vec3 local,n,v;void main(){vec3 p=position;vec3 u=normalize(p);float flow=sin(u.x*4.1+time*.29)*sin(u.y*3.4-time*.21)+sin(u.z*4.8+u.x*2.+time*.18)*.48;p*=1.+flow*.055+burst*.60;p.x+=sin(u.y*3.+time*.17)*.09;p.y+=cos(u.x*3.2-time*.19)*.09;local=p;vec4 view=modelViewMatrix*vec4(p,1.);n=normalize(normalMatrix*normal);v=normalize(-view.xyz);gl_Position=projectionMatrix*view;}`,
 fragmentShader:`uniform float time,fade,hover;varying vec3 local,n,v;
 vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
 vec2 cell(vec2 p){vec2 a=floor(p),b=fract(p);float first=8.,second=8.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 o=vec2(float(x),float(y));vec2 h=hash2(a+o);vec2 point=.5+.34*sin(time*.20+6.283*h);float d=length(o+point-b);if(d<first){second=first;first=d;}else if(d<second)second=d;}return vec2(first,second-first);}
 void main(){vec3 N=normalize(n),V=normalize(v);float fresnel=pow(1.-abs(dot(N,V)),2.8);vec2 q=local.xy*5.5+local.z*vec2(.28,-.18);q+=vec2(sin(q.y*.8-time*.15),cos(q.x*.6+time*.12))*.48;q+=vec2(sin(q.y*3.2+time*.13),cos(q.x*2.8-time*.16))*.24;vec2 c=cell(q);float vein=1.-smoothstep(.008,.13,c.y);float grain=(hash2(gl_FragCoord.xy).x-.5)*.075;float nacre=.5+.5*sin(local.y*1.6+local.x*.55-time*.15);vec3 base=mix(vec3(.025,.09,.17),vec3(.12,.34,.48),nacre);vec3 color=(base+vein*vec3(.035,.21,.38))*(1.+hover*2.6)+fresnel*mix(vec3(.19,.42,.70),vec3(.55,.41,.37),nacre)+grain;color+=hover*vec3(.06,.35,.56)*(vein*.6+fresnel);float alpha=(.045+vein*.12+fresnel*(.45+hover*.35))*fade;gl_FragColor=vec4(color,alpha);}`});
 const body=new THREE.Mesh(new THREE.SphereGeometry(1,44,32),material);body.scale.set(1.04,1,.92);body.renderOrder=4;parent.add(body);
 const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d'),radial=g.createRadialGradient(48,48,8,48,48,48);radial.addColorStop(0,'#94e7ff00');radial.addColorStop(.34,'#66d9ff0a');radial.addColorStop(.62,'#54caff77');radial.addColorStop(1,'#3d7bff00');g.fillStyle=radial;g.fillRect(0,0,96,96);
 const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),color:0x97dcff,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false}));aura.scale.set(3.15,3.15,1);parent.add(aura);
 return{body,update(t,burst,dissolve,hover=0){uniforms.time.value=t+seed*2.39;uniforms.burst.value=burst*.08;uniforms.fade.value=1-dissolve;uniforms.hover.value=hover;aura.material.opacity=(.055+hover*.70)*(1-dissolve);aura.scale.setScalar(3.15+hover*.20);}};
}
