import * as THREE from 'three';

// Small, fully volumetric shelf objects based on the supplied ceramic, wood,
// brushed-metal and instant-camera references. Coordinates start at their feet.
export function createReferenceObjects(texture){
 const rnd=n=>{const a=Math.sin(n*91.73+19.31)*43758.545;return a-Math.floor(a)};
 const glazeMap=texture(256,256,g=>{g.fillStyle='#e8e6df';g.fillRect(0,0,256,256);for(let i=0;i<6800;i++){const v=170+rnd(i+5)*65;g.fillStyle=`rgba(${v},${v-4},${v-12},.19)`;g.fillRect(rnd(i)*256,rnd(i+713)*256,1,1)}for(let i=0;i<25;i++){g.strokeStyle='#ffffff0c';g.lineWidth=3;g.beginPath();g.moveTo(rnd(i)*256,0);g.bezierCurveTo(90,80,170,150,rnd(i+21)*256,256);g.stroke()}});
 const ceramic=color=>new THREE.MeshPhysicalMaterial({color,map:glazeMap,bumpMap:glazeMap,bumpScale:.004,roughness:.35,clearcoat:.78,clearcoatRoughness:.19});
 const ivory=ceramic(0xf0eee4),red=ceramic(0xce3e32),blue=ceramic(0x91b3c9),ink=ceramic(0x171d22);
 const brush=texture(256,256,g=>{g.fillStyle='#c3c7ca';g.fillRect(0,0,256,256);for(let i=0;i<256;i++){g.fillStyle=i%3?'#ffffff12':'#17202d18';g.fillRect(i,0,1,256)}});
 const steel=new THREE.MeshPhysicalMaterial({color:0xe7e8e7,map:brush,bumpMap:brush,bumpScale:.002,metalness:.91,roughness:.29,anisotropy:.7});
 const chrome=new THREE.MeshPhysicalMaterial({color:0xf0f2f2,metalness:1,roughness:.10,clearcoat:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x11151a,roughness:.46,metalness:.13});
 const woodMap=texture(256,512,g=>{g.fillStyle='#cbaa7d';g.fillRect(0,0,256,512);for(let i=0;i<480;i++){g.strokeStyle=i%3?'#6f4a251c':'#f0dcc426';g.lineWidth=.3+rnd(i)*1.1;g.beginPath();g.moveTo(i*.54,0);g.bezierCurveTo(i*.54+Math.sin(i)*6,160,i*.54-6,340,i*.54+4,512);g.stroke()}});
 const wood=new THREE.MeshStandardMaterial({color:0xe6c598,map:woodMap,bumpMap:woodMap,bumpScale:.005,roughness:.86,flatShading:true});
 const shellWood=new THREE.MeshStandardMaterial({color:0xa76835,map:woodMap,roughness:.91,flatShading:true});
 const greenWood=new THREE.MeshStandardMaterial({color:0x8d973a,map:woodMap,roughness:.94,flatShading:true});
 const add=(p,geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=!mat.transparent;p.add(m);return m};
 const box=(p,w,h,d,x,y,z,m)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const ball=(p,x,y,z,rx,ry,rz,m,segments=32)=>{const o=add(p,new THREE.SphereGeometry(1,segments,24),m,x,y,z);o.scale.set(rx,ry,rz);return o};
 const lathe=(p,points,m,x=0,y=0,z=0)=>add(p,new THREE.LatheGeometry(points.map(v=>new THREE.Vector2(...v)),48),m,x,y,z);
 const tube=(p,points,r,m)=>add(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,8,false),m);
 const make=(name,parent,x,y,z,scale=1,angle=0)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);g.scale.setScalar(scale);g.rotation.y=angle;parent.add(g);return g};
 // Smoothly fused clay instead of visible intersecting spheres. A tetrahedral
 // surface uses the field gradient for continuous normals across every facet.
 function clay(parent,parts,mat,k=.085){
  const field=(x,y,z)=>{let d=1e3;for(const [cx,cy,cz,rx,ry,rz]of parts){const a=Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz),b=Math.hypot((x-cx)/(rx*rx),(y-cy)/(ry*ry),(z-cz)/(rz*rz));const e=a<.00001?-Math.min(rx,ry,rz):a*(a-1)/Math.max(.0001,b),h=Math.max(k-Math.abs(d-e),0)/k;d=Math.min(d,e)-h*h*k*.25}return d};
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const p of parts)for(let a=0;a<3;a++){lo[a]=Math.min(lo[a],p[a]-p[a+3]-k);hi[a]=Math.max(hi[a],p[a]+p[a+3]+k)}
  const n=32,step=hi.map((v,a)=>(v-lo[a])/n),stride=n+1,idx=(x,y,z)=>x+stride*(y+stride*z),values=new Float32Array(stride**3);
  for(let z=0;z<=n;z++)for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)values[idx(x,y,z)]=field(lo[0]+x*step[0],lo[1]+y*step[1],lo[2]+z*step[2]);
  const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pos=[],norm=[],uv=[];
  const gradient=v=>{const e=.002;return new THREE.Vector3(field(v[0]+e,v[1],v[2])-field(v[0]-e,v[1],v[2]),field(v[0],v[1]+e,v[2])-field(v[0],v[1]-e,v[2]),field(v[0],v[1],v[2]+e)-field(v[0],v[1],v[2]-e)).normalize()};
  function triangle(a,b,c){let ga=gradient(a),gb=gradient(b),gc=gradient(c);const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),cv=new THREE.Vector3(...c);if(bv.sub(av).cross(cv.sub(av)).dot(ga)<0){[b,c]=[c,b];[gb,gc]=[gc,gb]}for(const [v,g]of[[a,ga],[b,gb],[c,gc]]){pos.push(...v);norm.push(g.x,g.y,g.z);uv.push(.5+Math.atan2(v[0],v[2])/Math.PI/2,(v[1]-lo[1])/(hi[1]-lo[1]))}}
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const vv=offsets.map(o=>values[idx(x+o[0],y+o[1],z+o[2])]);if(vv.every(v=>v>=0)||vv.every(v=>v<0))continue;
   const pp=offsets.map(o=>[lo[0]+(x+o[0])*step[0],lo[1]+(y+o[1])*step[1],lo[2]+(z+o[2])*step[2]]);
   for(const t of tetra){const inside=t.filter(i=>vv[i]<0),outside=t.filter(i=>vv[i]>=0);if(!inside.length||!outside.length)continue;const cut=(a,b)=>{const q=vv[a]/(vv[a]-vv[b]);return pp[a].map((v,j)=>v+(pp[b][j]-v)*q)};if(inside.length===1||inside.length===3){const one=inside.length===1?inside[0]:outside[0],others=inside.length===1?outside:inside;triangle(...others.map(i=>cut(one,i)))}else{const a=cut(inside[0],outside[0]),b=cut(inside[0],outside[1]),c=cut(inside[1],outside[0]),d=cut(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c)}}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return add(parent,geo,mat);
 }
 function writing(p,lines,x,y,z,w,h,color='#151515',curve=0){
  const map=texture(512,256,g=>{g.fillStyle=color;g.font='bold 70px Arial';g.textAlign='center';g.textBaseline='middle';lines.forEach((line,i)=>{g.save();g.translate(256,128+(i-(lines.length-1)/2)*76);g.rotate(Math.sin(i*2+1)*.024);g.fillText(line,0,0,480);g.restore()})});
  const geo=new THREE.PlaneGeometry(w,h,24,12),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setZ(i,typeof curve==='function'?Math.sqrt(Math.max(.001,curve(y+yy)**2-xx**2))-z+.006:-curve*(xx/w*2)**2);}
  const o=add(p,geo,new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.1,roughness:.42,depthWrite:false}),x,y,z);o.castShadow=false;return o;
 }
 function face(p,x,y,z,size,variant=0){
  const map=texture(256,192,g=>{g.strokeStyle=g.fillStyle='#171816';g.lineWidth=9;g.lineCap='round';for(const e of[-1,1]){g.beginPath();g.moveTo(128+e*43-10,42+variant*3);g.lineTo(128+e*43+9,38-variant*4);g.stroke();g.beginPath();g.ellipse(128+e*35,72,9,5,0,0,7);g.fill()}g.beginPath();g.ellipse(128,104,16,11,-.18,0,7);g.fill();g.beginPath();g.arc(128,123,34,.2,Math.PI-.15);g.stroke()});
  const geo=new THREE.PlaneGeometry(size,size*.75,12,8),a=geo.attributes.position;for(let i=0;i<a.count;i++){const xx=a.getX(i)/(size*.75),yy=a.getY(i)/(size*.75);a.setZ(i,-size*.28*(xx*xx+yy*yy))}add(p,geo,new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.1,roughness:.45,depthWrite:false}),x,y,z);
 }
 function club(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / Hahaha Club three-person glazed ceramic',parent,x,y,z,scale,angle),parts=[];
  for(const [i,c]of[-.56,0,.56].entries()){parts.push([c,.88,0,.35,.66,.24],[c-.15,.39,.02,.16,.39,.23],[c+.15,.39,.02,.16,.39,.23]);ball(g,c,1.62,0,.205,.215,.19,ivory);face(g,c,1.64,.195,.26,i)}
  parts.push([-.91,1.0,0,.13,.38,.22],[.91,1.0,0,.13,.38,.22]);clay(g,parts,red);for(const c of[-.72,-.40,-.16,.16,.40,.72])ball(g,c,.08,.015,.17,.08,.25,ivory);for(const side of[-1,1])ball(g,side*.94,.76,.01,.10,.13,.19,ivory);
  writing(g,['HAHAHA','CLUB'],0,1.14,.258,1.20,.40,'#f7eedb',.04);return g;
 }
 function love(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / Love Myself blue glazed ceramic',parent,x,y,z,scale,angle);
  lathe(g,[[0,0],[.48,0],[.49,.07],[.40,.32],[.28,.49],[0,.49]],ivory);
  clay(g,[[-.13,.81,0,.125,.47,.14],[.13,.81,0,.125,.47,.14],[0,1.36,0,.32,.40,.20],[-.28,1.40,.03,.18,.30,.18],[.28,1.40,.03,.18,.30,.18],[.12,1.52,.20,.26,.12,.12],[-.06,1.30,.21,.29,.12,.12]],blue,.06);
  for(const c of[-.13,.13])ball(g,c,.51,.04,.135,.09,.18,ivory);
  ball(g,0,1.83,0,.20,.23,.18,ivory);face(g,0,1.85,.185,.26);
  writing(g,['LOVE','MYSELF'],0,.23,.438,.71,.27,'#bd4138',y=>y<.07?.49:y<.32?.49-(y-.07)*.36:.40-(y-.32)*.71);return g;
 }
 function cat(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / Please Like Me embracing black cat',parent,x,y,z,scale,angle);
  lathe(g,[[0,0],[.39,0],[.40,.06],[.31,.18],[.25,.29]],ivory,.20,0,-.07);
  const person=clay(g,[[.20,.86,-.10,.245,.71,.22],[.20,1.52,-.10,.26,.35,.24],[0,1.53,.12,.34,.11,.11],[-.15,1.45,.21,.15,.12,.13]],red,.07);
  ball(g,.24,1.90,-.06,.205,.22,.20,ivory);ball(g,-.36,1.48,.16,.11,.12,.12,ivory);
  ball(g,-.23,.075,.10,.35,.075,.31,ivory);
  clay(g,[[-.20,.77,.16,.17,.60,.13],[-.32,.33,.16,.09,.26,.10],[-.07,.31,.16,.10,.24,.11],[-.23,1.59,.18,.18,.21,.145],[-.36,1.76,.18,.08,.14,.10],[-.12,1.76,.18,.08,.14,.10],[-.10,1.42,.13,.28,.10,.12]],ink,.045);
  const fm=texture(256,256,g=>{g.fillStyle='#efeada';g.beginPath();g.ellipse(95,126,24,22,-.4,0,7);g.ellipse(153,126,24,22,.4,0,7);g.fill();for(const c of[93,155]){g.beginPath();g.ellipse(c,69,10,7,0,0,7);g.fill()}g.fillStyle='#c94232';g.beginPath();g.arc(125,110,11,0,7);g.fill()});
  add(g,new THREE.PlaneGeometry(.27,.28),new THREE.MeshStandardMaterial({map:fm,transparent:true,alphaTest:.1,depthWrite:false}),-.23,1.59,.328);
  const words=writing(g,['PLEASE','LIKE','ME'],.20,1.13,-.326,.37,.49);words.rotation.y=Math.PI;
  return g;
 }
 function pistachio(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / hand-carved pistachio child on wood block',parent,x,y,z,scale,angle);
  box(g,.70,.44,.62,0,.22,0,wood);for(const c of[-.11,.11]){box(g,.15,.34,.16,c,.64,0,wood);box(g,.18,.09,.26,c,.50,.06,wood)}
  const body=ball(g,0,.91,0,.25,.30,.20,wood,10);body.rotation.z=.04;ball(g,0,1.22,0,.23,.20,.18,wood,10);
  for(const c of[-.085,.085]){const eye=box(g,.037,.026,.012,c,1.21,.177,dark);eye.rotation.z=c<0?.2:-.2}
  const nut=new THREE.Group();nut.position.set(0,1.93,-.06);nut.rotation.z=-.44;g.add(nut);
  ball(nut,0,0,0,.40,.59,.33,greenWood,10);
  for(const side of[-1,1]){const geo=new THREE.SphereGeometry(1,14,8,0,Math.PI*2,side>0?0:Math.PI/2,Math.PI/2),v=geo.attributes.position;for(let i=0;i<v.count;i++){const x=v.getX(i),y=v.getY(i),z=v.getZ(i),q=1+.025*Math.sin(x*17+y*23+z*13);v.setXYZ(i,x*q,y*q,z*q)}geo.computeVertexNormals();const sh=add(nut,geo,shellWood);sh.scale.set(.50,.64,.38);sh.position.set(side*.035,side*.105,-.035);sh.rotation.x=-side*.11;}
  return g;
 }
 function clock(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / Longood brushed steel clock and circular mirror',parent,x,y,z,scale,angle);
  box(g,1.12,2.34,.035,0,1.18,0,steel);
  for(const c of[-.43,.43]){ball(g,c,.045,.14,.12,.045,.14,chrome);const screw=add(g,new THREE.CylinderGeometry(.032,.032,.10,20),chrome,c,.05,.11);screw.rotation.x=Math.PI/2}
  const mirror=new THREE.MeshPhysicalMaterial({color:0xdce4e8,metalness:1,roughness:.035,envMapIntensity:1.8});add(g,new THREE.CircleGeometry(.44,64),mirror,0,.57,.031);add(g,new THREE.TorusGeometry(.446,.012,8,64),chrome,0,.57,.036);
  for(const [cx,cy]of[[0,2.30],[0,1.33],[-.53,1.81],[.53,1.81]])box(g,.024,.035,.008,cx,cy,.024,chrome);
  const spindle=add(g,new THREE.CylinderGeometry(.036,.036,.035,24),chrome,0,1.81,.041);spindle.rotation.x=Math.PI/2;
  for(const [length,angle,width]of[[.31,-.84,.035],[.40,1.02,.024],[.48,-.03,.009]]){const hand=new THREE.Group();hand.position.set(0,1.81,.064);hand.rotation.z=angle;g.add(hand);box(hand,width,length,.012,0,length/2-.025,0,chrome)}
  writing(g,['UNFOLDING   HOME','EVOKE   MEANING','THROUGH   ART','LONGOOD'],0,1.13,.025,.59,.30,'#e4e6e6');return g;
 }
 function polaroid(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / open Polaroid SX-70 Land Camera Alpha 1',parent,x,y,z,scale,angle);
  box(g,1.84,.17,1.60,0,.10,0,chrome);box(g,1.66,.045,1.42,0,.202,0,dark);
  const leatherMap=texture(256,256,g=>{g.fillStyle='#b57435';g.fillRect(0,0,256,256);for(let i=0;i<7000;i++){g.fillStyle=i%2?'#efc28622':'#46230c22';g.fillRect(rnd(i)*256,rnd(i+220)*256,1.4,1)}}),leather=new THREE.MeshStandardMaterial({map:leatherMap,roughness:.74,bumpMap:leatherMap,bumpScale:.006});
  const back=new THREE.Group();back.position.set(0,.24,-.57);back.rotation.x=.28;g.add(back);box(back,1.76,.97,.12,0,.46,0,chrome);box(back,1.62,.84,.025,0,.46,-.073,leather);
  // The tapered black bellows connects the raised lens board to the hinged back.
  const shape=new THREE.Shape();shape.moveTo(-.65,0);shape.lineTo(.65,0);shape.lineTo(.50,.71);shape.lineTo(-.50,.71);shape.closePath();const bellows=add(g,new THREE.ExtrudeGeometry(shape,{depth:.70,bevelEnabled:false}),dark,0,.25,-.39);bellows.rotation.x=-.11;
  for(let i=0;i<5;i++)box(g,1.33-i*.06,.022,.66-i*.04,0,.33+i*.13,-.03,dark);
  const board=new THREE.Group();board.position.set(0,.84,.38);board.rotation.x=-.10;g.add(board);box(board,1.76,.52,.16,0,0,0,steel);
  const frontCyl=(r,h,x,y,z,m)=>{const o=add(board,new THREE.CylinderGeometry(r,r,h,48),m,x,y,z);o.rotation.x=Math.PI/2;return o};
  frontCyl(.239,.13,.18,0,.12,dark);frontCyl(.251,.025,.18,0,.18,chrome);frontCyl(.204,.029,.18,0,.196,dark);
  const lens=new THREE.MeshPhysicalMaterial({color:0x233244,metalness:.38,roughness:.08,clearcoat:1});frontCyl(.152,.02,.18,0,.215,lens);add(board,new THREE.TorusGeometry(.197,.008,6,48),chrome,.18,0,.223);
  for(const [x,r,color]of[[-.63,.125,0xd73123],[.67,.107,0x1b3534]]){frontCyl(r+.018,.035,x,0,.12,chrome);frontCyl(r,.037,x,0,.145,new THREE.MeshPhysicalMaterial({color,roughness:.23,clearcoat:1}))}
  const finder=new THREE.Group();finder.position.set(0,1.34,-.27);finder.rotation.x=.15;g.add(finder);box(finder,.90,.35,.75,0,0,0,dark);box(finder,.94,.05,.77,0,.20,0,chrome);box(finder,.82,.015,.65,0,.234,0,leather);box(finder,.76,.23,.02,0,0,.387,dark);
  const print=writing(g,['POLAROID','SX-70 LAND CAMERA','ALPHA 1'],0,.232,.50,.87,.24,'#eeeeeb');print.rotation.x=-Math.PI/2;
  return g;
 }
 function crystal(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / seated glass Buddha with folded robe',parent,x,y,z,scale,angle);
  const glass=new THREE.MeshPhysicalMaterial({color:0xe4eff5,roughness:.24,metalness:0,transparent:true,opacity:.82,transmission:.35,thickness:.38,ior:1.52,clearcoat:.75,clearcoatRoughness:.12,bumpMap:glazeMap,bumpScale:.0015,depthWrite:false,envMapIntensity:1.7});
  glass.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`diffuseColor.a *= .62 + .38 * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 1.6);
#include <opaque_fragment>`) };
  glass.customProgramCacheKey=()=> 'frosted-crystal-buddha-v2';glass.userData.preserveTransmission=true;
  lathe(g,[[0,0],[.38,0],[.40,.035],[.38,.09],[.31,.13],[0,.13]],glass);
  clay(g,[[0,.57,0,.235,.40,.17],[-.29,.24,.08,.28,.13,.18],[.29,.24,.08,.28,.13,.18],[-.15,.86,0,.17,.15,.16],[.15,.86,0,.17,.15,.16],[0,.98,0,.10,.13,.095]],glass,.052);
  ball(g,0,1.18,0,.16,.22,.15,glass);ball(g,0,1.39,0,.095,.06,.092,glass);
  for(const side of[-1,1]){tube(g,[[side*.18,.91,0],[side*.27,.59,.04],[side*.13,.45,.22],[0,.44,.23]],.073,glass);ball(g,side*.015,.45,.25,.08,.045,.055,glass);ball(g,side*.16,1.17,0,.03,.10,.025,glass)}
  for(let i=0;i<8;i++)tube(g,[[-.18,.91-i*.037,.11],[-.09,.76-i*.026,.162],[.08,.51-i*.023,.171],[.30,.25,.12]],.006,glass);
  ball(g,0,1.18,.15,.025,.07,.024,glass);ball(g,0,1.11,.147,.05,.018,.014,glass);
  for(let row=0;row<3;row++)for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ball(g,Math.cos(a)*(.13-row*.025),1.31+row*.028,Math.sin(a)*(.105-row*.025),.025,.024,.025,glass)}
  for(const c of[-.055,.055])tube(g,[[c-.024,1.20,.145],[c,1.185,.156],[c+.024,1.20,.145]],.003,steel);
  return g;
 }
 function lamp(parent,x,y,z,scale=1,angle=0){
  const g=make('Opal glass three-shade lamp / brushed aluminum',parent,x,y,z,scale,angle);
  const opal=new THREE.MeshPhysicalMaterial({color:0xf5f7f5,roughness:.24,transmission:.32,thickness:.035,ior:1.46,clearcoat:.55,emissive:0xffecd0,emissiveIntensity:.14});
  lathe(g,[[0,0],[.31,0],[.34,.035],[.31,.065],[.17,.09],[0,.09]],steel);
  lathe(g,[[.035,.08],[.036,1.47]],chrome);
  for(const [r,h,cy] of [[.51,.24,1.57],[.34,.20,1.43],[.22,.19,1.27]]){
   lathe(g,[[.018,cy+h],[r*.26,cy+h*.97],[r*.53,cy+h*.79],[r*.80,cy+h*.43],[r,cy],[r,cy-.014],[r*.94,cy-.018],[r*.76,cy+h*.39],[r*.49,cy+h*.76],[r*.23,cy+h*.91],[.017,cy+h-.02]],opal);
   const rim=add(g,new THREE.TorusGeometry(r,.007,8,64),chrome,0,cy,0);rim.rotation.x=Math.PI/2;
  }
  const glow=new THREE.PointLight(0xffd6a2,.32,2.4,2);glow.position.y=1.45;g.add(glow);
  return g;
 }
 function waxMaterial(color){
  const map=texture(256,256,g=>{g.fillStyle='#a7a7a7';g.fillRect(0,0,256,256);for(let i=0;i<7500;i++){g.fillStyle=i%2?'#ffffff12':'#24242413';g.fillRect(rnd(i)*256,rnd(i+319)*256,.8,1.3)}for(let i=0;i<22;i++){g.strokeStyle='#ffffff09';g.lineWidth=1;g.beginPath();g.moveTo(i*12,0);g.bezierCurveTo(i*12+2,80,i*12-3,180,i*12,256);g.stroke()}});
  return new THREE.MeshPhysicalMaterial({color,roughness:.60,bumpMap:map,bumpScale:.0025,clearcoat:.08,transmission:.04,thickness:.04});
 }
 function burningFlame(g,x,y,z,size=1){
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;void main(){float h=clamp(p.y/.23,0.,1.);float core=1.-smoothstep(.006,.035,abs(p.x));vec3 warm=mix(vec3(.24,.40,1.),vec3(1.,.36,.035),smoothstep(0.,.21,h));warm=mix(warm,vec3(1.,.94,.63),core*(1.-h)*.88);gl_FragColor=vec4(warm,.80*(1.-smoothstep(.80,1.,h)));}'});
  const flame=lathe(g,[[0,0],[.014,.008],[.033,.046],[.029,.098],[.019,.147],[.009,.187],[0,.232]],material,x,y,z);flame.scale.setScalar(size);flame.userData.dynamic=true;
  return flame;
 }
 function candles(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / small dotted wax candles and ceramic taper dish',parent,x,y,z,scale,angle),waxMap=texture(256,256,g=>{g.fillStyle='#edcf60';g.fillRect(0,0,256,256);for(let yy=25;yy<256;yy+=61)for(let xx=24;xx<256;xx+=62){g.fillStyle='#3c91ad';g.beginPath();g.arc(xx+(yy%2?12:0),yy,6,0,7);g.fill()}}),wax=waxMaterial(0xffdd78);wax.map=waxMap;
  lathe(g,[[0,0],[.22,0],[.24,.05],[.23,.88],[.20,.91],[.15,.86],[0,.86]],wax,-.35,0,.11);
  const wick=tube(g,[[-.35,.86,.11],[-.33,.98,.11]],.011,dark);
  lathe(g,[[0,0],[.32,.02],[.43,.14],[.47,.27],[.44,.29],[.39,.22],[.26,.12],[0,.10]],ivory,.40,0,-.12);
  const teal=waxMaterial(0x65b8bd);lathe(g,[[0,0],[.061,0],[.063,.94],[.043,.97],[0,.97]],teal,.40,.10,-.12);tube(g,[[.40,1.07,-.12],[.40,1.12,-.12]],.009,dark);
  const flames=[burningFlame(g,-.33,.98,.11,.75),burningFlame(g,.40,1.12,-.12,.72)];
  const glow=new THREE.PointLight(0xffbf79,.6,2.4,2);glow.position.set(.05,1.1,.1);g.add(glow);
  g.userData.update=now=>{for(let i=0;i<flames.length;i++){const q=1+.04*Math.sin(now*4.1+i)+.022*Math.sin(now*11.3+i);flames[i].scale.y=(i?.72:.75)*q;flames[i].rotation.z=Math.sin(now*3.1+i)*.025}glow.intensity=.6*(1+.035*Math.sin(now*4.1));};
  return g;
 }
 function candle(parent,x,y,z,scale=1,angle=0){
  const g=make('Reference / lit teal taper in glazed ceramic bowl',parent,x,y,z,scale,angle);
  lathe(g,[[0,0],[.30,.02],[.42,.14],[.46,.26],[.43,.29],[.38,.21],[.25,.12],[0,.10]],ivory);
  const wax=waxMaterial(0x69b9bf);
  lathe(g,[[0,0],[.060,0],[.063,1.17],[.045,1.20],[.027,1.16],[0,1.16]],wax,0,.10,0);
  tube(g,[[0,1.27,0],[.007,1.34,0]],.009,dark);
  const flame=burningFlame(g,0,1.33,0,.94);
  for(const [xx,yy,zz,len] of [[.047,1.11,.01,.13],[-.044,.96,.035,.17]]){const drip=ball(g,xx,yy,zz,.018,len,.021,wax);drip.rotation.z=xx*.8;}
  // A small handmade porcelain rabbit on the same dish, as in the reference.
  clay(g,[[.40,.23,.05,.11,.17,.11],[.41,.41,.05,.09,.11,.085],[.37,.56,.05,.034,.13,.030],[.45,.56,.05,.032,.14,.030]],ivory,.025);
  const light=new THREE.PointLight(0xffb867,1.8,4,2);light.position.set(0,1.44,.08);g.add(light);
  g.userData.update=now=>{const q=1+.04*Math.sin(now*4.1)+.020*Math.sin(now*11.7);flame.scale.y=.94*q;flame.rotation.z=Math.sin(now*3.3)*.025;light.intensity=1.8*(.97+.03*Math.sin(now*4.1)+.02*Math.sin(now*11.7))};return g;
 }
 return{club,love,cat,pistachio,clock,polaroid,crystal,lamp,candles,candle};
}
