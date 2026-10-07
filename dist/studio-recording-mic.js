import * as THREE from 'three';

// Reference IMG_4736: long satin-nickel body, rounded rectangular woven basket,
// suspended metal spider, threaded boom joint and a secured red XLR cable.
export function createRecordingMic({parent,texture}){
 const group=new THREE.Group();group.name='Satin nickel studio condenser with suspension mount';group.position.set(-13.8,2.81,-8.50);parent.add(group);
 const add=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;p.add(m);return m};
 const cyl=(p,r,h,x,y,z,m,rb=r)=>add(new THREE.CylinderGeometry(r,rb,h,48),m,p,x,y,z);
 const ball=(p,r,x,y,z,m)=>add(new THREE.SphereGeometry(r,16,10),m,p,x,y,z);
 const rod=(p,a,b,r,m)=>{const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),v=bv.clone().sub(av),o=cyl(p,r,v.length(),...av.add(bv).multiplyScalar(.5).toArray(),m);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o};
 const ring=(p,r,t,y,m)=>{const o=add(new THREE.TorusGeometry(r,t,8,48),m,p,0,y,0);o.rotation.x=Math.PI/2;return o};
 const brush=texture(256,512,(g,w,h)=>{g.fillStyle='#b3b4b4';g.fillRect(0,0,w,h);for(let y=0;y<h;y++){g.fillStyle=`rgba(255,255,255,${.025+((y*29)%37)/800})`;g.fillRect(0,y,w,.4)}});brush.wrapS=brush.wrapT=THREE.RepeatWrapping;
 const nickel=new THREE.MeshPhysicalMaterial({color:0xd9d6cc,bumpMap:brush,bumpScale:.0008,metalness:.86,roughness:.26,envMapIntensity:1.05,anisotropy:.34,anisotropyRotation:Math.PI/2});
 const polished=new THREE.MeshStandardMaterial({color:0xe3e1d9,metalness:1,roughness:.13});
 const black=new THREE.MeshStandardMaterial({color:0x0b0b0b,roughness:.55,metalness:.25});
 const elastic=new THREE.MeshStandardMaterial({color:0x4d4941,roughness:.92});
 const cableRed=new THREE.MeshPhysicalMaterial({color:0xa41d0f,roughness:.28,metalness:.12,clearcoat:.65});
 const red=new THREE.MeshStandardMaterial({color:0x741c16,roughness:.48});
 // Clamp at the desktop rear edge; two articulated arms bring the capsule
 // to the workstation without a remote floor stand or cables across the floor.
 const clamp=new THREE.Mesh(new THREE.BoxGeometry(.66,.12,.92),nickel);clamp.position.set(0,.06,0);group.add(clamp);
 const jaw=new THREE.Mesh(new THREE.BoxGeometry(.66,.52,.10),black);jaw.position.set(0,-.24,-.38);group.add(jaw);
 cyl(group,.16,.62,0,-.24,.01,black);cyl(group,.28,.07,0,-.52,.01,nickel);
 rod(group,[0,.23,0],[-1.0,7.4,2.7],.075,polished);
 rod(group,[.15,.23,.03],[-.85,7.4,2.73],.038,nickel);
 rod(group,[-1.0,7.4,2.7],[7.45,3.60,13.2],.068,polished);
 rod(group,[-.85,7.55,2.73],[7.60,3.75,13.23],.036,nickel);
 for(const p of[[0,.23,0],[-1.0,7.4,2.7],[7.45,3.60,13.2]]){const joint=cyl(group,.18,.23,...p,black);joint.rotation.z=Math.PI/2;}
 const cradle=new THREE.Group();cradle.position.set(8.8,3.80,13.2);cradle.rotation.set(0,0,0);group.add(cradle);
 const mic=new THREE.Group();mic.name='Condenser body and fine woven headbasket';cradle.add(mic);
 cyl(mic,.465,1.97,0,.27,0,nickel,.365);
 for(const [y,r] of[[-.715,.364],[-.66,.373],[1.21,.466],[1.285,.479]])ring(mic,r,.023,y,polished);
 cyl(mic,.471,.035,0,1.25,0,black);cyl(mic,.484,.16,0,1.34,0,nickel);
 // Under the mesh, the capsule remains visible as a softly lit dark silhouette.
 const capsule=add(new THREE.CylinderGeometry(.32,.32,.11,40),black,mic,0,2.10,0);capsule.rotation.x=Math.PI/2;
 rod(mic,[0,1.39,0],[0,1.96,0],.048,nickel);
 const weave=texture(512,512,(g,w,h)=>{
  g.clearRect(0,0,w,h);const step=9;
  for(let k=0;k<w;k+=step){g.strokeStyle='#88847b';g.lineWidth=2.9;g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.strokeStyle='#d9d5c8';g.lineWidth=1.0;g.beginPath();g.moveTo(k-1,0);g.lineTo(k-1,h);g.stroke();}
  for(let k=0;k<h;k+=step){g.strokeStyle='#9c978b';g.lineWidth=2.7;g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();g.strokeStyle='#e3ded0';g.lineWidth=.8;g.beginPath();g.moveTo(0,k-1);g.lineTo(w,k-1);g.stroke();}
 });weave.wrapS=weave.wrapT=THREE.RepeatWrapping;weave.repeat.set(1,1);weave.anisotropy=8;
 const grille=new THREE.MeshStandardMaterial({color:0xd8d3c7,map:weave,bumpMap:weave,bumpScale:.0014,alphaTest:.38,metalness:.78,roughness:.31,side:THREE.DoubleSide});
 // Rounded metal basket with cylindrical UVs: no stretched side pixels.
 const basket=new THREE.BoxGeometry(.99,1.47,.70,16,20,12),pos=basket.attributes.position,uv=basket.attributes.uv,r=.115,limits=new THREE.Vector3(.495-r,.735-r,.35-r);
 for(let i=0;i<pos.count;i++){
  const v=new THREE.Vector3().fromBufferAttribute(pos,i),q=new THREE.Vector3(THREE.MathUtils.clamp(v.x,-limits.x,limits.x),THREE.MathUtils.clamp(v.y,-limits.y,limits.y),THREE.MathUtils.clamp(v.z,-limits.z,limits.z));v.sub(q).normalize().multiplyScalar(r).add(q);pos.setXYZ(i,v.x,v.y,v.z);uv.setXY(i,Math.atan2(v.x,v.z)/(Math.PI*2)+.5,(v.y+.735)/1.47);
 }basket.computeVertexNormals();add(basket,grille,mic,0,2.135,0);
 // Fine rolled edges surround the front and rear grilles, leaving the capsule visible.
 for(const z of[-.351,.351]){const edge=new THREE.Shape();edge.moveTo(-.35,-.68);edge.lineTo(.35,-.68);edge.quadraticCurveTo(.48,-.68,.48,-.55);edge.lineTo(.48,.55);edge.quadraticCurveTo(.48,.71,.32,.71);edge.lineTo(-.32,.71);edge.quadraticCurveTo(-.48,.71,-.48,.55);edge.lineTo(-.48,-.55);edge.quadraticCurveTo(-.48,-.68,-.35,-.68);const points=edge.getPoints(72).map(p=>new THREE.Vector3(p.x,p.y+2.135,z));add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,.010,5,false),polished,mic);}
 const badge=add(new THREE.PlaneGeometry(.20,.20),new THREE.MeshStandardMaterial({color:0x20242a,metalness:.2,roughness:.4}),mic,0,-.48,.421);badge.rotation.z=Math.PI/4;
 // Outer spider stays beyond the barrel. Tension strings terminate at a
 // separate collar; no diagonal crosses through the microphone body.
 for(const y of[-.78,.70])ring(cradle,.89,.026,y,polished);
 ring(cradle,.535,.027,-.63,nickel);ring(cradle,.535,.021,.53,nickel);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3,b=a+Math.PI/3,c=a+Math.PI/6;
  const lo=[Math.cos(a)*.92,-.87,Math.sin(a)*.92],hi=[Math.cos(b)*.98,.92,Math.sin(b)*.98];
  rod(cradle,lo,hi,.021,polished);ball(cradle,.042,...lo,polished);
  rod(cradle,[Math.cos(a)*.89,-.78,Math.sin(a)*.89],[Math.cos(c)*.535,.53,Math.sin(c)*.535],.009,elastic);
  rod(cradle,[Math.cos(a)*.89,.70,Math.sin(a)*.89],[Math.cos(c)*.535,-.63,Math.sin(c)*.535],.009,elastic);
 }
 rod(cradle,[-.89,-.78,0],[-.89,.70,0],.036,nickel);
 rod(cradle,[-1.35,-.2,0],[-.89,-.2,0],.081,nickel);
 // Three radial rubber pads seat the barrel inside each suspension collar.
 for(const [y,inner] of[[-.63,.377],[.53,.433]])for(let i=0;i<3;i++){const a=i*Math.PI*2/3;rod(cradle,[Math.cos(a)*inner,y,Math.sin(a)*inner],[Math.cos(a)*.535,y,Math.sin(a)*.535],.032,black);}
 const locking=cyl(cradle,.14,.22,-1.25,-.2,0,black);locking.rotation.z=Math.PI/2;
 cyl(mic,.18,.28,0,-.93,0,nickel);cyl(mic,.184,.035,0,-1.065,0,red);cyl(mic,.168,.38,0,-1.25,0,black,.11);
 // A small service loop at the XLR, then clips keep the red lead on the
 // boom. The final drop goes directly into the rear service tray.
 group.updateMatrixWorld(true);const plug=group.worldToLocal(mic.localToWorld(new THREE.Vector3(0,-1.44,0)));
 const route=[plug,new THREE.Vector3(8.80,1.92,13.22),new THREE.Vector3(8.26,1.68,13.26),new THREE.Vector3(7.35,1.99,13.25),new THREE.Vector3(7.30,3.47,13.17),new THREE.Vector3(5.65,4.24,11.02),new THREE.Vector3(2.20,5.83,6.70),new THREE.Vector3(-1.08,7.28,2.75),new THREE.Vector3(-.78,5.15,1.94),new THREE.Vector3(-.40,2.60,1.02),new THREE.Vector3(-.15,.19,.03),new THREE.Vector3(-.12,.04,-.43),new THREE.Vector3(0,-.55,-.59)];
 add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(route),120,.028,8,false),cableRed,group);
 for(const p of[[5.65,4.24,11.02],[2.20,5.83,6.70],[-.78,5.15,1.94],[-.40,2.60,1.02]])ball(group,.052,...p,black);
 group.userData.capsulePosition=[-5,6.61,4.7];group.userData.minimumSuspensionRadius=.535;
 return group;
}
