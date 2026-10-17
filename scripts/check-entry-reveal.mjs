import assert from 'node:assert/strict';
import {entryRevealFrame,createEntryContourData} from '../dist/entry-reveal.js';
// A black first frame and a neutral contour must precede any red or homepage type.
assert.deepEqual(entryRevealFrame(0),{seed:0,outline:0,trace:0,red:0,approach:0,copy:0});
const seed=entryRevealFrame(.09);
assert.ok(seed.seed>0&&seed.seed<1&&seed.trace===0&&seed.red===0&&seed.copy===0,'The original light transfers before its contour expands');
assert.equal(entryRevealFrame(.18).seed,1);
assert.equal(entryRevealFrame(.18).trace,0);
const drawing=entryRevealFrame(.30);
assert.ok(drawing.outline===1&&drawing.trace>0&&drawing.trace<1&&drawing.red===0&&drawing.copy===0);
const contour=entryRevealFrame(.49);
assert.ok(contour.outline===1&&contour.trace===1&&contour.red===0&&contour.copy===0,'All edges finish drawing before any red appears');
const colouring=entryRevealFrame(.60);
assert.ok(colouring.outline===1&&colouring.trace===1&&colouring.red>0&&colouring.red<1&&colouring.copy===0);
assert.deepEqual(entryRevealFrame(1),{seed:1,outline:1,trace:1,red:1,approach:1,copy:1});
// Opacity and camera motion never reverse or overshoot at a phase boundary.
let previous=entryRevealFrame(-1);
for(let i=0;i<=1100;i++){
 const frame=entryRevealFrame(i/1000);
 for(const key of Object.keys(frame)){
  assert.ok(frame[key]>=0&&frame[key]<=1);
  assert.ok(frame[key]+1e-10>=previous[key],key+' reversed during reveal');
 }
 previous=frame;
}
for(const key of ['seed','outline','trace','red','approach','copy']){
 assert.ok(entryRevealFrame(.001)[key]-entryRevealFrame(0)[key]<.00001);
 assert.ok(entryRevealFrame(1)[key]-entryRevealFrame(.999)[key]<.00001);
}

// The drawn contour must cover the actual rectangular shell, without diagonals,
// doubled edges or missing sides. Unequal dimensions also expose speed changes.
const dimensions=[83.5275,35.28,68.9535],half=dimensions.map(value=>value/2);
const {positions,traces}=createEntryContourData(dimensions);
assert.ok(positions instanceof Float32Array&&traces instanceof Float32Array);
assert.equal(positions.length,24*3);
assert.equal(traces.length,24);
const tolerance=1e-5,edges=new Set(),degrees=new Map(),cornerTraces=new Map();
const span=dimensions.reduce((sum,value)=>sum+value,0);
let totalLength=0;
const cornerAt=index=>{
 const point=Array.from(positions.slice(index*3,index*3+3));
 point.forEach((value,axis)=>assert.ok(Math.abs(Math.abs(value)-half[axis])<tolerance,'Vertex must lie on a shell corner'));
 return {point,key:point.map(value=>value>0?'+':'-').join('')};
};
for(let vertex=0;vertex<24;vertex+=2){
 const a=cornerAt(vertex),b=cornerAt(vertex+1);
 const changed=a.point.map((value,axis)=>Math.abs(value-b.point[axis])).filter(value=>value>tolerance);
 assert.equal(changed.length,1,'Every contour segment follows exactly one shell axis');
 const edge=[a.key,b.key].sort().join(':');
 assert.ok(!edges.has(edge),'Contour must not double an edge');edges.add(edge);
 for(const [offset,corner] of [[0,a],[1,b]]){
  const trace=traces[vertex+offset];
  degrees.set(corner.key,(degrees.get(corner.key)||0)+1);
  assert.ok(trace>=0&&trace<=1);
  if(cornerTraces.has(corner.key))assert.equal(trace,cornerTraces.get(corner.key),'All edges touching a corner must meet at the same wavefront time');
  cornerTraces.set(corner.key,trace);
  const fromSeed=corner.point.reduce((distance,value,axis)=>distance+Math.abs(half[axis]-value),0);
  assert.ok(Math.abs(trace-fromSeed/span)<tolerance,'Light must travel out from the same positive corner');
 }
 const length=changed[0];totalLength+=length;
 assert.ok(traces[vertex+1]>traces[vertex],'A real edge must advance the drawing distance');
 assert.ok(Math.abs((traces[vertex+1]-traces[vertex])-length/span)<tolerance,'Each branch must propagate at the same physical speed');
}
assert.equal(edges.size,12);assert.equal(degrees.size,8);
for(const degree of degrees.values())assert.equal(degree,3,'Each cube corner must join three edges');
assert.ok(Math.abs(totalLength-4*span)<1e-3);
assert.equal(cornerTraces.get('+++'),0);
assert.equal(cornerTraces.get('---'),1);
assert.equal(Array.from(traces).filter(value=>value===0).length,3,'Three branches originate together from the same light');
assert.equal(Array.from(traces).filter(value=>value===1).length,3,'Three wavefronts meet at the opposite corner');
console.log('Entry reveal passed: one light → branching shell → red → interface; continuous motion; 12 unique edges share one physical wavefront distance at every corner.');
