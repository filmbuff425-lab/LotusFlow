// Phone media never waits indefinitely for a decoder or a slow connection.
export function decodeImage(image,timeoutMs=4000){
 return new Promise(resolve=>{
  let done=false;
  const finish=value=>{if(done)return;done=true;clearTimeout(timer);resolve(value)};
  const timer=setTimeout(()=>finish(false),timeoutMs);
  Promise.resolve().then(()=>image.decode()).then(()=>finish(true),()=>finish(false));
 });
}

export function playPhoneTransition(video,{src,onStart=()=>{},onProgress=()=>{},onEnd,onFallback,holdLastFrame=false,firstFrameTimeout=2800,readyFrameTimeout=1400,stallTimeout=1600,clock=globalThis}={}){
 let active=true,started=false,lastTime=0,stalledAt=clock.performance.now(),frame=0;
 let timer=0,poll=0;
 const stop=()=>{
  if(!active)return;active=false;clock.clearTimeout(timer);clock.clearInterval(poll);
  if(frame&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(frame);
  video.removeEventListener('playing',show);video.removeEventListener('error',fail);video.removeEventListener('ended',end);video.pause();
 };
 const fail=()=>{if(!active)return;stop();onFallback()};
 // Camera journeys keep their final decoded frame visible until the matching
 // still has painted underneath it. Pausing first can expose a blank decoder
 // surface for one frame on iOS, which reads as a flash and a layout jump.
 const end=()=>{if(!active)return;if(holdLastFrame){clock.clearTimeout(timer);clock.clearInterval(poll);video.removeEventListener('playing',show);video.removeEventListener('error',fail);video.removeEventListener('ended',end);onEnd();return}stop();onEnd()};
 const show=()=>{if(!active)return;started=true;clock.clearTimeout(timer);stalledAt=clock.performance.now();onStart()};
 const ready=video.getAttribute('src')===src&&video.readyState>=2;
 video.addEventListener('error',fail);video.addEventListener('ended',end);
 // A cold iPhone decoder can need well over 650 ms even after the file has
 // reached the HTTP cache. Wait for an actual decoded frame instead of
 // replacing the approved camera journey with the still-image fallback.
 timer=clock.setTimeout(fail,ready?readyFrameTimeout:firstFrameTimeout);
 poll=clock.setInterval(()=>{
  if(!active)return;
  const time=video.currentTime,now=clock.performance.now();
  if(time>lastTime+.002){lastTime=time;stalledAt=now}
  else if(started&&now-stalledAt>stallTimeout){fail();return}
  onProgress(time);
 },100);
 try{
  if(video.getAttribute('src')!==src){video.src=src;video.preload='auto';video.load()}
  video.currentTime=0;
  if(video.requestVideoFrameCallback)frame=video.requestVideoFrameCallback(show);
  else video.addEventListener('playing',show,{once:true});
  Promise.resolve(video.play()).catch(fail);
 }catch{fail()}
 return stop;
}
