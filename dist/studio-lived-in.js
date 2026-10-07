import {createSharedTextureLoader} from './texture-sources.js';
import * as THREE from 'three';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
export function createLivedInStudio(root){
 const set=new THREE.Group();set.name='Personal studio objects';root.add(set);
 const mat=(color,metalness=0,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const chrome=mat(0xbcbfba,.92,.22),black=mat(0x13120f,.1,.7),ivory=mat(0xf1e1be,0,.55),wood=mat(0x9b6132,0,.6),paper=mat(0xd7caae,0,.96);
 const add=(g,m,p,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const box=(p,w,h,d,x,y,z,m)=>add(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
 function line(p,points,r,m){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,5,false),m,p)}
 // A six-string offset guitar on a proper floor stand: lacquer, pickguard, frets and hardware.
 const guitar=new THREE.Group();guitar.name='Electric guitar';guitar.position.set(32.1,0,-25.1);guitar.rotation.set(-.075,-.18,.20);set.add(guitar);
 const silhouette=new THREE.Shape();silhouette.moveTo(-.24,3.15);silhouette.bezierCurveTo(-.8,3.3,-.61,4.35,-1.05,4.05);silhouette.bezierCurveTo(-1.65,3.5,-.68,2.84,-1.25,2.22);silhouette.bezierCurveTo(-2.3,.7,-.95,.25,0,.32);silhouette.bezierCurveTo(1.68,.08,2.06,1.19,1.20,2.39);silhouette.bezierCurveTo(.72,3.09,1.18,3.94,.78,3.64);silhouette.bezierCurveTo(.62,3.48,.52,3.05,.23,3.15);silhouette.closePath();
 const body=new THREE.ExtrudeGeometry(silhouette,{depth:.35,bevelEnabled:true,bevelSegments:3,bevelThickness:.08,bevelSize:.09,curveSegments:12});
 add(body,new THREE.MeshPhysicalMaterial({color:0xac2413,roughness:.24,metalness:.1,clearcoat:1,clearcoatRoughness:.13}),guitar);
 const guard=new THREE.Shape();guard.moveTo(-.48,3.2);guard.lineTo(.52,3.17);guard.quadraticCurveTo(.45,2.2,.95,1.62);guard.quadraticCurveTo(.9,.94,.1,1.01);guard.lineTo(-.74,1.18);guard.quadraticCurveTo(-.96,2.45,-.48,3.2);add(new THREE.ShapeGeometry(guard),ivory,guitar,0,0,.451);
 box(guitar,.45,4.8,.26,0,5.44,.19,wood);box(guitar,.42,4.75,.075,0,5.43,.365,black);
 for(let i=0;i<19;i++){const y=3.21+4.65*(1-Math.pow(2,-i/12))/(1-Math.pow(2,-19/12));box(guitar,.435,.018,.024,0,y,.414,chrome);if([3,5,7,9,12,15,17].includes(i))add(new THREE.SphereGeometry(.035,8,5),ivory,guitar,0,y-.15,.419)}
 const head=box(guitar,.62,1.27,.27,.10,8.28,.16,wood);head.rotation.z=-.12;
 for(let i=0;i<6;i++){const x=-.155+i*.062;line(guitar,[[x,1.16,.505],[x,7.79,.451],[.30,7.88+i*.16,.32]],.008,chrome);const peg=add(new THREE.CylinderGeometry(.08,.08,.18,12),chrome,guitar,.45,7.9+i*.17,.18);peg.rotation.z=Math.PI/2}
 box(guitar,.63,.30,.10,0,1.15,.5,chrome);
 for(const y of [1.76,2.32,2.86]){box(guitar,.75,.19,.07,0,y,.49,ivory);for(let i=0;i<6;i++)add(new THREE.SphereGeometry(.025,6,4),chrome,guitar,-.15+i*.06,y,.536)}
 for(const [x,y] of [[.71,1.44],[.91,1.08],[.73,.73]]){const k=add(new THREE.CylinderGeometry(.105,.105,.09,16),ivory,guitar,x,y,.51);k.rotation.x=Math.PI/2}
 line(guitar,[[.17,1.14,.56],[.65,1.06,.77],[.91,1.67,.76]],.024,chrome);
 // Lean naturally beside the steel shelf; the lower body actually meets the floor.
 guitar.updateMatrixWorld(true);const guitarBounds=new THREE.Box3().setFromObject(guitar);guitar.position.y+=.055-guitarBounds.min.y;
 line(set,[[32.45,.32,-24.6],[33.10,.065,-23.8],[32.4,.065,-22.8],[31.5,.065,-23.1],[32.2,.065,-23.8],[34.0,.065,-24.9]],.025,black);
 // Full official artwork, attached directly to the inner glass with translucent tape.
 const poster=new THREE.Group();poster.name='Taped official Kill Bill poster';poster.position.set(-27.3,20.2,studioLayout.backWall+.13);poster.rotation.y=0;set.add(poster);
 const art=createSharedTextureLoader().load('assets/cinema/kill-bill-official.jpg');art.colorSpace=THREE.SRGBColorSpace;
 add(new THREE.PlaneGeometry(7,7*733/500),new THREE.MeshStandardMaterial({map:art,roughness:.88,side:THREE.DoubleSide,emissive:0x3d2c06,emissiveIntensity:.16}),poster,0,0,.014);
 const tapeCanvas=document.createElement('canvas');tapeCanvas.width=128;tapeCanvas.height=48;const tg=tapeCanvas.getContext('2d');tg.fillStyle='#e8e6d81f';tg.fillRect(0,0,128,48);
 for(let i=0;i<280;i++){const x=(i*37)%128,y=(i*19)%48;tg.fillStyle=i%3?'#ffffff19':'#8c8a7922';tg.fillRect(x,y,1+(i%7),1)}
 const tapeMap=new THREE.CanvasTexture(tapeCanvas),tape=new THREE.MeshPhysicalMaterial({map:tapeMap,transparent:true,opacity:.67,roughness:.3,metalness:.05,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
 for(const [x,y,r] of [[-2.7,5.10,-.14],[2.65,5.10,.12],[-2.7,-5.08,.09],[2.7,-5.08,-.11]]){const strip=add(new THREE.PlaneGeometry(1.5,.55),tape,poster,x,y,.032);strip.rotation.z=r;strip.castShadow=false}
 // Low resolution alpha artwork: the mark reads as a luminous game decal on the glass.
 const logoCanvas=document.createElement('canvas');logoCanvas.width=88;logoCanvas.height=56;const lc=logoCanvas.getContext('2d');const logoMap=new THREE.CanvasTexture(logoCanvas);logoMap.magFilter=THREE.NearestFilter;logoMap.minFilter=THREE.NearestFilter;logoMap.colorSpace=THREE.SRGBColorSpace;
 const logoImage=new Image();logoImage.onload=()=>{lc.clearRect(0,0,88,56);lc.imageSmoothingEnabled=false;const scale=Math.min(88/logoImage.width,56/logoImage.height);lc.drawImage(logoImage,(88-logoImage.width*scale)/2,(56-logoImage.height*scale)/2,logoImage.width*scale,logoImage.height*scale);logoMap.needsUpdate=true};logoImage.src='assets/lotus-flow-wordmark-web.webp';
 const decal=add(new THREE.PlaneGeometry(10.4,6.62),new THREE.MeshBasicMaterial({map:logoMap,transparent:true,alphaTest:.1,side:THREE.DoubleSide,toneMapped:false,depthWrite:false}),set,-1,24.7,studioLayout.backWall+.07);decal.name='Pixel Lotus Flow glass decal';decal.castShadow=false;
 const haloMapCanvas=document.createElement('canvas');haloMapCanvas.width=64;haloMapCanvas.height=64;const hg=haloMapCanvas.getContext('2d'),glow=hg.createRadialGradient(32,32,0,32,32,32);glow.addColorStop(0,'#e838191c');glow.addColorStop(1,'#e8381900');hg.fillStyle=glow;hg.fillRect(0,0,64,64);
 const halo=add(new THREE.PlaneGeometry(15,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(haloMapCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),set,-1,24.7,studioLayout.backWall+.05);halo.castShadow=false;
 // An open studio notebook: curved paper, page edges, pencil and handwritten
 // arrangement notes. The ink is a continuous page texture, not generic bars.
 const notes=new THREE.Group();notes.name='Open handwritten arrangement notebook';notes.position.set(17.05,2.82,-4.50);notes.rotation.y=-.10;set.add(notes);
 box(notes,3.80,.075,2.66,0,.045,0,new THREE.MeshStandardMaterial({color:0x6b3e26,roughness:.68}));
 for(let i=0;i<5;i++)box(notes,3.69-i*.012,.011,2.54-i*.012,0,.091+i*.015,0,paper);
 const pageCanvas=document.createElement('canvas');pageCanvas.width=1536;pageCanvas.height=1024;const pg=pageCanvas.getContext('2d');
 pg.fillStyle='#e9e1cb';pg.fillRect(0,0,1536,1024);for(let i=0;i<17000;i++){const x=(i*73)%1536,y=(i*151)%1024;pg.fillStyle=i%2?'#ffffff12':'#6e634b09';pg.fillRect(x,y,1,1)}
 pg.strokeStyle='#bdb8a752';pg.lineWidth=1;for(let y=202;y<930;y+=62){pg.beginPath();pg.moveTo(62,y);pg.lineTo(703,y);pg.moveTo(824,y);pg.lineTo(1474,y);pg.stroke()}
 const ink=(text,x,y,size=31,angle=0)=>{pg.save();pg.translate(x,y);pg.rotate(angle);pg.fillStyle='#252822';pg.font=`italic 600 ${size*1.12}px cursive`;pg.fillText(text,0,0,630);pg.restore()};
 ink('Late-night ideas',78,132,46,-.024);ink('Session 07 / keep it human',91,186,22,.01);
 ['Intro — leave room to breathe','Verse   Em9 → A13','Less kick. More space.','Chorus: open up the harmony','Double the last line?','texture > perfection'].forEach((t,i)=>ink(t,91,273+i*100,i===0?29:30,(i%3-1)*.008));
 pg.strokeStyle='#5a574c';pg.lineWidth=3;pg.beginPath();pg.moveTo(92,587);pg.lineTo(620,578);pg.stroke();ink('try a softer take',335,566,23,-.035);
 ink('Chorus / vocal layers',838,139,39,.018);ink('1   lead      2   whisper      3   air',838,211,24);
 pg.lineWidth=1.5;for(let i=0;i<5;i++){pg.beginPath();pg.moveTo(847,278+i*22);pg.lineTo(1450,278+i*22);pg.stroke()}for(let i=0;i<8;i++){let x=898+i*69,y=310+(i%3-1)*11;pg.beginPath();pg.ellipse(x,y,10,7,-.4,0,Math.PI*2);pg.fill();pg.beginPath();pg.moveTo(x+9,y);pg.lineTo(x+9,y-62);pg.stroke()}
 ['A / B — listen without looking','Let the tail ring out.','No hard cut before the bridge.','one more pass tomorrow...'].forEach((t,i)=>ink(t,844,473+i*100,29,(i%2?-.008:.012)));
 pg.strokeStyle='#885443';pg.beginPath();pg.ellipse(1090,478,251,34,-.018,0,Math.PI*2);pg.stroke();ink('LF',1392,955,28,-.07);
 const gutter=pg.createLinearGradient(731,0,798,0);gutter.addColorStop(0,'#655c4600');gutter.addColorStop(.47,'#655c4640');gutter.addColorStop(.50,'#655c4660');gutter.addColorStop(.57,'#fff9e52b');gutter.addColorStop(1,'#655c4600');pg.fillStyle=gutter;pg.fillRect(731,0,67,1024);
 const pageMap=new THREE.CanvasTexture(pageCanvas);pageMap.colorSpace=THREE.SRGBColorSpace;pageMap.anisotropy=8;
 const pageGeo=new THREE.PlaneGeometry(3.68,2.54,48,24),pa=pageGeo.attributes.position,pu=pageGeo.attributes.uv;
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=-pa.getY(i),v=pu.getY(i),y=.161+.068*Math.pow(Math.abs(x)/1.84,.55)+.020*Math.pow(Math.abs(x)/1.84,6)*Math.sin(v*3.14);pa.setXYZ(i,x,y,z)}pageGeo.computeVertexNormals();add(pageGeo,new THREE.MeshStandardMaterial({map:pageMap,roughness:.94,side:THREE.DoubleSide}),notes);
 const pencil=new THREE.Group();pencil.position.set(1.42,.25,.08);pencil.rotation.y=-.18;notes.add(pencil);const shaft=add(new THREE.CylinderGeometry(.033,.033,2.06,6),wood,pencil,0,0,0);shaft.rotation.x=Math.PI/2;const tip=add(new THREE.ConeGeometry(.033,.17,6),ivory,pencil,0,0,1.115);tip.rotation.x=Math.PI/2;const graphite=add(new THREE.ConeGeometry(.011,.057,6),black,pencil,0,0,1.211);graphite.rotation.x=Math.PI/2;
 return set;
}
