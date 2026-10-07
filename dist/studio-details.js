import * as THREE from 'three';
import { createInstruments } from './studio-instruments.js?v=20261006-lake-surface1';

export function createStudioDetails({ scene, root, renderer, api, touchables, texture, topText, selected, camera, soundcube }) {
 const material=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const aluminum=material(0xc8cbd0,.86,.24),dark=material(0x1b1c20,.7,.3),black=material(0x08090b,.12,.58),ivory=material(0xebeae6,.03,.4);
 const glassWhite=new THREE.MeshPhysicalMaterial({color:0xf2f2ee,roughness:.12,metalness:.08,clearcoat:1,clearcoatRoughness:.05});
 const objects=[],keys=[],speakers=[];
 const add=(geo,mat,parent,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const box=(w,h,d,x,y,z,mat,parent=root)=>add(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z);
 const cylinder=(r,h,x,y,z,mat,parent=root)=>add(new THREE.CylinderGeometry(r,r,h,64),mat,parent,x,y,z);
 function slab(w,d,h,r,x,y,z,mat,parent=root){
  const s=new THREE.Shape();s.moveTo(-w/2+r,-d/2);s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
  const geo=new THREE.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:7});geo.center();geo.rotateX(-Math.PI/2);return add(geo,mat,parent,x,y,z);
 }
 const register=(mesh,data)=>{mesh.userData={...data};touchables.push(mesh);return mesh};
 function cord(points,r=.023,parent=root){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return add(new THREE.TubeGeometry(curve,40,r,7,false),black,parent)}

 // Large photographic softboxes give anodized aluminum and glass real reflections.
 const env=texture(1024,512,g=>{const grad=g.createLinearGradient(0,0,0,512);grad.addColorStop(0,'#505654');grad.addColorStop(.42,'#303a38');grad.addColorStop(.53,'#121216');grad.addColorStop(1,'#433c31');g.fillStyle=grad;g.fillRect(0,0,1024,512);g.fillStyle='#fff';g.fillRect(90,100,200,230);g.fillRect(570,40,120,390);g.fillStyle='#f0b4a4';g.fillRect(810,60,100,290);g.fillStyle='#0b0b10';g.fillRect(410,0,80,512)});
 env.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);const baked=pmrem.fromEquirectangular(env);scene.environment=baked.texture;env.dispose();pmrem.dispose();
 scene.environmentIntensity=.65;

 const instruments=createInstruments({root,scene,api,texture,topText,add,box,cylinder,slab,cord,register});

 // A compact, low-profile aluminum keyboard. Each key has a recess and legend.
 const keyboard=new THREE.Group();keyboard.position.set(-1.4,2.89,5.45);root.add(keyboard);
 slab(5.1,1.64,.095,.16,0,0,0,aluminum,keyboard);slab(5.03,1.57,.026,.13,0,.056,0,ivory,keyboard);
 const rows=[['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','◉'],['`','1','2','3','4','5','6','7','8','9','0','−','=','delete'],['tab','Q','W','E','R','T','Y','U','I','O','P','[',']','\\'],['caps','A','S','D','F','G','H','J','K','L',';','\u0027','return'],['shift','Z','X','C','V','B','N','M',',','.','/','shift']];
 function key(label,x,z,w=.29,d=.21){
  slab(w+.03,d+.025,.018,.045,x,.074,z,black,keyboard);
  const k=slab(w,d,.044,.045,x,.105,z,ivory.clone(),keyboard);
  const legend=topText(label==='space'?'':label,0,.027,0,w*.9,d*.83,'#494a4e',k,label.length>2?31:47);
  const data={label:`KEY / ${label.toUpperCase()}`,key:label,baseY:.105};
  if(/^[1-8]$/.test(label))data.channel=api.channels[Number(label)-1].id;
  if(label==='space')data.action='play';if(label==='M')data.action='selected-mute';if(label==='S')data.action='selected-solo';
  register(k,data);keys.push(k);return k;
 }
 rows.forEach((row,j)=>{const pitch=4.71/14,start=-2.33+(j===3?.02:j===4?.05:0);row.forEach((label,i)=>key(label,start+i*pitch*(14/row.length),-.66+j*.265,pitch*(14/row.length)-.05,j===0?.16:.205))});
 let x=-2.4;for(const [label,w] of [['fn',.32],['control',.38],['option',.38],['⌘',.4],['space',1.4],['⌘',.4],['option',.38],['←',.25],['↑',.25],['→',.25]]){key(label,x+w/2,.665,w,.205);x+=w+.045}
 for(const side of [-1,1])slab(.3,.09,.012,.035,side*2.2,-.055,-.6,black,keyboard);
 slab(.19,.036,.07,.015,0,.006,-.825,black,keyboard);

 // A continuous glass touch surface with a fine aluminum seam: Magic Mouse form.
 const mouse=new THREE.Group();mouse.position.set(2.55,2.84,5.45);mouse.rotation.y=-.10;root.add(mouse);
 slab(.98,1.61,.06,.43,0,.026,0,aluminum,mouse);slab(.90,1.55,.018,.40,0,-.016,0,black,mouse);
 const vertices=[],uv=[],indices=[],segments=80,rings=22;
 for(let r=0;r<=rings;r++)for(let s=0;s<=segments;s++){const a=s/segments*Math.PI*2,t=r/rings,c=Math.cos(a),q=Math.sin(a);vertices.push(Math.sign(c)*Math.abs(c)**.73*.49*t,.065+.17*Math.sqrt(Math.max(0,1-t*t)),Math.sign(q)*Math.abs(q)**.73*.81*t);uv.push((c*t+1)/2,(q*t+1)/2);if(r&&s){const n=r*(segments+1)+s;indices.push(n,n-1,n-segments-2,n,n-segments-2,n-segments-1)}}
 const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));mg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));mg.setIndex(indices);mg.computeVertexNormals();
 const touch=register(add(mg,glassWhite,mouse),{action:'computer',label:'OPEN MY DESKTOP',baseY:0});objects.push(touch);
 const mouseMark=topText('LF',0,.242,.34,.16,.12,'#a3a6a8',mouse,48);

 const room=soundcube.room;
 function press(mesh){if(mesh?.userData.baseY!==undefined)mesh.userData.pressedAt=performance.now()}
 function update(now){
  soundcube.update(now);instruments.update(now);
  speakers.forEach(a=>a.material.opacity=api.audioState.playing?.65+Math.sin(now*.0015)*.12:.18);
  [...keys,...objects].forEach(k=>{const elapsed=now-(k.userData.pressedAt||-1000);k.position.y=k.userData.baseY-(elapsed<220?Math.sin(elapsed/220*Math.PI)*.028:0);if(k.userData.channel)k.material.color.set(k.userData.channel===selected()?0xf3c8c8:0xebeae6)});
 }
 return {room,update,press,keys,mouse,keyboard,speakers,instruments,soundcube};
}
