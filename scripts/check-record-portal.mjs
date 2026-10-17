import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync('dist/record-portal.js','utf8');
function setup(reduced=false){
 let now=0,id=0,observe;const frames=new Map(),events={},windowEvents={},cues=[],properties={};
 const ctx=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
 const canvas={getContext:()=>ctx},beacon={getBoundingClientRect:()=>({top:180,height:24})},label={};
 const link={clientWidth:430,clientHeight:280,dataset:{},style:{setProperty:(k,v)=>properties[k]=v},classList:{add(){},remove(){}},querySelector:s=>s==='canvas'?canvas:s==='.portal-beacon'?beacon:label,getBoundingClientRect:()=>({left:0,top:0,width:430,height:280}),addEventListener:(k,f)=>events[k]=f};
 const document={hidden:false,querySelector:()=>link,addEventListener:(k,f)=>events[k]=f};
 const window={lotusSfx:{play(kind){cues.push(kind);return true}}};
 vm.runInNewContext(code.replace(/^import .*;\n/,''),{loadPortalArtwork:()=>Promise.resolve(null),document,window,matchMedia:()=>({matches:reduced,addEventListener(){}}),ResizeObserver:class{constructor(fn){this.fn=fn}observe(){this.fn()}},IntersectionObserver:class{constructor(fn){observe=fn}observe(){}},devicePixelRatio:2,performance:{now:()=>now},requestAnimationFrame:f=>{frames.set(++id,f);return id},cancelAnimationFrame:id=>frames.delete(id),addEventListener:(k,f)=>windowEvents[k]=f,location:{assign(){}}});
 return{link,document,events,cues,frames,properties,visible(value){observe([{isIntersecting:value,intersectionRatio:value?1:0}])},step(t){now=t;const queue=[...frames.values()];frames.clear();queue.forEach(f=>f(now))}};
}
const page=setup();assert.equal(page.frames.size,0);
page.visible(true);for(let t=0;t<20000;t+=34)page.step(t);
assert.equal(page.cues.length,1,'Breathing is silent after the one-time arrival invitation');
page.visible(false);assert.equal(page.frames.size,0,'Offscreen particles consume no frames');
page.visible(true);for(let t=21000;t<23000;t+=34)page.step(t);assert.equal(page.cues.length,1,'Scrolling back cannot replay the arrival sound');
page.events.pointerenter({pointerType:'mouse'});assert.equal(page.cues.length,2,'A deliberate return hover can make a quiet cue after cooldown');
page.events.pointerenter({pointerType:'mouse'});assert.equal(page.cues.length,2,'Repeated pointer events do not stack sound');
const still=setup(true);still.visible(true);still.step(0);assert.equal(still.frames.size,0,'Reduced motion renders once');
assert.ok(code.includes("'#ffeac7':i%3===0?'#fa6c28':'#d93819'"),'Preserve the original warm cloud palette');
assert.ok(code.includes('r:Math.sqrt((i+.5)/840)'),'Preserve the original golden-angle distribution');
console.log('Portal checks passed: original cloud, layered breath, one-time invitation, hover cooldown, offscreen pause and reduced motion.');
