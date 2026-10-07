import * as THREE from './vendor/three.module.js';
// Original sculpted surfaces, calculated once before the room is assembled.
export function buildClayGeometry(parts,k=.085){
  const field=(x,y,z)=>{let d=1e3;for(const [cx,cy,cz,rx,ry,rz]of parts){const a=Math.hypot((x-cx)/rx,(y-cy)/ry,(z-cz)/rz),b=Math.hypot((x-cx)/(rx*rx),(y-cy)/(ry*ry),(z-cz)/(rz*rz));const e=a<.00001?-Math.min(rx,ry,rz):a*(a-1)/Math.max(.0001,b),h=Math.max(k-Math.abs(d-e),0)/k;d=Math.min(d,e)-h*h*k*.25}return d};
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const p of parts)for(let a=0;a<3;a++){lo[a]=Math.min(lo[a],p[a]-p[a+3]-k);hi[a]=Math.max(hi[a],p[a]+p[a+3]+k)}
  const n=32,step=hi.map((v,a)=>(v-lo[a])/n),stride=n+1,idx=(x,y,z)=>x+stride*(y+stride*z),values=new Float32Array(stride**3);
  for(let z=0;z<=n;z++)for(let y=0;y<=n;y++)for(let x=0;x<=n;x++)values[idx(x,y,z)]=field(lo[0]+x*step[0],lo[1]+y*step[1],lo[2]+z*step[2]);
  const offsets=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tetra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]],pos=[],norm=[],uv=[];
  const gradient=v=>{const e=.002;return new THREE.Vector3(field(v[0]+e,v[1],v[2])-field(v[0]-e,v[1],v[2]),field(v[0],v[1]+e,v[2])-field(v[0],v[1]-e,v[2]),field(v[0],v[1],v[2]+e)-field(v[0],v[1],v[2]-e)).normalize()};
  function triangle(a,b,c){let ga=gradient(a),gb=gradient(b),gc=gradient(c);const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),cv=new THREE.Vector3(...c);if(bv.sub(av).cross(cv.sub(av)).dot(ga)<0){[b,c]=[c,b];[gb,gc]=[gc,gb]}for(const [v,g]of[[a,ga],[b,gb],[c,gc]]){pos.push(...v);norm.push(g.x,g.y,g.z);uv.push(.5+Math.atan2(v[0],v[2])/Math.PI/2,(v[1]-lo[1])/(hi[1]-lo[1]))}}
  for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){
   const vv=offsets.map(o=>values[idx(x+o[0],y+o[1],z+o[2])]);if(vv.every(v=>v>=0)||vv.every(v=>v<0))continue;
   const pp=offsets.map(o=>[lo[0]+(x+o[0])*step[0],lo[1]+(y+o[1])*step[1],lo[2]+(z+o[2])*step[2]]);
   for(const t of tetra){const inside=t.filter(i=>vv[i]<0),outside=t.filter(i=>vv[i]>=0);if(!inside.length||!outside.length)continue;const cut=(a,b)=>{const q=vv[a]/(vv[a]-vv[b]);return pp[a].map((v,j)=>v+(pp[b][j]-v)*q)};if(inside.length===1||inside.length===3){const one=inside.length===1?inside[0]:outside[0],others=inside.length===1?outside:inside;triangle(...others.map(i=>cut(one,i)))}else{const a=cut(inside[0],outside[0]),b=cut(inside[0],outside[1]),c=cut(inside[1],outside[0]),d=cut(inside[1],outside[1]);triangle(a,b,c);triangle(b,d,c)}}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return geo;
 }
const clubParts=[];for(const c of [-.56,0,.56])clubParts.push([c,.88,0,.35,.66,.24],[c-.15,.39,.02,.16,.39,.23],[c+.15,.39,.02,.16,.39,.23]);clubParts.push([-.91,1.0,0,.13,.38,.22],[.91,1.0,0,.13,.38,.22]);
export const clayPresets=[
{parts:[[-.13,.81,0,.125,.47,.14],[.13,.81,0,.125,.47,.14],[0,1.36,0,.32,.40,.20],[-.28,1.40,.03,.18,.30,.18],[.28,1.40,.03,.18,.30,.18],[.12,1.52,.20,.26,.12,.12],[-.06,1.30,.21,.29,.12,.12]],k:.06},
{parts:[[.20,.86,-.10,.245,.71,.22],[.20,1.52,-.10,.26,.35,.24],[0,1.53,.12,.34,.11,.11],[-.15,1.45,.21,.15,.12,.13]],k:.07},
{parts:[[-.20,.77,.16,.17,.60,.13],[-.32,.33,.16,.09,.26,.10],[-.07,.31,.16,.10,.24,.11],[-.23,1.59,.18,.18,.21,.145],[-.36,1.76,.18,.08,.14,.10],[-.12,1.76,.18,.08,.14,.10],[-.10,1.42,.13,.28,.10,.12]],k:.045},
{parts:[[0,.57,0,.235,.40,.17],[-.29,.24,.08,.28,.13,.18],[.29,.24,.08,.28,.13,.18],[-.15,.86,0,.17,.15,.16],[.15,.86,0,.17,.15,.16],[0,.98,0,.10,.13,.095]],k:.052},
{parts:clubParts,k:.085}
];

const cache=new Map();let hits=0,misses=0;
export const clayStats=()=>({cached:cache.size,hits,misses});
export const clayKey=(parts,k=.085)=>JSON.stringify([parts,k]);
export function clayGeometry(parts,k=.085){const key=clayKey(parts,k);if(!cache.has(key)){misses++;cache.set(key,buildClayGeometry(parts,k))}else hits++;return cache.get(key)}
let preparation;
export function prepareStudioClay(){
 if(preparation)return preparation;
 preparation=(async()=>{
  if(typeof DecompressionStream!=='undefined'){
   try{
    const geometries=await Promise.all(clayPresets.map(async({parts,k},index)=>{
     const response=await fetch(new URL(`./assets/models/studio-clay-${index}-v1.mesh.gz`,import.meta.url));
     if(!response.ok)throw new Error('Sculpture asset unavailable');
     const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
     const header=new DataView(buffer),geometry=new THREE.BufferGeometry();let offset=12;
     for(const [i,[name,size]]of[['position',3],['normal',3],['uv',2]].entries()){
      const length=header.getUint32(i*4,true);geometry.setAttribute(name,new THREE.BufferAttribute(new Float32Array(buffer,offset,length),size));offset+=length*4;
     }
     if(offset!==buffer.byteLength)throw new Error('Invalid sculpture asset');
     return{key:clayKey(parts,k),geometry};
    }));
    for(const {key,geometry}of geometries)cache.set(key,geometry);
    return;
   }catch{/* Keep the original worker as a compatibility and network fallback. */}
  }
  await new Promise(resolve=>{
  if(typeof Worker==='undefined'){resolve();return}
  let worker;
  try{worker=new Worker(new URL('./studio-clay-worker.js?v=20261007-mobile3',import.meta.url),{type:'module'})}catch{resolve();return}
  const finish=()=>{clearTimeout(timeout);worker.terminate();resolve()};
  const timeout=setTimeout(finish,15000);
  worker.onerror=finish;
  worker.onmessage=({data})=>{for(const item of data){const geometry=new THREE.BufferGeometry();for(const [name,size]of[['position',3],['normal',3],['uv',2]])geometry.setAttribute(name,new THREE.BufferAttribute(item[name],size));cache.set(item.key,geometry)}finish()};
  worker.postMessage(clayPresets);
  });
 })();
 return preparation;
}
