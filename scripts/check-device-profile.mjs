import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mobileImages} from '../dist/mobile-images.js';

globalThis.matchMedia=()=>({matches:false});
const desktop=await import('../dist/device-profile.js?desktop-test');
assert.equal(desktop.deviceProfile.panelWidth,4096);
assert.equal(desktop.canvasScale(1024,1024),1);
for(const source of Object.keys(mobileImages))assert.equal(desktop.mobileAsset(source),source,'Desktop keeps its exact original asset URL');
globalThis.matchMedia=()=>({matches:true});
const phone=await import('../dist/device-profile.js?phone-test');
assert.equal(phone.deviceProfile.panelWidth,1024);
assert.equal(phone.canvasScale(1024,1024),.5);
assert.equal(phone.canvasScale(256,256),1);
for(const [source,variant]of Object.entries(mobileImages)){
 assert.ok(fs.existsSync(new URL('../dist/'+source,import.meta.url)),'Original asset stays local');
 assert.ok(fs.existsSync(new URL('../dist/'+variant,import.meta.url)),'Phone variant exists');
 assert.equal(phone.mobileAsset(source),new URL('../dist/'+variant,import.meta.url).href);
 assert.equal(phone.mobileAsset(new URL('../dist/'+source,import.meta.url).href),new URL('../dist/'+variant,import.meta.url).href);
}
assert.equal(phone.mobileAsset('https://outside.example/art.jpg'),'https://outside.example/art.jpg');
assert.equal(phone.mobileAsset('assets/unmapped.webp'),'assets/unmapped.webp');
delete globalThis.matchMedia;
console.log(`Device profile checks passed: desktop originals unchanged, ${Object.keys(mobileImages).length} phone variants, complete assets and bounded procedural maps.`);
