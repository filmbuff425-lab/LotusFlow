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

// A single decoder, created only by a deliberate tap. Releasing the source
// cancels its download and decoder when the viewer is dismissed.
export function createPhoneFilmPlayback(video,{announce=()=>{},onState=()=>{}}={}){
 let request=0,active=false;
 const state=value=>onState(value);
 function release(){request++;active=false;video.pause();video.removeAttribute('src');video.load();state('idle')}
 function play(src){
  const token=++request;active=true;video.pause();video.src=src;video.preload='none';
  announce();state('loading');
  try{Promise.resolve(video.play()).catch(error=>{if(active&&token===request)state(error.name==='NotAllowedError'?'gesture':'error')})}
  catch{if(active&&token===request)state('error')}
 }
 video.addEventListener('play',()=>{if(active)announce()});
 video.addEventListener('playing',()=>{if(active)state('playing')});
 video.addEventListener('waiting',()=>{if(active)state('loading')});
 video.addEventListener('ended',()=>{if(active)state('ended')});
 video.addEventListener('error',()=>{if(active)state('error')});
 return{play,release,pause:()=>video.pause()};
}
