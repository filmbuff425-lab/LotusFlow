import assert from 'node:assert/strict';
import {createAirCue} from '../dist/air-sound.js';
let buffers=0;const nodes=[];
function parameter(){return {value:0,events:[],setValueAtTime(...args){this.events.push(['set',...args])},linearRampToValueAtTime(...args){this.events.push(['ramp',...args])},setValueCurveAtTime(...args){this.events.push(['curve',...args])},cancelAndHoldAtTime(...args){this.events.push(['hold',...args])}}}
function node(){const n={frequency:parameter(),gain:parameter(),Q:{value:0},connect(){return arguments[0]},disconnect(){this.disconnected=true},start(at){this.startAt=at},stop(at){this.stopAt=at}};nodes.push(n);return n}
const context={currentTime:10,sampleRate:48000,createBuffer(channels,length,rate){buffers++;return{channels,length,sampleRate:rate,getChannelData:()=>new Float32Array(length)}},createBufferSource:node,createBiquadFilter:node,createGain:node};
const breath=createAirCue(context,{}, {delay:1.35}),first=nodes.slice();
assert.equal(first[0].startAt,11.35,'The breath starts with the opening hint, rather than before the slit moves');
assert.equal(first[0].buffer.sampleRate,16000,'The filtered air needs a small mono source, not a full song-sized allocation');
const curve=first.at(-1).gain.events.find(e=>e[0]==='curve')[1];
assert.equal(curve[0],0);assert.equal(curve.at(-1),0);assert.ok(Math.max(...curve)<.067,'The seam stays a quiet breath beneath the supplied score');
assert.ok(curve.slice(0,45).every((v,i,a)=>!i||v>=a[i-1]),'There is no impact at the beginning of the soft air');
const wind=createAirCue(context,{}, {kind:'studio-wind'});
assert.equal(buffers,1,'The next entrance shares the existing noise buffer');assert.equal(wind.tail,6.63,'Air follows the 5.8-second camera entrance and leaves a soft tail');
context.currentTime=11.5;breath.stop();assert.ok(first.at(-1).gain.events.some(e=>e[0]==='ramp'&&e[1]===0&&e[2]===11.68),'Mute cancels a scheduled breath with a short fade');
first[0].onended();assert.ok(first.every(n=>n.disconnected),'Every completed breath releases its nodes');
console.log('Air sound checks passed: unpitched quiet envelopes, camera-length wind, one cached source and smooth cancellation.');
