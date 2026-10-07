const stage=document.querySelector('#studio-stage');
const toggle=document.createElement('button');
toggle.className='cube-sound-toggle mono';toggle.type='button';
toggle.textContent='HEARTBEAT / ENABLE';toggle.setAttribute('aria-pressed','false');
toggle.setAttribute('aria-label','Enable heartbeat sound');stage.append(toggle);
// The original paired heartbeat has its own media channel. Its clock must not
// depend on the interaction-sound AudioContext or on the background music.
const heart=document.createElement('audio');heart.src=new URL('./assets/audio/cube-heart.wav',import.meta.url).href;
heart.preload='auto';heart.dataset.heartbeat='true';heart.setAttribute('aria-hidden','true');document.body.append(heart);
let armed=false,arming,muted=false,visible=false,inside=false,cycle=-1,fade=0,plays=0,lastDiagnostic=-1;
function label(){const on=armed&&!muted;toggle.textContent=muted?'HEARTBEAT / OFF':on?'HEARTBEAT / ON':'HEARTBEAT / ENABLE';toggle.setAttribute('aria-pressed',String(on));toggle.setAttribute('aria-label',on?'Mute heartbeat sound':'Enable heartbeat sound');toggle.dataset.audioState=armed?'ready':'needs-gesture'}
export async function armHeartbeat(){
 if(arming)return arming;if(armed)return;
 arming=(async()=>{try{heart.volume=0;await heart.play();heart.pause();heart.currentTime=0;armed=true;label()}catch{toggle.dataset.audioState='needs-gesture';toggle.textContent='HEARTBEAT / RETRY';toggle.setAttribute('aria-pressed','false')}finally{arming=null}})();return arming;
}
function stop(){clearInterval(fade);fade=0;if(heart.paused)return;if(document.hidden){heart.pause();return}fade=setInterval(()=>{heart.volume*=.5;if(heart.volume<.006){heart.pause();clearInterval(fade);fade=0}},40)}
const musicPlaying=()=>window.lotusSession?.audioState?.playing||[...document.querySelectorAll('audio:not([data-ambient]):not([data-heartbeat]),video')].some(el=>!el.paused&&!el.muted&&el.volume>.01);
async function play(){
 if(!armed||muted||!visible||inside||document.hidden||musicPlaying())return;
 clearInterval(fade);fade=0;heart.currentTime=0;heart.volume=.34;
 try{await heart.play();toggle.dataset.heartbeatPlays=String(++plays);toggle.dataset.audioState='playing'}catch{armed=false;label()}
}
// The original paired impacts at .04/.32 s align with the shell's .20/.49 s pulse.
export function updateHeartbeat(t,closed){
 if(t-lastDiagnostic>.2){lastDiagnostic=t;toggle.dataset.heartbeatProgress=heart.currentTime.toFixed(3);toggle.dataset.heartbeatPaused=String(heart.paused)}
 if(closed<.99){if(!fade)stop();return}
 const c=Math.floor((t-.16)/1.85);if(c!==cycle){cycle=c;if(c>=0)play()}
}
heart.addEventListener('ended',()=>{toggle.dataset.audioState='ready'});
heart.addEventListener('error',()=>{armed=false;label();toggle.textContent='HEARTBEAT / RETRY'});
toggle.addEventListener('click',async()=>{if(armed&&!muted){muted=true;stop()}else{muted=false;await armHeartbeat();cycle=-1}label()});
const unlock=e=>{if(e.target===toggle||muted||armed)return;armHeartbeat()};
document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(!visible)stop()},{threshold:.15}).observe(stage);
window.addEventListener('lotus-room-change',e=>{inside=e.detail;toggle.hidden=inside;if(inside)stop()});
window.addEventListener('lotus-audio-start',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
