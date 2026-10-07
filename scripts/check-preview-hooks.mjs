import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('dist/preview-hooks.js','utf8');
const {loadHook,previewEnded,cancelHook}=await import('data:text/javascript,'+encodeURIComponent(source));
class Media{
 dataset={};listeners=new Map();duration=200;currentTime=7;readyState=4;loads=0;
 addEventListener(name,fn){this.listeners.set(name,fn)}
 removeEventListener(name,fn){if(this.listeners.get(name)===fn)this.listeners.delete(name)}
 load(){this.loads++;this.readyState=0}
 metadata(duration){this.duration=duration;this.readyState=1;const fn=this.listeners.get('loadedmetadata');this.listeners.delete('loadedmetadata');fn?.()}
}
const a=new Media(),one={id:'one',audio:'/full-one.mp3',previewAudio:'/clip-one.mp3',previewStart:69,previewEnd:91,previewDuration:22};
loadHook(a,one);assert.equal(a.src,'/clip-one.mp3');assert.equal(a.currentTime,7,'Do not seek against stale metadata');assert.equal(a.loads,1);a.metadata(22);assert.equal(a.currentTime,0);assert.equal(a.dataset.previewEnd,'22');
a.currentTime=21;assert.equal(previewEnded(a),false);a.currentTime=22;assert.equal(previewEnded(a),true);
loadHook(a,one,{full:true});a.metadata(195);assert.equal(a.currentTime,69);assert.equal(a.src,'/full-one.mp3');assert.equal(a.dataset.previewMode,'full');
loadHook(a,one,{full:true});const stale=a.listeners.get('loadedmetadata');loadHook(a,{...one,id:'two',previewStart:130},{full:true});stale();assert.equal(a.dataset.previewTrack,'two');a.metadata(120);assert.equal(a.currentTime,118,'Clamp cue to actual recording duration');
loadHook(a,one);cancelHook(a);a.metadata(22);assert.equal(a.currentTime,118,'Cancelled loads cannot seek the next source');
const context={window:{}};vm.createContext(context);for(const file of ['release-media.js','catalog-data.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),context);
const tracks=context.window.lotusCatalog,manifest=JSON.parse(fs.readFileSync('dist/assets/music/previews/preview-manifest.json'));
assert.equal(tracks.length,26);assert.equal(manifest.length,26);
for(const t of tracks){const m=manifest.find(m=>m.id===t.id);assert.ok(m);assert.ok(fs.existsSync('dist'+t.previewAudio),t.id+' missing clip');assert.ok(t.audio.startsWith('/'),t.id+' still depends on remote audio');assert.ok(fs.existsSync('dist'+t.audio),t.id+' missing recording');assert.equal(t.previewStart,m.start);assert.equal(t.previewDuration,22);assert.ok(m.rms>.001);if(t.audioKind==='full')assert.ok(t.previewStart>12,t.id+' starts in the intro')}
for(const file of ['dist/collaborators/index.html','dist/films/index.html'])assert.match(fs.readFileSync(file,'utf8'),/data-discography-back/);
console.log('Preview checks passed: 26 local highlights, matching full cues, stale metadata, rapid switching, cancellation, duration clamp and both Discography return links.');
