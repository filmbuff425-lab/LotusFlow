import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scheduled=[];const context=vm.createContext({console,setTimeout(fn,delay){scheduled.push({fn,delay});return scheduled.length},clearTimeout(){}});
for(const file of ['studio-opening.js','identity-score.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8').replaceAll('export function','function').replaceAll('export const','const'),context);
const createOpening=vm.runInContext('createStudioOpening',context),createScore=vm.runInContext('createIdentityScore',context);
const studioWarmupAt=vm.runInContext('studioWarmupAt',context);
const audioVisualTime=vm.runInContext('audioVisualTime',context);
assert.ok(Math.abs(audioVisualTime({currentTime:10,getOutputTimestamp:()=>({contextTime:9.96,performanceTime:1000})},10.04,1020)-1080)<1e-8,'Animation uses the actual output timestamp, rather than ignoring the audio device delay');
assert.ok(Math.abs(audioVisualTime({currentTime:10,outputLatency:.025},10.04,1000)-1065)<1e-8,'Browsers without output timestamps use their output latency');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
function media(){return {dataset:{},volume:.6,paused:true,currentTime:0,handlers:{},addEventListener(k,fn){this.handlers[k]=fn},pause(){this.paused=true},async play(){this.paused=false}}}
const intro=media(),screen=media();screen.paused=false;
const opening=createOpening({media:intro,stopScreen:()=>screen.pause(),announce:()=>{}});
await opening.arm();assert.ok(intro.paused);assert.equal(intro.volume,.6);assert.equal(intro.currentTime,0,'The gesture primes the intact pickup before the room begins');
opening.waitForReveal();assert.ok(intro.paused,'Preparing the room cannot start the drums');assert.equal(intro.dataset.entranceCue,'waiting-for-blue');
await opening.warmup();assert.equal(intro.dataset.entranceCue,'warming-up');assert.equal(intro.currentTime,0,'Warmup keeps the mysterious pickup');intro.currentTime=.866;await opening.reveal();assert.equal(intro.dataset.entranceCue,'blue-visible');assert.ok(!intro.paused);assert.equal(intro.currentTime,.866,'The blue frame keeps the live first drum, with no seek or restart');
intro.currentTime=2;await opening.reveal();assert.equal(intro.currentTime,2,'Duplicate reveal events cannot restart the music');
opening.stop();opening.waitForReveal();opening.stop();await opening.reveal();assert.ok(intro.paused,'Leaving before the blue reveal cancels the pending cue');
await opening.start();assert.ok(!intro.paused&&screen.paused,'Entrance pauses the computer track before playing the supplied instrumental');
opening.stop();screen.play();assert.ok(intro.paused&&!screen.paused,'Opening the computer cannot layer the entrance over the first song');
intro.currentTime=27;await opening.start();assert.equal(intro.currentTime,0,'Each animated entrance keeps the pickup');
const armPending=deferred();intro.play=()=>armPending.promise;const arming=opening.arm();opening.stop();armPending.resolve();await arming;assert.equal(intro.dataset.audioState,'paused','A late unlock must not restart a cancelled entrance');
const blocked=media();blocked.play=async()=>{throw new Error('Gesture required')};const retry=createOpening({media:blocked,stopScreen:()=>{},announce:()=>{}});await retry.start();assert.equal(blocked.dataset.audioState,'needs-gesture');blocked.play=media().play;await retry.start();assert.equal(blocked.dataset.audioState,'playing','A blocked browser can retry in the next click');

// Exercise the real cube update: the cue must follow the first visible blue
// frame, including reduced motion and re-entry, rather than a late progress cutoff.
const THREE=await import('../dist/vendor/three.module.js');
for(const reduced of [false,true]){
 let cues=0;
 const cubeContext=vm.createContext({THREE,innerWidth:1200,innerHeight:900,matchMedia:()=>({matches:reduced}),updateHeartbeat(){},createEntrancePrint(){return{update(){}}},createCubeBrand(){return null},studioLayout:{shell:[40,35,40],center:[0,17.5,0]},createCosmos({scene}){const group=new THREE.Group();group.visible=false;scene.add(group);return{group,setReveal(v){group.visible=v>.001},update(){}}}});
 vm.runInContext(fs.readFileSync('dist/soundcube.js','utf8').replace(/^import .*$/gm,'').replace('export function','function'),cubeContext);
 const cube=vm.runInContext('createSoundcube',cubeContext)({scene:new THREE.Scene(),root:new THREE.Group(),camera:new THREE.PerspectiveCamera(),renderer:{domElement:{clientHeight:800}},onBlueReveal:()=>cues++});
 cube.attachRoom({update(){}});cube.setInteriorReady();cube.setProgress(.22);cube.update(1000);assert.equal(cues,0,'No downbeat before the blue sky is visible');
 cube.setProgress(.24);cube.update(1017);assert.equal(cues,1,'The first blue frame cues the drums while the planet is still emerging');
 cube.setProgress(1);cube.update(1034);assert.equal(cues,1,'Completing the reveal cannot restart the drums');
 cube.setProgress(0);cube.update(1051);cube.setProgress(1);cube.update(1068);assert.equal(cues,2,'Re-entry and a reduced-motion jump cue the same first visible frame');
 cube.setProgress(0);cube.update(1085);
 const progressAt=seconds=>{const t=(studioWarmupAt+seconds*1000)/5800;return t*t*t*(t*(t*6-15)+10)};
 cube.setProgress(progressAt(.866-.01));cube.update(1102);assert.equal(cues,2,'Blue stays hidden through the end of the pickup');
 cube.setProgress(progressAt(.866+.01));cube.update(1119);assert.equal(cues,3,'Blue emerges within one frame of the first drum on the media clock');
}

const sources=[],states=[];let now=10,loads=0;
const ctx={state:'running',get currentTime(){return now},async resume(){this.state='running'},destination:{},createGain(){return {gain:{value:0,cancelScheduledValues(){},setValueAtTime(v,t){this.value=v;this.set=[v,t]},linearRampToValueAtTime(v,t){this.value=v;this.ramp=[v,t]}},connect(){return this},disconnect(){}}},createBufferSource(){const s={connect(){return this},disconnect(){},start(at,offset){this.started={at,offset}},stop(at){this.stopped=at??now}};sources.push(s);return s}};
const score=createScore({getContext:()=>ctx,loadBuffer:async()=>{loads++;return {duration:72.02}},announce:()=>{},onState:(state,info)=>states.push({state,...info})});
await score.enter();assert.equal(loads,1);assert.equal(score.phase,'warmup');assert.equal(sources[0].loopEnd,40.9,'The warmup cannot accidentally run into the drum reveal while a visitor waits');
assert.equal(sources[0].loop,false,'Identity phrases overlap instead of using an abrupt native loop');assert.ok(scheduled.at(-1).delay>39000,'The following phrase is scheduled just before the warmup boundary');
const contact=now+.04+1.17;assert.ok(score.reveal(contact));const reveal=sources.at(-1);
assert.ok(Math.abs(reveal.started.at+(43.12-reveal.started.offset)-contact)<1e-10,'The strong drum transient lands exactly at the blade contact on the shared AudioContext clock');
assert.equal(reveal.loopStart,43.12);assert.equal(sources[0].stopped,contact+.01,'Warmup and reveal have only a short crossfade');
now=contact+4;score.pause();assert.equal(score.playing,false);assert.ok(sources.every(s=>s.stopped!==undefined),'Leaving the page cancels every live or scheduled source');
await score.enter(true);assert.equal(loads,1,'Returning reuses the decoded source');assert.ok(sources.at(-1).started.offset>47,'Returning to the profile resumes the musical reveal');
score.pause();const pending=deferred();const slow=createScore({getContext:()=>ctx,loadBuffer:()=>pending.promise,announce:()=>{},onState:()=>{}});const waiting=slow.enter();slow.pause();const count=sources.length;pending.resolve({duration:72});await waiting;assert.equal(sources.length,count,'Leaving during loading cannot start background music later');
assert.ok(fs.statSync('dist/assets/audio/studio-mirror-instrumental.mp3').size>1000000);assert.ok(fs.statSync('dist/assets/audio/identity-bgm.mp3').size>1000000);
console.log('Opening music checks passed: intact studio pickup, first blue frame / drum alignment, re-entry, reduced motion, gesture unlock, computer separation and identity timing.');
