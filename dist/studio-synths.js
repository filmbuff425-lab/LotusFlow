import * as THREE from 'three';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';

// Control coordinates follow the Sequential front-panel photograph and the
// Moog Subsequent 37 product photographs, rather than a generic knob grid.
export function createStudioSynths({root,texture,touchables,loadTexture=path=>new THREE.TextureLoader().load(path)}) {
 const rig=new THREE.Group();rig.name='Moog Subsequent 37 / Sequential Prophet-6';rig.position.set(...studioLayout.synths);rig.rotation.y=studioLayout.synthRotation;root.add(rig);
 const keys=[],controls=[],geometries=new Map();
 const cached=(id,make)=>{if(!geometries.has(id))geometries.set(id,make());return geometries.get(id)};
 const mat=(color,roughness=.5,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const black=mat(0x191a1b,.53,.28),rubber=mat(0x101112,.79),steel=mat(0x313435,.42,.70),silver=mat(0xc6cac9,.34,.84),ivory=new THREE.MeshPhysicalMaterial({color:0xf3f3f0,roughness:.28,clearcoat:.22,clearcoatRoughness:.28});
 const blackKey=new THREE.MeshPhysicalMaterial({color:0x0a0b0c,roughness:.31,clearcoat:.25,clearcoatRoughness:.32});
 const grain=texture(256,256,(g,w,h)=>{let seed=3721;g.fillStyle='#808080';g.fillRect(0,0,w,h);for(let i=0;i<6000;i++){seed=(seed*16807)%2147483647;const v=118+seed%20;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(i%w,Math.floor(i/w)*11%h,1,1)}});grain.colorSpace=THREE.NoColorSpace;
 black.bumpMap=grain;black.bumpScale=.0009;steel.bumpMap=grain;steel.bumpScale=.001;
 // Photographic PBR grain, pore normals and satin finish load with the interior.
 // The map spans one real metre (20 scene units); it is never stretched to a cheek.
 const woodMaps=new Map();
 function wood(name,color,label){
  let maps=woodMaps.get(name);if(!maps){maps=['albedo','normal','roughness'].map(kind=>{
   const map=loadTexture('./assets/materials/synth-wood/'+name+'-'+kind+'.jpg');
   map.colorSpace=kind==='albedo'?THREE.SRGBColorSpace:THREE.NoColorSpace;
   map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;
   map.minFilter=THREE.LinearMipmapLinearFilter;return map;
  });woodMaps.set(name,maps)}
  const m=new THREE.MeshPhysicalMaterial({map:maps[0],normalMap:maps[1],roughnessMap:maps[2],color,
   normalScale:new THREE.Vector2(.15,.15),roughness:.78,metalness:0,
   clearcoat:.17,clearcoatRoughness:.42,specularIntensity:.65});
  m.name=label;
  return m;
 }
 const walnut=wood('walnut',0xb68057,'Prophet-6 / oiled walnut grain'),moogWood=wood('walnut',0xe3a875,'Moog / warm satin hardwood');
 function woodUV(geometry,axis='z',offset=.56){
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i),z=p.getZ(i),nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
   const length=axis==='x'?x:z;
   let u=length*.05+.48,v=(ny>Math.max(nx,nz)?(axis==='x'?z:x):y)*.05+offset;
   // End cuts need a second coordinate, not the collapsed z/y projection.
   if((axis==='z'&&nz>Math.max(nx,ny))||(axis==='x'&&nx>Math.max(ny,nz))){u=(axis==='z'?x:z)*.05+.48;v=y*.05+offset}
   uv.setXY(i,u,v);
  }
  return geometry;
 }
 const red=new THREE.MeshStandardMaterial({color:0xff5446,emissive:0xff2114,emissiveIntensity:.55,roughness:.48,toneMapped:false});
 const amber=new THREE.MeshStandardMaterial({color:0xf7bb6b,emissive:0xff852a,emissiveIntensity:.42,roughness:.48,toneMapped:false});
 function add(p,g,m,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o}
 const box=(p,w,h,d,x,y,z,m)=>add(p,cached(`b${w}/${h}/${d}`,()=>new THREE.BoxGeometry(w,h,d)),m,x,y,z);
 function rounded(w,h,d,r=.025){return cached(`r${w}/${h}/${d}/${r}`,()=>{const g=new THREE.BoxGeometry(w,h,d,4,3,4),a=g.attributes.position;const limit=new THREE.Vector3(w/2-r,h/2-r,d/2-r);for(let i=0;i<a.count;i++){const v=new THREE.Vector3(a.getX(i),a.getY(i),a.getZ(i)),b=new THREE.Vector3(THREE.MathUtils.clamp(v.x,-limit.x,limit.x),THREE.MathUtils.clamp(v.y,-limit.y,limit.y),THREE.MathUtils.clamp(v.z,-limit.z,limit.z)),n=v.clone().sub(b).normalize().multiplyScalar(r);v.copy(b).add(n);a.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g})}
 const bevel=(p,w,h,d,x,y,z,m,r=.025)=>add(p,rounded(w,h,d,Math.min(r,h*.42,d*.2,w*.2)),m,x,y,z);
 const cylinder=(p,r,h,x,y,z,m,rb=r,segments=24)=>add(p,cached(`c${r}/${rb}/${h}/${segments}`,()=>new THREE.CylinderGeometry(r,rb,h,segments)),m,x,y,z);
 function rod(p,a,b,r,m=steel){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from),o=cylinder(p,r,d.length(),...from.add(to).multiplyScalar(.5).toArray(),m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
 function cable(p,points,r=.031){const path=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)),false,'centripetal');const o=add(p,new THREE.TubeGeometry(path,64,r,8,false),rubber);o.name='Shielded audio cable / routed behind stand';return o}
 function decal(p,text,w,h,x,y,z,{top=false,color='#c9cbca',bg='',size=58}={}){const map=texture(1024,128,g=>{if(bg){g.fillStyle=bg;g.fillRect(0,0,1024,128)}g.fillStyle=color;g.font=`${size}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,64,1000)});const m=new THREE.MeshStandardMaterial({map,alphaTest:bg?0:.1,roughness:.62,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const o=add(p,new THREE.PlaneGeometry(w,h),m,x,y,z);if(top)o.rotation.x=-Math.PI/2;o.castShadow=o.receiveShadow=false;return o}
 function screw(p,x,y,z){cylinder(p,.029,.022,x,y,z,steel);box(p,.030,.009,.006,x,y+.016,z,rubber)}
 // One opaque, mipmapped silk-screen texture per panel. No floating labels or
 // coincident transparent faces: the print belongs to the metal face itself.
 function panel(parent,w,d,x,y,z,angle,bg){const p=new THREE.Group();p.position.set(x,y,z);p.rotation.x=angle;parent.add(p);bevel(p,w,.15,d,0,-.087,0,black);const canvas=document.createElement('canvas');canvas.width=4096;canvas.height=Math.round(4096*d/w);const g=canvas.getContext('2d'),sx=canvas.width/w,sy=canvas.height/d;g.fillStyle=bg;g.fillRect(0,0,canvas.width,canvas.height);g.lineJoin='round';g.textAlign='center';g.textBaseline='middle';
  const px=a=>(a+w/2)*sx,pz=a=>(a+d/2)*sy;
  const text=(s,a,b,size=.064,color='#c4c4bb',font='Arial')=>{g.fillStyle=color;g.font=`${size*sy}px ${font}`;g.fillText(s,px(a),pz(b))};
  const line=(points,width=.016,color='#babcb0')=>{g.strokeStyle=color;g.lineWidth=width*sy;g.beginPath();points.forEach(([a,b],i)=>i?g.lineTo(px(a),pz(b)):g.moveTo(px(a),pz(b)));g.stroke()};
  const rect=(l,t,r,b,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(px(l),pz(t),(r-l)*sx,(b-t)*sy,.042*sy);g.fill()};
  const section=(title,l,t,r,b)=>{g.strokeStyle='#b5b8ac';g.lineWidth=.018*sy;g.beginPath();g.roundRect(px(l),pz(t),(r-l)*sx,(b-t)*sy,.075*sy);g.stroke();g.font=`${.084*sy}px Arial`;const tw=g.measureText(title).width;g.fillStyle=bg;g.fillRect(px((l+r)/2)-tw/2-8,pz(t)-9,tw+16,18);text(title,(l+r)/2,t,.084)};
  const arc=(a,b,r)=>{g.strokeStyle='#b7b9b0';g.lineWidth=.012*sy;g.beginPath();g.arc(px(a),pz(b),r*sx,Math.PI*.70,Math.PI*2.30);g.stroke();for(let i=0;i<11;i++){const q=Math.PI*.70+i*Math.PI*1.6/10;line([[a+Math.cos(q)*r,b+Math.sin(q)*r],[a+Math.cos(q)*(r+.047),b+Math.sin(q)*(r+.047)]],.011)}};
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;const face=add(p,new THREE.PlaneGeometry(w-.025,d-.025),new THREE.MeshStandardMaterial({map,roughness:.60,metalness:.26,bumpMap:grain,bumpScale:.0006}),0,.025,0);face.rotation.x=-Math.PI/2;face.castShadow=face.receiveShadow=false;
  return{p,text,line,section,arc,rect,map,finish(){map.needsUpdate=true}};
 }
 function knob(panel,x,z,label,r=.145,kind='prophet',angle=-.35){const p=panel.p;panel.arc(x,z,r+.045);panel.text(label,x,z+r+.105,.057);cylinder(p,r*1.05,.025,x,.049,z,steel);const shape=cached(`knob${r}/${kind}`,()=>{const points=[[0,0],[r*.93,0],[r,.025],[r,.235],[r*.91,.257],[0,.257]].map(v=>new THREE.Vector2(...v));const geo=new THREE.LatheGeometry(points,48),v=geo.attributes.position;for(let i=0;i<v.count;i++){const a=Math.atan2(v.getX(i),v.getZ(i)),ridge=1+Math.sin(a*36)*.015;v.setX(i,v.getX(i)*ridge);v.setZ(i,v.getZ(i)*ridge)}geo.computeVertexNormals();return geo});const o=add(p,shape,rubber,x,.070,z);o.name=kind+' / '+label;controls.push(o);
  if(kind==='moog')cylinder(p,r*.83,.016,x,.331,z,silver);else cylinder(p,r*.82,.016,x,.331,z,blackKey);
  // The index is inset in the cap, separated from the cap's top by .012.
  const tick=box(p,.022,.012,r*.66,x+Math.sin(angle)*r*.39,.356,z-Math.cos(angle)*r*.39,ivory);tick.rotation.y=-angle;
 }
 function button(panel,x,z,label,lit=false,kind='prophet',w=.15){const p=panel.p;bevel(p,w+.037,.025,.112,x,.052,z,rubber,.008);bevel(p,w,.056,.087,x,.094,z,kind==='preset'?silver:black,.01);if(lit){box(p,w*.65,.015,.025,x,.133,z-.015,kind==='moog'?amber:red)}panel.text(label,x,z+.115,.052);}
 function led(panel,x,z,on=true,kind='prophet'){const p=panel.p;cylinder(p,.032,.020,x,.052,z,rubber,undefined,12);cylinder(p,.021,.015,x,.072,z,on?(kind==='moog'?amber:red):black,undefined,12)}
 function digits(panel,x,z,value,w=.64){const p=panel.p;bevel(p,w+.08,.035,.29,x,.045,z,rubber,.008);const map=texture(512,192,g=>{g.fillStyle='#160c0b';g.fillRect(0,0,512,192);g.fillStyle='#ff4e3e';const patterns={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'},segments={a:[15,15,56,10],b:[69,24,10,54],c:[69,89,10,54],d:[15,148,56,10],e:[4,89,10,54],f:[4,24,10,54],g:[15,81,56,10]};for(let i=0;i<value.length;i++){g.save();g.translate(36+i*(440/value.length),12);for(const s of 'abcdefg'){g.globalAlpha=patterns[value[i]].includes(s)?1:.08;g.fillRect(...segments[s])}g.restore()}});const o=add(p,new THREE.PlaneGeometry(w,.265),new THREE.MeshBasicMaterial({map,toneMapped:false}),x,.075,z);o.rotation.x=-Math.PI/2;o.castShadow=o.receiveShadow=false;}
 function whiteGeometry(step,depth,left,right){const notch=step*.32,rear=-depth/2,front=depth/2,l=-step*.462,r=step*.462;const s=new THREE.Shape();s.moveTo(l,front);s.lineTo(r,front);s.lineTo(r,rear+depth*.60);if(right){s.lineTo(r-notch,rear+depth*.60);s.lineTo(r-notch,rear)}else s.lineTo(r,rear);s.lineTo(left?l+notch:l,rear);if(left){s.lineTo(l+notch,rear+depth*.60);s.lineTo(l,rear+depth*.60)}s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:.21,bevelEnabled:true,bevelThickness:.011,bevelSize:.011,bevelSegments:2,curveSegments:1});geo.center();geo.rotateX(Math.PI/2);return geo;}
 function keyboard(p,count,w,depth,octave){const whiteClasses=[0,2,4,5,7,9,11],isWhite=n=>whiteClasses.includes(((n%12)+12)%12),whiteCount=Array.from({length:count},(_,i)=>i).filter(isWhite).length,step=w/whiteCount,start=-w/2;let wi=0;
  for(let i=0;i<count;i++){const white=isWhite(i),x=white?start+(wi+.5)*step:start+wi*step;if(white)wi++;
   const geo=white?cached(`white${step}/${depth}/${i>0&&!isWhite(i-1)}/${i<count-1&&!isWhite(i+1)}`,()=>whiteGeometry(step,depth,i>0&&!isWhite(i-1),i<count-1&&!isWhite(i+1))):rounded(step*.60,.30,depth*.60,.031);
   const key=add(p,geo,white?ivory:blackKey,x,white?.225:.49,white?0:-depth*.20);key.name=p.name+' key '+i;key.userData={action:'note',note:octave*12+i,baseY:key.position.y,label:'PLAY / '+p.name,dynamic:true};touchables.push(key);keys.push(key);
  }
 }
 function wheel(p,x,z,color){bevel(p,.32,.035,1.16,x,.056,z,rubber);const arc=add(p,new THREE.TorusGeometry(.405,.061,8,40,Math.PI),color,x,.111,z);arc.rotation.y=Math.PI/2;arc.rotation.z=Math.PI/2;const o=cylinder(p,.40,.14,x,.11,z,rubber);o.rotation.z=Math.PI/2;for(let i=0;i<18;i++){const a=i/17*Math.PI;const rib=box(p,.145,.023,.035,x,.11+Math.sin(a)*.402,z+Math.cos(a)*.402,black);rib.rotation.x=Math.PI/2-a;} }
 function sideProfile(p,x,points,material,width=.37){const shape=new THREE.Shape();points.forEach(([z,y],i)=>i?shape.lineTo(z,y):shape.moveTo(z,y));shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:.034,bevelThickness:.021,bevelSegments:3,curveSegments:8});geo.translate(0,0,-width/2);geo.rotateY(-Math.PI/2);woodUV(geo,'z',x<0?.51:.66);const o=add(p,geo,material,x,0,0);o.name='Solid wood end cheek';return o;}

 const prophet=new THREE.Group();prophet.name='Prophet-6';prophet.position.set(0,5.5,.85);rig.add(prophet);bevel(prophet,17.61,.78,7.1,0,-.39,0,black,.065);
 for(const x of[-8.98,8.98])sideProfile(prophet,x,[[-3.59,-.75],[-3.59,.86],[-.04,.68],[3.61,.10],[3.61,-.75]],walnut,.39);
 const rail=bevel(prophet,17.90,.29,.23,0,-.25,3.57,walnut,.04);woodUV(rail.geometry,'x',.37);bevel(prophet,17.48,.12,.13,0,.075,.16,black,.015);
 const pk=new THREE.Group();pk.name='Prophet-6';pk.position.set(1.17,0,1.86);prophet.add(pk);keyboard(pk,49,15.30,3.18,3);wheel(prophet,-7.72,1.80,red);wheel(prophet,-6.95,1.80,red);decal(prophet,'PITCH         MOD',1.60,.13,-7.35,.086,2.91,{top:true});
 const pp=panel(prophet,17.65,3.85,0,.77,-1.73,.045,'#292a2b');
 // Positions normalized from the official 1024 x 407 top photograph.
 const X=u=>(u-510)/54.4,Z=v=>(v-113)/56;
 const ps=(title,l,t,r,b)=>pp.section(title,X(l),Z(t),X(r),Z(b));
 ps('POLY MOD',83,25,275,62);ps('CLOCK',282,25,427,62);ps('ARPEGGIATOR',432,25,655,62);ps('AFTERTOUCH',661,25,861,62);ps('MISC PARAMETERS',866,25,987,62);
 ps('EFFECTS',83,67,327,102);ps('OSCILLATOR 1',335,67,510,102);ps('SLOP',514,67,542,139);ps('MIXER',548,67,610,139);ps('HIGH-PASS FILTER',618,67,782,102);ps('FILTER ENVELOPE',788,67,987,102);
 ps('LOW FREQUENCY OSCILLATOR',35,108,327,141);ps('OSCILLATOR 2',335,108,510,141);ps('LOW-PASS FILTER',618,108,782,141);ps('AMPLIFIER ENVELOPE',788,108,987,141);
 function pkn(u,v,label,r=.137){knob(pp,X(u),Z(v),label,r,'prophet',(u%9-4)*.13)}
 for(const a of [[50,42,'MASTER VOL'],[51,81,'DISTORTION'],[94,42,'FILTER ENV'],[135,42,'OSC 2'],[330,42,'BPM'],[391,42,'VALUE'],[499,42,'OCTAVES'],[543,42,'MODE'],[672,42,'AMOUNT'],[882,42,'PAN SPREAD'],[974,42,'PRGM VOL'],[148,83,'TYPE'],[258,83,'MIX'],[310,83,'AMOUNT'],[351,82,'FREQUENCY'],[427,82,'SHAPE'],[467,82,'PULSE WIDTH'],[527,83,'SLOP'],[565,83,'OSC 1'],[595,83,'OSC 2'],[640,83,'CUTOFF'],[685,83,'RESONANCE'],[722,83,'ENV AMOUNT'],[790,83,'VELOCITY'],[833,83,'ATTACK'],[870,83,'DECAY'],[909,83,'SUSTAIN'],[947,83,'RELEASE'],[52,125,'FREQUENCY'],[102,125,'SHAPE'],[352,124,'FREQUENCY'],[388,124,'FINE'],[427,124,'SHAPE'],[467,124,'PULSE WIDTH'],[565,125,'SUB OCTAVE'],[595,125,'NOISE'],[640,125,'CUTOFF'],[685,125,'RESONANCE'],[722,125,'ENV AMOUNT'],[790,125,'ENV AMOUNT'],[833,125,'ATTACK'],[870,125,'DECAY'],[909,125,'SUSTAIN'],[947,125,'RELEASE'],[242,170,'GLIDE RATE']])pkn(...a);
 for(const [u,v,label,lit] of [[174,42,'FREQ 1',false],[203,42,'SHAPE 1',false],[231,42,'PW 1',false],[264,42,'FILTER',true],[296,42,'TAP TEMPO',true],[470,42,'ON / OFF',false],[607,42,'RECORD',true],[635,42,'PLAY',false],[704,42,'FREQ 1',false],[734,42,'FREQ 2',true],[764,42,'LFO AMT',true],[792,42,'AMP',false],[823,42,'FILTER',false],[904,42,'KEY MODE',false],[936,42,'P WHL RANGE',false],[94,83,'ON / OFF',true],[121,83,'A / B',false],[392,82,'SYNC',false],[495,125,'LOW FREQ',true],[207,125,'FREQ 2',true],[239,125,'PW 1+2',false],[268,125,'AMP',false],[297,125,'FILTER',false],[174,125,'FREQ 1',false],[161,125,'INITIAL AMT',true],[752,83,'VELOCITY',true],[775,83,'KEYBOARD',false],[751,125,'VELOCITY',false],[775,125,'KEYBOARD',false],[815,125,'VELOCITY',true],[74,170,'UP',false],[48,170,'DOWN',false],[188,170,'HOLD',true],[281,170,'GLIDE',true],[336,170,'UNISON',true]])button(pp,X(u),Z(v),label,lit);
 for(let i=0;i<10;i++){button(pp,X(505+i*28),Z(171),String(i),i===2,'preset',.26);pp.text(String(i),X(505+i*28),Z(158),.072)}
 digits(pp,X(434),Z(169),'022',.93);digits(pp,X(360),Z(40),'120',.65);digits(pp,X(185),Z(76),'00',.46);digits(pp,X(185),Z(91),'00',.46);digits(pp,X(292),Z(76),'43',.46);digits(pp,X(292),Z(91),'94',.46);
 for(const [u,t] of [[393,'BANK'],[472,'TENS'],[812,'WRITE'],[868,'GLOBALS'],[925,'PRESET']])button(pp,X(u),Z(171),t,u===812||u===925,'preset',.27);
 pp.rect(X(809),Z(190),X(980),Z(221),'#cecfca');pp.text('prophet-6',X(894),Z(205),.40,'#181818','italic Georgia');
 pp.finish();decal(prophet,'SEQUENTIAL',2.14,.23,-6.88,-.32,3.71,{size:70});

 const moog=new THREE.Group();moog.name='Moog Subsequent 37';moog.position.set(.32,8.75,-1.96);rig.add(moog);bevel(moog,14.62,.66,8.18,0,-.34,0,black,.055);
 for(const x of[-7.46,7.46])sideProfile(moog,x,[[-4.19,-.65],[-4.19,3.68],[-3.94,3.70],[.29,.70],[4.19,.16],[4.19,-.65]],moogWood,.36);
 box(moog,14.48,.11,.14,0,.18,.23,steel);box(moog,14.45,.13,.12,0,-.08,4.12,black);
 const mk=new THREE.Group();mk.name='Moog Subsequent 37';mk.position.set(1.39,0,2.21);moog.add(mk);keyboard(mk,37,11.55,3.65,3);wheel(moog,-6.22,2.30,amber);wheel(moog,-5.31,2.30,amber);decal(moog,'PITCH        MODULATION',1.95,.16,-5.74,.075,3.54,{top:true});
 const mp=panel(moog,14.47,5.0,0,2.15,-1.90,.62,'#2b2e2e');
 const mx=u=>(u-970)/91.7,mz=v=>(v-452)/61.4;
 for(const [title,l,r] of [['PROGRAMMING',300,380],['ARPEGGIATOR',382,487],['GLIDE',488,552],['MOD 1',555,705],['MOD 2',707,858],['OSCILLATORS',860,1007],['MIXER',1008,1127],['FILTER',1128,1256],['ENVELOPE GENERATORS',1259,1536],['OUTPUT',1539,1610]]){mp.section(title,mx(l),-2.35,mx(r),2.08);mp.rect(mx(l),-2.46,mx(r),-2.30,'#a9ada7');mp.text(title,(mx(l)+mx(r))/2,-2.38,.064,'#202426')}
 const mkn=(u,v,label,r=.18)=>knob(mp,mx(u),mz(v),label,r,'moog',(u%13-6)*.09);
 for(const a of [[420,350,'RATE'],[433,524,'PATTERN'],[513,351,'TIME'],[593,351,'LFO 1 RATE'],[668,351,'LFO 1 SOURCE'],[593,448,'PITCH AMT'],[666,448,'FILTER AMT'],[668,547,'MOD 1 AMT'],[748,351,'LFO 2 RATE'],[820,351,'LFO 2 SOURCE'],[748,448,'PITCH AMT'],[820,448,'FILTER AMT'],[820,547,'MOD 2 AMT'],[895,351,'OCTAVE'],[969,351,'WAVE'],[895,448,'OCTAVE'],[969,448,'WAVE'],[895,547,'FREQUENCY'],[969,547,'BEAT FREQ'],[1046,351,'OSC 1'],[1096,401,'SUB 1'],[1046,448,'OSC 2'],[1096,499,'NOISE'],[1046,547,'EXT IN'],[1195,351,'CUTOFF'],[1163,448,'RESONANCE'],[1230,448,'MULTIDRIVE'],[1163,547,'EG AMT'],[1230,547,'KB TRACK'],[1308,350,'ATTACK'],[1373,350,'DECAY'],[1438,350,'SUSTAIN'],[1500,350,'RELEASE'],[1308,498,'ATTACK'],[1373,498,'DECAY'],[1438,498,'SUSTAIN'],[1500,498,'RELEASE'],[1577,351,'VOLUME'],[1577,448,'VOLUME'],[342,547,'FINE TUNE']])mkn(...a,a[2]==='CUTOFF'?.30:.18);
 const lcd=texture(512,256,g=>{g.fillStyle='#d7d6c8';g.fillRect(0,0,512,256);g.fillStyle='#4c514a';g.font='29px monospace';g.fillText('ORGAN',24,53);g.fillText('BENDER',24,96);g.font='21px monospace';g.fillText('CAT 07 / ORGAN',24,155);g.fillText('BANK 01     04',24,204)});bevel(mp.p,.88,.06,.71,mx(342),.060,mz(341),rubber,.016);const lcdMesh=add(mp.p,new THREE.PlaneGeometry(.80,.63),new THREE.MeshBasicMaterial({map:lcd,toneMapped:false}),mx(342),.105,mz(341));lcdMesh.rotation.x=-Math.PI/2;lcdMesh.castShadow=lcdMesh.receiveShadow=false;
 for(const [u,v,label,on] of [[315,384,'◁',false],[338,384,'▷',false],[362,384,'CURSOR',false],[324,434,'COMPARE',false],[363,434,'SAVE',false],[324,488,'PRESET',true],[363,488,'PANEL',false],[522,490,'GATED',true],[522,557,'ON',true],[581,400,'HI RANGE',false],[628,400,'SYNC',false],[680,400,'KB RESET',false],[735,400,'HI RANGE',false],[782,400,'SYNC',false],[832,400,'KB RESET',false],[910,400,'HARD SYNC',false],[969,400,'KB RESET',false],[969,490,'DUO MODE',true],[1308,392,'MULTI TRIG',false],[1359,392,'RESET',false],[1406,392,'SYNC',false],[1450,392,'LOOP',false],[1503,392,'LATCH ON',false],[1308,540,'MULTI TRIG',false],[1359,540,'RESET',false],[1406,540,'SYNC',false],[1450,540,'LOOP',false],[1503,540,'LATCH ON',false],[1577,392,'MUTE',false]])button(mp,mx(u),mz(v),label,on,'moog',.14);
 // Bank row, centered along the lower edge of the front panel.
 for(let i=0;i<16;i++){button(mp,-6.95+i*.65,2.28,String(i+1),i===9,'moog',.22)}
 for(const [u,v]of[[435,396],[509,396],[532,396],[496,447],[526,447],[578,493],[622,493],[578,532],[615,532],[735,493],[772,493],[735,532],[909,492],[1024,498],[1114,351],[1114,448],[1114,547],[1163,493]])led(mp,mx(u),mz(v),true,'moog');
 mp.text('SUBSEQUENT 37',4.18,2.26,.23,'#d4d5cb');mp.text('MOOG MUSIC INC.',5.77,2.22,.065);mp.text('Employee Owned Co.',5.77,2.37,.056);mp.text('◉',6.69,2.25,.40);mp.finish();
 // Side-mounted I/O on the Moog, rear-panel I/O on the Prophet.
 const io=bevel(moog,.03,.68,1.77,-7.684,-.13,1.64,silver,.005);io.name='Moog left I/O plate';
 for(const z of[1.05,1.34,1.63,1.92,2.21]){const jack=cylinder(moog,.063,.045,-7.722,-.12,z,rubber);jack.rotation.z=Math.PI/2;}
 for(const x of[-6.65,-6.25,-5.85]){const jack=cylinder(prophet,.06,.045,x,-.08,-3.58,silver);jack.rotation.x=Math.PI/2;}

 const stand=new THREE.Group();stand.name='Two-tier black steel synthesizer stand';rig.add(stand);
 for(const x of[-6.65,6.65]){bevel(stand,.33,.23,7.5,x,.16,.10,steel,.025);for(const z of[-3.44,3.64])bevel(stand,.44,.15,.50,x,.09,z,rubber,.023);rod(stand,[x,.27,-2.85],[x,8.55,-3.24],.145);rod(stand,[x,.27,2.86],[x,5.01,-2.19],.145);box(stand,.36,.20,6.34,x,4.54,.69,steel);box(stand,.37,.17,6.69,x,7.94,-1.89,steel);for(const[y,z]of[[4.69,.70],[8.085,-1.89]])for(const dz of[-1.6,1.6])bevel(stand,.40,.09,.40,x,y,z+dz,rubber,.021);for(const y of[4.24,7.72]){const bolt=cylinder(stand,.14,.12,x+.23,y,-3.12,silver);bolt.rotation.z=Math.PI/2;}}
 rod(stand,[-6.65,3.15,-2.99],[6.65,3.15,-2.99],.10);rod(stand,[-6.65,7.42,-3.21],[6.65,7.42,-3.21],.09);
 const leads=new THREE.Group();leads.name='Synth I/O plugs, strain relief and cable clips';rig.add(leads);
 function plug(p,a,axis){const o=cylinder(p,.059,.30,...a,rubber);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...axis));const end=new THREE.Vector3(...a).addScaledVector(new THREE.Vector3(...axis),.19);const grip=cylinder(p,.066,.07,...end.toArray(),steel);grip.quaternion.copy(o.quaternion);}
 plug(leads,[-6.65,5.42,-2.89],[0,0,-1]);plug(leads,[-7.56,8.62,-.62],[-1,0,0]);
 cable(leads,[[-6.65,5.42,-3.02],[-6.65,5.30,-3.40],[-6.61,4.20,-3.35],[-6.63,2.80,-3.30],[-6.52,.55,-3.40],[-5.75,.09,-3.78]]);
 cable(leads,[[-7.69,8.62,-.62],[-8.08,8.38,-.81],[-7.85,8.08,-2.69],[-6.83,7.70,-3.46],[-6.80,4.10,-3.46],[-6.69,.45,-3.53],[-5.73,.09,-3.89]]);
 for(const y of[1.4,3.1,4.5,7.4])bevel(leads,.36,.075,.17,-6.68,y,-3.42,steel,.02);
 rig.userData.models=['Moog Subsequent 37','Sequential Prophet-6'];rig.userData.keyCounts=[37,49];rig.userData.referencePanels={prophet:'Sequential Prophet6_top_2125_transparent_Tour_TY2',moog:'Moog Subsequent 37 official product photographs'};
 rig.updateMatrixWorld(true);
 // Extend the service leads along the room perimeter, never across the aisle.
 const from=rig.localToWorld(new THREE.Vector3(-5.75,.10,-3.83));root.worldToLocal(from);cable(root,[from.toArray(),[31.2,.11,14.2],[32.0,.11,3],[32.0,.11,-9.3],[21.4,.13,-9.3],[19.9,1.60,-9.23],[18.1,2.18,-9.10]],.035);
 const bounds=new THREE.Box3(),local=new THREE.Matrix4();rig.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();rig.traverse(mesh=>{if(!mesh.isMesh)return;mesh.geometry.computeBoundingBox();local.multiplyMatrices(inverse,mesh.matrixWorld);bounds.union(mesh.geometry.boundingBox.clone().applyMatrix4(local))});
 return {rig,keys,controls,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},update(now){for(const key of keys){const elapsed=now-(key.userData.pressedAt??-1000);key.position.y=key.userData.baseY-(elapsed>=0&&elapsed<240?Math.sin(elapsed/240*Math.PI)*.075:0)}}};
}
