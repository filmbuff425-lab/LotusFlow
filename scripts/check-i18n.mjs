import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

function site(search='',saved=null){
 const context={window:{addEventListener(){}},document:{documentElement:{dataset:{}},readyState:'loading',addEventListener(){}},location:{search},sessionStorage:{getItem:()=>saved,setItem(){}},URLSearchParams};
 vm.createContext(context);
 for(const file of ['site-translations.js','site-i18n.js','release-media.js','catalog-data.js'])vm.runInContext(fs.readFileSync(path.join('dist',file),'utf8'),context);
 return context;
}
const chinese=site('?lang=zh','zh'),english=site('?lang=en');
assert.equal(chinese.document.documentElement.lang,'zh-CN');
assert.equal(english.document.documentElement.lang,'en');
assert.equal(site('','zh').window.lotusI18n.language,'zh','A deliberate Chinese selection survives navigation in this visit');
assert.equal(site('?lang=zh').window.lotusI18n.language,'en','Even an old Chinese shared URL opens a new visit in English');
assert.equal(site('?lang=invalid','invalid').window.lotusI18n.language,'en');
const zh=chinese.window.lotusI18n.translate,en=english.window.lotusI18n.translate;
for(const track of chinese.window.lotusCatalog){
 assert.equal(en(track.title),track.title,`English title: ${track.id}`);
 assert.equal(en(track.artist),track.artist,`English artist: ${track.id}`);
 assert.notEqual(zh(track.role),track.role,`Translate role: ${track.id}`);
 assert.notEqual(zh(track.credits),track.credits,`Translate credits: ${track.id}`);
 assert.equal(en(track.credits),track.credits,`Restore English credits: ${track.id}`);
}
for(const [a,b] of [['My music.','我的音乐'],['Music films.','音乐影像'],['Sound lab.','声音实验室']])assert.equal(zh(a),b);
const home=fs.readFileSync('dist/index.html','utf8');
const biography=home.match(/id="profile-bio"[^>]*>([\s\S]*?)<\/div>/)[1];
const approved=JSON.parse(fs.readFileSync('scripts/fixtures/client-profile-copy.json','utf8'));
const paragraphs=[...biography.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
assert.equal(paragraphs.length,5,'All five final biography paragraphs');
for(let i=0;i<paragraphs.length;i++){assert.equal(en(paragraphs[i]),approved.bio[i][0]);assert.equal(zh(paragraphs[i]),approved.bio[i][1]);}
const practice=home.match(/id="profile-process"[^>]*>([\s\S]*?)<\/div>/)[1];
const statements=[...practice.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/&amp;/g,'&'));
assert.equal(statements.length,6);
for(let i=0;i<statements.length;i++){assert.equal(en(statements[i]),approved.practice[i][0]);assert.equal(zh(statements[i]),approved.practice[i][1]);}
for(const [a,b] of [['Cassette','磁带'],['Caelan','庆怜'],['大桥','大桥'],['不完美大人','不完美大人'],['Yitai Wang','王以太'],['NEWs','NEWs（头条八卦）']])assert.equal(zh(a),b);
assert.ok(!home.includes('SHENZHEN ↔ LOS ANGELES')&&!home.includes('Shenzhen → Los Angeles.'));
assert.equal(zh('02 / Identity'),'02 / 个人简介');
assert.equal(zh('01 / MUSIC PRODUCTION'),'01 / 音乐制作');
assert.equal(zh('Play NEWs'),'播放 NEWs（头条八卦）');
assert.equal(zh('NOW PLAYING / NEWs · OFFICIAL PREVIEW'),'正在播放 / NEWs（头条八卦） · 官方试听');
assert.equal(en('合上 NEWs 透明 CD 盒'),'Close NEWs clear CD case');
assert.equal(en('打开 洋流 Flow 透明 CD 盒'),'Open 洋流 Flow clear CD case');
assert.equal(en('合上 CD 盒'),'Close CD case');
assert.equal(zh('Open Cassette — Caelan'),'打开 磁带 — 庆怜');
assert.equal(zh('Cassette cover'),'磁带 封面');
assert.equal(zh('NEXT RELEASE / Caelan'),'下一张作品 / 庆怜');
assert.equal(zh('Feed On / Sulianya'),'Feed On / 苏恋雅');
assert.equal(zh('Cassette / Caelan'),'磁带 / 庆怜');
assert.equal(zh('Show Me Love / WizTheMc · bees & honey · Tia Ray'),'Show Me Love / WizTheMc · bees & honey · 袁娅维');
assert.equal(zh('Juliet — CD Case / Lotus Flow'),'Juliet — CD 唱片盒 / Lotus Flow');
for(const [source,translation] of Object.entries(chinese.window.LotusTranslations))for(const lang of ['zh','en'])assert.ok(translation[lang]?.trim(),`${lang} missing: ${source}`);
const pages=['dist/index.html','dist/jewel-case.html',...fs.readdirSync('dist/works').filter(f=>f.endsWith('.html')).map(f=>'dist/works/'+f),'dist/films/index.html','dist/collaborators/index.html'];
for(const page of pages){const html=fs.readFileSync(page,'utf8');assert.match(html,/site-translations\.js/);assert.match(html,/site-i18n\.js/);assert.match(html,/site-i18n\.css/);}
console.log(`Bilingual checks passed: ${pages.length} pages, ${chinese.window.lotusCatalog.length} records, language preferences, dynamic player labels and original names.`);
