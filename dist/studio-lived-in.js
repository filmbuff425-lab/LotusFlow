import {createSharedTextureLoader} from './texture-sources.js';
import * as THREE from 'three';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
export function createLivedInStudio(root){
 const set=new THREE.Group();set.name='Personal studio objects';root.add(set);
 const mat=(color,metalness=0,roughness=.55)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const chrome=mat(0xbcbfba,.92,.22),black=mat(0x13120f,.1,.7),ivory=mat(0xf1e1be,0,.55),wood=mat(0x9b6132,0,.6);
 const add=(g,m,p,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;p.add(o);return o};
 const box=(p,w,h,d,x,y,z,m)=>add(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
 function line(p,points,r,m){return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,r,5,false),m,p)}
 // A six-string offset guitar on a proper floor stand: lacquer, pickguard, frets and hardware.
 const guitar=new THREE.Group();guitar.name='Electric guitar';guitar.position.set(...studioLayout.guitar);guitar.rotation.set(.10,-.18,.06);
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
 // Ground in room-local coordinates before attaching to the animated cube.
 // World bounds include its opening tilt and scale, which used to lift the guitar.
 const guitarBounds=new THREE.Box3().setFromObject(guitar,true);guitar.position.y+=.28-guitarBounds.min.y;guitar.updateMatrix();set.add(guitar);
 const stand=new THREE.Group();stand.name='Grounded padded guitar stand';stand.position.set(studioLayout.guitar[0],0,studioLayout.guitar[2]);stand.rotation.y=-.18;set.add(stand);
 const standMetal=mat(0x363a3d,.42,.48);
 for(const [x,z]of[[-1.30,.80],[1.30,.80],[0,-1.25]]){line(stand,[[0,.25,-.30],[x*.55,.13,z*.55],[x,.085,z]],.085,standMetal);box(stand,.25,.17,.30,x,.085,z,black)}
 // The lower cradle carries the body; a padded fork supports the tilted neck.
 line(stand,[[-.95,.61,.32],[-.65,.22,.32],[.65,.22,.32],[.95,.61,.32]],.09,black);
 const neck=new THREE.Vector3(0,6.40,-.12).applyMatrix4(guitar.matrix);neck.sub(stand.position).applyAxisAngle(new THREE.Vector3(0,1,0),.18);
 line(stand,[[0,.23,-.30],[0,3.35,neck.z-.20],[neck.x,neck.y,neck.z-.16]],.085,standMetal);
 line(stand,[[neck.x-.36,neck.y,neck.z+.29],[neck.x-.36,neck.y,neck.z],[neck.x+.36,neck.y,neck.z],[neck.x+.36,neck.y,neck.z+.29]],.085,black);
 const jack=new THREE.Vector3(.92,1.02,.47).applyMatrix4(guitar.matrix);
 line(set,[jack.toArray(),[jack.x+.28,.25,jack.z+.45],...[ [1.0,.065,1.30],[.30,.065,2.30],[-.60,.065,2.0],[.10,.065,1.30],[1.90,.065,.20] ].map(([x,y,z])=>[x+studioLayout.guitar[0],y,z+studioLayout.guitar[2]])],.025,black);
 // Full official artwork, attached directly to the inner glass with translucent tape.
 const poster=new THREE.Group();poster.name='Taped official Kill Bill poster';poster.position.set(studioLayout.killBillX,20.2,-14.47*studioLayout.architectureScale[2]+.13);poster.rotation.y=0;set.add(poster);
 const art=createSharedTextureLoader().load('assets/cinema/kill-bill-official.jpg');art.colorSpace=THREE.SRGBColorSpace;
 add(new THREE.PlaneGeometry(7,7*733/500),new THREE.MeshStandardMaterial({map:art,roughness:.88,side:THREE.DoubleSide,emissive:0x3d2c06,emissiveIntensity:.16}),poster,0,0,.014);
 const tapeCanvas=document.createElement('canvas');tapeCanvas.width=128;tapeCanvas.height=48;const tg=tapeCanvas.getContext('2d');tg.fillStyle='#e8e6d81f';tg.fillRect(0,0,128,48);
 for(let i=0;i<280;i++){const x=(i*37)%128,y=(i*19)%48;tg.fillStyle=i%3?'#ffffff19':'#8c8a7922';tg.fillRect(x,y,1+(i%7),1)}
 const tapeMap=new THREE.CanvasTexture(tapeCanvas),tape=new THREE.MeshPhysicalMaterial({map:tapeMap,transparent:true,opacity:.67,roughness:.3,metalness:.05,clearcoat:1,side:THREE.DoubleSide,depthWrite:false});
 for(const [x,y,r] of [[-2.7,5.10,-.14],[2.65,5.10,.12],[-2.7,-5.08,.09],[2.7,-5.08,-.11]]){const strip=add(new THREE.PlaneGeometry(1.5,.55),tape,poster,x,y,.032);strip.rotation.z=r;strip.castShadow=false}
 // Low resolution alpha artwork: the mark reads as a luminous game decal on the glass.
 const logoCanvas=document.createElement('canvas');logoCanvas.width=88;logoCanvas.height=56;const lc=logoCanvas.getContext('2d');const logoMap=new THREE.CanvasTexture(logoCanvas);logoMap.magFilter=THREE.NearestFilter;logoMap.minFilter=THREE.NearestFilter;logoMap.colorSpace=THREE.SRGBColorSpace;
 const logoImage=new Image();logoImage.onload=()=>{lc.clearRect(0,0,88,56);lc.imageSmoothingEnabled=false;const scale=Math.min(88/logoImage.width,56/logoImage.height);lc.drawImage(logoImage,(88-logoImage.width*scale)/2,(56-logoImage.height*scale)/2,logoImage.width*scale,logoImage.height*scale);logoMap.needsUpdate=true};logoImage.src='assets/lotus-flow-wordmark-web.webp';
 const decal=add(new THREE.PlaneGeometry(10.4,6.62),new THREE.MeshBasicMaterial({map:logoMap,transparent:true,alphaTest:.1,side:THREE.DoubleSide,toneMapped:false,depthWrite:false}),set,-1,24.7,-14.47*studioLayout.architectureScale[2]+.13);decal.name='Pixel Lotus Flow glass decal';decal.castShadow=false;
 const haloMapCanvas=document.createElement('canvas');haloMapCanvas.width=64;haloMapCanvas.height=64;const hg=haloMapCanvas.getContext('2d'),glow=hg.createRadialGradient(32,32,0,32,32,32);glow.addColorStop(0,'#e838191c');glow.addColorStop(1,'#e8381900');hg.fillStyle=glow;hg.fillRect(0,0,64,64);
 const halo=add(new THREE.PlaneGeometry(15,10),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(haloMapCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}),set,-1,24.7,-14.47*studioLayout.architectureScale[2]+.11);halo.castShadow=false;
 return set;
}
