import * as THREE from 'three';

// A small glazed espresso cup: a continuous thick wall, separate crema and a
// record-pattern saucer. All dimensions share the same tabletop contact plane.
export function createReferenceCoffeeCup({parent,texture,x=0,y=0,z=0,scale=1,saucer=true}){
 const group=new THREE.Group();group.name='Blue illustrated porcelain espresso cup with record saucer';group.position.set(x,y,z);group.scale.setScalar(scale);parent.add(group);
 const add=(geometry,material,px=0,py=0,pz=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(px,py,pz);group.add(m);return m};
 const ceramic=new THREE.MeshPhysicalMaterial({color:0xfff7df,roughness:.18,clearcoat:1,clearcoatRoughness:.12});
 const blackGlaze=new THREE.MeshPhysicalMaterial({color:0x151b1b,roughness:.20,clearcoat:1,clearcoatRoughness:.1});
 const lathe=(profile,material,oy=0)=>add(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),64),material,0,oy,0);
 const lift=saucer?.05:0;
 if(saucer){
  lathe([[0,0],[.48,0],[.76,.038],[.81,.085],[.80,.118],[.72,.115],[.47,.057],[0,.047]],blackGlaze);
  const print=texture(1024,1024,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#f7f3dc';for(let i=0;i<10;i++){g.lineWidth=i%3===0?5:3;g.beginPath();g.arc(w/2,h/2,194+i*22,0,Math.PI*2);g.stroke();}g.textAlign='center';g.textBaseline='middle';const phrase='LA MARZOCCO   ESPRESSO MACHINES SINCE 1927   ';[...phrase].forEach((c,i)=>{const a=i/phrase.length*Math.PI*2;g.save();g.translate(512+Math.sin(a)*458,512-Math.cos(a)*458);g.rotate(a);g.font='bold 25px Arial';g.fillStyle='#fff9e5';g.fillText(c,0,0);g.restore()});});
  const saucerMesh=add(new THREE.CircleGeometry(.794,80),new THREE.MeshPhysicalMaterial({map:print,transparent:true,depthWrite:false,roughness:.22,clearcoat:1}),0,.123,0);saucerMesh.rotation.x=-Math.PI/2;
 }
 // Both faces are actual geometry; the white inner lip remains visible above coffee.
 lathe([[0,0],[.27,0],[.29,.045],[.32,.09],[.405,.21],[.465,.48],[.49,.67],[.487,.71],[.464,.732],[.433,.725],[.421,.693],[.416,.61],[.372,.31],[.291,.13],[0,.13]],ceramic,lift);
 const artwork=texture(1536,768,(g,w,h)=>{g.fillStyle='#4d899e';g.fillRect(0,0,w,h);g.strokeStyle='#d9e6d8';g.fillStyle='#e7eada';g.lineWidth=3;for(let i=0;i<9;i++){g.beginPath();g.moveTo(0,550+i*17);g.lineTo(w,550+i*17);g.stroke()}for(let k=0;k<3;k++){const ox=k*512+24;g.strokeRect(ox,130,440,350);g.strokeRect(ox+19,164,403,278);for(let j=0;j<6;j++)g.strokeRect(ox+34+j*66,215,40,194);g.beginPath();g.moveTo(ox-12,125);g.lineTo(ox+223,30);g.lineTo(ox+456,125);g.stroke();g.strokeRect(ox+106,175,204,37);g.font='22px Georgia';g.textAlign='center';g.fillText('LA MARZOCCO',ox+218,202);for(let j=0;j<6;j++){g.beginPath();g.moveTo(ox+15+j*77,488);g.lineTo(ox+15+j*77,531);g.stroke();}}});
 const wrap=new THREE.LatheGeometry([[.322,.09],[.407,.21],[.467,.48],[.4849,.616]].map(p=>new THREE.Vector2(...p)),80);
 const blue=add(wrap,new THREE.MeshPhysicalMaterial({map:artwork,roughness:.20,clearcoat:1,clearcoatRoughness:.12}),0,lift,0);
 blue.rotation.y=.24;
 const innerText=texture(1024,160,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#141c1c';g.font='bold 90px Arial';g.textAlign='center';g.fillText('la marzocco',w/2,118)});
 innerText.repeat.x=-1;innerText.offset.x=1;
 const inside=add(new THREE.CylinderGeometry(.424,.409,.133,64,1,true,Math.PI*.56,Math.PI*.86),new THREE.MeshPhysicalMaterial({map:innerText,transparent:true,depthWrite:false,side:THREE.BackSide,roughness:.20}),0,lift+.637,0);
 const crema=texture(512,512,(g,w,h)=>{const r=g.createRadialGradient(190,170,25,256,256,254);r.addColorStop(0,'#d8a037');r.addColorStop(.42,'#c98520');r.addColorStop(.81,'#b9690c');r.addColorStop(1,'#e6ae45');g.fillStyle=r;g.fillRect(0,0,w,h);for(let i=0;i<1600;i++){const xx=(Math.sin(i*12.93)*43758.5)%1,zz=(Math.sin(i*3.72+2)*31754.4)%1;g.fillStyle=i%3?'rgba(248,202,97,.15)':'rgba(117,65,14,.12)';g.beginPath();g.arc(Math.abs(xx)*512,Math.abs(zz)*512,.4+(i%6)*.35,0,7);g.fill()}g.strokeStyle='rgba(255,217,130,.38)';g.lineWidth=13;g.beginPath();g.ellipse(260,254,164,103,-.38,.3,4.4);g.stroke();});
 const coffee=add(new THREE.CircleGeometry(.401,64),new THREE.MeshPhysicalMaterial({map:crema,roughness:.22,clearcoat:1,clearcoatRoughness:.10}),0,lift+.539,0);coffee.rotation.x=-Math.PI/2;
 const handleCurve=new THREE.CatmullRomCurve3([[.458,.571,0],[.649,.62,0],[.773,.516,0],[.739,.34,0],[.60,.234,0],[.398,.249,0]].map(p=>new THREE.Vector3(p[0],p[1]+lift,p[2])));
 add(new THREE.TubeGeometry(handleCurve,40,.073,12,false),ceramic);
 group.userData.tableContact=0;return group;
}
