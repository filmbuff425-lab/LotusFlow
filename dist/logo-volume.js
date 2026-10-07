import * as THREE from 'three';
// Trace the chroma-key silhouette into closed contours, including letter counters.
export function createVolume(image,{compact=false}={}){
 const w=720,h=Math.round(w*image.height/image.width),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(image,0,0,w,h);const data=cx.getImageData(0,0,w,h).data;
 const solid=(x,y)=>{if(x<0||x>=w||y<0||y>=h)return false;const i=(y*w+x)*4;return data[i+1]-Math.max(data[i],data[i+2])<45};
 const edges=new Map(),id=(x,y)=>y*(w+1)+x;function edge(x,y,a,b){const k=id(x,y);if(!edges.has(k))edges.set(k,[]);edges.get(k).push(id(a,b))}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(solid(x,y)){if(!solid(x,y-1))edge(x,y,x+1,y);if(!solid(x+1,y))edge(x+1,y,x+1,y+1);if(!solid(x,y+1))edge(x+1,y+1,x,y+1);if(!solid(x-1,y))edge(x,y+1,x,y)}
 const loops=[];while(edges.size){const start=edges.keys().next().value;let k=start,points=[],guard=0;do{points.push(new THREE.Vector2((k%(w+1)/w-.5)*8.4,(.5-Math.floor(k/(w+1))/h)*4.73));const list=edges.get(k);if(!list)break;const next=list.pop();if(!list.length)edges.delete(k);k=next;}while(k!==start&&guard++<w*h);if(points.length>18)loops.push(points.filter((_,i)=>i%2===0))}
 for(let j=0;j<5;j++)for(const loop of loops){const copy=loop.map(p=>p.clone());for(let i=0;i<loop.length;i++)loop[i].copy(copy[i]).multiplyScalar(.5).addScaledVector(copy[(i+loop.length-1)%loop.length],.25).addScaledVector(copy[(i+1)%loop.length],.25)}
 const outers=loops.filter(p=>THREE.ShapeUtils.isClockWise(p)),holes=loops.filter(p=>!THREE.ShapeUtils.isClockWise(p));
 const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes};
 function smoothPath(points,Type){const path=new Type();const p=points.filter((_,i)=>i%3===0);const mid=(a,b)=>a.clone().add(b).multiplyScalar(.5);const start=mid(p[p.length-1],p[0]);path.moveTo(start.x,start.y);for(let i=0;i<p.length;i++){const end=mid(p[i],p[(i+1)%p.length]);path.quadraticCurveTo(p[i].x,p[i].y,end.x,end.y)}path.closePath();return path}
 const shapes=outers.map(p=>{const s=smoothPath(p,THREE.Shape);for(const hole of holes)if(inside(hole[0],p))s.holes.push(smoothPath(hole,THREE.Path));return s});
 const geom=new THREE.ExtrudeGeometry(shapes,{depth:.10,bevelEnabled:true,bevelSize:.040,bevelOffset:-.025,bevelThickness:.085,bevelSegments:compact?6:12,curveSegments:compact?2:4,steps:3});geom.translate(0,0,-.05);
 // Weld lighting normals across duplicated bevel/side vertices, keeping smooth rounded shading.
 const positions=geom.attributes.position,normals=geom.attributes.normal,sums=new Map();const key=i=>[positions.getX(i),positions.getY(i),positions.getZ(i)].map(v=>Math.round(v*10000)).join(',');for(let i=0;i<positions.count;i++){const k=key(i),n=sums.get(k)||new THREE.Vector3();n.add(new THREE.Vector3(normals.getX(i),normals.getY(i),normals.getZ(i)));sums.set(k,n)}for(let i=0;i<positions.count;i++){const n=sums.get(key(i)).clone().normalize();normals.setXYZ(i,n.x,n.y,n.z)}normals.needsUpdate=true;
 return new THREE.Mesh(subdivideFaces(geom,compact?.15:.018),new THREE.MeshStandardMaterial({color:0xb42919,metalness:.5,roughness:.27}));
}

// Add interior vertices so a pointer can compress a small patch without bending an entire cap.
function subdivideFaces(source,edgeLimit){
 const p=source.attributes.position,n=source.attributes.normal,positions=[],normals=[],groups=[];
 const vertex=i=>({p:new THREE.Vector3().fromBufferAttribute(p,i),n:new THREE.Vector3().fromBufferAttribute(n,i)});
 const midpoint=(a,b)=>({p:a.p.clone().add(b.p).multiplyScalar(.5),n:a.n.clone().add(b.n).normalize()});
 function triangle(a,b,c,depth=0){
  const d=[a.p.distanceToSquared(b.p),b.p.distanceToSquared(c.p),c.p.distanceToSquared(a.p)];const longest=Math.max(...d);
  if(longest>edgeLimit&&depth<12){const edge=d.indexOf(longest);if(edge===0){const m=midpoint(a,b);triangle(a,m,c,depth+1);triangle(m,b,c,depth+1)}else if(edge===1){const m=midpoint(b,c);triangle(a,b,m,depth+1);triangle(a,m,c,depth+1)}else{const m=midpoint(c,a);triangle(a,b,m,depth+1);triangle(m,b,c,depth+1)}return}
  for(const v of[a,b,c]){positions.push(v.p.x,v.p.y,v.p.z);normals.push(v.n.x,v.n.y,v.n.z)}
 }
 for(const group of source.groups){const start=positions.length/3;for(let i=group.start;i<group.start+group.count;i+=3){if(group.materialIndex===0)triangle(vertex(i),vertex(i+1),vertex(i+2));else for(let j=0;j<3;j++){const v=vertex(i+j);positions.push(v.p.x,v.p.y,v.p.z);normals.push(v.n.x,v.n.y,v.n.z)}}groups.push({start,count:positions.length/3-start,materialIndex:group.materialIndex})}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(positions.flatMap((_,i)=>i%3===0?[positions[i]/8.4+.5,positions[i+1]/4.73+.5]:[]),2));for(const g of groups)geometry.addGroup(g.start,g.count,g.materialIndex);geometry.computeBoundingSphere();source.dispose();return geometry;
}
