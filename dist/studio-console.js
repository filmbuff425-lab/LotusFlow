import * as THREE from 'three';

// Large-format analog desk: physical meter bridge, two embedded displays and banked returns.
export function createConsoleExtension({desk,texture,api,touchables,dawTexture,mixerTexture}){
 const mat=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const dark=mat(0x171c20,.5,.36),alloy=mat(0xa1aaa9,.85,.25),black=mat(0x070909,.15,.65),cream=mat(0xd5d2c4,.3,.35),wood=mat(0x667e91,.86,.27),brass=mat(0x8a7854,.72,.32);
 const add=(geo,material,x,y,z,parent=desk)=>{const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const box=(w,h,d,x,y,z,m,parent)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent);
 const cyl=(r,h,x,y,z,m,parent)=>add(new THREE.CylinderGeometry(r,r,h,24),m,x,y,z,parent);
 function text(label,w,h,x,y,z,parent=desk){const t=texture(512,96,g=>{g.fillStyle='#bdc3bb';g.font='30px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(label,256,48)});const m=add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}),x,y,z,parent);m.rotation.x=-Math.PI/2;return m}
 // The entire surface shares one chassis, with anodized metal cheeks and an upholstered wrist rest.
 box(25.5,.5,7.6,0,-.07,-1.43,dark);box(25.28,.052,7.38,0,.218,-1.43,dark);
 for(const x of [-12.8,12.8]){box(.35,.64,7.62,x,-.035,-1.43,wood);box(.025,.075,7.48,x-Math.sign(x)*.19,.25,-1.43,brass)}
 box(25.72,.28,.38,0,.03,2.51,black);
 for(const x of [-6.55,3.13,6.56])box(.034,.022,7.15,x,.257,-1.42,alloy);
 const knobs=[],aliasFaders=[];function knob(x,z,color=cream,channel=null){const k=cyl(.108,.15,x,.348,z,color);box(.018,.012,.073,x,.43,z-.02,black);if(channel){k.userData={channel};touchables.push(k)}for(let j=0;j<10;j++){const a=j/10*Math.PI*2;box(.013,.095,.013,x+Math.cos(a)*.11,.348,z+Math.sin(a)*.11,alloy)}return k}
 // EQ and send rows sit above the original eight functional fader strips.
 api.channels.forEach((c,i)=>{const x=-5.42+i*1.12;for(let row=0;row<4;row++){const k=knob(x,-4.16+row*.53,row===0?brass:cream,c.id);k.userData={channel:c.id,action:'param',key:['low','mid','high','room'][row]};}text('EQ / SEND',.75,.11,x,.255,-1.96)});
 const busNames=['DRUMS','BASS','MUSIC','FX','ROOM','DELAY'];
 for(const side of [-1,1])for(let i=0;i<6;i++){const x=side*9.43+(i-2.5)*.85,isBus=side<0;box(.77,.012,4.15,x,.253,.20,black);for(let row=0;row<3;row++)knob(x,-1.54+row*.43,isBus?cream:dark);box(.045,.014,1.88,x,.273,.80,black);for(let k=0;k<13;k++)box(k%3?.08:.14,.015,.012,x-.24,.282,-.13+k*.149,alloy);const f=box(.30,.11,.25,x,.337,isBus?1.65-(i>3?61:100)/100*1.68:1.65,alloy);box(.25,.015,.017,0,.065,0,black,f);if(isBus){f.userData={bus:busNames[i].toLowerCase(),action:'bus-fader'};touchables.push(f);aliasFaders.push({f,index:i})}text(isBus?busNames[i]:'LINE '+(i+9),.61,.13,x,.266,2.06);text(isBus?'BUS LEVEL':'NO INPUT',.60,.10,x,.268,-.22)}
 function display(x,width,map,label){const g=new THREE.Group();g.position.set(x,.34,-3.43);g.rotation.x=-Math.PI/2+.34;desk.add(g);box(width+ .18,1.56,.13,0,0,0,alloy,g);box(width+.08,1.46,.035,0,0,.08,black,g);const panel=add(new THREE.PlaneGeometry(width,1.34),new THREE.MeshBasicMaterial({map,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),0,0,.20,g);panel.userData.dynamic=true;panel.castShadow=panel.receiveShadow=false;text(label,width,.12,x,.259,-2.30);return panel}
 display(-9.43,4.76,dawTexture,'ARRANGEMENT');display(9.43,4.76,mixerTexture,'MIX BUS');
 // Master section also has its own screen; displays share the real session state.
 display(4.77,2.26,mixerTexture,'MASTER');
 const bridge=new THREE.Group();bridge.position.set(0,1.24,-4.95);bridge.rotation.x=-.17;desk.add(bridge);box(25.38,2.1,.55,0,.22,0,dark,bridge);box(25.45,.075,.58,0,1.31,0,alloy,bridge);for(const x of [-12.7,12.7])box(.17,2.22,.59,x,.22,0,wood,bridge);
 const meterTexture=texture(512,320,g=>{const a=g.createLinearGradient(0,0,0,320);a.addColorStop(0,'#9b6727');a.addColorStop(.22,'#dbb455');a.addColorStop(.58,'#e8c469');a.addColorStop(1,'#b98935');g.fillStyle=a;g.fillRect(0,0,512,320);g.strokeStyle='#493621';g.lineWidth=3;g.beginPath();g.arc(256,335,239,Math.PI*1.16,Math.PI*1.84);g.stroke();const nums=['−20','−10','−7','−5','−3','−1','0','1','2','3'];for(let i=0;i<28;i++){const a=Math.PI*(1.16+i/27*.68);g.strokeStyle=i>21?'#97382b':'#493621';g.beginPath();g.moveTo(256+Math.cos(a)*226,335+Math.sin(a)*226);g.lineTo(256+Math.cos(a)*(i%3?242:251),335+Math.sin(a)*(i%3?242:251));g.stroke()}g.font='23px Georgia';g.textAlign='center';for(let i=0;i<10;i++){const values=[-20,-10,-7,-5,-3,-1,0,1,2,3],a=Math.PI*(1.16+Math.pow(10,values[i]/20)/1.413*.68);g.fillStyle=i>7?'#97382b':'#493621';g.fillText(nums[i],256+Math.cos(a)*273,344+Math.sin(a)*273)}g.font='bold 33px Georgia';g.fillStyle='#483a23';g.fillText('VU',256,240);g.font='13px monospace';g.fillText('VOLUME UNIT',256,267);for(let i=0;i<10000;i++){g.fillStyle=i%2?'#ffffff08':'#00000008';g.fillRect((i*71)%512,(i*139)%320,1,1)}});
 const meterGlass=new THREE.MeshPhysicalMaterial({color:0xe7d5aa,transparent:true,opacity:.08,roughness:.12,metalness:.15,clearcoat:1,depthWrite:false});
 const meterLayout=[];
 for(let i=0;i<8;i++)meterLayout.push({x:-10.95+(i%4)*2.22,y:i<4?.80:-.27,w:1.64,h:.70,type:'channels',index:i,label:api.channels[i].name});
 for(let i=0;i<6;i++)meterLayout.push({x:-1.45+(i%3)*2.20,y:i<3?.80:-.27,w:1.53,h:.70,type:'buses',index:i,label:busNames[i]});
 for(let i=0;i<2;i++)meterLayout.push({x:7.38+i*2.86,y:.35,w:2.42,h:1.43,type:'master',index:i,label:'MIX '+(i?'R':'L')});
 for(const d of meterLayout){const {x,y,w,h}=d;box(w+.11,h+.11,.07,x,y,.315,black,bridge);box(w+.045,h+.05,.035,x,y,.366,brass,bridge);add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:meterTexture,toneMapped:false}),x,y,.39,bridge);const glass=box(w+.02,h+.02,.045,x,y,.431,meterGlass,bridge);glass.castShadow=false;const pivot=new THREE.Group();pivot.userData.dynamic=true;pivot.position.set(x,y-h*.48,.419);bridge.add(pivot);box(.009,h*.79,.009,0,h*.395,0,black,pivot);knobs.push({pivot,...d,value:1.05});const cap=cyl(.024,.022,x,y-h*.48,.435,black,bridge);cap.rotation.x=Math.PI/2;const label=texture(256,48,g=>{g.fillStyle='#aab9b6';g.font='22px monospace';g.textAlign='center';g.fillText(d.label,128,32)});add(new THREE.PlaneGeometry(w*.88,.13),new THREE.MeshBasicMaterial({map:label,transparent:true}),x,y-h/2-.14,.355,bridge)}
 const led=new THREE.MeshStandardMaterial({color:0xefb668,emissive:0xb67527,emissiveIntensity:.8});box(24.4,.016,.023,0,1.37,.29,led,bridge);
 for(const x of [-12.3,0,12.3]){const screw=cyl(.038,.02,x,.68,.315,black,bridge);screw.rotation.x=Math.PI/2}
 function update(now){const levels=api.readMeters(now);knobs.forEach(m=>{const rms=levels[m.type][m.index].vu;const reference=Math.pow(10,-18/20),voltage=Math.min(1.413,rms/reference);const target=1.05-voltage/1.413*2.10;m.value+=(target-m.value)*.22;m.pivot.rotation.z=m.value});aliasFaders.forEach(({f,index})=>{const value=api.audioState.engine?.buses[index].value??(index>3?61:100);f.position.z+=(1.65-value/100*1.68-f.position.z)*.28})}
 return{update};
}
