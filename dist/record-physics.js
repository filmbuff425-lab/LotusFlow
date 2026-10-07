// Deterministic, bounded spring and impulse motion for the vinyl collection.
export function stepRecords(bodies, dt, { pointer = null, dragged = -1, reduced = false, onImpact = () => {} } = {}) {
 const step = Math.min(dt, .035);
 for (let i = 0; i < bodies.length; i++) {
  const b = bodies[i]; if (!b.active) continue;
  if (reduced) { b.x = b.homeX; b.y = b.homeY; b.vx = b.vy = 0; continue; }
  if (i !== dragged) {
   b.vx += (b.homeX - b.x) * 6 * step;
   b.vy += (b.homeY - b.y) * 7 * step;
   if (pointer?.active) {
    const dx = b.x - pointer.x, dy = b.y - pointer.y, d = Math.hypot(dx, dy), limit = b.radius + .34;
    if (d < limit) {
     const nx = d > .01 ? dx / d : 1, ny = d > .01 ? dy / d : 0;
     const strength = Math.min(7, (limit - d) * 9 + Math.hypot(pointer.vx, pointer.vy) * .12);
     b.vx += (nx * strength + pointer.vx * .12) * step; b.vy += (ny * strength + pointer.vy * .12) * step;
     b.spin += (pointer.vx * .035 - pointer.vy * .025) * step;
     if (b.cooldown <= 0 && strength > 2) { onImpact(i, pointer.x, pointer.y, Math.min(1, strength / 14)); b.cooldown = 1.1; }
    }
   }
   const damping = Math.exp(-4.4 * step); b.vx *= damping; b.vy *= damping;
   const speed = Math.hypot(b.vx, b.vy); if (speed > 5) { b.vx *= 5 / speed; b.vy *= 5 / speed; }
   b.x += b.vx * step; b.y += b.vy * step;
  }
  b.cooldown = Math.max(0, b.cooldown - step); b.spin *= Math.exp(-2 * step); b.angle += b.spin * step;
 }
 if (reduced) return;
 // Resolve complete silhouettes, not a smaller circle hidden under the artwork.
 // Multiple position passes prevent a dragged disc from leaving a chain of overlaps.
 for (let pass=0;pass<64;pass++) for (let i=0;i<bodies.length;i++) for(let j=i+1;j<bodies.length;j++) {
  const a=bodies[i],b=bodies[j];if(!a.active||!b.active)continue;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.radius+b.radius+.025;
  if(d>=min)continue;
  const nx=d>.0001?dx/d:1,ny=d>.0001?dy/d:0,overlap=min-d;
  const wa=i===dragged?0:1,wb=j===dragged?0:1,total=wa+wb;
  a.x-=nx*overlap*wa/total;a.y-=ny*overlap*wa/total;
  b.x+=nx*overlap*wb/total;b.y+=ny*overlap*wb/total;
  const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
  if(pass===0&&closing<0){
   const impulse=-closing*.52;
   a.vx-=impulse*nx*wa;a.vy-=impulse*ny*wa;b.vx+=impulse*nx*wb;b.vy+=impulse*ny*wb;
   a.spin-=impulse*.07;b.spin+=impulse*.07;
   if(impulse>.9&&a.cooldown<=0){onImpact(i,(a.x+b.x)/2,(a.y+b.y)/2,Math.min(1,impulse/4));a.cooldown=b.cooldown=.9;}
  }
 }
}
