import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {playPhoneTransition,decodeImage} from '../dist/studio-phone-media.js';

class Clock {
 now=0;serial=0;tasks=new Map();performance={now:()=>this.now};
 setTimeout=(fn,ms)=>this.add(fn,ms,0);setInterval=(fn,ms)=>this.add(fn,ms,ms);
 clearTimeout=id=>this.tasks.delete(id);clearInterval=this.clearTimeout;
 add(fn,ms,repeat){const id=++this.serial;this.tasks.set(id,{fn,at:this.now+ms,repeat});return id}
 advance(ms){const end=this.now+ms;for(;;){const next=[...this.tasks].sort((a,b)=>a[1].at-b[1].at)[0];if(!next||next[1].at>end)break;const[id,t]=next;this.now=t.at;if(t.repeat)t.at+=t.repeat;else this.tasks.delete(id);t.fn()}this.now=end}
}
class Video extends EventTarget {
 src='return.mp4';readyState=0;currentTime=0;paused=true;frame=null;reject=false;loads=0;
 getAttribute(name){return this[name]}
 load(){this.loads++}
 play(){this.paused=false;return this.reject?Promise.reject(new Error('decoder unavailable')):Promise.resolve()}
 pause(){this.paused=true}
 requestVideoFrameCallback(fn){this.frame=fn;return 1}
 cancelVideoFrameCallback(){this.frame=null}
 frameReady(){this.frame?.();this.frame=null}
}
function fixture(){const clock=new Clock(),video=new Video(),events=[];const stop=playPhoneTransition(video,{src:'enter.mp4',clock,onStart:()=>events.push('start'),onProgress:t=>events.push(t),onEnd:()=>events.push('end'),onFallback:()=>events.push('fallback')});return{clock,video,events,stop}}

{
 const{clock,video,events}=fixture();assert.equal(video.src,'enter.mp4','Re-entry replaces the return clip');video.frameReady();for(let i=0;i<58;i++){video.currentTime=i/10;clock.advance(100)}video.dispatchEvent(new Event('ended'));clock.advance(5000);assert.equal(events.filter(e=>e==='end').length,1);assert.ok(!events.includes('fallback'));assert.equal(clock.tasks.size,0);assert.equal(video.paused,true);
}
{
 const{clock,video,events}=fixture();clock.advance(650);assert.deepEqual(events.filter(e=>typeof e==='string'),['fallback']);assert.equal(video.paused,true);video.frameReady();clock.advance(5000);assert.equal(clock.tasks.size,0);assert.equal(events.filter(e=>e==='fallback').length,1,'A late decoder cannot replay a timed-out transition');
}
{
 const{clock,video,events}=fixture();video.frameReady();video.currentTime=.3;clock.advance(100);clock.advance(1200);assert.equal(events.at(-1),'fallback','A started but stalled decoder exits to the still image');assert.equal(clock.tasks.size,0);
}
{
 const{clock,video,events,stop}=fixture();stop();video.frameReady();video.dispatchEvent(new Event('ended'));clock.advance(10000);assert.deepEqual(events,[],'Cancellation cannot settle an old transition');assert.equal(clock.tasks.size,0);
}
{
 const video=new Video(),clock=new Clock();video.reject=true;let failures=0;playPhoneTransition(video,{src:'enter.mp4',clock,onFallback:()=>failures++});await Promise.resolve();clock.advance(5000);assert.equal(failures,1);assert.equal(clock.tasks.size,0);
}
assert.equal(await decodeImage({decode:()=>Promise.resolve()}),true);
assert.equal(await decodeImage({decode:()=>Promise.reject(new Error('missing'))}),false);
assert.equal(await decodeImage({decode:()=>new Promise(()=>{})},5),false,'Image download/decoder hangs have a deadline');

// Audit the phone module graph, including indirect imports, against accidentally
// bringing model construction back into the entry path.
const seen=new Set();function visit(file){if(seen.has(file))return;seen.add(file);const source=fs.readFileSync(file,'utf8');for(const [,dep]of source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){assert.notEqual(dep,'three','Phone must not import Three.js');if(dep.startsWith('.'))visit(path.resolve(path.dirname(file),dep.split('?')[0]))}}
visit(path.resolve('dist/studio-phone.js'));assert.ok(![...seen].some(file=>/studio-interior|studio-room|soundcube\.js|vendor\//.test(file)));
const html=fs.readFileSync('dist/index.html','utf8');assert.ok(html.includes('src="studio-loader.js'));assert.ok(!/<link[^>]*modulepreload[^>]*(?:three|studio\.js)/.test(html),'No eager model preload for phones');
const assets=fs.readdirSync('dist/assets/phone-studio62');assert.deepEqual(assets.sort(),['closed-glow.webp','closed.webp','desk-overview.mp4','desk-records.mp4','desk.webp','enter.mp4','overview-desk.mp4','overview-records.mp4','overview.webp','records-desk.mp4','records-overview.mp4','records.webp','return.mp4']);assert.ok(fs.statSync('dist/assets/phone-studio62/enter.mp4').size<2*1024*1024,'Entry clip stays below 2 MiB');
assert.ok(!fs.readFileSync('dist/studio-synths.js','utf8').includes('touchables.push'),'Synth keys are visual only');
console.log(`Phone Studio passed: independent ${seen.size}-module graph without Three.js, bounded media waits, decoder rejection/stall fallback, repeat entry and cancellation cleanup.`);
for(const name of ['overview-desk','desk-overview','overview-records','records-overview','desk-records','records-desk']){
 assert.ok(fs.statSync(`dist/assets/phone-studio62/${name}.mp4`).size<500*1024,'Short camera journeys stay below 500 KiB');
}
const vm=await import('node:vm');
const phoneSource=fs.readFileSync('dist/studio-phone.js','utf8');
const cancelled=[];const state={operation:3,wantedView:'desk',cancelViewClip:()=>cancelled.push('video'),finishViewClip:v=>cancelled.push(v),clip:{classList:{remove:v=>cancelled.push(v)}},viewAnimations:[{cancel:()=>cancelled.push('animation')}],viewLayer:{remove:()=>cancelled.push('layer')},changingView:true,phase:'open',view:'overview',still:{src:'desk.webp'},asset:n=>n};
vm.createContext(state);vm.runInContext(phoneSource.slice(phoneSource.indexOf('function stopViewMotion('),phoneSource.indexOf('async function changeView(')),state);state.stopViewMotion();
assert.equal(state.operation,4);assert.equal(state.changingView,false);assert.equal(state.still.src,'overview.webp');assert.deepEqual(cancelled,['video',false,'is-playing','animation','layer']);assert.equal(state.finishViewClip,null);
console.log('Camera journeys passed: bounded payload, cancelled decoder and animations, resolved pending promise, consistent final still.');
