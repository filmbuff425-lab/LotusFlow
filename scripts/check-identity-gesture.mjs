import assert from 'node:assert/strict';
import {bladeLength,scarThickness,fittedScar,followsScar} from '../dist/identity-gesture.js';
assert.equal(bladeLength(390,844),643.5);
assert.ok(bladeLength(1440,900)>1440*.85,'Desktop blade keeps its independent size');
assert.ok(scarThickness(390)>27,'The phone scar is no longer a shrunk desktop line');
for(const [vw,vh,w,h]of [[390,844,358,440],[1440,900,1325,560]]){
 const scar=fittedScar(vw,vh,w,h),dy=80,dx=(scar.bottom-scar.top)*dy/h;
 assert.ok(followsScar({x:scar.top,y:0},{x:scar.top+dx,y:dy},scar));
 assert.ok(!followsScar({x:100,y:100},{x:190,y:100},scar),'Horizontal swipes do not trigger the diagonal');
 assert.ok(!followsScar({x:100,y:100},{x:102,y:109},scar),'Taps do not count as swipes');
 const fit=Math.max(w/vw,h/vh),offset=(h-vh*fit)/2;
 assert.ok(Math.abs(scar.top-((w-vw*fit)/2+(vw*(.77-.55*(-offset/fit)/vh)+scarThickness(vw)*.05)*fit))<1e-6,'The touch strip matches the same cover crop as the light');
}
console.log('Identity gesture checks passed: independent blade sizes, cover alignment and diagonal gestures.');
