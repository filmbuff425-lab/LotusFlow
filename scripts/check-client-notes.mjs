import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {recognitionData,recognitionExtraEntries} from '../dist/recognition-data.js';
const ctx={window:{}};vm.createContext(ctx);for(const file of ['release-media.js','catalog-data.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),ctx);
const tracks=ctx.window.lotusCatalog,byId=new Map(tracks.map(t=>[t.id,t]));
assert.deepEqual(Array.from(tracks,t=>t.id).slice(0,14),['lov','show-me-love','mirror','bridge','juliet','cassette','pick-a-side','news','train-to-nowhere','red-flag-101','rendezvous','wya','feed-on','im-fine']);
assert.deepEqual(Array.from(ctx.window.lotusStudioSongIds),['lov','show-me-love','mirror','bridge','juliet','cassette','pick-a-side','news','train-to-nowhere','feed-on','airtight']);
assert.deepEqual(Array.from(ctx.window.lotusFilms,t=>t.id),['show-me-love','mirror','juliet','say-it-to-me','feed-on','airtight','wya']);
assert.equal(byId.get('bridge').title,'大桥');assert.equal(byId.get('bridge').artist,'Yitai Wang');assert.equal(byId.get('adult').title,'不完美大人');assert.equal(byId.get('cassette').title,'Cassette');assert.equal(byId.get('cassette').artist,'Caelan');
for(const id of ['flow','jellyfish','right-here']){assert.ok(byId.get(id).audio&&!byId.get(id).video);assert.ok(!fs.readFileSync('dist/works/'+id+'.html','utf8').includes('<section class="release-film">'));}
assert.ok(byId.get('im-fine').audio&&!byId.get('im-fine').video);assert.ok(!fs.readFileSync('dist/works/im-fine.html','utf8').includes('<section class="release-film">'));
for(const t of tracks)assert.ok(!/WD|WUMUTI|QSTNMRKS|NIE|Mucky|Sally Han|Kory|Hitimpulse|Writers:|Shawn Halim|ADN Lewis|Yixuan Ouyang/.test(t.credits),`Other people's credits: ${t.id}`);
for(const id of ['flow','summer','im-falling','red-flag-101','rendezvous','jellyfish','news'])assert.ok(!(recognitionData[id]?.facts||[]).some(f=>['editorial','press'].includes(f.type)));
assert.ok(recognitionData.lov.facts.some(f=>f.value==='10M+'&&f.type==='reach'));for(const id of ['best-u-had','all-of-you'])assert.ok(recognitionData[id].facts.some(f=>f.value==='1M+'&&/SNAPSHOT/.test(f.dateLabel)));
assert.ok(recognitionData.juliet.facts.some(f=>f.id==='juliet-genius'));for(const id of ['lotus-songwriters-apple','lotus-voyage-la','lotus-bold-journey'])assert.ok(recognitionData['lotus-flow-profile'].facts.some(f=>f.id===id));
for(const t of recognitionExtraEntries)assert.ok(fs.existsSync('dist'+t.image));
const home=fs.readFileSync('dist/index.html','utf8');assert.ok(home.indexOf('data-view="gallery"')<home.indexOf('data-view="vinyl"'));assert.ok(home.indexOf('data-view="vinyl"')<home.indexOf('data-view="list"'));assert.ok(home.includes('CREATIVE PRACTICE'));
console.log('Client notes: collection orders, bilingual naming, MV-only removal, role scopes and dated recognition passed.');

assert.equal(byId.get('lov').role,'LYRICS / COMPOSITION');assert.equal(byId.get('lov').credits,'Co-lyrics · Co-composition');
for(const id of ['news','rendezvous','wya','right-here'])assert.equal(byId.get(id).role,'PRODUCTION / SONGWRITING / RECORDING');
for(const file of ['index.html','works/index.html','works/lov.html','collaborators.js','collaborators/index.html']){
 const page=fs.readFileSync('dist/'+file,'utf8');
 assert.ok(!page.includes('contributing to the lyrics.')&&!page.includes('Lyrics for 1 of LOV.')&&!page.includes('I contributed lyrics to 1 of LOV,'),file+' has stale LOV credits');
}
assert.ok(fs.readFileSync('dist/works/lov.html','utf8').includes('<p>Co-lyrics · Co-composition</p>'));
assert.ok(home.includes('id="vinyl-credit" class="mono">LYRICS / COMPOSITION'));
assert.ok(fs.readFileSync('dist/record-print.js','utf8').includes("credit:'LYRICS / COMPOSITION / LOTUS FLOW'"));
console.log('October 16 credits: four corrected summaries and all LOV detail/print copies agree.');

const archive=fs.readFileSync('dist/works/index.html','utf8');
for(const track of tracks){
 const row=archive.match(new RegExp(`<a class="credit-row" href="${track.id}\\.html"[^>]*>([\\s\\S]*?)</a>`));
 const credits=row?.[1].match(/<span class="credit-role">([^<]*)</)?.[1].replaceAll('&amp;','&');
 assert.equal(credits,track.credits,`Static archive credits must match the shared Grid/List/Vinyl/modal catalog: ${track.id}`);
}
console.log('All 26 static archive credit rows agree with the shared catalog.');

assert.match(home, /data-view="gallery" class="active" aria-pressed="true"/);
assert.ok(!home.includes('class="work section vinyl-mode"')&&!home.includes('id="track-list" hidden'));
assert.ok(home.includes('id="vinyl-room" hidden')&&home.includes('id="vinyl-caption" hidden'));
console.log('Records starts in Grid on both screen sizes; Vinyl remains an explicit choice.');

for(const id of ['news','rendezvous','right-here']){const html=fs.readFileSync('dist/works/'+id+'.html','utf8');const contribution=html.match(/<section class="contribution"[\s\S]*?<\/section>/)?.[0];assert.ok(contribution?.includes('<h3>RECORDING</h3>'),id+' detail must use Recording');assert.ok(!contribution?.includes('AUDIO'),id+' detail must not retain the obsolete Audio heading');}
