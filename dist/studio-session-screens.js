// The studio monitors show the music library; the sound-lab screens are removed.
export function createSessionScreens({arrange,mix,dawTexture,mixerTexture}){
 const W=1280,H=720;arrange.width=mix.width=W;arrange.height=mix.height=H;
 const a=arrange.getContext('2d'),m=mix.getContext('2d');
 function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
 const snapshot=document.createElement('canvas');snapshot.width=W;snapshot.height=H;const sx=snapshot.getContext('2d');
 function macWorkspace(g,title){
  sx.clearRect(0,0,W,H);sx.drawImage(g.canvas,0,0);
  const bg=g.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#273043');bg.addColorStop(.5,'#111b30');bg.addColorStop(1,'#53465a');g.fillStyle=bg;g.fillRect(0,0,W,H);
  rect(g,0,0,W,24,'#111824d9');g.font='14px -apple-system,BlinkMacSystemFont,sans-serif';g.fillStyle='#e7eaf0';g.fillText('',16,17);g.font='600 12px -apple-system,BlinkMacSystemFont,sans-serif';g.fillText('Lotus Music',44,17);g.font='12px -apple-system,BlinkMacSystemFont,sans-serif';g.fillText('File    Edit    View    Window    Help',154,17);g.fillText('Wi-Fi   ◉   '+new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),1070,17);
  g.fillStyle='#373e48';g.beginPath();g.roundRect(8,30,W-16,632,9);g.fill();
  ['#ff6059','#ffbd2e','#28c841'].forEach((color,i)=>{g.fillStyle=color;g.beginPath();g.arc(25+i*19,44,5,0,Math.PI*2);g.fill()});g.font='12px -apple-system,BlinkMacSystemFont,sans-serif';g.fillStyle='#c9d0d8';g.textAlign='center';g.fillText(title,W/2,48);g.textAlign='left';
  g.save();g.beginPath();g.roundRect(8,57,W-16,605,[0,0,9,9]);g.clip();g.drawImage(snapshot,8,57,W-16,605);g.restore();
  g.fillStyle='#b2bdd02b';g.beginPath();g.roundRect(W/2-142,673,284,42,13);g.fill();
  const icons=[['#50aafa','⌘'],['#326ab4','✧'],['#ee6388','♫'],['#696473','≋'],['#a8acb5','⚙︎'],['#39495a','▤']];
  icons.forEach(([c,label],i)=>{const x=W/2-129+i*44;g.fillStyle=c;g.beginPath();g.roundRect(x,679,31,30,7);g.fill();g.fillStyle='#fff';g.font='23px -apple-system,BlinkMacSystemFont,sans-serif';g.textAlign='center';if(label.startsWith('⚙')){g.save();g.translate(x+15,694);g.strokeStyle='#fff';g.lineWidth=1.6;g.beginPath();g.arc(0,0,6,0,Math.PI*2);g.moveTo(2.2,0);g.arc(0,0,2.2,0,Math.PI*2);for(let k=0;k<8;k++){const q=k*Math.PI/4;g.moveTo(Math.cos(q)*6,Math.sin(q)*6);g.lineTo(Math.cos(q)*9,Math.sin(q)*9)}g.stroke();g.restore()}else g.fillText(label,x+15,703);g.textAlign='left'});
 }
 let lastStamp='';
 function update(now){
  const media=window.lotusStudioMedia;
  if(!media)return;
  const stamp=media.screenStamp();
  if(stamp===lastStamp)return;
  lastStamp=stamp;
  media.render(a,m);macWorkspace(a,'Music');macWorkspace(m,'Library');
  // Publish both fully painted screens together; never upload a cleared frame.
  dawTexture.needsUpdate=true;mixerTexture.needsUpdate=true;
 }
 return{update};
}
