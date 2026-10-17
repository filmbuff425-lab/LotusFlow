import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createArtistImages} from '../dist/artist-images.js';
import {frames} from '../dist/artist-sprite-data.js';

const images=[];
class ImageStub{
 constructor(){images.push(this)}
 async decode(){this.decoded=true}
}
const assets=createArtistImages({makeImage:()=>new ImageStub(),resolve:x=>x});
assert.equal(images.length,0,'Constructing the loader cannot fetch hidden outfits');
const first=assets.load('idle');
assert.equal(assets.load('idle'),first,'Repeated chapter intent shares one request');
assert.equal(images.length,1);assert.ok(images[0].src.endsWith('yellow-idle55.webp'));
const atlas=assets.load('yellow');
await images[0].onload();await first;
assert.equal(assets.get('idle'),images[0]);assert.equal(assets.get('yellow'),undefined,'A delayed atlas cannot withhold the visible first pose');
assert.ok(images[0].decoded,'Paint only after decoding finishes');
assert.ok(!images.some(image=>image.src.includes('black')),'No black outfit on the first-pose path');
await images[1].onload();await atlas;
const failed=assets.load('black');images[2].onerror();await assert.rejects(failed);
const retry=assets.load('black');await images[3].onload();await retry;
assert.equal(assets.get('black'),images[3],'A failed optional outfit can retry independently');
assert.equal(assets.get('yellow'),images[1],'Changing outfits retains the existing portrait');
const original=JSON.parse(fs.readFileSync('dist/assets/pixel/frames.json','utf8'));delete original.images;
assert.deepEqual(frames,original,'Optimized atlas keeps every original crop and anchor');
assert.ok(fs.statSync('dist/assets/pixel/yellow-idle55.webp').size<50*1024,'First pose remains below 50 KiB');
for(const name of ['yellow','black'])assert.ok(fs.statSync(`dist/assets/pixel/${name}-sprites55.webp`).size<450*1024,'Animation atlas stays below 450 KiB');
console.log('Portrait loading passed: independent decoded first pose, deduplicated requests, optional outfit retry, unchanged crop geometry and bounded image payload.');
