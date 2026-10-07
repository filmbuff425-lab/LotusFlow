import {createSharedTextureLoader} from './texture-sources.js';
import * as THREE from 'three';

// Upright jewel cases: printed inserts sit inside separate clear lids and hinges.
export function createGlassRecords({parent,texture,backWall,objects}) {
 const tracks=window.lotusCatalog,group=new THREE.Group(),targets=[],cases=[];
 group.name='One row of '+tracks.length+' glass CD cases';group.position.set(0,.95,backWall+30.387);parent.add(group);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const glass=new THREE.MeshPhysicalMaterial({color:0xe8f4ff,roughness:.11,metalness:.03,transparent:true,opacity:.15,clearcoat:1,depthWrite:false});
 const edge=new THREE.LineBasicMaterial({color:0xc1d8ed,transparent:true,opacity:.48});
 const clearHinge=new THREE.MeshStandardMaterial({color:0x9bb5c4,metalness:.32,roughness:.26});
 const loader=createSharedTextureLoader(),height=4.05,width=4.30,depth=.42,y=17.30,z=-25.1,angle=Math.PI/2-.055;
 const add=(geo,mat,p,x=0,y=0,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m};
 const box=(w,h,d,p,x,y,z,mat)=>add(new THREE.BoxGeometry(w,h,d),mat,p,x,y,z);
 box(31,.10,4.9,group,0,15.20,z,glass);
 for(const x of [-15.05,15.05])box(.09,1.1,4.9,group,x,15.72,z,glass);
 for(const x of [-12.7,12.7]){box(.10,.10,4.17,group,x,15.10,-28.20,clearHinge);box(.19,.62,.07,group,x,14.90,-30.25,clearHinge);}
 tracks.forEach((track,index)=>{
  const g=new THREE.Group();g.name='Glass CD / '+track.title;g.userData.dynamic=true;const yaw=index===0 ? .40 : index===6 ? 1.08 : angle+Math.sin(index*2.17)*.065,lean=Math.sin(index*1.73+.4)*.047,pitch=Math.cos(index*2.39)*.018;g.rotation.order='ZXY';g.rotation.set(pitch,yaw,lean);g.position.set(0,y,z+Math.sin(index*1.41)*.33);group.add(g);
  const art=loader.load(track.image);art.colorSpace=THREE.SRGBColorSpace;art.anisotropy=8;
  const paper=new THREE.MeshStandardMaterial({map:art,roughness:.71,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
  add(new THREE.PlaneGeometry(width-.17,height-.13),paper,g,0,0,-.13);
  box(width,height,.035,g,0,0,.19,glass);box(width,height,.035,g,0,0,-.19,glass);
  for(const yy of [-height/2,height/2])box(width,.035,depth,g,0,yy,0,glass);
  box(.11,height,depth,g,-width/2+.045,0,0,glass);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(width,height,depth)),edge);g.add(edges);
  for(const yy of [-1.78,1.78])box(.13,.09,.08,g,-width/2+.035,yy,.16,clearHinge);
  const spineMap=texture(96,768,ctx=>{
   ctx.fillStyle='#11171d';ctx.fillRect(0,0,96,768);ctx.fillStyle=track.color;ctx.fillRect(12,14,72,13);
   ctx.save();ctx.translate(53,690);ctx.rotate(-Math.PI/2);ctx.fillStyle='#ffffff';ctx.font='650 27px LotusInterface,Arial,sans-serif';ctx.fillText(track.title.toUpperCase(),0,0,540);ctx.restore();
   ctx.fillStyle='#9faab4';ctx.font='19px monospace';ctx.fillText(String(index+1).padStart(2,'0'),28,746);
  });
  const spine=add(new THREE.PlaneGeometry(depth*.78,height-.13),new THREE.MeshBasicMaterial({map:spineMap,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),g,-width/2-.016,0,0);spine.rotation.y=-Math.PI/2;
  const target=box(width+.08,height+.08,depth+.12,g,0,0,0,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
  target.userData={action:'studio-record',release:track.id,label:'TAKE CD / '+track.title.toUpperCase()};targets.push(target);
  // Keep the lowest corner on the shelf when a case leans; no floating boxes.
  let lowest=Infinity,minX=Infinity,maxX=-Infinity;for(const xx of [-width/2,width/2])for(const yy of [-height/2,height/2])for(const zz of [-depth/2,depth/2]){const corner=new THREE.Vector3(xx,yy,zz).applyQuaternion(g.quaternion);lowest=Math.min(lowest,corner.y);minX=Math.min(minX,corner.x);maxX=Math.max(maxX,corner.x)}g.position.y=15.26-lowest;
  cases.push({g,track,home:g.position.clone(),base:g.quaternion.clone(),spine,offset:0,minX,maxX});
 });
 // Two covers peek out amongst groups of spines; measured gaps prevent clipping.
 const gapAfter=i=>i%7===6 ? .18 : .045+Math.sin(i*1.7)**2*.035;
 let cursor=0;cases.forEach((c,i)=>{c.g.position.x=cursor-c.minX;cursor+=c.maxX-c.minX+gapAfter(i)});
 const rowWidth=cursor-gapAfter(cases.length-1);cases.forEach(c=>{c.g.position.x-=rowWidth/2+1.05;c.home.copy(c.g.position)});
 objects.club(group,-13.9,15.255,z+.35,.76,.08);
 objects.polaroid(group,12.0,15.255,z+.35,.90,-.13);
 objects.clock(group,14.10,15.255,z+.50,.86,-.08);
 let selected=null,flight=null,hoverId=null,trigger=null,last=0;
 const picker=document.createElement('details');picker.className='studio-record-picker';picker.hidden=true;
 const summary=document.createElement('summary');summary.textContent='CD COLLECTION / '+tracks.length;picker.append(summary);
 const list=document.createElement('div');list.className='studio-record-list';list.setAttribute('role','group');list.setAttribute('aria-label','Take a glass CD to view its details');picker.append(list);
 tracks.forEach((track,index)=>{const button=document.createElement('button');button.type='button';button.dataset.studioRecord=track.id;button.style.setProperty('--record-color',track.color);const n=document.createElement('span');n.textContent=String(index+1).padStart(2,'0');const title=document.createElement('strong');title.textContent=track.title;const artist=document.createElement('small');artist.textContent=track.artist;button.append(n,title,artist);button.addEventListener('click',()=>take(track.id,summary));list.append(button)});
 document.querySelector('#studio-stage').after(picker);
 function take(id,source){if(selected||!window.lotusPortfolio)return;const c=cases.find(c=>c.track.id===id);if(!c)return;hoverId=null;selected=c;trigger=source;picker.open=false;if(source===summary)document.querySelector('#studio-stage').scrollIntoView({behavior:reduced?'instant':'smooth',block:'center'});picker.dataset.selected=id;flight={at:performance.now(),returning:false};}
 function retract(){if(!selected)return;flight={at:performance.now(),returning:true,from:selected.g.position.clone(),quaternion:selected.g.quaternion.clone()};}
 document.querySelector('#track-dialog').addEventListener('close',retract);
 window.addEventListener('lotus-room-change',e=>{picker.hidden=!e.detail;if(!e.detail){picker.open=false;hoverId=null;if(selected){selected.g.position.copy(selected.home);selected.g.quaternion.copy(selected.base);selected=null;flight=null;delete picker.dataset.selected}}});
 function update(now){
  const dt=Math.min(.06,(now-last)/1000||.016);last=now;
  for(const c of cases){if(c===selected)continue;const goal=c.track.id===hoverId ? .34 : 0;c.offset+=(goal-c.offset)*(reduced?1:1-Math.exp(-dt*12));c.g.position.z=c.home.z+c.offset;}
  if(!selected||!flight)return;
  const q=reduced?1:Math.min(1,(now-flight.at)/(flight.returning?650:950)),ease=q*q*(3-2*q),c=selected;
  if(flight.returning){c.g.position.lerpVectors(flight.from,c.home,ease);c.g.quaternion.slerpQuaternions(flight.quaternion,c.base,ease);if(q===1){selected=null;flight=null;delete picker.dataset.selected}}
  else{
   // Clear the neighbouring cases before turning the cover towards the viewer.
   const pull=Math.min(1,q/.48),turn=THREE.MathUtils.smoothstep(q,.48,1);c.g.position.copy(c.home);c.g.position.z+=6.2*(1-Math.pow(1-pull,3));c.g.position.y+=1.15*turn;c.g.quaternion.slerpQuaternions(c.base,new THREE.Quaternion(),turn);
   if(q===1){flight=null;window.lotusPortfolio.openTrack(c.track.id,trigger);}
  }
 }
 return{group,targets,update,take,setHover:id=>hoverId=id};
}
