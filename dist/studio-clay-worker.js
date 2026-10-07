import {buildClayGeometry,clayKey} from './studio-clay.js?v=20261007-mobile3';
self.onmessage=({data})=>{
 const results=data.map(({parts,k})=>{const geometry=buildClayGeometry(parts,k);return{key:clayKey(parts,k),position:geometry.attributes.position.array,normal:geometry.attributes.normal.array,uv:geometry.attributes.uv.array}});
 self.postMessage(results,results.flatMap(result=>[result.position.buffer,result.normal.buffer,result.uv.buffer]));
};
