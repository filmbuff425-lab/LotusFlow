import * as THREE from 'three';

export function createReferenceStereo({cabinet,texture}){
 const group=new THREE.Group();group.name='Reference / silver Panasonic modular CD and MD stereo';group.position.set(4.65,7.205,-.12);cabinet.add(group);
 const rnd=n=>{const a=Math.sin(n*79.71+2.3)*43851.3;return a-Math.floor(a)};
 const brushed=texture(256,512,g=>{g.fillStyle='#d1d4d6';g.fillRect(0,0,256,512);for(let y=0;y<512;y++){g.fillStyle=y%3?'#ffffff14':'#1522310b';g.fillRect(0,y,256,1)}});
 const satin=new THREE.MeshPhysicalMaterial({color:0xe4e6e6,map:brushed,bumpMap:brushed,bumpScale:.003,metalness:.76,roughness:.35,anisotropy:.45});
 const panel=new THREE.MeshPhysicalMaterial({color:0xeeeee9,map:brushed,metalness:.53,roughness:.36,clearcoat:.15});
 const chrome=new THREE.MeshPhysicalMaterial({color:0xe7e8e5,metalness:1,roughness:.16});
 const seam=new THREE.MeshStandardMaterial({color:0x9c9f9d,metalness:.67,roughness:.41});
 const black=new THREE.MeshStandardMaterial({color:0x161a1d,roughness:.65});
 const aged=new THREE.MeshPhysicalMaterial({color:0xdacda1,roughness:.44,clearcoat:.20});
 const amber=new THREE.MeshPhysicalMaterial({color:0xe9a63d,roughness:.28,clearcoat:.5});
 const paperMap=texture(256,256,g=>{g.fillStyle='#e1d7b5';g.fillRect(0,0,256,256);for(let i=0;i<9000;i++){g.fillStyle=i%2?'#5f542110':'#ffffff19';g.fillRect(rnd(i)*256,rnd(i+700)*256,1,1)}});
 const coneMat=new THREE.MeshStandardMaterial({map:paperMap,color:0xf0ddb3,roughness:.83,bumpMap:paperMap,bumpScale:.005});
 const add=(p,geo,mat,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const box=(p,w,h,d,x,y,z,m)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function face(p,w,h,d,x,y,z,m,holes){
  const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();
  for(const [cy,r]of holes){const hole=new THREE.Path();hole.absarc(0,cy-y,r,0,Math.PI*2,true);s.holes.push(hole)}
  const geometry=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:48});geometry.translate(0,0,-d/2);
  const mesh=add(p,geometry,m,x,y,z);mesh.name='Speaker face / physical driver apertures';return mesh;
 }
 const cylinder=(p,r,h,x,y,z,m)=>{const c=add(p,new THREE.CylinderGeometry(r,r,h,48),m,x,y,z);c.rotation.x=Math.PI/2;return c};
 const dome=(p,r,x,y,z)=>{const o=add(p,new THREE.SphereGeometry(r,32,20),chrome,x,y,z);o.scale.z=.34;return o};
 const screw=(p,x,y,z)=>{cylinder(p,.044,.014,x,y,z,seam);cylinder(p,.018,.016,x,y,z+.009,black)};
 const label=(p,text,x,y,z,w,h,color='#c4c8c7',font=24)=>{const map=texture(512,128,g=>{g.fillStyle=color;g.font=`${font}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,256,64,500)});const o=add(p,new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map,alphaTest:.12,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,roughness:.65}),x,y,z+.018);o.castShadow=o.receiveShadow=false;return o};
 function driver(parent,x,y,r){
  const surround=add(parent,new THREE.TorusGeometry(r*.91,r*.095,12,64),aged,x,y,1.325);
  const rim=add(parent,new THREE.RingGeometry(r*.96,r*1.11,64),satin,x,y,1.415);
  const cone=add(parent,new THREE.LatheGeometry([[0,-.09],[r*.24,-.09],[r*.62,-.035],[r*.86,.095],[r*.96,.15]].map(a=>new THREE.Vector2(...a)),64),coneMat,x,y,1.13);cone.rotation.x=Math.PI/2;
  add(parent,new THREE.TorusGeometry(r*.78,.008,6,64),new THREE.MeshStandardMaterial({color:0xb29763,roughness:.76}),x,y,1.348);
  dome(parent,r*.40,x,y,1.29);rim.castShadow=rim.receiveShadow=false;return{surround,rim};
 }
 for(const side of[-1,1]){
  const speaker=new THREE.Group();speaker.position.x=side*3.74;speaker.name='Silver speaker / cream paper drivers, chrome dust caps';group.add(speaker);
  // Hollow enclosure: the old solid front cut through the paper cones.
  box(speaker,2.02,4.30,.10,0,2.19,-1.16,seam);
  for(const x of[-.965,.965])box(speaker,.09,4.30,2.42,x,2.19,0,seam);
  for(const y of[.085,4.295])box(speaker,1.84,.09,2.42,0,y,0,seam);
  box(speaker,1.83,4.10,.06,0,2.19,.86,black);
  face(speaker,2.02,4.30,.13,0,2.19,1.22,satin,[[3.26,.655],[1.21,.799]]);
  face(speaker,2.018,2.15,.017,0,1.116,1.326,panel,[[1.21,.799]]);
  driver(speaker,0,3.26,.64);driver(speaker,0,1.21,.78);
  for(const x of[-.83,.83])for(const y of[.23,4.10]){cylinder(speaker,.085,.019,x,y,1.314,aged);screw(speaker,x,y,1.33)}
  for(const x of[-.72,.72])box(speaker,.32,.068,1.61,x,.015,0,black);
 }
 const amp=new THREE.Group();amp.name='Four silver modules / LCD, CD, MD, jog control and tone';group.add(amp);
 box(amp,5.39,2.92,2.26,0,1.51,0,seam);
 const left=box(amp,2.42,2.85,.105,-1.44,1.525,1.182,panel);
 const control=box(amp,1.91,1.95,.105,.79,1.975,1.182,panel);
 const md=box(amp,1.91,.87,.105,.79,.533,1.182,panel);
 const tones=box(amp,.91,2.85,.105,2.235,1.525,1.182,panel);
 for(const part of[left,control,md,tones]){const w=part.geometry.parameters.width,h=part.geometry.parameters.height;for(const x of[-w/2+.07,w/2-.07])for(const y of[-h/2+.07,h/2-.07])screw(amp,part.position.x+x,part.position.y+y,1.249)}
 const lcdMap=texture(768,256,g=>{g.fillStyle='#686d65';g.fillRect(0,0,768,256);g.fillStyle='#b8d1b9';g.font='28px monospace';g.fillText('STEREO · CD',30,58);g.font='32px monospace';g.fillText('01      03  72:51',192,187);for(let i=0;i<5;i++)g.fillRect(30+i*13,123,6,24+i*6)});
 const lcd=add(amp,new THREE.PlaneGeometry(1.81,.49),new THREE.MeshBasicMaterial({map:lcdMap,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),-1.44,2.47,1.280);lcd.castShadow=lcd.receiveShadow=false;
 label(amp,'Panasonic',-2.05,.17,1.247,.62,.12,'#c7ceca',32);label(amp,'MD STEREO SYSTEM',-1.18,.17,1.247,.94,.095);
 for(let row=0;row<2;row++)for(let i=0;i<5;i++){const x=-2.33+i*.415,y=1.64-row*.27;cylinder(amp,.054,.055,x,y,1.257,chrome);if(row===0&&i===1){const light=add(amp,new THREE.CircleGeometry(.012,12),new THREE.MeshBasicMaterial({color:0xc5e886}),x,y,1.288);light.castShadow=false}}
 label(amp,'CD      MD      FM      AM      AUX',-1.44,1.87,1.247,1.84,.08);
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){const x=.62+col*.36,y=2.67-row*.24;box(amp,.27,.16,.067,x,y,1.262,amber);label(amp,[['CD ▷','MD ▷','FM/AM'],['|◁◁','□','▷▷|'],['DISP','Ⅱ','AUX']][row][col],x,y,1.302,.21,.065,'#745121',24)}
 for(let i=0;i<2;i++)cylinder(amp,.051,.055,-.014+i*.24,2.65,1.255,chrome);
 label(amp,'OPEN/CLOSE',.10,2.46,1.251,.47,.075);label(amp,'JOG/SET',.97,1.91,1.251,.54,.08);
 cylinder(amp,.415,.08,.97,1.47,1.275,aged);cylinder(amp,.182,.028,.97,1.47,1.324,amber);dome(amp,.109,.97,1.47,1.350);
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2;cylinder(amp,.013,.009,.97+Math.cos(a)*.325,1.47+Math.sin(a)*.325,1.321,seam)}
 for(let i=0;i<3;i++){cylinder(amp,.064,.048,-.024+i*.24,1.56,1.265,chrome);add(amp,new THREE.TorusGeometry(.07,.010,6,24),new THREE.MeshStandardMaterial({color:0xa4bb42,roughness:.43}),-.024+i*.24,1.56,1.285);cylinder(amp,.048,.033,-.024+i*.24,1.30,1.268,chrome)}
 box(amp,1.35,.235,.052,.79,.73,1.269,seam);box(amp,1.18,.067,.038,.79,.71,1.301,black);box(amp,1.13,.093,.04,.79,.80,1.313,satin);
 for(let i=0;i<4;i++){box(amp,.145,.113,.035,.26+i*.34,.36,1.258,i===3?satin:amber);box(amp,.11,.08,.023,.26+i*.34,.36,1.29,panel)}
 for(const [i,y]of[2.51,1.79,1.08].entries()){cylinder(amp,.228,.09,2.235,y,1.278,aged);add(amp,new THREE.TorusGeometry(.231,.013,8,40),i===0?new THREE.MeshStandardMaterial({color:0xa9b96c,roughness:.45}):chrome,2.235,y,1.33);label(amp,['VOLUME','TREBLE','BASS'][i],2.235,y+.32,1.249,.55,.073)}
 for(const x of[2.04,2.44])cylinder(amp,.055,.03,x,.48,1.27,chrome);
 label(amp,'POWER   ECO',2.235,.24,1.25,.59,.09,'#ae7664');
 const cable=add(group,new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0,.05,-1.05],[.15,.04,-1.8],[.15,-.32,-2.20],[.15,-3,-2.2]].map(v=>new THREE.Vector3(...v))),18,.022,6,false),black);
 return group;
}
