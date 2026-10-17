import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync('dist/app.js','utf8');
const code=source.slice(source.indexOf('const desktopSleeves='),source.indexOf("document.getElementById('close-dialog')"));
function environment(desktop){
 let id=0;const frames=new Map(),handlers={},classes=new Set(),values={};
 const art={offsetHeight:200,style:{setProperty:(k,v)=>values[k]=v,removeProperty:k=>delete values[k]}};
 const card={hidden:false,classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)},querySelector:()=>art,getBoundingClientRect:()=>({top:0,left:0,width:208})};
 const target={closest:()=>card};
 const list={classList:{contains:()=>true},addEventListener:(k,f)=>handlers[k]=f};
 vm.runInNewContext(code,{list,matchMedia:q=>({matches:q.includes('min-width')?desktop:false,addEventListener(){}}),window:{addEventListener(){}},document:{addEventListener(){}},releaseSleeve(){},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:id=>frames.delete(id)});
 return{frames,classes,values,move:()=>handlers.pointermove({pointerType:'mouse',target,clientX:208,clientY:0}),leave:()=>handlers.pointerleave(),step(t){const queue=[...frames.values()];frames.clear();queue.forEach(f=>f(t))}};
}
const desktop=environment(true);desktop.move();for(let t=0;t<3000;t+=16)desktop.step(t);
assert.ok(parseFloat(desktop.values['--sleeve-y'])>10.9);assert.ok(parseFloat(desktop.values['--sleeve-lift'])<-13.9);
assert.equal(desktop.frames.size,0,'The desktop spring stops once the pointer settles');
desktop.leave();for(let t=3000;t<6000;t+=16)desktop.step(t);assert.equal(desktop.frames.size,0);assert.equal(desktop.classes.size,0,'Returning to rest removes active animation state');
const phone=environment(false);phone.move();assert.equal(phone.frames.size,0,'Phone interaction is unchanged');
console.log('Desktop sleeve checks passed: stronger tilt/lift, soft return, no idle frames, phone unchanged.');
