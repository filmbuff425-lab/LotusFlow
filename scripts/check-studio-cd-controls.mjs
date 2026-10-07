import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../dist/studio-cd-player.js',import.meta.url),'utf8');
const body=source.match(/ async function command\(action\)\{([^\n]+)\}/)?.[1];
assert.ok(body,'CD command handler exists');
const calls=[];let release;
const media={mode:'video',setMode(next,options){calls.push(['mode',next,options]);return new Promise(resolve=>release=ok=>{if(ok)this.mode=next;resolve(ok)})},choose(id){calls.push(['choose',this.mode,id])},advance(n){calls.push(['advance',this.mode,n])}};
const command=new Function('window','favorites',`return async action=>{${body}}`)({lotusStudioMedia:media},['lov','mirror']);
const pending=command('disc-2');
assert.deepEqual(calls,[['mode','music',{start:false}]],'Do not select a disc against the old video collection');
release(true);await pending;
assert.deepEqual(calls.at(-1),['choose','music','mirror']);
media.mode='video';const canceled=command('next');release(false);await canceled;
assert.equal(calls.filter(c=>c[0]==='advance').length,0,'A superseded mode switch must not trigger another track');
media.mode='music';await command('next');assert.deepEqual(calls.at(-1),['advance','music',1]);
console.log('CD controls pass: wait for music mode, retain the selected disc, and cancel superseded actions.');
