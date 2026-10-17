// One clock for light, shell, colour and camera. Each phase lands with zero velocity.
const ease=(value,from,to)=>{const t=Math.min(1,Math.max(0,(value-from)/(to-from)));return t*t*t*(t*(t*6-15)+10)};
export function entryRevealFrame(progress){
 return {
  seed:ease(progress,0,.18),
  outline:ease(progress,.10,.21),
  trace:ease(progress,.18,.49),
  red:ease(progress,.49,.91),
  approach:ease(progress,.10,.94),
  copy:ease(progress,.78,1)
 };
}

// One light expands from the all-positive corner along every physical edge.
// Shared corners keep one distance, so each arriving front branches continuously.
export function createEntryContourData(dimensions){
 const edges=[[7,6],[6,4],[4,5],[5,7],[7,3],[3,2],[2,6],[3,1],[1,5],[2,0],[0,4],[0,1]];
 const corner=index=>dimensions.map((size,axis)=>((index&(1<<axis))?1:-1)*size/2);
 const positions=new Float32Array(72),traces=new Float32Array(24);
 const span=dimensions.reduce((sum,size)=>sum+size,0);
 const distance=index=>dimensions.reduce((sum,size,axis)=>sum+((index&(1<<axis))?0:size),0)/span;
 edges.forEach(([a,b],i)=>{
  if(distance(a)>distance(b))[a,b]=[b,a];
  positions.set(corner(a),i*6);positions.set(corner(b),i*6+3);
  traces[i*2]=distance(a);traces[i*2+1]=distance(b);
 });
 return {positions,traces};
}
