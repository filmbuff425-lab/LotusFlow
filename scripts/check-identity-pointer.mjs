import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('dist/music-cursor.js','utf8');
function setup({fine=true,reduced=false}={}){
 let now=0,next=0,gradients=0;
 const frames=new Map(),events={},strokes=[],moves=[];
 const context={setTransform(){},clearRect(){},beginPath(){},moveTo(x,y){moves.push([x,y])},lineTo(){},quadraticCurveTo(){},ellipse(){},fill(){},stroke(){strokes.push({width:this.lineWidth,color:this.strokeStyle})},createRadialGradient(){gradients++;return{addColorStop(){}}}};
 const canvas={dataset:{},getContext:()=>context,setAttribute(){}};
 const document={hidden:false,body:{append(){}},createElement:()=>canvas,addEventListener:(name,fn)=>events[name]=fn};
 vm.runInNewContext(source,{document,innerWidth:1440,innerHeight:900,devicePixelRatio:2,performance:{now:()=>now},matchMedia:query=>({matches:query.includes('reduced')?reduced:fine,addEventListener(){}}),addEventListener(){},requestAnimationFrame:fn=>{frames.set(++next,fn);return next},cancelAnimationFrame:id=>frames.delete(id)});
 return{canvas,document,events,frames,strokes,moves,get gradients(){return gradients},move(x,y,t){now=t;events.pointermove({pointerType:'mouse',clientX:x,clientY:y,target:{closest:()=>({})}})},step(t){now=t;const queue=[...frames.values()];frames.clear();queue.forEach(fn=>fn(t))}};
}

const page=setup();
page.move(50,50,0);page.move(74,58,20);page.step(36);
assert.ok(Number(page.canvas.dataset.particleCount)>0,'Moving inside Identity produces a visible trail');
assert.equal(page.gradients,0,'The red trace does not use the broad iridescent glow');
assert.ok(page.strokes.every(stroke=>stroke.width<=2.1),'The blood trace remains a fine line');
assert.ok(page.strokes.every(stroke=>/^rgba\((180,19,17|246,66,40),/.test(stroke.color)),'Identity draws only the red trace and its wet highlight');
const first=page.moves[0];page.moves.length=0;page.step(72);
assert.notDeepEqual(page.moves[0],first,'The wet trace moves as it fades');
for(let t=108;t<2500;t+=36)page.step(t);
assert.equal(page.frames.size,0,'A stationary pointer leaves no idle animation loop');
assert.equal(page.canvas.dataset.particleCount,'0');
page.move(98,66,2520);page.step(2536);page.document.hidden=true;page.events.visibilitychange();
assert.equal(page.frames.size,0,'Background tabs immediately cancel the trace');
assert.equal(page.canvas.dataset.particleCount,'0');
for(const options of [{fine:false},{reduced:true}]){
 const still=setup(options);still.move(50,50,0);still.move(74,58,20);
 assert.equal(still.frames.size,0,'Touch devices and reduced motion do not animate the pointer');
}
console.log('Identity pointer checks passed: a thin moving red trace, no broad glow, natural expiry, hidden-tab pause and reduced-motion support.');
