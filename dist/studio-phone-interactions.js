// Object outlines in the approved 1080 × 1350 stills. No scene/model allocation.
export const phoneObjects={
 overview:{
  computer:[[.363,.411],[.639,.411],[.633,.524],[.369,.524]],
  records:[[.324,.326],[.647,.324],[.649,.373],[.325,.373]],
  film:[[.849,.235],[1,.299],[.965,.598],[.827,.456]]
 },
 desk:{
  computer:[[.275,.329],[.726,.329],[.718,.512],[.282,.512]],
  records:[[.238,.235],[.722,.232],[.721,.297],[.241,.297]]
 },
 records:{
  computer:[[.088,.78],[.911,.78],[.9,1],[.101,1]],
  records:[[.105,.578],[.833,.572],[.835,.675],[.113,.675]]
 }
};
export function objectBounds(points){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const x=Math.min(...xs),y=Math.min(...ys),width=Math.max(...xs)-x,height=Math.max(...ys)-y;
 return{x,y,width,height,clip:`polygon(${points.map(([px,py])=>`${(px-x)/width*100}% ${(py-y)/height*100}%`).join(',')})`};
}
export function swipeDirection(dx,dy){return Math.abs(dx)>44&&Math.abs(dx)>Math.abs(dy)*1.5?(dx<0?1:-1):0}
export function phoneHeartbeatScale(time,gain=1){
 const t=time%1.85;
 const pair=Math.exp(-Math.pow((t-.20)/.105,2))+.68*Math.exp(-Math.pow((t-.49)/.14,2));
 return 1+.038*pair*gain;
}

// Project the native video onto the approved screen plane without rendering a
// 3D scene. Unit-square homography, expressed as a CSS matrix for a 640×360 video.
export const phoneFilmQuad=[[924/1080,322/1350],[1118/1080,426/1350],[1039/1080,794/1350],[889/1080,608/1350]];
export function screenTransform(width,height){
 const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=phoneFilmQuad.map(([x,y])=>[x*width,y*height]);
 const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
 const determinant=dx1*dy2-dx2*dy1;
 if(!determinant)return 'none';
 const g=(dx3*dy2-dx2*dy3)/determinant,h=(dx1*dy3-dx3*dy1)/determinant;
 return `matrix3d(${[(x1-x0+g*x1)/640,(y1-y0+g*y1)/640,0,g/640,(x3-x0+h*x3)/360,(y3-y0+h*y3)/360,0,h/360,0,0,1,0,x0,y0,0,1].join(',')})`;
}

// Releasing the sole native video cancels its download and decoder whenever
// both the room screen and enlarged viewer are out of view.
export function createPhoneFilmPlayback(video,{announce=()=>{},onState=()=>{},clock=globalThis}={}){
 let request=0,active=false,poll=0,lastTime=0,progressAt=0,currentState='idle';
 const state=value=>{if(value!==currentState){currentState=value;onState(value)}};
 const stopWatch=()=>{clock.clearInterval(poll);poll=0};
 function watch(){
  stopWatch();lastTime=video.currentTime||0;progressAt=clock.performance.now();
  poll=clock.setInterval(()=>{
   if(!active)return stopWatch();
   const now=clock.performance.now();
   if(Math.abs(video.currentTime-lastTime)>.02){lastTime=video.currentTime;progressAt=now;state('playing')}
   else if(now-progressAt>=9000){video.pause();stopWatch();state('stalled')}
  },350);
 }
 function release(){request++;active=false;stopWatch();video.pause();video.removeAttribute('src');video.load();state('idle')}
 function play(src){
  const token=++request;active=true;stopWatch();video.pause();video.preload='auto';video.src=src;
  // Load and play in the same tap. Do not cross an awaited fade or animation.
  video.load();announce();state('loading');watch();
  const failed=error=>{if(active&&token===request){stopWatch();state(error.name==='NotAllowedError'?'gesture':'error')}};
  try{Promise.resolve(video.play()).catch(failed)}catch(error){failed(error)}
 }
 video.addEventListener('play',()=>{if(active){announce();watch()}});
 video.addEventListener('playing',()=>{if(active){progressAt=clock.performance.now();state('playing')}});
 video.addEventListener('waiting',()=>{if(active)state('loading')});
 video.addEventListener('pause',()=>{stopWatch();if(active&&!['stalled','error','gesture'].includes(currentState))state('paused')});
 video.addEventListener('ended',()=>{stopWatch();if(active)state('ended')});
 video.addEventListener('error',()=>{stopWatch();if(active)state('error')});
 function resume(){
  if(!active||!video.getAttribute('src'))return;
  const token=++request;announce();state('loading');watch();
  Promise.resolve(video.play()).catch(error=>{if(active&&token===request){stopWatch();state(error.name==='NotAllowedError'?'gesture':'error')}});
 }
 return{play,resume,release,pause:()=>video.pause()};
}
