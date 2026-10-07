const tracks=window.lotusCatalog;
document.querySelectorAll('[data-filter]').forEach(b=>b.querySelector('span').textContent=String(tracks.filter(t=>b.dataset.filter==='all'||t.categories.includes(b.dataset.filter)).length).padStart(2,'0'));
function bars(count,seed=1){return Array.from({length:count},(_,i)=>`<i style="--bar:${8+Math.abs(Math.sin(i*1.39+seed)*Math.cos(i*.31+seed))*80}%;--speed:${.3+(i%7)*.12}s"></i>`).join('')}
const list=document.getElementById('track-list');
list.innerHTML=tracks.map((t,i)=>`<article class="track" tabindex="0" role="button" aria-label="Open ${t.title} and play" data-id="${t.id}" style="--track-color:${t.color}"><span class="track-num">${String(i+1).padStart(2,'0')}</span><div class="track-art" aria-hidden="true"></div><div class="track-title"><h3>${t.title}</h3><p>${t.artist}</p></div><div class="track-meta">${t.role.replace(' / ',' /<br>')}<br>${t.year}</div><div class="track-preview" aria-hidden="true">${bars(34,i+3)}</div><span class="track-open" aria-hidden="true">＋</span></article>`).join('');
document.querySelector('.transport-wave').innerHTML=bars(29,2);

const channels=[{id:'kick',name:'KICK',color:'#ef3340',value:72},{id:'snare',name:'SNARE',color:'#ef3340',value:68},{id:'hats',name:'HI-HATS',color:'#ee7f64',value:56},{id:'bass',name:'BASS',color:'#e6c575',value:62},{id:'keys',name:'KEYS',color:'#80cad0',value:55},{id:'lead',name:'LEAD',color:'#a0afd4',value:38},{id:'pad',name:'PAD',color:'#baa1ce',value:40},{id:'fx',name:'FX',color:'#b5b5b5',value:35}].map(c=>({...c,initial:c.value,mute:false,solo:false,pan:0,hpf:20,low:0,mid:0,high:0,room:-60,delay:-60}));
document.getElementById('mixer-channels').innerHTML=channels.map((c,i)=>`<div class="channel" data-channel="${c.id}" style="--channel-color:${c.color}"><span class="channel-name">${c.name}</span><div class="channel-wave" aria-hidden="true">${bars(17,i+1)}</div><div class="fader-wrap"><input id="fader-${c.id}" type="range" min="0" max="100" value="${c.value}" aria-label="${c.name} volume" aria-orientation="vertical"></div><output class="channel-level" for="fader-${c.id}">${c.value}%</output><div class="channel-buttons"><button data-action="mute" aria-label="Mute ${c.name}" aria-pressed="false">M</button><button data-action="solo" aria-label="Solo ${c.name}" aria-pressed="false">S</button></div></div>`).join('');

const audioState={playing:false,muted:false,context:null,master:null,gains:[],step:0,nextTime:0,timer:null,startTime:0,elapsed:0,voices:new Set(),noise:null};
function notify(message){const el=document.getElementById('notification');el.textContent=message;el.classList.add('visible');clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.classList.remove('visible'),4500)}
function initAudio(){
 const AudioCtx=window.AudioContext||window.webkitAudioContext;
 if(!AudioCtx)throw new Error('Your browser does not support this audio demo. Please use a browser with Web Audio support.');
 const ctx=new AudioCtx();audioState.context=ctx;const master=ctx.createGain();master.gain.value=audioState.muted?0:.42;
 const limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-16;limiter.knee.value=18;limiter.ratio.value=5;
 master.connect(limiter).connect(ctx.destination);audioState.master=master;
 audioState.engine=window.createLotusSignalEngine(ctx,channels,master,limiter);audioState.gains=audioState.engine.gains;audioState.inputs=audioState.engine.inputs;
 const noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;audioState.noise=noise;updateMix();
 ctx.onstatechange=()=>{if(ctx.state==='closed'){audioState.context=null;audioState.playing=false;syncPlayback()}};
}
function addVoice(voice){audioState.voices.add(voice);voice.onended=()=>{audioState.voices.delete(voice);try{voice.disconnect()}catch{}}}
function tone(freq,time,duration,channel,volume=.2,type='sine',detune=0){
 const ctx=audioState.context,o=ctx.createOscillator(),env=ctx.createGain();o.type=type;o.frequency.value=freq;o.detune.value=detune;
 env.gain.setValueAtTime(.0001,time);env.gain.exponentialRampToValueAtTime(volume,time+.012);env.gain.exponentialRampToValueAtTime(.0001,time+duration);
 o.connect(env).connect(audioState.inputs[channel]);o.start(time);o.stop(time+duration+.03);addVoice(o);
}
function percussion(time,kind){
 const ctx=audioState.context;
 if(kind==='kick'){const o=ctx.createOscillator(),env=ctx.createGain();o.frequency.setValueAtTime(135,time);o.frequency.exponentialRampToValueAtTime(44,time+.15);env.gain.setValueAtTime(.85,time);env.gain.exponentialRampToValueAtTime(.0001,time+.36);o.connect(env).connect(audioState.inputs[0]);o.start(time);o.stop(time+.4);addVoice(o);return}
 const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),env=ctx.createGain();n.buffer=audioState.noise;f.type='highpass';f.frequency.value=kind==='snare'?1600:7500;const duration=kind==='snare'?.15:.035;
 env.gain.setValueAtTime(kind==='snare'?.34:.11,time);env.gain.exponentialRampToValueAtTime(.0001,time+duration);n.connect(f).connect(env).connect(audioState.inputs[kind==='snare'?1:2]);n.start(time);n.stop(time+duration+.02);addVoice(n);
}
const midi=n=>440*Math.pow(2,(n-69)/12);
const progression=[[45,57,60,64,71],[41,57,60,64,69],[48,55,59,62,67],[43,55,59,62,69]];
const melody=[76,null,72,null,71,null,69,72,76,null,79,null,76,74,72,null];
function scheduleStep(step,time){const beat=60/104/4,bar=Math.floor(step/16)%4,pos=step%16,chord=progression[bar];
 if([0,7,8,14].includes(pos))percussion(time,'kick');if(pos===4||pos===12)percussion(time,'snare');if(pos%2===0)percussion(time+(pos%4===2?.016:0),'hat');
 if([0,6,10].includes(pos)){tone(midi(chord[0]),time,beat*3.7,3,.5);tone(midi(chord[0]+12),time,beat*2,3,.06,'triangle')}
 if(pos===0||pos===10){chord.slice(1).forEach((note,i)=>{tone(midi(note),time+i*.012,1.3,4,.105,'triangle');tone(midi(note+12),time+i*.012,.9,4,.026)})}
 if(pos===0)chord.slice(1,4).forEach((note,i)=>tone(midi(note),time+i*.04,2.7,6,.035,'sine'));
 const note=melody[(pos+bar*2)%16];if(note!==null){tone(midi(note),time,.55,5,.08);tone(midi(note),time+beat*1.5,.5,7,.022)}
}
function scheduler(){const ctx=audioState.context;if(!ctx||!audioState.playing)return;while(audioState.nextTime<ctx.currentTime+.12){scheduleStep(audioState.step,audioState.nextTime);audioState.nextTime+=60/104/4;audioState.step=(audioState.step+1)%64}}
async function togglePlayback(){if(togglePlayback.busy)return;togglePlayback.busy=true;try{
 if(audioState.playing){pausePlayback();return}
 if(!audioState.context)initAudio();await audioState.context.resume();
 if(audioState.context.state!=='running')throw new Error('Audio is not ready. Please press play again.');
 window.dispatchEvent(new CustomEvent('lotus-audio-start',{detail:'session'}));audioState.playing=true;audioState.nextTime=audioState.context.currentTime+.06;audioState.startTime=performance.now();audioState.timer=setInterval(scheduler,25);scheduler();syncPlayback();
 }catch(error){pausePlayback();notify(error.message||'Audio is unavailable. Please try again.')}finally{togglePlayback.busy=false}}
function pausePlayback(){if(audioState.playing)audioState.elapsed+=performance.now()-audioState.startTime;audioState.playing=false;clearInterval(audioState.timer);for(const voice of audioState.voices){try{voice.stop()}catch{}}audioState.voices.clear();syncPlayback()}
function syncPlayback(){document.body.classList.toggle('playing',audioState.playing);document.getElementById('session-play').textContent=audioState.playing?'Ⅱ PAUSE SESSION':'▶ PLAY SESSION';document.getElementById('transport-play').textContent=audioState.playing?'Ⅱ':'▶';document.getElementById('transport-play').setAttribute('aria-label',audioState.playing?'Pause sound demo':'Play sound demo');document.getElementById('session-status').textContent=audioState.playing?'SESSION IN FLOW':'READY WHEN YOU ARE'}
function updateMix(){const soloing=channels.some(c=>c.solo);channels.forEach((c,i)=>{const enabled=!c.mute&&(!soloing||c.solo);const el=document.querySelector(`[data-channel="${c.id}"]`);el.classList.toggle('is-muted',!enabled);el.querySelector('input').value=c.value;el.querySelector('output').textContent=`${c.value}%`;el.querySelector('[data-action=mute]').setAttribute('aria-pressed',String(c.mute));el.querySelector('[data-action=solo]').setAttribute('aria-pressed',String(c.solo));if(audioState.gains[i])audioState.gains[i].gain.setTargetAtTime(enabled?Math.pow(c.value/100,1.4):0,audioState.context.currentTime,.025)})}
function setChannel(id,values){const c=channels.find(c=>c.id===id);if(!c)throw new Error('Unknown channel');if(values.volume!==undefined){if(typeof values.volume!=='number'||!Number.isFinite(values.volume)||values.volume<0||values.volume>100)throw new Error('Volume must be between 0 and 100');c.value=Math.round(values.volume)}for(const key of ['mute','solo'])if(values[key]!==undefined){if(typeof values[key]!=='boolean')throw new Error(`${key} must be boolean`);c[key]=values[key]}for(const [key,min,max] of [['pan',-1,1],['hpf',20,1000],['low',-12,12],['mid',-12,12],['high',-12,12],['room',-60,0],['delay',-60,0]])if(values[key]!==undefined){if(!Number.isFinite(values[key])||values[key]<min||values[key]>max)throw new Error('Invalid '+key);c[key]=values[key]}audioState.engine?.update();updateMix()}
channels.forEach(c=>{const el=document.querySelector(`[data-channel="${c.id}"]`);el.querySelector('input').addEventListener('input',e=>setChannel(c.id,{volume:Number(e.target.value)}));el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{const action=b.dataset.action;setChannel(c.id,{[action]:!c[action]})}))});
for(const id of ['session-play','transport-play'])document.getElementById(id).addEventListener('click',togglePlayback);
document.getElementById('reset-mixer').addEventListener('click',()=>{channels.forEach(c=>{c.value=c.initial;c.mute=false;c.solo=false;c.pan=0;c.hpf=20;c.low=c.mid=c.high=0;c.room=c.delay=-60});audioState.engine?.update();audioState.engine?.buses.forEach((b,i)=>audioState.engine.setBus(b.id,i>3?61:100));updateMix();notify('Mix reset. Make it yours.')});
document.getElementById('sound-toggle').addEventListener('click',e=>{audioState.muted=!audioState.muted;e.currentTarget.textContent=audioState.muted?'SOUND OFF':'SOUND ON';e.currentTarget.setAttribute('aria-pressed',String(audioState.muted));e.currentTarget.setAttribute('aria-label',audioState.muted?'Unmute':'Mute');if(audioState.master)audioState.master.gain.setTargetAtTime(audioState.muted?0:.42,audioState.context.currentTime,.03)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&audioState.playing)pausePlayback()});
setInterval(()=>{const elapsed=audioState.elapsed+(audioState.playing?performance.now()-audioState.startTime:0),secs=Math.floor(elapsed/1000);document.getElementById('transport-time').textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')}`},500);

let activeFilter='all';
function filterTracks(filter){if(!['all','production','writing','artist'].includes(filter))throw new Error('Unknown filter');activeFilter=filter;document.querySelectorAll('.track').forEach(el=>{const t=tracks.find(t=>t.id===el.dataset.id);el.hidden=filter!=='all'&&!t.categories.includes(filter)});document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b.dataset.filter===filter);b.setAttribute('aria-pressed',String(b.dataset.filter===filter))});window.dispatchEvent(new CustomEvent('lotus-filter-change',{detail:filter}))}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filterTracks(b.dataset.filter)}));
const dialog=document.getElementById('track-dialog');let dialogTrigger=null;
function openTrack(id,trigger){if(window.lotusReleasePlayer)return window.lotusReleasePlayer.open(id,trigger);const t=tracks.find(t=>t.id===id);if(!t)return;dialogTrigger=trigger;document.getElementById('dialog-content').innerHTML=`<span class="eyebrow mono">SELECTED FREQUENCY / ${t.year}</span>${t.image?`<img src="${t.image}" alt="${t.title} release artwork">`:`<div class="dialog-art" style="background:${t.color}" aria-hidden="true">LF✳</div>`}<h2 id="dialog-title">${t.title}</h2><p>${t.artist}</p><div class="dialog-credits"><span class="mono">LOTUS FLOW / CREDITS</span><p>${t.credits}</p></div><a class="solid-button" href="${t.url}" target="_blank" rel="noopener noreferrer">LISTEN / VIEW RELEASE <span>＋</span></a><p class="dialog-disclosure">Listen and explore the release on the music platform.</p>`;dialog.showModal()}
document.querySelectorAll('.track').forEach(el=>{el.addEventListener('click',()=>openTrack(el.dataset.id,el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTrack(el.dataset.id,el)}})});
document.getElementById('close-dialog').addEventListener('click',()=>{if(window.lotusReleasePlayer)window.lotusReleasePlayer.close();else dialog.close()});dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&e.detail>0&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))(window.lotusReleasePlayer?window.lotusReleasePlayer.close():dialog.close())});dialog.addEventListener('close',()=>dialogTrigger?.focus());
document.getElementById('year').textContent=new Date().getFullYear();

// Structured access uses the same state transitions as the visible controls.
if(document.modelContext?.registerTool){const lifecycle=new AbortController();const tools=[
 {name:'list_lotus_flow_works',title:'List Lotus Flow works',description:'Read the displayed music portfolio and current filter.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({filter:activeFilter,works:tracks.map(({id,title,artist,credits,categories,url})=>({id,title,artist,credits,categories,url}))})},
 {name:'configure_sound_sketch',title:'Configure sound sketch',description:'Set a channel volume, mute, or solo in the interactive demo mixer. Does not start audio playback.',inputSchema:{type:'object',properties:{channel:{type:'string',enum:channels.map(c=>c.id)},volume:{type:'number',minimum:0,maximum:100},mute:{type:'boolean'},solo:{type:'boolean'}},required:['channel'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>!['channel','volume','mute','solo'].includes(k)))throw new Error('Invalid mixer input');for(const k of ['mute','solo'])if(input[k]!==undefined&&typeof input[k]!=='boolean')throw new Error('Invalid boolean');if(input.volume!==undefined&&(typeof input.volume!=='number'||!Number.isFinite(input.volume)||input.volume<0||input.volume>100))throw new Error('Invalid volume');setChannel(input.channel,input);return{playing:audioState.playing,channels:channels.map(({id,value,mute,solo})=>({id,volume:value,mute,solo}))}}}
 ];for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{})}catch{}}window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true})}

// Local editorial assets: public artist portrait and official release artwork.

tracks.forEach(t=>{const art=document.querySelector(`[data-id="${t.id}"] .track-art`);art.innerHTML=t.image?`<img src="${t.image}" alt="" loading="lazy" width="600" height="600">`:`<span class="art-type">${t.title}</span>`});
function setPortfolioView(view){list.classList.toggle('gallery',view==='gallery');list.hidden=view==='vinyl';document.getElementById('work').classList.toggle('vinyl-mode',view==='vinyl');document.getElementById('vinyl-room').hidden=view!=='vinyl';document.getElementById('vinyl-caption').hidden=view!=='vinyl';document.querySelectorAll('[data-view]').forEach(v=>{v.classList.toggle('active',v.dataset.view===view);v.setAttribute('aria-pressed',String(v.dataset.view===view))});window.dispatchEvent(new CustomEvent('lotus-view-change',{detail:view}))}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setPortfolioView(b.dataset.view)));
async function playNote(note){try{if(!audioState.context)initAudio();await audioState.context.resume();tone(midi(note),audioState.context.currentTime+.01,1.05,4,.22,'triangle');tone(midi(note+12),audioState.context.currentTime+.014,.7,4,.045)}catch(error){notify(error.message||'Audio is unavailable.')}}
const silentMeter=()=>({rms:0,peak:0,peakDb:-Infinity,rmsDb:-Infinity,vu:0});
const silentFrame={channels:channels.map(silentMeter),buses:Array.from({length:6},silentMeter),master:[silentMeter(),silentMeter()]};
function readMeters(now){return audioState.engine?audioState.engine.read(now):silentFrame}
function setBus(id,value){if(!audioState.context)initAudio();audioState.engine.setBus(id,value)}
window.lotusSession={channels,audioState,setChannel,togglePlayback,pausePlayback,playNote,readMeters,setBus,progression,melody};
window.dispatchEvent(new Event('lotus-session-ready'));
const visibleMixers=new Set();const mixerObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting)visibleMixers.add(entry.target.id);else visibleMixers.delete(entry.target.id)}document.body.classList.toggle('mix-view',visibleMixers.size>0)},{threshold:.3});mixerObserver.observe(document.getElementById('studio'));mixerObserver.observe(document.getElementById('playground'));

window.lotusPortfolio={tracks,openTrack,filterTracks,setView:setPortfolioView};window.dispatchEvent(new Event('lotus-portfolio-ready'));

window.addEventListener('lotus-audio-start',e=>{if(e.detail!=='session')pausePlayback()});
