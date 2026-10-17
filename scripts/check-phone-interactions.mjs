import assert from 'node:assert/strict';
import fs from 'node:fs';
import {phoneObjects,objectBounds,swipeDirection,createPhoneFilmPlayback} from '../dist/studio-phone-interactions.js';
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
 pause(){this.paused=true}removeAttribute(name){if(name==='src')this.src=''}load(){this.loads++}
}
const video=new Media(),events=[];let claims=0;
const player=createPhoneFilmPlayback(video,{announce:()=>claims++,onState:s=>events.push(s)});
assert.equal(video.plays,0,'No autoplay or MV fetch during Studio startup');assert.equal(video.src,'');
player.play('first.mp4');assert.equal(video.src,'first.mp4');assert.ok(claims>0);assert.equal(events.at(-1),'loading');
video.dispatchEvent(new Event('playing'));assert.equal(events.at(-1),'playing');
player.release();assert.equal(video.src,'');assert.equal(video.paused,true);assert.equal(video.loads,1,'Dismissal releases the decoder/download');
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
