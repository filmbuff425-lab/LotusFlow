import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
const timers=new Map();let timerId=0,aborted=0,workerUsed=false,terminated=false;
const context={THREE,URL,AbortController,DecompressionStream,Response,setTimeout(fn,delay){timers.set(++timerId,{fn,delay});return timerId},clearTimeout:id=>timers.delete(id),fetch:(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>{aborted++;reject(new Error('Aborted'))},{once:true})),Worker:class{constructor(){workerUsed=true}postMessage(){queueMicrotask(()=>this.onmessage({data:[]}))}terminate(){terminated=true}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/studio-clay.js','utf8').replace(/^import .*$/gm,'').replace(/export /g,'').replaceAll('import.meta.url',JSON.stringify('http://localhost/studio-clay.js'))+'\nthis.prepare=prepareStudioClay;',context);
const ready=context.prepare(),deadline=[...timers.values()].find(t=>t.delay===8000);assert.ok(deadline);deadline.fn();await ready;
assert.equal(aborted,5,'Every stalled sculpture download is cancelled');assert.ok(workerUsed&&terminated,'The original local geometry fallback completes and releases its worker');assert.equal(timers.size,0,'No timers remain after fallback');
console.log('Studio download check passed: network timeout cancels all five requests and activates the local geometry fallback.');
