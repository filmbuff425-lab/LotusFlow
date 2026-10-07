import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {buildClayGeometry,clayGeometry,clayPresets,clayKey} from '../dist/studio-clay.js';
const keys=new Set();
for(const [index,{parts,k}] of clayPresets.entries()){
 const geometry=clayGeometry(parts,k),original=buildClayGeometry(parts,k);
 assert.equal(clayGeometry(parts,k),geometry,'Repeated ornaments reuse their original surface geometry');
 for(const name of ['position','normal','uv'])assert.deepEqual(geometry.attributes[name].array,original.attributes[name].array,'Cached geometry preserves every vertex, normal and texture coordinate');
 assert.ok(geometry.attributes.position.count>1000,'Detailed sculpted surfaces remain intact');
 assert.ok(Array.from(geometry.attributes.position.array).every(Number.isFinite));
 const packed=gunzipSync(await fs.readFile(new URL(`../dist/assets/models/studio-clay-${index}-v1.mesh.gz`,import.meta.url)));
 let offset=12;
 for(const [attributeIndex,name] of ['position','normal','uv'].entries()){
  const length=packed.readUInt32LE(attributeIndex*4);
  const values=new Float32Array(packed.buffer,packed.byteOffset+offset,length);
  assert.deepEqual(values,original.attributes[name].array,'Published sculptures preserve every original attribute without quantization');
  offset+=length*4;
 }
 assert.equal(offset,packed.length,'Packed sculpture has no missing or extra attributes');
 const key=clayKey(parts,k);assert.ok(!keys.has(key));keys.add(key);
}
console.log('Sculpture geometry checks passed: cached and packaged surfaces match every original vertex, normal and UV.');
