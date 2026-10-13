import assert from 'node:assert/strict';
import {identityLightFrame} from '../dist/identity-peek.js';
import {timing} from '../dist/cut-timing.js';
// All breathing entry phases must fade monotonically after contact and be dark
// before the modal is removed. This guards the visible layer handoff regression.
for(const entry of [0,.4,1]){
 let previous=Infinity;
 for(let time=timing.contact;time<=timing.duration;time++){
  const frame=identityLightFrame(time,timing,entry);
  assert.ok(frame.opacity<=previous+1e-12,'Light brightens again after contact');
  assert.ok(frame.opacity>=0&&frame.slit>=0&&frame.slit<=1);
  previous=frame.opacity;
 }
 assert.equal(identityLightFrame(timing.duration,timing,entry).opacity,0);
 assert.equal(identityLightFrame(timing.contact+40,timing,entry).slit,0);
}
console.log('Identity light: every breathing phase fades monotonically to zero before the modal handoff.');
