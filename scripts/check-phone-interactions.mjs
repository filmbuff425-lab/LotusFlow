import assert from 'node:assert/strict';
import fs from 'node:fs';
import {phoneObjects,objectBounds,swipeDirection,phoneHeartbeatScale,phoneFilmQuad,screenTransform,createPhoneFilmPlayback} from '../dist/studio-phone-interactions.js';
for(const objects of Object.values(phoneObjects)){
 for(const points of Object.values(objects)){
  assert.equal(points.length,4);for(const p of points)for(const n of p)assert.ok(n>=0&&n<=1,'Hit areas stay in the artwork');
  const r=objectBounds(points);assert.ok(r.width>0&&r.height>0);
 }
 const a=objectBounds(objects.computer),b=objectBounds(objects.records);assert.ok(b.y+b.height<a.y,'Record and computer targets must not overlap');
}
assert.equal(swipeDirection(-80,12),1);assert.equal(swipeDirection(80,12),-1);
assert.equal(swipeDirection(25,0),0,'Taps do not change views');assert.equal(swipeDirection(60,120),0,'Vertical scroll cannot change views');
class Media extends EventTarget{
 src='';paused=true;plays=0;loads=0;pending=[];
 play(){this.paused=false;this.plays++;return new Promise((resolve,reject)=>this.pending.push({resolve,reject}))}
 getAttribute(name){return this[name]}pause(){this.paused=true}removeAttribute(name){if(name==='src')this.src=''}load(){this.loads++}
}
const video=new Media(),events=[];let claims=0;
const player=createPhoneFilmPlayback(video,{announce:()=>claims++,onState:s=>events.push(s)});
assert.equal(video.plays,0,'No autoplay or MV fetch during Studio startup');assert.equal(video.src,'');
player.play('first.mp4');assert.equal(video.src,'first.mp4');assert.ok(claims>0);assert.equal(events.at(-1),'loading');
video.dispatchEvent(new Event('playing'));assert.equal(events.at(-1),'playing');
player.release();assert.equal(video.src,'');assert.equal(video.paused,true);assert.equal(video.loads,2,'Dismissal releases the decoder/download after explicit source loading');
video.pending[0].reject(new Error('late error'));await Promise.resolve();assert.equal(events.at(-1),'idle','A dismissed video cannot write a late failure');
player.play('second.mp4');player.play('third.mp4');video.pending[1].reject(new Error('superseded'));await Promise.resolve();assert.equal(events.at(-1),'loading');
video.pending[2].reject(Object.assign(new Error('gesture'),{name:'NotAllowedError'}));await Promise.resolve();assert.equal(events.at(-1),'gesture');
player.pause();assert.equal(video.paused,true);player.release();
const phone=fs.readFileSync('dist/studio-phone.js','utf8'),css=fs.readFileSync('dist/studio-phone.css','utf8');
assert.ok(!css.includes("content:'+'"),'No oversized floating plus buttons');assert.ok(phone.includes('suppressClickUntil'),'Swipe cannot activate a record or screen');
console.log('Phone interactions passed: aligned separate targets, scroll-safe gestures, no eager MV playback, source cleanup and stale playback cancellation.');

const {identityHasFocus}=await import('../dist/identity-score.js');
assert.equal(identityHasFocus({top:590,bottom:1200},844,112),false,'A short mobile Studio must not hand audio to the Identity sliver below it');
assert.equal(identityHasFocus({top:125,bottom:730},844,112),true,'Scrolling Identity into the reading position gives it the soundtrack');
assert.equal(identityHasFocus({top:-700,bottom:200},844,112),false,'Leaving Identity stops its soundtrack');
console.log('Mobile audio focus passed: adjacent chapter visibility cannot steal Studio playback.');

assert.ok(phoneHeartbeatScale(.20)>1.037,'The first heartbeat visibly expands the cube');
assert.ok(phoneHeartbeatScale(.49)>1.025,'The second beat remains visible');
assert.ok(phoneHeartbeatScale(1)<1.001,'The cube returns to rest');
assert.equal(phoneHeartbeatScale(.20,0),1,'No pulse before entrance completion');
{
 let now=0,tick=null;const clock={performance:{now:()=>now},setInterval:fn=>(tick=fn,1),clearInterval:()=>tick=null};
 const stalled=new Media(),states=[],p=createPhoneFilmPlayback(stalled,{clock,onState:s=>states.push(s)});
 p.play('film.mp4');assert.equal(stalled.preload,'auto');assert.equal(stalled.loads,1,'Start decoding in the tap');
 now=9100;tick();assert.equal(states.at(-1),'stalled');assert.equal(stalled.paused,true);assert.equal(tick,null,'No perpetual polling after failure');
 p.play('film.mp4');stalled.currentTime=.2;now+=100;tick();assert.equal(states.at(-1),'playing','Retry recovers when frames advance');
 p.release();assert.equal(tick,null);assert.equal(stalled.src,'');
}
console.log('Phone follow-up passed: visible paired heartbeat, held entrance and bounded video stall/retry.');

for(const [width,height] of [[390,487.5],[430,537.5]]){
 const m=screenTransform(width,height).slice(9,-1).split(',').map(Number);
 for(const [index,[x,y]]of [[0,[0,0]],[1,[640,0]],[2,[640,360]],[3,[0,360]]]){
  const w=m[3]*x+m[7]*y+1;
  assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/w-phoneFilmQuad[index][0]*width)<.01);
  assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/w-phoneFilmQuad[index][1]*height)<.01);
 }
}
{
 let now=0,tick=null;const clock={performance:{now:()=>now},setInterval:fn=>(tick=fn,1),clearInterval:()=>tick=null};
 const loop=new Media(),states=[],p=createPhoneFilmPlayback(loop,{clock,onState:s=>states.push(s)});
 p.play('show-me-love-mobile53.mp4');loop.currentTime=179;tick();now=8800;loop.currentTime=.1;tick();now=9400;loop.currentTime=.7;tick();
 assert.equal(states.at(-1),'playing','A loop rewind is advancing video, not a stall');
 p.pause();const loads=loop.loads;p.resume();assert.equal(loop.loads,loads,'Enlarging reuses the active decoder');assert.equal(loop.currentTime,.7,'Enlarging continues the current moment');p.release();assert.equal(tick,null);
}
const film=fs.readFileSync('dist/studio-phone-films.js','utf8');assert.ok(film.includes('video.loop=true'));
const films=['show-me-love','mirror','juliet','say-it-to-me','feed-on','airtight','wya'];
assert.deepEqual(fs.readdirSync('dist/assets/phone-films53').sort(),films.flatMap(id=>[`${id}-mobile53.jpg`,`${id}-mobile53.mp4`]).sort(),'The original seven selected films remain available on phones');
for(const id of films)assert.ok(fs.statSync(`dist/assets/phone-films53/${id}-mobile53.mp4`).size<18*1024*1024,`${id} retains the lightweight phone stream`);
{
 let tick=null;const clock={performance:{now:()=>0},setInterval:fn=>(tick=fn,1),clearInterval:()=>tick=null};
 const v=new Media(),states=[],p=createPhoneFilmPlayback(v,{clock,onState:s=>states.push(s)});
 p.play('wall.mp4');p.pause();v.pending[0].reject(new Error('interrupted'));await Promise.resolve();assert.equal(states.at(-1),'paused','A superseded play rejection must not turn a deliberate pause into an error');assert.equal(tick,null);
 v.play=()=>{throw Object.assign(new Error('gesture'),{name:'NotAllowedError'})};p.resume();assert.equal(states.at(-1),'gesture','Synchronous native failures expose retry instead of escaping');assert.equal(tick,null);p.release();
}
console.log('Phone films passed: seven lightweight choices, responsive wall perspective, shared decoder, loop reset, pause cancellation and synchronous resume rejection.');
