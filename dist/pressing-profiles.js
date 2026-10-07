// Shared optical choices for the record room, jewel case and collection drawer.
// No tint is applied to the original cover artwork.
const profiles={
 news:{name:'pearl glaze',kind:'pearl',mode:0,angle:-.62,spread:1.35,grain:590,intensity:.9,phase:.4},
 bridge:{name:'brushed platinum',kind:'brushed',mode:1,angle:.54,spread:.7,grain:870,intensity:.95,phase:1.1},
 juliet:{name:'porcelain frost',kind:'frost',mode:8,angle:1.15,spread:1.4,grain:510,intensity:.8,phase:2.3},
 flow:{name:'liquid clearcoat',kind:'liquid',mode:3,angle:-.25,spread:.95,grain:710,intensity:.92,phase:.6},
 'feed-on':{name:'smoked lacquer',kind:'lacquer',mode:4,angle:.8,spread:.72,grain:790,intensity:1,phase:2.4},
 'show-me-love':{name:'satin gold print',kind:'satin',mode:5,angle:-1.2,spread:1.2,grain:480,intensity:.78,phase:1.7},
 summer:{name:'sunlit clear resin',kind:'resin',mode:6,angle:.35,spread:1.15,grain:950,intensity:.9,phase:.9},
 adult:{name:'frosted clear resin',kind:'frost',mode:8,angle:-.8,spread:.82,grain:1080,intensity:1.05,phase:1.9},
 lov:{name:'prismatic foil',kind:'prism',mode:7,angle:.2,spread:.9,grain:970,intensity:.94,phase:.1},
 runaway:{name:'silver crescent',kind:'mirror',mode:9,angle:-.7,spread:.68,grain:800,intensity:.9,phase:2.6},
 casual:{name:'wet glass',kind:'glass',mode:2,angle:.85,spread:.86,grain:660,intensity:.92,phase:1.2},
 only:{name:'soft lacquer',kind:'lacquer',mode:4,angle:-1.65,spread:1.8,grain:420,intensity:.68,phase:.2},
 airtight:{name:'cut crystal',kind:'prism',mode:7,angle:1.65,spread:.6,grain:1160,intensity:.92,phase:2.5}
};
const aliases={'great-bridge':'bridge','over-the-summer':'summer','imperfect-adult':'adult','1-of-lov':'lov','runaway-bride':'runaway','only-you':'only'};
export function pressingProfile(id='news'){const key=aliases[id]||id;if(profiles[key])return profiles[key];const n=[...key].reduce((v,c)=>v*31+c.charCodeAt(0),7)>>>0,base=Object.values(profiles)[n%13];return {...base,angle:(n%628)/100-3.14,phase:(n%314)/100,intensity:.72+(n%24)/100}}
export function drawerReflection(id){
 const p=pressingProfile(id),grooves=`repeating-radial-gradient(circle,transparent 0 ${p.grain>800?'1.3':'2'}px,#ffffff09 ${p.grain>800?'1.6':'2.3'}px,transparent ${p.grain>800?'2':'3'}px)`;
 const surfaces={
  pearl:'radial-gradient(ellipse at 28% 22%,#fff7,transparent 36%),radial-gradient(ellipse at 63% 82%,#fff2,transparent 48%)',
  brushed:'linear-gradient(78deg,transparent 32%,#fff2 39%,#fff9 41%,transparent 43%,transparent 49%,#fff3 50%,transparent 51%)',
  frost:'radial-gradient(ellipse at 17% 38%,#fff5,transparent 47%),radial-gradient(circle,transparent 66%,#fff2 69%,transparent 71%)',
  liquid:'radial-gradient(ellipse at 90% 55%,transparent 49%,#fff7 51%,transparent 54%),radial-gradient(ellipse at 10% 30%,transparent 46%,#fff3 49%,transparent 54%)',
  lacquer:`radial-gradient(ellipse ${p.spread>1?'38% 28%':'17% 8%'} at 27% 21%,#fffa,transparent 88%),radial-gradient(ellipse at 70% 82%,#fff1,transparent 37%)`,
  satin:'linear-gradient(114deg,transparent 17%,#fff3 39%,#fff1 64%,transparent 82%)',
  resin:'radial-gradient(ellipse at 78% 22%,transparent 35%,#fff5 39%,transparent 44%),radial-gradient(ellipse at 21% 82%,transparent 48%,#fff3 51%,transparent 56%)',
  prism:`linear-gradient(${id==='airtight'?'132':'67'}deg,transparent 24%,#d8e9ff30 29%,#f4bfff5c 32%,#f9e0a366 35%,#c0efda66 38%,transparent 41%,transparent 67%,#fff6 69%,transparent 70%)`,
  mirror:'conic-gradient(from 40deg,transparent 0deg,transparent 88deg,#fff9 92deg,transparent 96deg,transparent 360deg),radial-gradient(circle,transparent 71%,#ffffff17 72%,transparent 73%)',
  glass:'radial-gradient(ellipse at 9% 44%,transparent 57%,#fff7 60%,transparent 63%),radial-gradient(ellipse at 88% 12%,#fff3,transparent 28%)'
 };
 return {profile:p,background:`${grooves},${surfaces[p.kind]}`};
}
