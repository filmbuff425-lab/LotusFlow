import assert from 'node:assert/strict';
import {bladeLength,scarThickness,fittedScar,followsScar,posterBleed,posterCover} from '../dist/identity-gesture.js';
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
for(const [vw,vh,w,h]of [[390,844,358,440],[1440,900,1325,560],[1280,720,1178,580],[390,700,358,590],[1920,1080,1766,980]]){
 const cover=posterCover(vw,vh,w,h),scar=fittedScar(vw,vh,w,h);
 const dx=scar.bottom-scar.top,len=Math.hypot(dx,h),distance=vw<=700?4.5:6;
 assert.ok(cover.bleed>distance,'Paint extends beyond the maximum panel translation on every edge');
 // The central old pixel grid is preserved; only pixels outside it are added.
 const originX=-cover.bleed+cover.imageLeft+posterBleed*cover.scale;
 const originY=-cover.bleed+cover.imageTop+posterBleed*cover.scale;
 assert.ok(Math.abs(originX-(w-vw*cover.scale)/2)<1e-8);
 assert.ok(Math.abs(originY-(h-vh*cover.scale)/2)<1e-8);
 const top=scar.top-dx/h*cover.bleed+cover.bleed,bottom=scar.bottom+dx/h*cover.bleed+cover.bleed;
 const atY=y=>top+(bottom-top)*y/cover.height-cover.bleed;
 assert.ok(Math.abs(atY(cover.bleed)-scar.top)<1e-8);
 assert.ok(Math.abs(atY(h+cover.bleed)-scar.bottom)<1e-8,'Extended clips still follow the original light seam');
 for(const sign of [-1,1]){const tx=sign*h/len*distance,ty=sign*-dx/len*distance;
  assert.ok(-cover.bleed+tx<0&&w+cover.bleed+tx>w);
  assert.ok(-cover.bleed+ty<0&&h+cover.bleed+ty>h,'Both opening halves cover the top and bottom even at peak breathing');
 }
}
console.log('Identity gesture checks passed: independent blade sizes, cover alignment and diagonal gestures.');
