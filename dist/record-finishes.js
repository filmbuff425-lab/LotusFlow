import * as THREE from 'three';

// Color lives in translucent resin; the cover remains a separate, untinted print.
export function resinPressing(radius,color,opacity=.18){
 return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,
  uniforms:{radius:{value:radius},tint:{value:new THREE.Color(color).convertLinearToSRGB()},angle:{value:1.2},opacity:{value:opacity}},
  vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 p;uniform float radius,angle,opacity;uniform vec3 tint;
  void main(){float r=length(p)/radius,a=atan(p.y,p.x);float b=abs(cos(a-angle));
   float phase=r*760.,aa=fwidth(phase);float groove=1.-smoothstep(.18-aa,.76+aa,abs(sin(phase)));
   float swirl=sin(r*32.+sin(a*3.+r*7.)*.45)*.5+.5;
   // Refraction stays subtle; the separate pressing finish owns the highlight.
   float light=(sin(a*2.+r*13.-angle)*.5+.5)*.018*smoothstep(.5,.96,r);
   float alpha=opacity+groove*.033+swirl*.012+light;
   vec3 c=mix(tint,vec3(1.),clamp(light*1.8+groove*.09,0.,.82));
   gl_FragColor=vec4(c,alpha);
  }`});
}

export function holographicPressing(radius){
 return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,
  uniforms:{radius:{value:radius},angle:{value:1.2},strength:{value:.8}},
  vertexShader:'varying vec2 p;void main(){p=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`varying vec2 p;uniform float radius,angle,strength;
  void main(){float r=length(p)/radius,a=atan(p.y,p.x);float b=abs(cos(a-angle));float beam=pow(b,17.);
   float phase=(a-angle)*2.1+r*6.;vec3 prism=.58+.42*cos(phase+vec3(0.,2.1,4.2));
   float fine=sin(r*980.)*.5+.5;float alpha=(beam*.23+pow(b,95.)*.13+fine*.014)*strength;
   gl_FragColor=vec4(mix(prism,vec3(1.),pow(b,95.)*.7),alpha);
  }`});
}
