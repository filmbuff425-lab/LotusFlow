import fs from 'node:fs/promises';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {buildClayGeometry,clayPresets} from '../dist/studio-clay.js';

const directory=path.resolve('dist/assets/models');
await fs.mkdir(directory,{recursive:true});
let bytes=0;
for(const [index,{parts,k}] of clayPresets.entries()){
 const geometry=buildClayGeometry(parts,k);
 const arrays=['position','normal','uv'].map(name=>geometry.attributes[name].array);
 const header=Buffer.alloc(12);arrays.forEach((array,i)=>header.writeUInt32LE(array.length,i*4));
 const original=Buffer.concat([header,...arrays.map(array=>Buffer.from(array.buffer,array.byteOffset,array.byteLength))]);
 const compressed=gzipSync(original,{level:9,mtime:0});
 assert.deepEqual(gunzipSync(compressed),original,'Every original vertex, normal and UV survives packaging');
 await fs.writeFile(path.join(directory,`studio-clay-${index}-v1.mesh.gz`),compressed);bytes+=compressed.length;
 geometry.dispose();
}
console.log(`Packaged ${clayPresets.length} original sculptures losslessly: ${(bytes/1048576).toFixed(2)} MiB.`);
