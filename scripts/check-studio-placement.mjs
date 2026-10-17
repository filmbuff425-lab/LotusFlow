import assert from 'node:assert/strict';
import fs from 'node:fs';
// Input is an inspection snapshot of actual transformed geometry, including
// instances, captured before batching. This does not infer bounds from anchors.
const path=process.argv[2];assert.ok(path,'Pass the saved geometry inspection JSON');
const {compact,meshes,groups}=JSON.parse(fs.readFileSync(path,'utf8'));
assert.ok(compact,'This snapshot must use the approved compact room');
const x=17.47*1.70,z=14.47*2.3415;
const objects=meshes.filter(m=>!m.name.includes('/Glass studio architecture/'));
assert.ok(objects.length>4000,'The complete interior must be loaded');
for(const m of objects){
 assert.ok(m.min[0]>=-x-.01&&m.max[0]<=x+.01,`${m.name} crosses a side wall`);
 assert.ok(m.min[2]>=-z-.01&&m.max[2]<=z+.01,`${m.name} crosses a front/back wall`);
 assert.ok(m.min[1]>=-.035,`${m.name} crosses the floor`);
}
const overlaps=(a,b)=>[0,1,2].every(i=>Math.min(a.max[i],b.max[i])-Math.max(a.min[i],b.min[i])>.008);
const cds=groups.filter(g=>g.name.includes('/Glass CD /'));
const vinyl=groups.filter(g=>g.name.includes('/Hollow record jacket /')&&!g.name.split('/Hollow record jacket /')[1].includes('/Group '));
const ornaments=groups.filter(g=>g.name.includes('/One row')&&g.name.includes('/Reference /')&&!g.name.split('/Reference /')[1].includes('/Group '));
assert.equal(cds.length,26);assert.equal(vinyl.length,4);assert.equal(ornaments.length,3);
for(const row of [cds,vinyl])for(let a=0;a<row.length;a++)for(let b=a+1;b<row.length;b++)assert.ok(!overlaps(row[a],row[b]),`${row[a].name} overlaps ${row[b].name}`);
for(const cd of cds)for(const ornament of ornaments)assert.ok(!overlaps(cd,ornament),`${cd.name} intersects ${ornament.name}`);
for(let a=0;a<ornaments.length;a++)for(let b=a+1;b<ornaments.length;b++)assert.ok(!overlaps(ornaments[a],ornaments[b]),'Rear ornaments intersect');
const lounge=groups.find(g=>g.name.endsWith('/Brown cowhide lounge with timber side platform'));
const table=groups.find(g=>g.name.endsWith('/Circular glass coffee table'));
assert.ok(!overlaps(lounge,table),'Coffee table intersects the lounge or its throw');
const poster=groups.find(g=>g.name.endsWith('/Taped official Kill Bill poster'));
const plant=groups.find(g=>g.name.endsWith('/Sculptural red-edge Dracaena marginata'));
assert.ok(!overlaps(poster,plant),'Plant penetrates the poster plane');
console.log(`Placement audit passed: ${objects.length} visible object meshes remain within the room/floor; 26 CDs, 4 vinyls, 3 ornaments, lounge/table and poster/plant have clearance.`);
