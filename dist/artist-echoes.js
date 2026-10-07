// Pixel snapshots preserve a deliberate CRT memory without cloning interactive controls.
export function createPortraitMemory(host, source, reduced) {
 const layer=document.createElement('div');layer.className='portrait-memory';layer.setAttribute('aria-hidden','true');host.before(layer);
 Array.from({length:3},(_,i)=>{const frame=document.createElement('i');frame.className='portrait-depth';frame.style.setProperty('--depth',i+1);layer.append(frame);return frame});
 const ghosts=Array.from({length:7},()=>{const canvas=document.createElement('canvas');canvas.className='portrait-echo';layer.append(canvas);return {canvas,ctx:canvas.getContext('2d'),animation:null}});
 let width=0,height=0,index=0,lastX=0,lastY=0,lastStamp=-Infinity;
 new ResizeObserver(()=>{width=host.clientWidth;height=host.clientHeight;layer.style.height=`${height}px`;for(const {canvas} of ghosts){canvas.width=Math.round(width*.65);canvas.height=Math.round(height*.65)}}).observe(host);
 function remember(x,y){
  if(reduced||!width||Math.hypot(x-lastX,y-lastY)<9)return;
  const now=performance.now();if(now-lastStamp<68)return;lastStamp=now;
  const ghost=ghosts[index++%ghosts.length],{canvas,ctx}=ghost;ghost.animation?.cancel();
  const scale=canvas.width/width;ctx.setTransform(scale,0,0,scale,0,0);ctx.clearRect(0,0,width,height);
  ctx.fillStyle='#250b07';ctx.fillRect(0,0,width,height);ctx.fillStyle='#e2431d';ctx.fillRect(0,0,width,34);
  ctx.fillStyle='#f3caa3';ctx.font='10px monospace';ctx.fillText('PORTRAIT / IDENTITY',13,21);
  ctx.imageSmoothingEnabled=false;ctx.globalAlpha=.88;ctx.drawImage(source,0,68,width,height-140);
  ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#c735184d';ctx.fillRect(0,34,width,height-34);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
  ctx.strokeStyle='#f26635';ctx.lineWidth=1.5;ctx.strokeRect(1,1,width-2,height-2);
  ctx.fillStyle='#f2712938';for(let line=36;line<height;line+=4)ctx.fillRect(0,line,width,1);
  // Old positions linger and separate slightly, then dissolve; the live window stays sharp.
  const from=`translate3d(${lastX}px,${lastY}px,0)`;
  ghost.animation=canvas.animate([{opacity:.58,transform:from},{opacity:.26,offset:.45,transform:`translate3d(${lastX-8}px,${lastY-3}px,0)`},{opacity:0,transform:`translate3d(${lastX-17}px,${lastY-6}px,0)`}],{duration:1550,easing:'cubic-bezier(.2,.6,.3,1)',fill:'forwards'});
  lastX=x;lastY=y;layer.dataset.echoes=String(Math.min(index,ghosts.length));
 }
 return {remember,reset(){lastX=lastY=0;for(const g of ghosts)g.animation?.cancel();layer.dataset.echoes='0'}};
}
