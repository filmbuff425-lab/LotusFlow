import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function site(search='',saved=null){
 const context={window:{addEventListener(){}},document:{documentElement:{dataset:{}},readyState:'loading',addEventListener(){}},location:{search},localStorage:{getItem:()=>saved,setItem(){}},URLSearchParams};
 vm.createContext(context);
 for(const file of ['site-translations.js','site-i18n.js','release-media.js','catalog-data.js'])vm.runInContext(fs.readFileSync(path.join('dist',file),'utf8'),context);
 return context;
}
const chinese=site('?lang=zh','en'),english=site('?lang=en','zh');
assert.equal(chinese.document.documentElement.lang,'zh-CN');
assert.equal(english.document.documentElement.lang,'en');
assert.equal(site('','zh').window.lotusI18n.language,'zh');
assert.equal(site('?lang=invalid','invalid').window.lotusI18n.language,'en');
const zh=chinese.window.lotusI18n.translate,en=english.window.lotusI18n.translate;
for(const track of chinese.window.lotusCatalog){
 assert.equal(zh(track.title),track.title,`Preserve title: ${track.id}`);
 assert.equal(zh(track.artist),track.artist,`Preserve artist: ${track.id}`);
 assert.notEqual(zh(track.role),track.role,`Translate role: ${track.id}`);
 assert.notEqual(zh(track.credits),track.credits,`Translate credits: ${track.id}`);
 assert.equal(en(track.credits),track.credits,`Restore English credits: ${track.id}`);
}
for(const [a,b] of [['My music.','我的音乐'],['Music films.','音乐影像'],['Sound lab.','声音实验室']])assert.equal(zh(a),b);
assert.equal(zh('02 / Identity'),'02 / 个人简介');
assert.equal(zh('Play NEWs'),'播放 NEWs');
assert.equal(zh('NOW PLAYING / NEWs · OFFICIAL PREVIEW'),'正在播放 / NEWs · 官方试听');
assert.equal(en('合上 NEWs 透明 CD 盒'),'Close NEWs clear CD case');
assert.equal(en('打开 洋流 Flow 透明 CD 盒'),'Open 洋流 Flow clear CD case');
assert.equal(en('合上 CD 盒'),'Close CD case');
assert.equal(zh('Juliet — CD Case / Lotus Flow'),'Juliet — CD 唱片盒 / Lotus Flow');
for(const [source,translation] of Object.entries(chinese.window.LotusTranslations))for(const lang of ['zh','en'])assert.ok(translation[lang]?.trim(),`${lang} missing: ${source}`);
const pages=['dist/index.html','dist/jewel-case.html',...fs.readdirSync('dist/works').filter(f=>f.endsWith('.html')).map(f=>'dist/works/'+f),'dist/films/index.html','dist/collaborators/index.html'];
for(const page of pages){const html=fs.readFileSync(page,'utf8');assert.match(html,/site-translations\.js/);assert.match(html,/site-i18n\.js/);assert.match(html,/site-i18n\.css/);}
console.log(`Bilingual checks passed: ${pages.length} pages, ${chinese.window.lotusCatalog.length} records, language preferences, dynamic player labels and original names.`);
