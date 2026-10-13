// Apply an authorized analytics export; never infer cumulative plays from Spotify popularity.
// Usage: node scripts/update-streaming-data.mjs path/to/verified-snapshots.json
// Format: [{recordId:'lov',streams:10118462,asOf:'2026-10-12',sourceUrl:'https://...'}]
import fs from 'node:fs';import assert from 'node:assert/strict';import {recognitionData,recognitionExtraEntries} from '../dist/recognition-data.js';
const input=process.argv[2];if(!input)throw new Error('Provide a verified streaming snapshot JSON export.');
const rows=JSON.parse(fs.readFileSync(input,'utf8')),ids=new Set(['lov','juliet','best-u-had','all-of-you']);assert.ok(Array.isArray(rows)&&rows.length,'No snapshots supplied.');
const next=structuredClone(recognitionData),seen=new Set();
for(const row of rows){
 assert.ok(ids.has(row.recordId)&&!seen.has(row.recordId),'Unknown or duplicate recording.');seen.add(row.recordId);assert.ok(Number.isSafeInteger(row.streams)&&row.streams>=0,'Streams must be an actual cumulative count.');assert.match(row.asOf,/^\d{4}-\d{2}-\d{2}$/);assert.ok(Number.isFinite(Date.parse(row.asOf))&&Date.parse(row.asOf)<=Date.now(),'Invalid or future snapshot date.');const url=new URL(row.sourceUrl);assert.equal(url.protocol,'https:','A verifiable HTTPS source is required.');assert.ok(!url.username&&!url.password&&!/token|secret|api_key/i.test(url.search),'Do not publish private analytics credentials.');
 const value=row.streams>=1e6?(Math.floor(row.streams/1e5)/10).toFixed(1).replace(/\.0$/,'')+'M+':row.streams.toLocaleString('en-US'),data=next[row.recordId]||{facts:[]},id=row.recordId+'-spotify-streams';
 const fact={id,type:'reach',scopeLabel:'TRACK',value,shortValue:value+' / SPOTIFY',label:'SPOTIFY STREAMS',description:row.streams.toLocaleString('en-US')+' streams / Spotify',dateLabel:'SNAPSHOT / '+row.asOf,sources:[{label:'STREAMING DATA SOURCE',url:url.href}]};data.facts=data.facts.filter(f=>f.id!==id);data.facts.unshift(fact);next[row.recordId]=data;
}
fs.writeFileSync('dist/recognition-data.js','// Dated milestones and editorial sources; track, album and artist scopes stay distinct.\nexport const recognitionData = '+JSON.stringify(next,null,2)+';\nexport const recognitionExtraEntries = '+JSON.stringify(recognitionExtraEntries,null,2)+';\n');console.log('Applied '+rows.length+' verified snapshots. Run the normal build and local review before publishing.');
