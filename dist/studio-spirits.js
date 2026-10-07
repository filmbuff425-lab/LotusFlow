import * as THREE from 'three';

// Independent lounge drink: a hollow cut-crystal glass, amber liquid and real ice.
export function createWhiskyOnIce({parent,texture,x=0,y=0,z=0,scale=1}){
 const group=new THREE.Group();group.name='Lounge / cut-crystal whisky tumbler with three ice cubes';group.position.set(x,y,z);group.scale.setScalar(scale);parent.add(group);
 const add=(geo,mat,px=0,py=0,pz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);m.castShadow=m.receiveShadow=false;group.add(m);return m};
 const glass=new THREE.MeshPhysicalMaterial({color:0xf1faff,roughness:.075,transmission:.96,thickness:.16,ior:1.52,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:1.1});glass.userData.preserveTransmission=true;
 const profile=[[0,0],[.32,0],[.375,.04],[.39,.14],[.39,.94],[.382,1.0],[.342,1.0],[.34,.20],[.30,.15],[0,.15]];
 const geometry=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),128),v=geometry.attributes.position;
 for(let i=0;i<v.count;i++){const px=v.getX(i),py=v.getY(i),pz=v.getZ(i),r=Math.hypot(px,pz);if(r>.36&&py>.13&&py<.94){const cut=.014*(.5+.5*Math.cos(Math.atan2(px,pz)*24));v.setXYZ(i,px*(r-cut)/r,py,pz*(r-cut)/r)}}geometry.computeVertexNormals();add(geometry,glass);
 const rim=add(new THREE.TorusGeometry(.36,.008,8,64),glass,0,.997,0);rim.rotation.x=Math.PI/2;
 const amber=new THREE.MeshPhysicalMaterial({color:0xe6ad51,roughness:.11,transmission:.72,thickness:.42,attenuationColor:0x7a390a,attenuationDistance:.65,ior:1.36});amber.userData.preserveTransmission=true;add(new THREE.CylinderGeometry(.329,.315,.30,64),amber,0,.306,0);
 const iceMap=texture(128,128,c=>{c.fillStyle='#9cb7c3';c.fillRect(0,0,128,128);for(let i=0;i<400;i++){const r=Math.sin(i*12.98)*43758.5,q=r-Math.floor(r);c.fillStyle=i%3?'#ffffff12':'#33495b09';c.fillRect(q*128,((q*57.6)%1)*128,1,2)}});
 const ice=new THREE.MeshPhysicalMaterial({color:0xe5f6fd,roughness:.19,bumpMap:iceMap,bumpScale:.003,transmission:.91,thickness:.27,ior:1.31,clearcoat:.45,envMapIntensity:.85});ice.userData.preserveTransmission=true;
 for(const [i,p]of[[-.12,.49,.07],[.13,.55,.04],[.015,.63,-.14]].entries()){
  const geo=new THREE.BoxGeometry(.245,.24,.25,4,4,4),pos=geo.attributes.position,limit=new THREE.Vector3(.0975,.095,.10);
  for(let j=0;j<pos.count;j++){const point=new THREE.Vector3(pos.getX(j),pos.getY(j),pos.getZ(j)),base=point.clone().clamp(limit.clone().negate(),limit),offset=point.sub(base);if(offset.lengthSq())offset.normalize().multiplyScalar(.025);point.copy(base).add(offset);pos.setXYZ(j,...point.toArray())}geo.computeVertexNormals();const cube=add(geo,ice,...p);cube.rotation.set(.21+i*.33,.34+i*.69,-.18+i*.42);
 }
 group.userData.service={cups:1,iceCubes:3,liquid:'whisky'};return group;
}

// Reference bottles: Richard Hennessy / Libeskind crystal decanter and
// Macallan 18 Sherry Oak. Cups follow Baccarat Harmonie's hollow, cut crystal.
export function createSpiritService({parent,texture,x=0,y=0,z=0}){
 const group=new THREE.Group();group.name='Richard Hennessy, Macallan 18 and two cut-crystal whisky tumblers';group.position.set(x,y,z);parent.add(group);
 const mesh=(p,geo,mat,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=!mat.transparent&&!mat.transmission;p.add(m);return m};
 const lathe=(p,profile,mat)=>mesh(p,new THREE.LatheGeometry(profile.map(a=>new THREE.Vector2(...a)),80),mat);
 const cyl=(p,r,h,y,mat)=>mesh(p,new THREE.CylinderGeometry(r,r,h,64),mat,0,y,0);
 const ring=(p,r,t,y,mat)=>{const m=mesh(p,new THREE.TorusGeometry(r,t,8,80),mat,0,y,0);m.rotation.x=Math.PI/2;return m};
 const make=(name,px,pz,angle)=>{const g=new THREE.Group();g.name=name;g.position.set(px,.008,pz);g.rotation.y=angle;group.add(g);return g};
 const crystal=new THREE.MeshPhysicalMaterial({color:0xf4fbff,metalness:0,roughness:.055,transmission:.95,thickness:.19,ior:1.52,clearcoat:1,clearcoatRoughness:.035,envMapIntensity:1.1});crystal.userData.preserveTransmission=true;
 const silver=new THREE.MeshPhysicalMaterial({color:0xe6e8e9,metalness:1,roughness:.105,clearcoat:.5,envMapIntensity:1.15});
 const shell=new THREE.MeshPhysicalMaterial({color:0xf3fbff,transparent:true,opacity:.18,depthWrite:false,metalness:.04,roughness:.055,clearcoat:1,clearcoatRoughness:.03,envMapIntensity:1.7});
 shell.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`diffuseColor.a *= .25 + 2.8 * pow(1.0 - abs(dot(normal, normalize(vViewPosition))), 2.4);
#include <opaque_fragment>`)};
 shell.customProgramCacheKey=()=> 'spirit-thin-glass-edge-v1';
 const amber=new THREE.MeshPhysicalMaterial({color:0xef9d42,roughness:.085,metalness:0,transmission:.78,thickness:.67,attenuationColor:0x671a03,attenuationDistance:.43,ior:1.36,clearcoat:.35});amber.userData.preserveTransmission=true;
 const whisky=amber.clone();whisky.color.set(0xe8b25a);whisky.attenuationColor.set(0x734709);whisky.attenuationDistance=.69;
 const print=(p,map,w,h,x,y,z,angle=0)=>{const m=mesh(p,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.03,roughness:.65,depthWrite:false}),x,y,z);m.rotation.y=angle;return m};
 const prism=(p,points,depth,material,bevel=.014)=>{const shape=new THREE.Shape();points.forEach((a,i)=>i?shape.lineTo(...a):shape.moveTo(...a));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2,curveSegments:32});geo.translate(0,0,-depth/2);return mesh(p,geo,material)};

 const richard=make('Richard Hennessy / faceted thick Baccarat crystal, silver collar, amber cognac',-.98,-.26,-.075);
 // The architectural frame surrounds a curved inner reservoir. The hole is
 // actual geometry, leaving the cognac visible through glass from every side.
 const body=new THREE.Shape();body.moveTo(-.86,.025);body.lineTo(.88,.095);body.lineTo(.49,2.015);body.lineTo(-.28,1.865);body.closePath();
 const hole=new THREE.Path();hole.moveTo(-.29,.21);hole.bezierCurveTo(-.63,.22,-.62,.61,-.55,.89);hole.bezierCurveTo(-.49,1.19,-.20,1.54,-.15,1.74);hole.lineTo(.15,1.80);hole.bezierCurveTo(.19,1.56,.44,1.37,.52,.94);hole.bezierCurveTo(.60,.48,.55,.26,.32,.23);hole.closePath();body.holes.push(hole);
 const frame=new THREE.ExtrudeGeometry(body,{depth:.57,bevelEnabled:true,bevelSize:.022,bevelThickness:.025,bevelSegments:3,curveSegments:28});frame.translate(0,0,-.285);mesh(richard,frame,crystal);
 const reservoir=lathe(richard,[[0,.13],[.24,.13],[.44,.20],[.55,.39],[.57,.65],[.51,.96],[.42,1.21],[.28,1.48],[.17,1.72],[.12,1.90],[.12,2.14],[.10,2.14],[.10,1.91],[.145,1.73],[.255,1.48],[.395,1.20],[.49,.95],[.54,.64],[.52,.40],[.40,.24],[.21,.19],[0,.19]],shell);reservoir.scale.z=.49;
 const cognac=lathe(richard,[[0,.205],[.22,.205],[.40,.25],[.51,.41],[.535,.65],[.49,.95],[.39,1.19],[.30,1.395],[0,1.395]],amber);cognac.scale.z=.48;
 ring(richard,.30,.004,1.396,amber).scale.z=.48;
 // Heavy crystal plinth and the asymmetric stopper are separate solids.
 prism(richard,[[-.84,.028],[.87,.096],[.845,.16],[-.81,.13]],.58,crystal,.009);
 cyl(richard,.147,.15,2.155,silver);ring(richard,.15,.009,2.222,silver);ring(richard,.151,.011,2.094,silver);
 prism(richard,[[-.14,2.225],[.14,2.225],[.35,2.58],[-.37,2.60]],.29,silver,.006);
 prism(richard,[[-.375,2.595],[.36,2.578],[.397,2.824],[-.412,3.055]],.36,crystal,.010);
 // Broad, non-parallel polished faces carry the crystal glints.
 prism(richard,[[-.408,3.041],[.39,2.82],[.08,2.665],[-.375,2.595]],.020,crystal,.002).position.z=.193;
 const signature=texture(512,128,c=>{c.fillStyle='#dce1e5';c.textAlign='center';c.font='italic 34px Georgia';c.fillText('RH',256,66);c.font='15px Georgia';c.fillText('RICHARD HENNESSY',256,102)});print(richard,signature,.29,.082,-.055,2.755,.207);
 const etching=texture(1024,256,c=>{c.fillStyle='#768187';c.textAlign='center';c.font='27px Georgia';c.fillText('40% vol   C O G N A C   70 cl',512,105);c.font='20px Georgia';c.fillText('JAS HENNESSY & CO · COGNAC · FRANCE',512,153);c.font='18px Georgia';c.fillText('RICHARD HENNESSY',512,204)});print(richard,etching,.73,.14,.025,.142,.323);

 const macallan=make('The Macallan / 18 years old Sherry Oak, printed label and embossed foil',.63,-.38,.045);
 const bottleProfile=[[0,0],[.29,0],[.40,.025],[.43,.105],[.43,1.59],[.415,1.73],[.36,1.88],[.245,1.99],[.17,2.08],[.164,2.52],[.15,2.55],[.137,2.55],[.137,2.11],[.22,2.02],[.34,1.88],[.39,1.70],[.403,.12],[.29,.075],[0,.075]];
 lathe(macallan,bottleProfile,shell);
 lathe(macallan,[[0,.085],[.29,.085],[.401,.12],[.401,1.58],[.39,1.70],[.34,1.84],[.265,1.94],[0,1.94]],whisky);
 const foilTex=texture(512,512,c=>{c.fillStyle='#c5bb8c';c.fillRect(0,0,512,512);c.lineWidth=2;for(let i=-512;i<1024;i+=23){c.strokeStyle='#7e775f70';c.beginPath();c.moveTo(i,0);c.lineTo(i+512,512);c.stroke();c.strokeStyle='#eee8cc8a';c.beginPath();c.moveTo(i,0);c.lineTo(i-512,512);c.stroke()}c.fillStyle='#4c4a3b';c.fillRect(0,444,512,14)});
 const foil=new THREE.MeshPhysicalMaterial({map:foilTex,bumpMap:foilTex,bumpScale:.0025,metalness:.57,roughness:.39,clearcoat:.10});
 cyl(macallan,.18,.43,2.70,foil);ring(macallan,.181,.006,2.5,silver);cyl(macallan,.18,.024,2.925,foil);
 const label=texture(1024,1400,c=>{c.fillStyle='#f4f4e9';c.fillRect(0,0,1024,1400);c.strokeStyle='#ab9b76';c.lineWidth=3;c.strokeRect(28,22,968,1356);c.strokeStyle='#4b493d';c.lineWidth=6;c.strokeRect(42,36,940,1329);c.fillStyle='#18252a';c.textAlign='center';
  // Small Easter Elchies engraving, a genuine printed detail rather than a blank label.
  c.fillRect(455,92,115,68);c.fillRect(491,60,37,100);c.beginPath();c.moveTo(450,91);c.lineTo(514,49);c.lineTo(579,91);c.fill();c.fillStyle='#f4f4e9';for(let r=0;r<2;r++)for(let i=0;i<4;i++)c.fillRect(464+i*25,101+r*28,11,18);
  c.fillStyle='#253139';c.font='italic 66px Georgia';c.fillText('The',512,241);c.font='bold 96px Georgia';c.fillText('MACALLAN',512,338);c.font='30px Georgia';c.fillText('HIGHLAND SINGLE MALT',512,408);c.fillText('SCOTCH WHISKY',512,453);c.font='bold 230px Georgia';c.fillText('18',512,755);c.font='28px Georgia';c.fillText('YEARS OLD',512,806);c.font='42px Georgia';c.fillText('SHERRY OAK CASK',512,963);c.font='22px Georgia';c.fillText('MATURED EXCLUSIVELY IN HAND-PICKED',512,1053);c.fillText('SHERRY SEASONED OAK CASKS FROM JEREZ',512,1090);c.fillText('SPAIN · RICHNESS AND COMPLEXITY',512,1127);c.fillStyle='#a09778';c.font='italic 24px Georgia';c.fillText('Natural colour',512,1208);c.font='21px Georgia';c.fillText('700 ml                                      43% vol',512,1309);
 });
 mesh(macallan,new THREE.CylinderGeometry(.435,.435,1.25,64,1,true,-Math.PI*.57,Math.PI*1.14),new THREE.MeshStandardMaterial({map:label,roughness:.82}),0,.93,0);
 const crest=texture(256,256,c=>{c.beginPath();c.moveTo(28,30);c.lineTo(228,30);c.lineTo(128,223);c.closePath();c.fillStyle='#d9cc9e';c.fill();c.strokeStyle='#91835e';c.lineWidth=9;c.stroke();c.fillStyle='#18252a';c.textAlign='center';c.font='bold 65px Georgia';c.fillText('18',128,119);c.font='14px Georgia';c.fillText('YEARS OLD',128,150)});const badgeGeo=new THREE.PlaneGeometry(.29,.30,20,18),bp=badgeGeo.attributes.position;
 for(let i=0;i<bp.count;i++){const xx=bp.getX(i),yy=bp.getY(i)+1.96;let radius=.17;for(let j=1;j<11;j++){const lo=bottleProfile[j-1],hi=bottleProfile[j];if(yy>=lo[1]&&yy<=hi[1]){radius=THREE.MathUtils.lerp(lo[0],hi[0],(yy-lo[1])/(hi[1]-lo[1]));break}}bp.setXYZ(i,xx,yy,Math.sqrt(Math.max(.001,radius*radius-xx*xx))+.005)}badgeGeo.computeVertexNormals();mesh(macallan,badgeGeo,new THREE.MeshStandardMaterial({map:crest,transparent:true,alphaTest:.03,roughness:.72,depthWrite:false}));

 function tumbler(px,pz,angle){
  const cup=make('Baccarat Harmonie inspired / open cut-crystal tumbler with thick base',px,pz,angle);
  const points=[[0,0],[.31,0],[.358,.027],[.376,.115],[.376,.88],[.369,.956],[.335,.956],[.333,.90],[.330,.176],[.302,.150],[0,.150]];
  const geo=new THREE.LatheGeometry(points.map(a=>new THREE.Vector2(...a)),192);const positions=geo.attributes.position;
  // 32 real longitudinal cuts. Only the outer wall is cut, leaving the inner
  // bowl smooth and visibly open; the heavy base remains continuous crystal.
  for(let i=0;i<positions.count;i++){const px=positions.getX(i),pz=positions.getZ(i),py=positions.getY(i),radius=Math.hypot(px,pz);if(radius>.348&&py>.10&&py<.94){const a=Math.atan2(px,pz),cut=.0135*(1+Math.cos(a*32))*.5,scale=(radius-cut)/radius;positions.setXYZ(i,px*scale,py,pz*scale)}}geo.computeVertexNormals();mesh(cup,geo,crystal);
  ring(cup,.352,.0055,.954,crystal);ring(cup,.344,.006,.030,crystal);
  const stamp=texture(128,128,c=>{c.fillStyle='#e8ebed70';c.textAlign='center';c.font='italic 14px Georgia';c.fillText('Baccarat',64,64)});const mark=print(cup,stamp,.20,.20,0,.153,0);mark.rotation.x=-Math.PI/2;
  return cup;
 }
 const cups=[tumbler(.43,.82,-.13),tumbler(1.36,.47,.20)];
 group.userData.service={bottles:2,cups:2,references:['Richard Hennessy','The Macallan 18 Sherry Oak','Baccarat Harmonie'],maxHeight:3.065};
 return {group,richard,macallan,cups};
}
