import * as THREE from 'three';

// Three reference objects, modelled as solids. Optical parts deliberately use
// ordinary transparent shading: no transmission framebuffer or extra render pass.
export function createStudioPersonalObjects({root,texture}){
 const group=new THREE.Group();group.name='Lotus Flow personal studio objects';root.add(group);
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const fract=n=>n-Math.floor(n),hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7+17.3)*43758.5453123);
 function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=fract(x),v=fract(y),s=u*u*(3-2*u),t=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b),hash(a+1,b),s),THREE.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),s),t)}
 function map(w,h,draw,data=false){const t=texture?texture(w,h,draw):(()=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)})();t.colorSpace=data?THREE.NoColorSpace:THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
 function raster(w,h,shade,data=false){return map(w,h,(g)=>{const image=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const rgb=shade(x,y),i=(x+y*w)*4;image.data[i]=rgb[0];image.data[i+1]=rgb[1];image.data[i+2]=rgb[2];image.data[i+3]=255}g.putImageData(image,0,0)},data)}
 const loader=new THREE.TextureLoader();
 const photoMap=(name)=>{const t=loader.load('assets/materials/'+name);t.colorSpace=THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=8;return t};
 const leatherMap=photoMap('cognac-aniline-leather-albedo.png');
 const leatherBump=raster(384,256,(x,y)=>{const pores=hash(x*1.7,y*1.3),wrinkle=Math.pow(Math.abs(Math.sin(x*.071+noise(x/34,y/48)*4.1)),22),v=112+pores*27+noise(x/9,y/8)*11-wrinkle*8;return[v,v,v]},true);
 const leatherRough=raster(256,256,(x,y)=>{const v=145+noise(x/20,y/16)*30+(hash(x,y)-.5)*9;return[v,v,v]},true);
 const hideMap=photoMap('cognac-cowhide-albedo.png');
 const hideBump=raster(256,256,(x,y)=>{const v=105+hash(x,y)*29+noise(x/17,y/19)*20;return[v,v,v]},true);
 const woodMap=map(256,256,(g,w,h)=>{const image=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const grain=Math.sin(x*.55+noise(x/37,y/102)*8)*.18+noise(x/29,y/180)*.62+hash(x,y)*.10,i=(x+y*w)*4;image.data[i]=73+grain*43;image.data[i+1]=44+grain*27;image.data[i+2]=27+grain*17;image.data[i+3]=255}g.putImageData(image,0,0)});
 const silverMap=map(256,128,g=>{g.fillStyle='#aab2b3';g.fillRect(0,0,256,128);for(let y=0;y<128;y++){g.fillStyle=y%3?'#ffffff17':'#10202d13';g.fillRect(0,y,256,.6)}});
 const leather=new THREE.MeshPhysicalMaterial({map:leatherMap,bumpMap:leatherBump,bumpScale:.014,roughnessMap:leatherRough,roughness:.63,metalness:0,clearcoat:.12,clearcoatRoughness:.46});
 const piping=new THREE.MeshStandardMaterial({color:0x62311c,roughness:.61,bumpMap:leatherBump,bumpScale:.009});
 const hide=new THREE.MeshPhysicalMaterial({map:hideMap,bumpMap:hideMap,bumpScale:.007,roughness:.82,metalness:0,sheen:.42,sheenColor:0x8a4d26,sheenRoughness:.8});
 const wood=new THREE.MeshStandardMaterial({map:woodMap,roughness:.52,metalness:0,bumpMap:woodMap,bumpScale:.009});
 const chrome=new THREE.MeshStandardMaterial({color:0xd0d3d1,map:silverMap,metalness:.86,roughness:.20,bumpMap:silverMap,bumpScale:.0018});
 const rubber=new THREE.MeshStandardMaterial({color:0x161a19,roughness:.82,metalness:0});
 const strap=new THREE.MeshStandardMaterial({color:0x793c27,roughness:.62,bumpMap:leatherBump,bumpScale:.012,side:THREE.DoubleSide});
 const acrylic=new THREE.MeshPhysicalMaterial({color:0xd5e9e6,transparent:true,opacity:.105,roughness:.09,metalness:.02,clearcoat:1,clearcoatRoughness:.12,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,transmission:0});
 const opticalEdge=new THREE.MeshStandardMaterial({color:0xc5ddd7,metalness:.28,roughness:.18,transparent:true,opacity:.46,depthWrite:false});
 const clearGlass=new THREE.MeshPhysicalMaterial({color:0xe5f2ed,transparent:true,opacity:.14,roughness:.07,metalness:.015,clearcoat:1,clearcoatRoughness:.08,side:THREE.DoubleSide,forceSinglePass:true,depthWrite:false,transmission:0});
 const thickGlass=clearGlass.clone();thickGlass.opacity=.24;thickGlass.roughness=.09;
 const water=new THREE.MeshPhysicalMaterial({color:0xd8eff0,transparent:true,opacity:.10,roughness:.035,metalness:.025,clearcoat:1,clearcoatRoughness:.04,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,transmission:0});

 // Merge primitives by material within each movable object, so all three
 // can be translated/rotated independently without dozens of cylinder draws.
 function builder(parent){const opaque=new Map();let parts=0;
  function add(geo,mat,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1],name=''){const matrix=new THREE.Matrix4().compose(new THREE.Vector3(...pos),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),new THREE.Vector3(...scale));geo.applyMatrix4(matrix);parts++;if(mat===acrylic){const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=false;m.receiveShadow=false;parent.add(m);return m}if(!opaque.has(mat))opaque.set(mat,[]);opaque.get(mat).push(geo);return null}
  function finish(){for(const [mat,list]of opaque){const geometry=new THREE.BufferGeometry(),parts=list.map(g=>g.index?g.toNonIndexed():g);for(const name of['position','normal','uv']){const size=name==='uv'?2:3,length=parts.reduce((n,g)=>n+g.attributes[name].array.length,0),array=new Float32Array(length);let offset=0;for(const part of parts){array.set(part.attributes[name].array,offset);offset+=part.attributes[name].array.length}geometry.setAttribute(name,new THREE.BufferAttribute(array,size))}geometry.computeBoundingSphere();geometry.computeBoundingBox();const m=new THREE.Mesh(geometry,mat);m.name=parent.name+' / material batch';m.castShadow=m.receiveShadow=!mat.transparent;parent.add(m);new Set([...parts,...list]).forEach(g=>g.dispose())}parent.userData.primitiveCount=parts;parent.userData.drawCalls=parent.children.filter(m=>m.isMesh).length}
  return{add,finish};
 }
 function tube(points,r=.05,segments=32){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),segments,r,8,false)}
 function rod(a,b,r=.07){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.sub(av),g=new THREE.CylinderGeometry(r,r,d.length(),16),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()),m=new THREE.Matrix4().compose(av.add(new THREE.Vector3(...b)).multiplyScalar(.5),q,new THREE.Vector3(1,1,1));return g.applyMatrix4(m)}
 function roundedRect(w,h,r){const s=new THREE.Shape(),x=-w/2,y=-h/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s}
 function pillow(w,h,d,r=.22){const g=new THREE.BoxGeometry(w,h,d,10,8,8),p=g.attributes.position,limit=new THREE.Vector3(w/2-r,h/2-r,d/2-r);for(let i=0;i<p.count;i++){const v=new THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)),base=new THREE.Vector3(clamp(v.x,-limit.x,limit.x),clamp(v.y,-limit.y,limit.y),clamp(v.z,-limit.z,limit.z)),n=v.clone().sub(base);if(n.lengthSq())n.normalize().multiplyScalar(r);v.copy(base).add(n);if(Math.abs(v.z)>d*.33)v.z+=Math.sign(v.z)*.035*Math.sin(Math.PI*(v.x/w+.5))*Math.sin(Math.PI*(v.y/h+.5));p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();return g}
 function upholsteredCylinder(length,r){const half=length/2,points=[new THREE.Vector2(0,-half),new THREE.Vector2(r*.81,-half),new THREE.Vector2(r*.94,-half+.025),new THREE.Vector2(r,-half+.11),new THREE.Vector2(r*1.018,-half+length*.26),new THREE.Vector2(r*1.022,0),new THREE.Vector2(r*1.018,half-length*.26),new THREE.Vector2(r,half-.11),new THREE.Vector2(r*.94,half-.025),new THREE.Vector2(r*.81,half),new THREE.Vector2(0,half)];return new THREE.LatheGeometry(points,36)}

 // The reference's eight rolls form one asymmetric U, with no office-chair stem.
 const chair=new THREE.Group();chair.name='Brown leather roller chair';chair.position.set(0,0,15.3);group.add(chair);const cb=builder(chair);
 const rolls=[[3.07,4.86,.60],[2.57,3.77,.57],[1.99,2.77,.56],[1.24,1.94,.56],[.24,1.43,.57],[-.91,1.29,.59],[-2.08,1.48,.61],[-3.17,2.00,.66]];
 for(const[z,y,r]of rolls){cb.add(upholsteredCylinder(5.40,r),leather,[0,y,z],[0,0,-Math.PI/2]);for(const side of[-1,1])cb.add(new THREE.TorusGeometry(r*.90,.018,6,36),piping,[side*2.665,y,z],[0,Math.PI/2,0])}
 // Visible circular steel axles appear only at the two terminal rollers.
 for(const index of[0,rolls.length-1]){const[z,y]=rolls[index];cb.add(new THREE.CylinderGeometry(.115,.115,5.92,20),chrome,[0,y,z],[0,0,Math.PI/2]);for(const side of[-1,1]){cb.add(new THREE.CylinderGeometry(.36,.36,.11,32),chrome,[side*2.9,y,z],[0,0,Math.PI/2]);cb.add(new THREE.TorusGeometry(.357,.012,6,36),chrome,[side*2.956,y,z],[0,Math.PI/2,0])}}
 const plateShape=roundedRect(7.60,4.15,.47),plate=new THREE.ExtrudeGeometry(plateShape,{depth:.10,bevelEnabled:true,bevelSize:.018,bevelThickness:.013,bevelSegments:2,curveSegments:8});plate.translate(0,2.24,-.05);plate.rotateY(Math.PI/2);
 const edgePoints=plateShape.getPoints(48).map(p=>[0,p.y+2.24,-p.x]);edgePoints.push(edgePoints[0]);
 for(const side of[-1,1]){cb.add(plate.clone(),acrylic,[side*2.855,0,0],[0,0,0],[1,1,1],'Clear rounded acrylic side panel');cb.add(tube(edgePoints,.014,104),opticalEdge,[side*2.855,0,0]);for(const z of[-3.18,3.18])cb.add(new THREE.CylinderGeometry(.18,.18,.22,20),rubber,[side*2.86,.18,z],[0,0,Math.PI/2])}plate.dispose();
 cb.finish();chair.userData.reference='IMG_4716 / IMG_4717 / IMG_4718 / ScreenRecording_10-02-2026 19-09-25_1';chair.userData.rollerCount=rolls.length;chair.userData.front=[0,0,-1];chair.userData.seatHeight=1.88;chair.userData.transmissionPasses=0;

 // The left-hand glass: open rim, a flared bowl, a narrowed waist and a solid foot.
 const cup=new THREE.Group();cup.name='Thick clear water glass with red pixel Lotus Flow print';cup.position.set(10.8,2.83,3.6);group.add(cup);const gb=builder(cup);
 const profile=[[0,.025],[.58,.025],[.64,.06],[.67,.13],[.67,.22],[.64,.29],[.61,.40],[.55,.61],[.535,.73],[.57,.88],[.63,1.06],[.705,1.31],[.77,1.63],[.785,1.90],[.785,2.16],[.776,2.20],[.741,2.20],[.733,2.16],[.731,1.90],[.714,1.64],[.655,1.33],[.578,1.07],[.52,.89],[.487,.72],[.485,.57],[0,.57]].map(p=>new THREE.Vector2(...p));
 gb.add(new THREE.LatheGeometry(profile,64),clearGlass,[0,0,0],[0,0,0],[1,1,1],'Open hollow glass body');
 gb.add(new THREE.LatheGeometry([[0,.025],[.58,.025],[.64,.06],[.657,.13],[.655,.215],[.625,.245],[0,.245]].map(p=>new THREE.Vector2(...p)),64),thickGlass,[0,0,0],[0,0,0],[1,1,1],'Thick glass foot');
 gb.add(new THREE.TorusGeometry(.760,.021,8,64),opticalEdge,[0,2.183,0],[Math.PI/2,0,0]);gb.add(new THREE.TorusGeometry(.630,.014,6,56),opticalEdge,[0,.088,0],[Math.PI/2,0,0]);
 const waterProfile=[[0,.575],[.48,.575],[.485,.72],[.515,.89],[.575,1.07],[.646,1.30],[.648,1.325],[0,1.325]].map(p=>new THREE.Vector2(...p));gb.add(new THREE.LatheGeometry(waterProfile,56),water,[0,0,0],[0,0,0],[1,1,1],'Half-full clear water');gb.add(new THREE.TorusGeometry(.644,.011,6,56),opticalEdge,[0,1.322,0],[Math.PI/2,0,0]);
 // A curved, low-resolution ink decal adheres to the cup wall, rather than a card.
 const logoCanvas=document.createElement('canvas');logoCanvas.width=80;logoCanvas.height=60;const lg=logoCanvas.getContext('2d'),logoMap=new THREE.CanvasTexture(logoCanvas);logoMap.colorSpace=THREE.SRGBColorSpace;logoMap.magFilter=logoMap.minFilter=THREE.NearestFilter;
 const print=new THREE.MeshStandardMaterial({map:logoMap,transparent:true,alphaTest:.17,roughness:.61,metalness:0,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
 const printGeo=new THREE.BufferGeometry(),positions=[],uv=[],indices=[],cols=24,rows=10;
 const radiusAt=y=>{for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i];if(a.y<=y&&b.y>=y&&a.x>0&&b.x>0)return THREE.MathUtils.lerp(a.x,b.x,(y-a.y)/(b.y-a.y))}return.72};
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows,a=(u-.5)*1.74,y=.96+v*.96,r=radiusAt(y)+.009;positions.push(Math.sin(a)*r,y,Math.cos(a)*r);uv.push(u,v)}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=i+j*(cols+1),b=a+cols+1;indices.push(a,a+1,b,b,a+1,b+1)}printGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));printGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));printGeo.setIndex(indices);printGeo.computeVertexNormals();gb.add(printGeo,print,[0,0,0],[0,0,0],[1,1,1],'Red pixel Lotus Flow ink');
 if(typeof Image!=='undefined'){const logo=new Image();logo.onload=()=>{lg.imageSmoothingEnabled=false;lg.clearRect(0,0,80,60);lg.drawImage(logo,0,0,80,60);const pixels=lg.getImageData(0,0,80,60);for(let i=0;i<pixels.data.length;i+=4){const alpha=pixels.data[i+3],bright=Math.max(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);pixels.data[i]=204;pixels.data[i+1]=37;pixels.data[i+2]=21;pixels.data[i+3]=bright>25&&alpha>35?255:0}lg.putImageData(pixels,0,0);logoMap.needsUpdate=true};logo.src=new URL('./assets/lotus-original-red-gold-web.webp',import.meta.url).href}
 for(let i=0;i<14;i++){const a=(hash(i,2)-.5)*4.7,y=.43+hash(i,3)*1.68,r=radiusAt(y)+.018,s=.011+hash(i,7)*.020;gb.add(new THREE.SphereGeometry(s,8,6),clearGlass,[Math.sin(a)*r,y,Math.cos(a)*r],[0,0,0],[.85,1.15,.50],'Tiny condensation bead')}
 gb.finish();cup.userData.waterLine=1.325;cup.userData.height=2.2;cup.userData.front=[0,0,1];cup.userData.reference='IMG_4700 / left glass';cup.userData.transmissionPasses=0;

 // A low hide lounge at left and an integrated thin timber platform at right.
 const lounge=new THREE.Group();lounge.name='Brown cowhide lounge with timber side platform';lounge.position.set(-25,0,5);group.add(lounge);const lb=builder(lounge);
 lb.add(pillow(4.64,.64,3.62,.21),hide,[-2.4,1.34,.42]);lb.add(pillow(4.63,3.12,.67,.23),hide,[-2.4,3.04,-1.52],[-.19,0,0]);
 lb.add(pillow(4.65,.135,3.88,.045),leather,[2.42,1.19,.03]);
 for(const z of[-1.97,2.09]){lb.add(new THREE.CylinderGeometry(.125,.125,10.0,20),wood,[0,1.03,z],[0,0,Math.PI/2]);lb.add(new THREE.CylinderGeometry(.065,.065,9.66,18),chrome,[0,.82,z+.13],[0,0,Math.PI/2])}
 for(const x of[-4.79,.02,4.79])lb.add(new THREE.CylinderGeometry(.12,.12,4.20,20),wood,[x,1.18,.03],[Math.PI/2,0,0]);
 // The back is held by timber dowels with leather cuffs, not a solid slab.
 for(const x of[-4.80,-.02]){const a=[x,1.07,-1.64],b=[x,4.61,-2.31];lb.add(rod(a,b,.13),wood);for(const t of[.29,.72]){const p=a.map((v,i)=>v+(b[i]-v)*t),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize()),geo=new THREE.CylinderGeometry(.164,.164,.28,20);geo.applyQuaternion(q);lb.add(geo,strap,p);lb.add(new THREE.SphereGeometry(.035,8,6),chrome,[x+.16,p[1],p[2]])}}
 for(const x of[-4.76,4.76])for(const z of[-1.95,2.17]){lb.add(rod([x,.10,z],[x,1.01,z],.052),chrome);lb.add(rod([x,.17,z],[x+(x<0?.93:-.93),.90,z-.30],.047),chrome);lb.add(new THREE.CylinderGeometry(.125,.125,.09,16),rubber,[x,.045,z]);lb.add(new THREE.CylinderGeometry(.11,.11,.43,16),wood,[x,.16,z],[0,0,Math.PI/2])}
 // Front and back tie rods stabilize the slender frame.
 for(const x of[-4.76,4.76])lb.add(rod([x,.15,-1.95],[x,.15,2.17],.052),chrome);
 const seamPoints=[[-2.06,.03,1.82],[2.06,.03,1.82],[2.18,.03,1.66],[2.18,.03,-1.66],[2.06,.03,-1.82],[-2.06,.03,-1.82],[-2.18,.03,-1.66],[-2.18,.03,1.66],[-2.06,.03,1.82]];lb.add(tube(seamPoints,.014,80),piping,[-2.4,1.61,.42]);
 const sling=new THREE.Shape();sling.moveTo(-.71,.95);sling.lineTo(.71,.95);sling.lineTo(.68,.21);sling.quadraticCurveTo(.0,-.40,-.68,.21);sling.closePath();const slingGeo=new THREE.ExtrudeGeometry(sling,{depth:.032,bevelEnabled:false,curveSegments:14});slingGeo.rotateY(Math.PI/2);lb.add(slingGeo,strap,[4.66,.15,-.27]);
 lb.finish();lounge.userData.reference='IMG_4709';lounge.userData.platformSide='+X';lounge.userData.front=[0,0,1];lounge.userData.seatHeight=1.66;

 // A folded throw rests diagonally on one seat corner. Its front fold
 // follows gravity over the cushion edge; most of the hide remains exposed.
 const woolMap=map(512,512,(g,w,h)=>{const im=g.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const weave=((x+y)%4<2?5:-5)+Math.sin((x-y)*.44)*2,n=(hash(x,y)-.5)*11,i=(x+y*w)*4;im.data.set([185+weave+n,176+weave+n,158+weave+n,255],i)}g.putImageData(im,0,0)});woolMap.repeat.set(3,3);woolMap.anisotropy=8;
 const wool=new THREE.MeshPhysicalMaterial({map:woolMap,bumpMap:woolMap,bumpScale:.005,roughness:.94,sheen:.38,sheenColor:0xb8ad99,sheenRoughness:.9,side:THREE.DoubleSide});
 const path=new THREE.CatmullRomCurve3([[0,1.745,-.42],[0,1.748,.32],[0,1.76,1.25],[0,1.74,2.12],[0,1.64,2.37],[0,1.05,2.44],[0,.49,2.48]].map(v=>new THREE.Vector3(...v)),false,'catmullrom',.12);
 const drape=(u,v)=>{const p=path.getPoint(v),t=path.getTangent(v),fold=.017+.086*Math.exp(-Math.pow((u-.33-v*.13)/.10,2))+.038*Math.exp(-Math.pow((u-.79+v*.17)/.12,2))+.012*Math.sin(u*24+v*5),x=-1.67+(u-.5)*2.48+.16*Math.sin(v*2.2),asym=(u-.5)*.19;return new THREE.Vector3(x,p.y+fold*t.z+asym*Math.pow(v,5),p.z-fold*t.y+(u-.5)*.27*(1-THREE.MathUtils.smoothstep(v,.30,.60)))};
 const cloth=new THREE.PlaneGeometry(1,1,40,80),cp=cloth.attributes.position,cu=cloth.attributes.uv;
 for(let i=0;i<cp.count;i++){const p=drape(cu.getX(i),1-cu.getY(i));cp.setXYZ(i,p.x,p.y,p.z)}cloth.computeVertexNormals();
 const throwMesh=new THREE.Mesh(cloth,wool);throwMesh.name='Soft folded wool throw on seat corner';throwMesh.castShadow=throwMesh.receiveShadow=true;lounge.add(throwMesh);
 // The folded-back upper layer is a separate, lifted edge with a real soft hem.
 const flap=new THREE.PlaneGeometry(1,1,32,18),fp=flap.attributes.position,fu=flap.attributes.uv;for(let i=0;i<fp.count;i++){const u=fu.getX(i),v=1-fu.getY(i),p=drape(u,.04+v*.24);p.y+=.027+.07*Math.pow(v,4);p.z+=.03*Math.sin(u*6);fp.setXYZ(i,p.x,p.y,p.z)}flap.computeVertexNormals();const folded=new THREE.Mesh(flap,wool);folded.castShadow=folded.receiveShadow=true;lounge.add(folded);
 const hemMat=new THREE.MeshStandardMaterial({color:0xa99e8b,roughness:1});for(const side of[0,1]){const pts=Array.from({length:49},(_,i)=>drape(side,i/48).toArray());lounge.add(new THREE.Mesh(tube(pts,.012,96),hemMat))}
 for(let i=0;i<29;i++){const p=drape((i+.5)/29,1),j=(hash(i,2)-.5)*.025;lounge.add(new THREE.Mesh(tube([p.toArray(),[p.x+j,p.y-.07,p.z+.013],[p.x+j*1.8,p.y-.16-hash(i,4)*.038,p.z+.017]],.0045,8),hemMat))}

 function localBounds(object){object.updateMatrixWorld(true);const inverse=object.matrixWorld.clone().invert(),box=new THREE.Box3(),matrix=new THREE.Matrix4();object.traverse(mesh=>{if(!mesh.isMesh)return;mesh.geometry.computeBoundingBox();matrix.multiplyMatrices(inverse,mesh.matrixWorld);box.union(mesh.geometry.boundingBox.clone().applyMatrix4(matrix))});const result={min:box.min.toArray(),max:box.max.toArray(),size:box.getSize(new THREE.Vector3()).toArray()};object.userData.localBounds=result;return result}
 const bounds={chair:localBounds(chair),cup:localBounds(cup),lounge:localBounds(lounge)};
 group.userData.localBounds=bounds;group.userData.drawCalls=chair.userData.drawCalls+cup.userData.drawCalls+lounge.userData.drawCalls;group.userData.opticalTechnique='Geometry thickness, ordinary clearcoat and alpha; no transmission pass';
 return{chair,cup,lounge,group,bounds};
}
