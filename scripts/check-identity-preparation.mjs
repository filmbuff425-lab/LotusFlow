import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('dist/film-prologue.js','utf8');
const between=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end));
let requests=0,decodes=0;
const audio={decodeAudioData:async bytes=>{decodes++;return {duration:2.5,bytes}}};
const sound={window:{AudioContext:class{constructor(){return audio}}},fetch:async()=>{requests++;if(requests===1)throw new Error('temporary offline');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}}};
vm.createContext(sound);
vm.runInContext('let audioContext,knifeBuffer,decodeTask;'+between('let knifeTask;','dialog.dataset.audioMix=')+between('async function prepareBlade(){','async function armSound(){'),sound);
assert.equal(await sound.prepareBlade(),null);
assert.equal((await sound.prepareBlade()).duration,2.5,'A transient first fetch failure can retry immediately');
await sound.prepareBlade();assert.equal(requests,2);assert.equal(decodes,1,'Successful audio is decoded only once');

let imageDecodes=0;
vm.runInNewContext(between('const katanaAsset=new Image();','const bevel='),{Image:class{async decode(){assert.equal(this.decoding,'async');assert.equal(this.src,'assets/cinema/katana.png');imageDecodes++}}});
assert.equal(imageDecodes,1,'The original katana image is decoded before its first moving frame');

let paints=0;const frames=[];
const target={getContext:()=>({drawImage(){}})},dialog={open:true,close(){this.open=false}};
const page={dialog,innerWidth:390,innerHeight:844,devicePixelRatio:3,posterBleed:16,scarThickness:()=>36,draw:()=>paints++,gate:{querySelector:()=>target},canvases:[{}],seam:{setAttribute(){},querySelectorAll:()=>[]},artistSection:{dataset:{artistLocked:'false'}},gatePeek:{arrive(){},size(){}},measureCut:false,document:{documentElement:{dataset:{soundEntry:'entered'}},body:{classList:{remove(){}}},querySelector:()=>({focus(){}})},history:{replaceState(){}},window:{dispatchEvent(){}},Event:class{},requestAnimationFrame:fn=>frames.push(fn)};
vm.createContext(page);
vm.runInContext(between('let openingViewport=null,','const gatePeek=')+between('const entryWaiting=','window.lotusIdentityAudio=')+between('function geometry(){','function point(')+between('function drawGate(){','drawGate();let gateResize;')+between('function finish(){','function renderFrame('),page);
vm.runInContext('openingViewport={width:390,height:844}',page);
const openingGeometry=page.geometry();page.innerHeight=760;
for(let i=0;i<6;i++)page.drawGate();
assert.equal(paints,0,'Mobile toolbar resize does not repaint the poster during the cut');
assert.deepEqual(page.geometry(),openingGeometry,'Blade geometry stays aligned with the existing poster during a toolbar resize');
page.finish();assert.equal(dialog.open,false);assert.equal(frames.length,1,'Deferred poster work is scheduled after the reveal closes');
frames.shift()();assert.equal(paints,1);assert.equal(target.height,1140,'The deferred paint adopts the new viewport at the original DPR cap');
assert.equal(page.geometry().height,760,'The next opening can adopt the current viewport');
for(const phase of ['waiting','starting','retry','revealing']){page.document.documentElement.dataset.soundEntry=phase;page.drawGate();assert.equal(paints,1,'The full poster waits while the sound entry is active')}
page.document.documentElement.dataset.soundEntry='entered';page.drawGate();assert.equal(paints,2);
console.log('Identity preparation checks passed: early image decode, retryable sound, stable cut geometry and deferred mobile resize painting.');
