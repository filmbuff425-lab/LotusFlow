import * as THREE from 'three';

// Archive typography uses only the actual release identity and portfolio credits.
// LF numbers identify this portfolio, not invented record-label catalogue numbers.
const editions={
 flow:{title:'FLOW',artist:'REN KAI',year:'2024',credit:'CO-COMPOSITION / CO-LYRICS',ink:'#e5f0e4',accent:'#528d88',n:'11'},
 'feed-on':{title:'FEED ON',artist:'SULIANYA',year:'2025',credit:'PRODUCTION / ARRANGEMENT / MIX / MASTER',ink:'#e6ead4',accent:'#8d9f43',n:'12'},
 'show-me-love':{title:'SHOW ME LOVE',artist:'WIZTHEMC / BEES & HONEY / TIA RAY',year:'2025',credit:'CO-WRITER / TIA RAY VERSION',ink:'#1a221a',accent:'#efd668',n:'13'},
 airtight:{title:'MI BU TOU FENG',artist:'RIDE THE WIND 2024',year:'2024',credit:'CO-COMPOSITION / CO-ARRANGEMENT',ink:'#fae4c7',accent:'#cc423e',n:'10'},
 news:{title:'NEWs',artist:'BENZO',year:'2025',credit:'CO-PRODUCTION / ARRANGEMENT / PROGRAMMING',ink:'#eee9db',accent:'#ec481d',n:'01'},
 'great-bridge':{title:'DA QIAO',artist:'WANG YITAI',year:'2024',credit:'CO-COMPOSITION / CO-ARRANGEMENT',ink:'#0d203b',accent:'#d2e6ed',n:'02'},
 juliet:{title:'JULIET',artist:'AleXa',year:'2023',credit:'ADDITIONAL PRODUCTION / ARRANGEMENT',ink:'#f7eee1',accent:'#b83d63',n:'03'},
 'over-the-summer':{title:'OVER THE SUMMER',artist:'LOTUS FLOW × ADN LEWIS',year:'2024',credit:'ARTIST RELEASE / WITH ADN LEWIS',ink:'#232715',accent:'#ffe848',n:'04'},
 'imperfect-adult':{title:'BU WAN MEI DA REN',artist:'DUAN YIXUAN & HYBRIDGENE',year:'2025',credit:'PRODUCTION / VOCAL PRODUCTION / BACKING VOCALS',ink:'#f0eee8',accent:'#8a79be',n:'05'},
 '1-of-lov':{title:'1 OF LOV',artist:'XLOV',year:'2025',credit:'CO-LYRICS / LOTUS FLOW',ink:'#192319',accent:'#d1ec96',n:'06'},
 'runaway-bride':{title:'RUNAWAY BRIDE',artist:'LOTUS FLOW',year:'2023',credit:'ARTIST RELEASE',ink:'#edeee0',accent:'#81cec2',n:'07'},
 casual:{title:'CASUAL',artist:'LOTUS FLOW',year:'2024',credit:'ARTIST RELEASE',ink:'#eef1f0',accent:'#bcbecb',n:'08'},
 'only-you':{title:'ONLY YOU',artist:'LOTUS FLOW',year:'2024',credit:'ARTIST RELEASE',ink:'#fce8dc',accent:'#cb274d',n:'09'}
};
const cache=new Map();
function text(g,s,x,y,size=20,color='#eee',font='monospace',weight=500){g.fillStyle=color;g.font=`${weight} ${size}px ${font}`;g.fillText(s,x,y)}
function fit(g,s,x,y,width,size,color,font='Arial',weight=900){g.save();g.font=`${weight} ${size}px ${font}`;const scale=Math.min(1,width/g.measureText(s).width);g.translate(x,y);g.scale(scale,1);text(g,s,0,0,size,color,font,weight);g.restore()}
function arc(g,s,r,start,size,color){g.save();g.translate(512,512);g.font=`500 ${size}px monospace`;g.fillStyle=color;g.textAlign='center';let a=start;for(const char of s){const w=g.measureText(char).width;g.save();g.rotate(a+w/r/2);g.translate(0,-r);g.fillText(char,0,0);g.restore();a+=(w+1.6)/r}g.restore()}
function ticket(g,e,x,y,w,angle=0){const ink=['#0d203b','#192319','#232715'].includes(e.ink)?'#f2eadf':'#181b1c';g.save();g.translate(x,y);g.rotate(angle);g.fillStyle=e.ink;g.fillRect(0,0,w,83);text(g,`LF / ARCHIVE ${e.n} — ${e.year}`,13,24,15,ink);fit(g,e.artist,13,49,w-26,22,ink);text(g,'SELECTED WORK  /  LOTUS FLOW',13,69,11,ink);g.restore()}
function rule(g,x,y,w,color){g.strokeStyle=color;g.lineWidth=1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.stroke()}
function print(g,key,e){
 const E=e.ink,A=e.accent;
 switch(key){
 case 'flow':
  g.save();g.translate(242,272);g.rotate(-.045);fit(g,'FLOW',0,0,544,129,E,'Georgia',700);text(g,'REN KAI / 2024',7,35,20,E);g.restore();
  ticket(g,e,280,748,430,-.035);break;
 case 'feed-on':
  fit(g,'FEED ON',231,230,570,94,E);text(g,'SULIANYA / 2025',253,264,22,E);
  g.save();g.translate(277,772);g.rotate(-.03);text(g,'PRODUCED BY LOTUS FLOW',0,0,25,E,'Arial',800);text(g,'ARRANGEMENT / MIX / MASTER',0,30,17,E);g.restore();break;
 case 'show-me-love':
  fit(g,'SHOW ME LOVE',212,253,605,84,E);text(g,'TIA RAY VERSION',289,292,22,E);
  ticket(g,e,220,746,580,.025);break;
 case 'news':
  g.save();g.translate(181,701);g.rotate(-.075);g.fillStyle=A;g.fillRect(-12,-92,639,128);fit(g,'NEWs',0,11,470,126,'#141414','Arial',900);text(g,'BENZO',484,-47,24,'#161616');text(g,'2025',488,0,22,'#161616');g.restore();
  text(g,'01 / CO-PRODUCTION',230,275,17,E);text(g,'ARRANGEMENT + PROGRAMMING',230,302,15,E);rule(g,230,316,290,E);
  break;
 case 'great-bridge':
  fit(g,'DA QIAO',244,198,580,94,E,'Arial',900);text(g,'WANG YITAI',260,231,23,E);
  g.save();g.translate(785,695);g.rotate(-Math.PI/2);text(g,'02 / COMPOSITION + ARRANGEMENT',0,0,17,E);g.restore();
  ticket(g,e,235,741,334,-.035);break;
 case 'juliet':
  g.save();g.font='italic 112px Georgia';g.fillStyle=E;g.fillText('Juliet',310,301);g.restore();
  g.fillStyle=A;g.fillRect(240,708,69,146);g.save();g.translate(288,835);g.rotate(-Math.PI/2);text(g,'AleXa',0,0,39,E,'Arial',700);g.restore();
  text(g,'ADDITIONAL PRODUCTION',335,753,19,E);text(g,'ARRANGEMENT / 2023',335,783,18,E);rule(g,335,803,370,E);break;
 case 'over-the-summer':
  g.save();g.translate(259,172);g.rotate(.06);fit(g,'OVER THE',0,0,520,79,E);fit(g,'SUMMER',0,79,528,103,E);g.restore();
  g.save();g.translate(235,785);g.rotate(-.06);g.fillStyle=E;g.fillRect(0,0,568,77);text(g,e.artist,19,32,23,A,'Arial',800);text(g,'04  /  ARTIST RELEASE  /  2024',19,60,16,A);g.restore();break;
 case 'imperfect-adult':
  g.save();g.translate(178,394);g.rotate(-Math.PI/2);text(g,'BU WAN MEI DA REN',0,0,38,E,'Arial',900);g.restore();
  ticket(g,e,321,747,446,.045);text(g,'PRODUCTION / VOCAL PRODUCTION',303,250,17,E);text(g,'BACKING VOCALS & SUPERVISION',303,277,16,E);break;
 case '1-of-lov':
  fit(g,'1 / LOV',220,218,588,112,E);text(g,'XLOV   /   I ONE',224,251,22,E);
  g.fillStyle=E;g.fillRect(653,717,141,115);text(g,'06',667,788,78,A,'Arial',900);text(g,'CO-LYRICS',238,771,31,E,'Arial',900);text(g,'LOTUS FLOW / 2025',238,806,18,E);break;
 case 'runaway-bride':
  g.save();g.translate(284,194);g.rotate(-.05);text(g,'RUNAWAY',0,0,57,E,'Georgia',700);text(g,'BRIDE',108,57,65,E,'Georgia',700);g.restore();
  ticket(g,e,230,748,308,.055);text(g,'07',681,812,73,E,'Arial',900);break;
 case 'casual':
  g.save();g.translate(306,212);g.rotate(.02);text(g,'CASUAL',0,0,78,E,'Arial',900);text(g,'LOTUS FLOW',3,36,19,E);g.restore();
  rule(g,288,762,444,E);text(g,'08  /  ARTIST RELEASE',288,791,19,E);text(g,'2024',632,791,19,E);text(g,'SOUND WITHOUT BORDERS',288,819,13,E);break;
 case 'only-you':
  g.save();g.translate(215,268);g.rotate(-.07);fit(g,'ONLY YOU',0,0,610,92,E,'Arial',900);g.restore();
  g.fillStyle=E;g.fillRect(273,756,470,66);text(g,'LOTUS FLOW',287,789,32,A,'Arial',900);text(g,'09 / 2024',572,807,16,A);break;
 }
 // Fine-print rings, matrix etching and registration marks reward a closer look.
 arc(g,`${e.artist}  •  ${e.title}  •  ${e.year}`,464,-1.02,14,E);
 arc(g,`LOTUS FLOW / SELECTED WORK / ${e.credit}`,437,1.12,10,E);
 g.save();g.translate(512,512);g.rotate(-.3);g.fillStyle=E;g.fillRect(31,-7,44,14);g.restore();
 for(let i=0;i<16;i++){const a=2.35+i*.011;g.strokeStyle=E;g.lineWidth=i%3===0?2:1;g.beginPath();g.moveTo(512+Math.cos(a)*477,512+Math.sin(a)*477);g.lineTo(512+Math.cos(a)*(i%3?484:491),512+Math.sin(a)*(i%3?484:491));g.stroke()}
 arc(g,`LF — ARCHIVE ${e.n}`,53,.1,7,E);
}
export function createRecordPrint(key){
 if(cache.has(key))return cache.get(key);
 const e=editions[key]||editions.news,c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');
 g.save();g.beginPath();g.arc(512,512,506,0,Math.PI*2);g.clip();
 if(key==='1-of-lov')print(g,key,e);
 if(key==='airtight'){
  arc(g,'密 不 透 风   /   MI BU TOU FENG',445,-.88,20,'#ead8c4');
  arc(g,'LOTUS FLOW  /  COMPOSITION + ARRANGEMENT',430,1.8,10,'#cfaf95');
  g.save();g.translate(791,650);g.rotate(-Math.PI/2);text(g,'2024 / LIVE',0,0,12,'#ead8c4');g.restore();
 }

 // Sparse ink dropout: print detail, not a uniform noisy overlay over the artwork.
 g.globalCompositeOperation='destination-out';for(let i=0;i<9500;i++){const n=Math.sin(i*67.31)*43758.54,x=(n-Math.floor(n))*1024,q=Math.sin(i*123.7+9)*4314,y=(q-Math.floor(q))*1024;g.fillStyle='#00000016';g.fillRect(x,y,1.2+(i%3),.8)}g.restore();
 g.globalCompositeOperation='destination-out';g.beginPath();g.arc(512,512,22,0,Math.PI*2);g.fill();g.globalCompositeOperation='source-over';
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;cache.set(key,texture);return texture;
}
export function createSleeveLabel(key){
 const e=editions[key]||editions.news,c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');
 g.fillStyle=e.accent;g.fillRect(0,0,1024,256);text(g,`LF / ARCHIVE ${e.n}     ${e.year}`,30,48,26,'#131717');fit(g,e.artist,30,119,960,58,'#131717');fit(g,e.credit,30,170,960,27,'#131717','monospace',500);text(g,e.title,30,226,33,'#131717','Arial',900);
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
