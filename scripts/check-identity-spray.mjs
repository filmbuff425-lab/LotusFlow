import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {timing} from '../dist/cut-timing.js';

const source=fs.readFileSync('dist/blood-ink.js','utf8').replace(/^import .*;\n/gm,'').replace('export function renderBlood','function renderBlood');
function scene(cached,phase='entered'){
 const draws=[],events={},classes=new Set();let ellipses=0,paths=0;
 const context={globalAlpha:1,setTransform(){},clearRect(){},beginPath(){this.path=[]},moveTo(...args){this.path.push(['move',...args])},lineTo(...args){this.path.push(['line',...args])},closePath(){this.path.push(['close'])},ellipse(...args){ellipses++;this.path.push(['ellipse',...args])},fill(path){draws.push([this.globalAlpha,this.fillStyle,path?.ops||this.path])}};
 const canvas={style:{},dataset:{},getContext:()=>context};
 const host={clientWidth:390,clientHeight:844,classList:{contains:name=>classes.has(name),add:name=>classes.add(name),remove:name=>classes.delete(name),toggle(name,active){active?classes.add(name):classes.delete(name)}},append(){}};
 const document={hidden:false,documentElement:{dataset:{soundEntry:phase}},body:{classList:host.classList},querySelector:selector=>selector==='.blood-field'?canvas:selector==='#about'?host:null,addEventListener(){}};
 const sandbox={timing,innerHeight:844,devicePixelRatio:2,document,window:{addEventListener:(name,fn)=>events[name]=fn},createInkFlow:()=>({svg:{style:{},classList:{add(){}}},update(){}}),IntersectionObserver:class{observe(){}},ResizeObserver:class{observe(){}}};
 if(cached)sandbox.Path2D=class{constructor(){paths++;this.ops=[]}ellipse(...args){this.ops.push(['ellipse',...args])}};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);
 return {draws,canvas,events,classes,document,sandbox,get ellipses(){return ellipses},get paths(){return paths},render(time){draws.length=0;sandbox.renderBlood(time);return JSON.stringify(draws)}};
}
const original=scene(false),cached=scene(true);
assert.equal(cached.paths,1946,'Every original grain and droplet retains an individual cached shape');
for(const time of [1180,1190,1200,1225,1250,1300,1400,1500])assert.equal(cached.render(time),original.render(time),`Cached and uncached spray must draw identical geometry, colours, opacity and order at ${time} ms`);
assert.ok(cached.ellipses<original.ellipses*.5,'Caching removes most repeated ellipse construction without removing particles');
const gated=scene(true,'waiting');assert.equal(gated.paths,0,'No grain preparation competes with the sound entry');
gated.document.documentElement.dataset.soundEntry='entered';gated.events['lotus-entry-complete']();assert.equal(gated.paths,1946);
gated.classes.add('prologue-open');gated.sandbox.innerHeight=760;gated.sandbox.size();assert.equal(gated.paths,1946,'Mobile resize cannot rebuild grain paths during the cut');
gated.classes.delete('prologue-open');gated.events['lotus-prologue-end']();assert.equal(gated.paths,3892);assert.equal(gated.canvas.height,1140);
console.log('Identity spray checks passed: identical 1,946 beads and paint order, fewer repeated path operations, sound-entry deferral and no mid-cut resize work.');
