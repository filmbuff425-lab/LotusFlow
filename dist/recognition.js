import {recognitionData} from './recognition-data.js?v=20261006-lake-surface1';
import {recognitionBrand} from './recognition-brands.js?v=20261006-lake-surface1';
import {awardVisuals} from './recognition-visuals.js?v=20261006-lake-surface1';
const checkedOn='4 OCT 2026';
const names={award:'AWARD',nomination:'NOMINATION',chart:'CHART',reach:'AUDIENCE',editorial:'EDITORIAL',press:'PRESS',certification:'CERTIFICATION'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sourceLink=s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} <span aria-hidden="true">↗</span></a>`;
function brandMarkup(f){const b=recognitionBrand(f);return `<div class="recognition-brand">${b.asset?`<a href="${esc(f.sources[0].url)}" target="_blank" rel="noopener noreferrer" class="recognition-brand-mark ${b.form==='icon'?'is-icon':''} ${b.surface==='light'?'on-paper':''}"><img src="${esc(new URL(b.asset,import.meta.url).href)}" alt="${esc(b.name)}" width="100" height="40" loading="lazy"></a>`:''}<span class="recognition-brand-name"><strong>${esc(b.name)}</strong><span>${esc(b.role)}</span></span></div>`}
function awardVisualMarkup(f){
 const visual=awardVisuals[f.id];if(!visual)return '';
 return `<figure class="recognition-award-visual"><button type="button" data-award-image="${esc(f.id)}" aria-label="Enlarge award image: ${esc(f.label)}"><img src="${esc(new URL(visual.previewAsset||visual.asset,import.meta.url).href)}" alt="${esc(visual.alt)}" width="${visual.width}" height="${visual.height}" loading="lazy"><span class="recognition-image-invitation">VIEW AWARD IMAGE <span aria-hidden="true">＋</span></span></button><figcaption>${esc(visual.caption)} <a href="${esc(visual.source)}" target="_blank" rel="noopener noreferrer" aria-label="Image source: ${esc(visual.sourceLabel)}">SOURCE ↗</a></figcaption></figure>`;
}
let imageDialog;
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-award-image]');if(!button)return;
 const visual=awardVisuals[button.dataset.awardImage];if(!visual)return;
 if(!imageDialog){imageDialog=document.createElement('dialog');imageDialog.className='recognition-image-dialog';imageDialog.setAttribute('aria-label','Official award image');document.body.append(imageDialog);imageDialog.addEventListener('click',e=>{if(e.target===imageDialog||e.target.closest('[data-close-award-image]'))imageDialog.close();const zoom=e.target.closest('[data-award-zoom]');if(zoom){const expanded=imageDialog.classList.toggle('is-image-zoomed');zoom.textContent=expanded?'FIT IMAGE':'READ FULL SIZE';zoom.setAttribute('aria-pressed',String(expanded));}});}
 imageDialog.classList.remove('is-image-zoomed');
 imageDialog.innerHTML=`<header><span>AWARD / ORIGINAL ARTWORK</span><div><button type="button" data-award-zoom aria-pressed="false">READ FULL SIZE</button><button type="button" data-close-award-image aria-label="Close award image">CLOSE ×</button></div></header><figure><img src="${esc(new URL(visual.asset,import.meta.url).href)}" alt="${esc(visual.alt)}" width="${visual.width}" height="${visual.height}"><figcaption><strong>${esc(visual.caption)}</strong><span>${esc(visual.context)}</span><a href="${esc(visual.source)}" target="_blank" rel="noopener noreferrer">${esc(visual.sourceLabel)} ↗</a></figcaption></figure>`;
 imageDialog.showModal();
});
function evidenceMarkup(f,{open=false}={}){return `<details class="recognition-evidence"${open?' open':''}><summary><span>SOURCE DETAILS</span><span aria-hidden="true">＋</span></summary><div class="recognition-evidence-body"><span class="recognition-source-date">${esc(f.dateLabel)}</span><div class="recognition-provenance">${f.sources.map(sourceLink).join('')}</div></div></details>`}
function factMarkup(f){return `<li class="recognition-fact" data-kind="${esc(f.type)}">${brandMarkup(f)}<span class="recognition-kind">${esc(names[f.type])} <span>/ ${esc(f.scopeLabel)}</span></span>${awardVisualMarkup(f)}<div class="recognition-fact-title"><strong>${esc(f.value)}</strong><span>${esc(f.label)}</span></div><p>${esc(f.description)}</p>${evidenceMarkup(f)}</li>`}
// Album, stage and original-recording contexts never become personal awards.
export function mountRecognition(host,track,{compact=false}={}){
 const data=recognitionData[track.id]||{facts:[]};host.className='record-recognition'+(compact?' recognition-compact':'');host.dataset.recognitionRecord=track.id;
 const related=data.context?`<article class="recognition-context recognition-fact">${brandMarkup({id:'original-ifpi-context',sources:data.context.sources})}<div class="recognition-fact-title"><strong>${esc(data.context.value)}</strong><span>${esc(data.context.label)}</span></div><p>${esc(data.context.description)}</p>${evidenceMarkup(data.context)}</article>`:'';
 host.innerHTML=`<div class="recognition-label"><i aria-hidden="true"></i><span>RECOGNITION & REACH</span></div>${data.facts.length?`<ul class="recognition-facts"${compact?' tabindex="0" aria-label="Recognition and source details"':''}>${data.facts.map(factMarkup).join('')}</ul>`:related?'':`<div class="recognition-unlisted"><p>Explore this recording on its official release page.</p>${sourceLink({label:'OFFICIAL RELEASE',url:track.url})}</div>`}${related}`;return data.facts.length;
}
// Small recording context for the home caption, video player and studio screens.
// All surfaces read the same scoped copy as the complete release details.
export function mountRecordingContext(host,track){
 const context=recognitionData[track.id]?.context;host.hidden=!context;
 host.className='recording-context-summary';host.dataset.recognitionRecord=track.id;
 host.innerHTML=context?`<a href="${esc(context.sources[0].url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(context.value)}</strong><span>${esc(context.label)} ↗</span></a><p>${esc(context.description)}</p>`:'';
}
function createOverview(root){
 const tracks=window.lotusCatalog;if(!tracks)return;
 const section=document.createElement('section');section.id='recognition';section.className='recognition-overview';section.setAttribute('aria-labelledby','recognition-title');
 section.innerHTML=`<div class="recognition-overview-heading"><div><p class="recognition-eyebrow"><i aria-hidden="true"></i> RECOGNITION & REACH</p><h2 id="recognition-title">Beyond the record<span>.</span></h2></div><p>The moments behind the music.<br><span>Select a record. Explore its story.</span></p></div><div class="recognition-filters" role="group" aria-label="Filter recognition"><button type="button" data-recognition-filter="all" aria-pressed="true">Highlights</button><button type="button" data-recognition-filter="award" aria-pressed="false">Awards & nominations</button><button type="button" data-recognition-filter="reach" aria-pressed="false">Charts & audience</button><button type="button" data-recognition-filter="editorial" aria-pressed="false">Editorial & press</button><button type="button" data-recognition-filter="artist" aria-pressed="false">Artist releases</button></div><div class="recognition-explorer"><div class="recognition-selectors" role="group" aria-label="Select a record’s recognition"></div><div class="recognition-detail"><div class="recognition-feature" id="recognition-feature"></div><div class="recognition-feature-footer"><a class="recognition-record-link">EXPLORE RECORD <span aria-hidden="true">↗</span></a><div class="recognition-pager"><span class="recognition-page-count"></span><button type="button" data-fact-step="-1" aria-label="Previous achievement">←</button><button type="button" data-fact-step="1" aria-label="Next achievement">→</button></div></div></div></div><p class="recognition-status" role="status" aria-live="polite"></p><div class="recognition-overview-footer"><p>Album, track & stage recognition. Every claim links to its source.</p><button class="recognition-more" type="button" aria-expanded="false" aria-controls="recognition-more-list">ALL RECOGNITION <span aria-hidden="true">＋</span></button></div><div id="recognition-more-list" class="recognition-more-list" hidden></div><p class="recognition-update">DATED SNAPSHOTS / SOURCES REVIEWED ${checkedOn}</p>`;
 root.querySelector('#record-inspector').after(section);
 const selectors=section.querySelector('.recognition-selectors'),feature=section.querySelector('.recognition-feature'),more=section.querySelector('.recognition-more-list'),expand=section.querySelector('.recognition-more');
 const selected=['show-me-love','bridge','airtight','juliet','train-to-nowhere'];let category='all',entries=[],activeId='',factIndex=0;
 const matches=f=>['all','artist'].includes(category)||(category==='award'?['award','nomination'].includes(f.type):category==='reach'?['reach','chart'].includes(f.type):['editorial','press'].includes(f.type));
 const allFacts=id=>{const data=recognitionData[id];if(!data)return [];return [...data.facts,...(data.context?[{...data.context,id:'original-ifpi-context',type:'certification',scopeLabel:'Original recording'}]:[])]};
 const recordFacts=id=>allFacts(id).filter(matches).sort((a,b)=>Number(Boolean(awardVisuals[b.id]))-Number(Boolean(awardVisuals[a.id])));
 const activeFacts=()=>recordFacts(activeId);
 function renderFeature(announce=false){
  const track=entries.find(t=>t.id===activeId),facts=activeFacts(),f=facts[factIndex];
  feature.innerHTML=`<div class="recognition-feature-content"><div class="recognition-feature-top">${brandMarkup(f)}<span class="recognition-kind">${esc(names[f.type])}<span>${esc(f.scopeLabel)}</span></span></div><div class="recognition-feature-result${awardVisuals[f.id]?' has-award-visual':''}"><div><h3>${esc(f.value)}</h3><p class="recognition-feature-award">${esc(f.label)}</p></div>${awardVisuals[f.id]?awardVisualMarkup(f):`<a href="${esc(track.detailUrl)}#recognition" class="recognition-art-link" aria-label="Open ${esc(track.title)} record details"><img class="recognition-art" src="${esc(track.image)}" alt="${esc(track.title)} cover" width="130" height="130"><span aria-hidden="true">↗</span></a>`}</div><p class="recognition-feature-description">${esc(f.description)}</p>${evidenceMarkup(f,{open:true})}</div>`;
  section.querySelector('.recognition-record-link').href=`${track.detailUrl}#recognition`;section.querySelector('.recognition-record-link').setAttribute('aria-label',`Explore ${track.title} record`);
  section.querySelector('.recognition-page-count').textContent=`${String(factIndex+1).padStart(2,'0')} / ${String(facts.length).padStart(2,'0')}`;
  section.querySelectorAll('[data-fact-step]').forEach(b=>{b.disabled=facts.length<2});selectors.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.record===activeId)));
  if(announce)section.querySelector('.recognition-status').textContent=`${track.title}: ${f.value}. Achievement ${factIndex+1} of ${facts.length}.`;
 }
 function render(){
  entries=tracks.filter(t=>(category!=='artist'||t.categories.includes('artist'))&&allFacts(t.id).some(matches));entries.sort((a,b)=>{const ai=selected.indexOf(a.id),bi=selected.indexOf(b.id);return (ai<0?100:ai)-(bi<0?100:bi)});
  const featured=category==='all'?entries.slice(0,5):entries;activeId=featured[0].id;factIndex=0;
  selectors.innerHTML=featured.map((t,i)=>{const f=recordFacts(t.id)[0];return `<button type="button" class="recognition-select" data-record="${esc(t.id)}" aria-pressed="${t.id===activeId}" aria-controls="recognition-feature"><span class="recognition-select-number">${String(i+1).padStart(2,'0')}</span><img src="${esc(t.image)}" alt="" width="48" height="48" loading="lazy"><span class="recognition-select-copy"><strong>${esc(t.title)}</strong><span>${esc(t.artist)}</span><small>${esc(f.shortValue||f.value)}</small></span><span class="recognition-select-arrow" aria-hidden="true">↗</span></button>`}).join('');
  more.replaceChildren();for(const t of entries){const article=document.createElement('article');article.innerHTML=`<div class="recognition-list-heading"><img src="${esc(t.image)}" alt="" width="40" height="40" loading="lazy"><div><h3><a href="${esc(t.detailUrl)}#recognition">${esc(t.title)} <span aria-hidden="true">↗</span></a></h3><p>${esc(t.artist)}</p></div></div><ul class="recognition-facts">${recordFacts(t.id).map(factMarkup).join('')}</ul>`;more.append(article)}
  section.querySelectorAll('[data-recognition-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.recognitionFilter===category)));renderFeature();
 }
 selectors.addEventListener('click',e=>{const b=e.target.closest('[data-record]');if(!b)return;activeId=b.dataset.record;factIndex=0;renderFeature(true)});
 section.querySelectorAll('[data-fact-step]').forEach(b=>b.addEventListener('click',()=>{const length=activeFacts().length;factIndex=(factIndex+Number(b.dataset.factStep)+length)%length;renderFeature(true)}));
 section.querySelectorAll('[data-recognition-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.recognitionFilter;render();section.querySelector('.recognition-status').textContent=`${b.textContent}: ${entries.length} records.`}));
 expand.addEventListener('click',()=>{const open=more.hidden;more.hidden=!open;expand.setAttribute('aria-expanded',String(open));expand.innerHTML=`${open?'LESS RECOGNITION':'ALL RECOGNITION'} <span aria-hidden="true">${open?'−':'＋'}</span>`});render();
}
function init(){
 const root=document.querySelector('.record-shop');if(root)createOverview(root);const id=document.body.dataset.release;
 if(id){const track=window.lotusCatalog?.find(t=>t.id===id);if(track){const section=document.createElement('section');section.id='recognition';section.setAttribute('aria-label','Recognition and reach');document.querySelector('.contribution')?.after(section);mountRecognition(section,track);section.classList.add('release-recognition-section')}}
 if(location.hash==='#recognition')requestAnimationFrame(()=>document.querySelector('#recognition')?.scrollIntoView());
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
