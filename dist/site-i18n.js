/* Local, reversible localization. No network request is needed to switch languages. */
(() => {
 const dictionary=window.LotusTranslations||{},key='lotus-language';
 const normalize=value=>String(value).replace(/\s+/g,' ').trim();
 const valid=value=>value==='zh'||value==='en';
 let saved;try{saved=localStorage.getItem(key)}catch{}
 const query=new URLSearchParams(location.search).get('lang');
 let locale=valid(query)?query:valid(saved)?saved:'en';
 const sourceText=new WeakMap(),sourceAttributes=new WeakMap(),symbolSources=new WeakMap();
 const skip='script,style,svg,[translate="no"],.site-language-switch,.studio-heading,#about-title,.mac-side-note';
 const attributes=['aria-label','placeholder','title','label','alt','content'];
 const terms=Object.entries(window.LotusTranslationTerms||{}).sort((a,b)=>b[0].length-a[0].length);
 const rolePattern=new RegExp(terms.map(([en])=>en.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'gi');
 const termMap=new Map(terms.map(([en,zh])=>[en.toLowerCase(),zh]));
 const months={JAN:'1月',FEB:'2月',MAR:'3月',APR:'4月',MAY:'5月',JUN:'6月',JUL:'7月',AUG:'8月',SEP:'9月',OCT:'10月',NOV:'11月',DEC:'12月',January:'1月',February:'2月',March:'3月',April:'4月',June:'6月',July:'7月',August:'8月',September:'9月',October:'10月',November:'11月',December:'12月',May:'5月'};
 const phrase=value=>{
  const exact=dictionary[normalize(value)];if(exact)return exact[locale];
  const s=normalize(value);
  let m;
  if(locale==='en'){
   if((m=s.match(/^(打开|合上) (.+) 透明 CD 盒$/)))return (m[1]==='打开'?'Open ':'Close ')+m[2]+' clear CD case';
   if(/^.+ 完整歌曲$/.test(s))return s.replace(/ 完整歌曲$/,' full track');
   return value;
  }
  if((m=s.match(/^([←↗↙↑↓＋×▶︎Ⅱ⌘♫▷≋]+\s*)?(.*?)(\s*[↗↙↑↓＋×]+|\.)?$/))&&dictionary[m[2]])return (m[1]||'')+dictionary[m[2]].zh+(m[3]||'');
  if((m=s.match(/^(\d{2}\s*(?:\/\s*)?)(.+)$/))&&(dictionary[m[2]]||dictionary[m[2].toUpperCase()]))return m[1]+(dictionary[m[2]]||dictionary[m[2].toUpperCase()]).zh;
  if((m=s.match(/^(.+) — CD Case \/ Lotus Flow$/)))return m[1]+' — CD 唱片盒 / Lotus Flow';
  if((m=s.match(/^(\d+) (RELEASES|RECORDS|ARTISTS & COLLABORATORS|FILES?|FOUND)(.*)$/)))return `${m[1]} ${({'RELEASES':'张作品','RECORDS':'张唱片','ARTISTS & COLLABORATORS':'位合作艺人','FILE':'位艺人','FILES':'位艺人','FOUND':'个结果'})[m[2]]}${m[3]}`;
  if((m=s.match(/^(Enlarge award image|Image source): (.+)$/)))return (m[1]==='Enlarge award image'?'放大获奖图片：':'图片来源：')+m[2];
  if((m=s.match(/^Explore (.+) record$/)))return '探索 '+m[1]+' 唱片';
  if((m=s.match(/^([/·:]\s*)(.+)$/))&&dictionary[m[2]])return m[1]+dictionary[m[2]].zh;
  if((m=s.match(/^ON SCREEN \/ (.+)$/)))return '音乐影像 / '+phrase(m[1]);
  if((m=s.match(/^(.+ \/ )?([A-Za-z]+) (\d{4})$/))&&months[m[2]])return (m[1]||'')+m[3]+'年'+months[m[2]];
  if((m=s.match(/^CD COLLECTION \/ (\d+)$/)))return 'CD 收藏 / '+m[1];
  if((m=s.match(/^NEXT RELEASE \/ (.+)$/)))return '下一张作品 / '+m[1];
  if((m=s.match(/^(NOW PLAYING|PAUSED) \/ (.+)$/)))return (m[1]==='PAUSED'?'已暂停':'正在播放')+' / '+m[2].replace(' · OFFICIAL PREVIEW',' · 官方试听');
  if((m=s.match(/^(.+) official accounts$/)))return m[1]+' 官方账号';
  if((m=s.match(/^(.+) (CD, audio and artist details|interactive CD|official music video|music film|official visualizer|animated music video|live performance|portrait|cover|full track|official preview)$/)))return m[1]+' '+({'CD, audio and artist details':'CD、音频与艺人详情','interactive CD':'互动 CD','official music video':'官方音乐视频','music film':'音乐影像','official visualizer':'官方视觉视频','animated music video':'动画音乐视频','live performance':'现场表演',portrait:'肖像',cover:'封面','full track':'完整歌曲','official preview':'官方试听'})[m[2]];
  if((m=s.match(/^Open (.+?)(?: and play| record details)?$/)))return '打开 '+m[1];
  if((m=s.match(/^(Play|Pause) (.+)$/)))return (m[1]==='Play'?'播放':'暂停')+' '+(dictionary[m[2]]?.zh||m[2].replace('music video','音乐视频').replace('studio song','工作室歌曲').replace('record','唱片'));
  if((m=s.match(/^(Mute|Solo) (.+)$/)))return (m[1]==='Mute'?'静音':'独奏')+' '+(dictionary[m[2]]?.zh||m[2]);
  if((m=s.match(/^(.+) volume$/)))return (dictionary[m[1]]?.zh||m[1])+' 音量';
  if((m=s.match(/^(.+): (.+)\. Achievement (\d+) of (\d+)\.$/)))return `${m[1]}：${phrase(m[2])}。第 ${m[3]} 项，共 ${m[4]} 项。`;
  if((m=s.match(/^(.+): (\d+) records\.$/)))return `${phrase(m[1])}：${m[2]} 张唱片。`;
  if((m=s.match(/^(DATED SNAPSHOTS \/ SOURCES REVIEWED|SOURCE REVIEW \/|REPORTED \/)\s*(.+)$/)))return (m[1].startsWith('DATED')?'数据快照 / 来源核对 ':m[1].startsWith('SOURCE')?'来源核对 / ':'发布于 / ')+phrase(m[2]);
  if((m=s.match(/^(\d+) ([A-Za-z]+) (\d{4})(.*)$/))&&months[m[2]])return `${m[3]}年${months[m[2]]}${m[1]}日${m[4]}`;
  if((m=s.match(/^(\d{4}) \/ (OFFICIAL AWARD POSTER|AWARD ACCEPTANCE PHOTO)$/)))return m[1]+' / '+(m[2]==='OFFICIAL AWARD POSTER'?'官方获奖海报':'领奖照片');
  if((m=s.match(/^(\d{4}) YEAR-END$/)))return m[1]+' 年度';
  // Credits are structured labels; long descriptive paragraphs have curated translations above.
  if(s.length<150&&(/^[A-Z\d\s/·&—:(),.-]+$/.test(s)||/^(Co-|Production ·|Lyrics ·|Composition ·|Production \/|Artist release ·)/.test(s))){
   const result=s.replace(rolePattern,part=>termMap.get(part.toLowerCase()));if(result!==s)return result;
  }
  return value;
 };
 const isSkipped=node=>node.parentElement?.closest(skip);
 const symbolPattern=/([↗↙↖↘▶◀⚙])[\uFE0E\uFE0F]?/g;
 const symbolPaths={
  '↗':'<path d="M4 16 16 4M5 4h11v11"/>',
  '↙':'<path d="M16 4 4 16M4 5v11h11"/>',
  '↖':'<path d="M16 16 4 4M4 15V4h11"/>',
  '↘':'<path d="M4 4 16 16M5 16h11V5"/>',
  '▶':'<path d="m6 3 12 7L6 17Z" fill="currentColor" stroke="none"/>',
  '◀':'<path d="m14 3-12 7 12 7Z" fill="currentColor" stroke="none"/>',
  '⚙':'<circle cx="10" cy="10" r="5.5"/><circle cx="10" cy="10" r="2"/><path d="M10 2v2m0 12v2M2 10h2m12 0h2M4.3 4.3l1.4 1.4m8.6 8.6 1.4 1.4M4.3 15.7l1.4-1.4m8.6-8.6 1.4-1.4"/>'
 };
 function symbolCopy(copy){
  const source=symbolSources.get(copy);if(source===undefined)return;
  const rendered=phrase(source);if(copy.dataset.symbolLocale===locale&&copy.dataset.symbolText===rendered)return;
  const parts=rendered.split(symbolPattern),fragment=document.createDocumentFragment();
  parts.forEach(part=>{if(symbolPaths[part]){const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 20 20');icon.setAttribute('aria-hidden','true');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.7');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');icon.classList.add('interface-arrow');icon.innerHTML=symbolPaths[part];fragment.append(icon)}else fragment.append(document.createTextNode(part))});
  copy.replaceChildren(fragment);copy.dataset.symbolLocale=locale;copy.dataset.symbolText=rendered;
 }
 function textNode(node){
  if(isSkipped(node)||!normalize(node.data))return;
  let entry=sourceText.get(node);
  // A player can replace its label at any time. Adopt that new source, never a stale previous state.
  if(!entry||node.data!==entry.rendered)entry={source:node.data,rendered:node.data};
  const translated=phrase(entry.source),padding=entry.source.match(/^(\s*)[\s\S]*?(\s*)$/);
  const next=translated===entry.source?entry.source:padding[1]+translated+padding[2];
  if(/[↗↙↖↘▶◀⚙]/.test(entry.source)){const copy=document.createElement('span');copy.className='interface-copy';copy.setAttribute('translate','no');symbolSources.set(copy,entry.source);symbolCopy(copy);node.replaceWith(copy);return}
  if(node.data!==next)node.data=next;
  entry.rendered=next;sourceText.set(node,entry);
 }
 function elementAttributes(el){
  if(el.closest(skip))return;
  const entries=sourceAttributes.get(el)||{};
  for(const name of attributes){
   if(name==='content'&&!(el.tagName==='META'&&el.getAttribute('name')==='description'))continue;
   if(!el.hasAttribute(name))continue;
   const current=el.getAttribute(name);let entry=entries[name];
   if(!entry||current!==entry.rendered)entry={source:current,rendered:current};
   const next=phrase(entry.source);if(current!==next)el.setAttribute(name,next);
   entry.rendered=next;entries[name]=entry;
  }
  sourceAttributes.set(el,entries);
 }
 function translateTree(root){
  if(root.nodeType===3){textNode(root);return}
  if(root.nodeType!==1&&root.nodeType!==9)return;
  if(root.nodeType===1&&symbolSources.has(root)){symbolCopy(root);return}
  root.querySelectorAll('.interface-copy').forEach(symbolCopy);
  if(root.nodeType===1&&root.closest(skip))return;
  if(root.nodeType===1)elementAttributes(root);
  root.querySelectorAll('[aria-label],[placeholder],[title],[label],[alt],meta[name="description"]').forEach(elementAttributes);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node;
  while((node=walker.nextNode()))nodes.push(node);
  nodes.forEach(textNode);
 }
 let observer,pending=false;const dirty=new Set();
 const observe=()=>observer?.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
 function flush(){pending=false;observer.disconnect();for(const node of dirty)if(node.isConnected)translateTree(node);dirty.clear();observe()}
 function controls(){
  const header=document.querySelector('header.header,header.archive-header');if(!header)return;
  const group=document.createElement('div');group.className='site-language-switch';group.setAttribute('role','group');group.setAttribute('aria-label','Website language / 网站语言');group.innerHTML='<button type="button" data-site-lang="en" lang="en" aria-label="View in English">EN</button><span aria-hidden="true">/</span><button type="button" data-site-lang="zh" lang="zh-CN" aria-label="切换为中文">中</button>';
  group.addEventListener('click',event=>{const button=event.target.closest('[data-site-lang]');if(button)setLocale(button.dataset.siteLang,true)});header.append(group);
 }
 function setLocale(next,persist=false){
  if(!valid(next))return;locale=next;
  if(persist){try{localStorage.setItem(key,next)}catch{}const u=new URL(location.href);u.searchParams.set('lang',next);history.replaceState(null,'',u)}
  document.documentElement.lang=next==='zh'?'zh-CN':'en';document.documentElement.dataset.language=next;
  observer?.disconnect();translateTree(document);document.querySelectorAll('[data-site-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.siteLang===next)));observe();
  document.querySelectorAll('iframe').forEach(frame=>{try{if(new URL(frame.src,location.href).origin===location.origin)frame.contentWindow.postMessage({type:'lotus-language',locale:next},location.origin)}catch{}});
  window.dispatchEvent(new CustomEvent('lotus-language-change',{detail:next}));
 }
 window.lotusI18n={get language(){return locale},translate:phrase,setLanguage:next=>setLocale(next,true)};
 document.documentElement.lang=locale==='zh'?'zh-CN':'en';document.documentElement.dataset.language=locale;
 if(valid(query))try{localStorage.setItem(key,locale)}catch{}
 function init(){controls();observer=new MutationObserver(records=>{for(const record of records){if(record.type==='childList')record.addedNodes.forEach(node=>dirty.add(node));else dirty.add(record.target)}if(dirty.size&&!pending){pending=true;queueMicrotask(flush)}});setLocale(locale);document.addEventListener('load',event=>{if(event.target.tagName==='IFRAME')try{if(new URL(event.target.src,location.href).origin===location.origin)event.target.contentWindow.postMessage({type:'lotus-language',locale},location.origin)}catch{}},true)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.addEventListener('storage',event=>{if(event.key===key&&valid(event.newValue)&&event.newValue!==locale)setLocale(event.newValue)});
 window.addEventListener('message',event=>{if(event.origin===location.origin&&event.data?.type==='lotus-language'&&valid(event.data.locale)&&event.data.locale!==locale)setLocale(event.data.locale)});
})();
