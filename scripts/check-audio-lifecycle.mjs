import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('dist/app.js','utf8');
const functions=source.slice(source.indexOf('function addVoice('),source.indexOf('const midi='));
const nodes=[];
function node(kind){const param={setValueAtTime(){},exponentialRampToValueAtTime(){}};const value={kind,gain:param,frequency:param,detune:{},connect(){return this},start(){},stop(){},disconnect(){this.disconnected=true}};nodes.push(value);return value}
const context={audioState:{voices:new Set(),inputs:[{},{},{}],noise:{},context:{createOscillator:()=>node('oscillator'),createGain:()=>node('gain'),createBufferSource:()=>node('buffer'),createBiquadFilter:()=>node('filter')}}};
vm.createContext(context);vm.runInContext(functions,context);
for(const play of ['tone(440,0,.2,0)','percussion(0,"kick")','percussion(0,"snare")','percussion(0,"hat")']){
 const start=nodes.length;vm.runInContext(play,context);const transient=nodes.slice(start),voice=[...context.audioState.voices][0];
 assert.ok(transient.every(node=>!node.disconnected),'Live note retains its original complete sound graph');
 voice.onended();assert.equal(context.audioState.voices.size,0);assert.ok(transient.every(node=>node.disconnected),'Every completed transient source, filter and envelope disconnects');
}
vm.runInContext('percussion(0,"snare")',context);const voice=[...context.audioState.voices][0];voice.disconnect=()=>{throw new Error('Context already closed')};voice.onended();assert.equal(context.audioState.voices.size,0);assert.ok(nodes.slice(-2).every(node=>node.disconnected),'A closed source cannot prevent remaining nodes from being released');
console.log('Mixer audio lifecycle checks passed: complete transient graphs are retained while playing and released after each note, including context shutdown.');
