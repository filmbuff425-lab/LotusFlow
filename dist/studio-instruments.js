import * as THREE from 'three';
import {createH100} from './studio-h100.js?v=20261006-lake-surface1';
import {createCuratedObjects} from './studio-curated-objects.js?v=20261006-lake-surface1';

// Custom studio objects, built as separate physical parts rather than featureless shells.
export function createInstruments({root,scene,api,texture,topText,add,box,cylinder,slab,cord,register}){
 const mat=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const noise=texture(256,256,g=>{const d=g.createImageData(256,256);for(let i=0;i<d.data.length;i+=4){const n=100+Math.random()*95;d.data.set([n,n,n,255],i)}g.putImageData(d,0,0)});noise.wrapS=noise.wrapT=THREE.RepeatWrapping;noise.repeat.set(4,4);
 const walnut=new THREE.MeshPhysicalMaterial({color:0x71869b,metalness:.78,roughness:.28,clearcoat:.32});
 const alloy=mat(0xb3b7bb,.84,.28),darkMetal=mat(0x282a2b,.76,.34),rubber=mat(0x0b0d0e,0,.82),cone=mat(0x25262a,.18,.7),ivory=mat(0xe3dfd4,.1,.48),black=mat(0x080909,.08,.7);
 rubber.bumpMap=noise;rubber.bumpScale=.023;cone.bumpMap=noise;cone.bumpScale=.013;darkMetal.bumpMap=noise;darkMetal.bumpScale=.006;
 const leather=new THREE.MeshPhysicalMaterial({color:0x161c20,roughness:.63,bumpMap:noise,bumpScale:.045,clearcoat:.12});
 const led=mat(0x86c9ca,.1,.28);led.emissive.set(0x66adab);led.emissiveIntensity=.7;
 const torus=(r,t,x,y,z,m,parent)=>add(new THREE.TorusGeometry(r,t,12,64),m,parent,x,y,z);
 function screw(x,y,z,parent){const head=cylinder(.025,.015,x,y,z,alloy,parent);head.rotation.x=Math.PI/2;const slot=box(.031,.005,.004,x,y,z+.01,darkMetal,parent);return head}
 const standGlass=new THREE.MeshPhysicalMaterial({color:0xd8ece7,metalness:0,roughness:.075,transmission:.83,thickness:.22,ior:1.5,transparent:true,opacity:.86,envMapIntensity:1.15});
 const cones=[];
 const phones=createH100({parent:root,texture,x:-14.6,y:4.83,z:4.08,angle:-.28});
 createCuratedObjects(texture).phone(root,-8.5,2.841,5.80,.16);
 // A weighted aluminum stand holds the band; wiring leaves behind the stand.
 const phoneStand=new THREE.Group();phoneStand.name='Satin aluminum headphone stand';phoneStand.position.set(-14.6,2.81,3.80);root.add(phoneStand);
 slab(1.85,1.47,.11,.22,0,.065,0,alloy,phoneStand);slab(1.75,1.37,.035,.20,0,.012,0,rubber,phoneStand);
 box(.095,3.13,.13,0,1.63,0,alloy,phoneStand);slab(1.05,.65,.10,.22,0,3.20,.24,alloy,phoneStand);slab(1.03,.62,.044,.22,0,3.267,.24,alloy,phoneStand);
 // Short headphone lead into the nearby audio interface; the rear USB drops
 // straight through a small pass-through, then runs under the desk to rear I/O.
 const io=new THREE.Group();io.name='Left headphone audio interface';io.position.set(-14.5,3.03,1.75);root.add(io);
 slab(2.25,1.18,.32,.075,0,0,0,alloy,io);box(2.16,.26,.032,0,0,.604,darkMetal,io);
 const level=cylinder(.16,.09,.69,0,.66,alloy,io);level.rotation.x=Math.PI/2;
 const jack=cylinder(.082,.06,-.67,-.01,.658,black,io);jack.rotation.x=Math.PI/2;
 function passThrough(x,z){cylinder(.13,.027,x,2.836,z,darkMetal);box(.55,.10,.55,x,2.45,z,darkMetal)}
 passThrough(-14.5,.73);
 cord([[-14.5,3.02,1.15],[-14.5,2.91,.90],[-14.5,2.84,.73],[-14.5,2.19,.73]],.022);
 box(.32,.16,9.78,-14.5,2.21,-4.17,darkMetal);
 // A 25-key MIDI rests directly on rubber feet on the continuous glass desk.
 const midi=new THREE.Group();midi.name='MIDI keyboard on the glass desktop';midi.position.set(13.75,3.095,5.0);midi.rotation.y=0;root.add(midi);
 slab(11.25,2.78,.16,.15,0,-.15,0,walnut,midi);slab(10.85,2.54,.17,.14,0,.02,0,alloy,midi);slab(10.7,2.40,.05,.09,0,.13,0,ivory,midi);
 for(const side of[-1,1]){box(.20,.32,2.55,side*5.34,.05,0,walnut,midi);for(const z of[-1.02,1.02])cylinder(.16,.055,side*4.75,-.2575,z,rubber,midi)}
 passThrough(13.75,2.99);
 // The front-facing instrument connects behind its case to a nearby desk port.
 cord([[13.75,3.12,3.58],[13.75,3.03,3.27],[13.75,2.84,2.99],[13.75,2.18,2.99]],.025);
 box(.32,.16,12.07,13.75,2.21,-3.04,darkMetal);
 const midiKeys=[],whiteNotes=[0,2,4,5,7,9,11],pitch=.44,start=-2.96;
 for(let i=0;i<15;i++){
  const note=48+Math.floor(i/7)*12+whiteNotes[i%7],x=start+i*pitch;
  box(.427,.10,1.42,x,.18,.40,black,midi);const key=slab(.410,1.39,.10,.035,x,.245,.41,ivory.clone(),midi);register(key,{action:'note',note,label:`MIDI KEY / ${['C','D','E','F','G','A','B'][i%7]}${Math.floor(note/12)-1}`,baseY:.245});midiKeys.push(key);
  if([0,1,3,4,5].includes(i%7)&&i<14){const k=slab(.255,.87,.12,.03,x+pitch/2,.361,.13,black,midi);register(k,{action:'note',note:note+1,label:'MIDI KEY / SHARP',baseY:.361});midiKeys.push(k)}
 }
 const knobColors=[0xce522e,0x577e8b,0xd6af55,0x657d59];
 for(let i=0;i<4;i++){const x=-2.8+i*1.38;cylinder(.17,.18,x,.28,-.87,mat(knobColors[i],.2,.45),midi);cylinder(.185,.03,x,.175,-.87,alloy,midi);box(.025,.012,.092,x,.378,-.93,ivory,midi);topText(['FILTER','RESONANCE','ATTACK','RELEASE'][i],x,.17,-.54,.94,.12,'#454746',midi,35)}
 for(let i=0;i<8;i++){const x=-4.74+i%2*.50,z=-.86+Math.floor(i/2)*.5;const pad=slab(.4,.41,.048,.04,x,.23,z,i%3?rubber:mat(0xb74435),midi);register(pad,{action:'note',note:48+i*2,label:`PAD / ${i+1}`,baseY:.23});midiKeys.push(pad)}
 const oled=texture(512,128,g=>{g.fillStyle='#172d31';g.fillRect(0,0,512,128);g.fillStyle='#acd0c7';g.font='32px monospace';g.fillText('01  /  SOFT KEYS',28,53);g.font='23px monospace';g.fillText('A MINOR       104 BPM',28,95)});const screen=add(new THREE.PlaneGeometry(1.62,.41),new THREE.MeshBasicMaterial({map:oled,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),midi,4.25,.220,-.82);screen.rotation.x=-Math.PI/2;screen.castShadow=screen.receiveShadow=false;
 topText('LF / 25',4.15,.17,.82,1.33,.2,'#62645d',midi,52);
 for(let i=0;i<3;i++){const wheel=cylinder(.13,.44,3.87+i*.4,.23,.09,rubber,midi);wheel.rotation.x=Math.PI/2;for(let j=0;j<5;j++)box(.21,.015,.013,3.87+i*.4,.366,-.08+j*.065,darkMetal,midi)}
 // A small monitor controller with genuine knob ribs and two warm VU windows.
 const control=new THREE.Group();control.name='Right desktop monitor controller';control.position.set(14.8,3.015,.90);control.rotation.y=0;root.add(control);
 slab(3.15,2.57,.28,.15,0,0,0,darkMetal,control);slab(3.06,2.47,.026,.1,0,.151,0,alloy,control);
 const vu=texture(512,256,g=>{g.fillStyle='#c9b582';g.fillRect(0,0,512,256);g.strokeStyle='#3d332a';g.lineWidth=3;g.beginPath();g.arc(256,260,207,Math.PI*1.14,Math.PI*1.87);g.stroke();for(let i=0;i<17;i++){const a=Math.PI*1.15+i*.14;g.beginPath();g.moveTo(256+Math.cos(a)*190,260+Math.sin(a)*190);g.lineTo(256+Math.cos(a)*211,260+Math.sin(a)*211);g.stroke()}g.font='24px monospace';g.fillStyle='#3d332a';g.fillText('VU',235,190);g.strokeStyle='#9e2f20';g.beginPath();g.moveTo(256,245);g.lineTo(130,75);g.stroke()});
 for(const x of [-.72,.72]){slab(1.22,.61,.04,.045,x,.18,-.72,black,control);const p=add(new THREE.PlaneGeometry(1.13,.52),new THREE.MeshBasicMaterial({map:vu}),control,x,.207,-.72);p.rotation.x=-Math.PI/2}
 cylinder(.49,.24,0,.30,.25,darkMetal,control);cylinder(.41,.025,0,.431,.25,black,control);for(let i=0;i<40;i++){const a=i/40*Math.PI*2;box(.015,.18,.018,Math.cos(a)*.492,.30,.25+Math.sin(a)*.492,alloy,control)}
 topText('MONITOR / LEVEL',0,.179,.99,1.77,.12,'#373b3b',control,36);for(const side of [-1,1]){const button=slab(.37,.29,.05,.025,side*1.08,.20,.35,ivory,control);register(button,{action:side<0?'selected-mute':'play',label:side<0?'MONITOR / MUTE':'MONITOR / PLAY'});topText(side<0?'MUTE':'PLAY',side*1.08,.232,.35,.30,.15,'#343d3b',control,47)}
 for(const x of[-1.27,1.27])for(const z of[-1.0,1.0])cylinder(.12,.065,x,-.1725,z,rubber,control);
 passThrough(14.8,-.73);cord([[14.8,3.02,-.39],[14.8,2.96,-.61],[14.8,2.84,-.73],[14.8,2.18,-.73]],.022);
 box(.26,.16,8.35,14.8,2.21,-4.905,darkMetal);
 function update(now){const t=now*.001;cones.forEach((c,i)=>{c.position.z=.01+(api.audioState.playing?Math.sin(t*56+i)*.012:0)});for(const k of midiKeys){const elapsed=now-(k.userData.pressedAt||-1000);k.position.y=k.userData.baseY-(elapsed<280?Math.sin(elapsed/280*Math.PI)*.05:0)}}
 return{update,midiKeys,walnut,phones,midi};
}
