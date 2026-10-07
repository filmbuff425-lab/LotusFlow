import {prepareStudioClay,clayStats} from './studio-clay.js?v=20261007-mobile3';
import {canvasScale} from './device-profile.js';
import * as THREE from 'three';
import {createStudioSynths} from './studio-synths.js?v=20261007-mobile3';
import {studioLayout} from './studio-layout.js?v=20261006-lake-surface1';
import {createReferenceShelf} from './studio-reference-shelf.js?v=20261007-mobile3';
import {createSculpturalSpeakers} from './studio-sculptural-speakers.js?v=20261006-lake-surface1';
import {createStudioPersonalObjects} from './studio-personal-objects.js?v=20261007-performance1';
import {createStudioHospitality} from './studio-hospitality.js?v=20261007-mobile3';
import {batchStudio} from './studio-batch.js?v=20261007-mobile3';
import {createLivedInStudio} from './studio-lived-in.js?v=20261007-performance1';
import { createSessionScreens } from './studio-session-screens.js?v=20261007-mobile3';
import { createConsoleExtension } from './studio-console.js?v=20261006-lake-surface1';
import { createStudioDetails } from './studio-details.js?v=20261006-lake-surface1';
import {createRecordingRoom} from './studio-room.js?v=20261007-mobile3';

// Yield between model families so the cube, heartbeat and navigation keep responding.
const yieldToPage=()=>new Promise(resolve=>setTimeout(resolve,0));
export async function createStudioInterior({scene,root,renderer,api,camera,soundcube,host,touchables,selected}) {
 await prepareStudioClay();
 const measured=new URLSearchParams(location.search).has('perf'),stages={};let phaseAt=performance.now();
 const stage=label=>{if(measured)stages[label]=+(performance.now()-phaseAt).toFixed(1)};
 async function nextStage(label){stage(label);await yieldToPage();phaseAt=performance.now()}
 const mat = (color, metalness = 0, roughness = .5) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
 const carbon = mat(0x101115, .45, .34), black = mat(0x050507, .1, .5), silver = mat(0xadb5bc, .85, .25), rubber = mat(0x080909, 0, .92), panel = mat(0x212329, .7, .33), soft = mat(0x16171a, 0, 1), white = mat(0xf4f4ec, .1, .55);
 const cyan = new THREE.MeshStandardMaterial({ color: 0x84dcff, emissive: 0x39bdf3, emissiveIntensity: 2.5 });
 const red = new THREE.MeshStandardMaterial({ color: 0xf12938, emissive: 0xd81123, emissiveIntensity: 1.7 });
 const green = new THREE.MeshStandardMaterial({ color: 0x80e6bc, emissive: 0x36c390, emissiveIntensity: 1.4 });
 const warm = new THREE.MeshStandardMaterial({ color: 0xf1c362, emissive: 0xa66f0e, emissiveIntensity: 1.7 });
 const texture = (w, h, draw) => {
  const original=document.createElement('canvas'),scale=canvasScale(w,h);original.width=w;original.height=h;draw(original.getContext('2d'),w,h);
  let image=original;
  if(scale<1){image=document.createElement('canvas');image.width=Math.round(w*scale);image.height=Math.round(h*scale);image.getContext('2d').drawImage(original,0,0,image.width,image.height);original.width=original.height=1}
  const t=new THREE.CanvasTexture(image);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;
 };
 const wood = new THREE.MeshPhysicalMaterial({color:0x8da8b9,roughness:.12,metalness:.08,transmission:.12,thickness:.32,ior:1.47,transparent:true,opacity:.20,clearcoat:1,depthWrite:false});
 function box(w, h, d, x, y, z, material, parent = root, shadow = false) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material); m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m; }
 function bevel(w, h, d, radius, x, y, z, material, parent = root) { const r = Math.min(radius, w / 4, h / 4, d / 4), shape = new THREE.Shape(); shape.moveTo(-w / 2 + r, -h / 2 + r); shape.lineTo(w / 2 - r, -h / 2 + r); shape.lineTo(w / 2 - r, h / 2 - r); shape.lineTo(-w / 2 + r, h / 2 - r); shape.closePath(); const geo = new THREE.ExtrudeGeometry(shape, { depth: d - r * 2, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 3, steps: 1 }); geo.center(); const m = new THREE.Mesh(geo, material); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
 function cyl(r, h, x, y, z, material, parent = root, r2 = r) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r2, h, 28), material); m.position.set(x, y, z); parent.add(m); return m; }
 function textPlane(text, w, h, color = '#b8becb', background = '', parent = root, font = 28) { const t = texture(512, 128, g => { if (background) { g.fillStyle = background; g.fillRect(0, 0, 512, 128); } g.fillStyle = color; g.font = `500 ${font}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 64); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: !background, side: THREE.DoubleSide, depthWrite: !!background })); parent.add(m); return m; }
 function topText(text, x, y, z, w, h, color, parent = root, font = 28) { const p = textPlane(text, w, h, color, '', parent, font); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); return p; }
 const faders = [], leds = [], channelButtons = [], selectionLights = [], oleds = [];
 const grain = texture(512, 512, (g,w,h)=>{g.fillStyle='#8b8b8d';g.fillRect(0,0,w,h);for(let i=0;i<h;i++){g.fillStyle=i%3?'#ffffff0b':'#00000016';g.fillRect(0,i,w,1)}});
 const graphite = new THREE.MeshPhysicalMaterial({color:0x25262a,roughness:.38,metalness:.2,clearcoat:.25,bumpMap:grain,bumpScale:.012});
 panel.bumpMap=grain;panel.bumpScale=.006;silver.bumpMap=grain;silver.bumpScale=.006;
 // A thick glass desk with a graphite control surface and machined aluminum supports.
 // One continuous wide desktop; no attached wing or floating instrument tray.
 bevel(40.0,.32,15.8,.12,0,2.65,-1.0,wood);
 for(const x of[-18.4,18.4])for(const z of[-7.6,5.6]){box(.16,2.48,.16,x,1.24,z,silver);box(.55,.08,.55,x,.04,z,carbon)}
 bevel(25.1,.024,7.5,.01,0,2.825,-1.35,graphite);
 bevel(23.0, .23, 2.4, .10, 0, 4.05, -7.5, wood);
 for (const x of [-12.5, 12.5]) { box(.16, 2.5, 8.5, x, 1.27, -.1, carbon, root, true); box(1.4, .13, 8.8, x, .06, -.1, carbon); }
 box(25.0, .17, .15, 0, .6, -3, carbon);
 for(const x of[-19.95,19.95])box(.035,.055,15.7,x,2.48,-1,silver);for(const z of[-8.85,6.85])box(39.9,.055,.035,0,2.48,z,silver);
 box(22.7,.012,.016,0,4.175,-8.68,new THREE.MeshBasicMaterial({color:0x84b9d5,toneMapped:false}));
 topText('LOTUS / RECORDING CLUB',-8.75,2.85,4.37,2.9,.18,'#92939d',root,34);
 for (const x of [-10.6, -3.45, 3.45, 10.6]) box(.16, 1.12, 2.4, x, 3.36, -7.5, wood, root, true);
 function rack(x, z, width, count) {
  for (let row = 0; row < count; row++) {
   const y = 2.95 + row * .31; const m = row % 2 ? panel : silver; box(width, .28, .65, x, y, z, m);
   for (let j = 0; j < 6; j++) { const knob = cyl(.061, .05, x - width / 2 + .32 + j * .39, y, z + .35, black); knob.rotation.x = Math.PI / 2; const l = box(.045, .055, .018, knob.position.x + .12, y + .03, z + .383, j % 3 ? green : warm); }
   for (let j = 0; j < 2; j++) { box(.27, .16, .014, x + width / 2 - .6 + j * .32, y, z + .338, black); box(.2, .025, .02, x + width / 2 - .6 + j * .32, y, z + .35, warm); }
   for (const side of [-1, 1]) { const screw = cyl(.027, .01, x + side * (width / 2 - .1), y, z + .34, black); screw.rotation.x = Math.PI / 2; }
  }
 }
 rack(-7.7, -7.3, 6.1, 3); rack(7.7, -7.3, 6.1, 3);

 await nextStage('desk');
 // Eight individually functional channels in an angled, anodized control surface.
 const desk = new THREE.Group(); desk.position.set(0, 3.42, .25); desk.rotation.x = .105; root.add(desk);
 // Level feet support the tilted chassis without crossing the tabletop.
 for(const x of [-5.5,5.5])for(const z of [-1.85,1.85]){const bottom=3.42-.28*Math.cos(.105)-z*Math.sin(.105),h=bottom-2.81;box(.4,h,.38,x,2.81+h/2,.25+z*Math.cos(.105)-.28*Math.sin(.105),rubber,root,true)}


 for (const x of [-6.12, 6.12]) for (const z of [-2, 2]) { cyl(.035, .015, x, .263, z, black, desk); }
 const stripX = i => -5.42 + i * 1.12;
 api.channels.forEach((c, i) => {
  const x = stripX(i); const strip = box(1.025, .014, 3.86, x, .263, .03, carbon, desk); strip.userData.channel = c.id; touchables.push(strip);
  const selectLight = box(.49, .022, .14, x, .292, -1.75, cyan.clone(), desk); selectLight.userData = { channel: c.id }; touchables.push(selectLight); selectionLights.push(selectLight);
  const screen = textPlane(`${String(i + 1).padStart(2, '0')}  ${c.name}`, .83, .37, '#b5e1ff', '#071420', desk, 39); screen.rotation.x = -Math.PI / 2; screen.position.set(x, .28, -1.39); screen.userData.channel = c.id; touchables.push(screen); oleds.push({screen,last:null});
  topText('PAN    < C >', x, .286, -1.09, .74, .13, '#7cb9d0', desk, 31);
  const knob = cyl(.148, .18, x, .365, -.83, black, desk, .16); knob.userData={channel:c.id,action:'param',key:'pan'}; touchables.push(knob);
  const knurl=new THREE.InstancedMesh(new THREE.BoxGeometry(.016,.11,.014),silver,24);const matrix=new THREE.Matrix4();
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2;matrix.makeTranslation(x+Math.cos(a)*.15,.365,-.83+Math.sin(a)*.15);knurl.setMatrixAt(k,matrix)}desk.add(knurl);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.157, .009, 6, 28), silver); ring.rotation.x = Math.PI / 2; ring.position.set(x, .293, -.83); desk.add(ring); box(.02, .009, .086, x, .459, -.873, white, desk);
  const buttons = {};
  for (const [j, action] of ['mute', 'solo'].entries()) { const bt = bevel(.27, .06, .19, .018, x + (j ? .2 : -.2), .306, -.38, white.clone(), desk); bt.userData = { channel: c.id, action }; touchables.push(bt); buttons[action] = bt; topText(j ? 'S' : 'M', bt.position.x, .34, -.38, .22, .15, '#17202a', desk, 54); } channelButtons.push(buttons);
  box(.062, .016, 1.82, x, .283, .81, black, desk);
  for (let tick = 0; tick < 13; tick++) { const z = -.09 + tick * .15; box(tick % 3 ? .1 : .16, .008, .011, x - .29, .281, z, silver, desk); }
  topText('0', x - .38, .286, -.12, .25, .12, '#7a838f', desk, 44); topText('−∞', x - .38, .286, 1.72, .25, .12, '#7a838f', desk, 44);
  const fader = bevel(.32, .13, .26, .025, x, .348, 1.65 - c.value / 100 * 1.68, silver, desk); box(.27, .013, .022, 0, .075, 0, black, fader); fader.userData = { channel: c.id, action: 'fader' }; touchables.push(fader); faders.push(fader); for(const dz of [-.074,-.04,.04,.074])box(.235,.009,.009,0,.07,dz,panel,fader);
  const meter = []; for (let k = 0; k < 16; k++) { const light = box(.06, .011, .066, x + .39, .282, 1.69 - k * .112, new THREE.MeshStandardMaterial({ color: 0x173734, emissive: 0x58deba, emissiveIntensity: .02 }), desk); meter.push(light); } leds.push(meter);
  topText(c.name, x, .285, 1.96, .82, .14, '#aab4c1', desk, 35);
 });
 box(.025, .015, 4, 3.13, .278, 0, silver, desk);
 topText('LOTUS FLOW', 4.61, .29, -1.88, 2.16, .25, '#d3d9e3', desk, 41); topText('LF–08   /   SESSION CONTROL', 4.61, .29, -1.57, 2.15, .13, '#8695a9', desk, 28);
 for (let row = 0; row < 3; row++) for (let col = 0; col < 4; col++) { const x = 3.62 + col * .58, z = -1.12 + row * .39; bevel(.32, .055, .21, .012, x, .29, z, row === 0 ? cyan : white, desk); topText(['READ', 'WRITE', 'TOUCH', 'LATCH', 'BANK', 'TRACK', 'PAN', 'SEND', 'UNDO', 'SAVE', 'LOOP', 'CLICK'][row * 4 + col], x, .282, z + .16, .43, .10, '#7b8797', desk, 33); }
 const jog = cyl(.45, .22, 4.62, .385, .51, silver, desk); cyl(.36, .026, 4.62, .508, .51, carbon, desk); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; box(.018, .13, .017, 4.62 + Math.cos(a) * .454, .391, .51 + Math.sin(a) * .454, black, desk); }
 topText('NAVIGATE / ZOOM', 4.62, .285, 1.18, 1.5, .14, '#9ba9b9', desk, 32);
 const playButton = bevel(.64, .07, .30, .02, 5.16, .305, 1.7, green.clone(), desk); playButton.userData.action = 'play'; touchables.push(playButton); topText('PLAY', 5.16, .349, 1.7, .51, .18, '#102318', desk, 41);
 const stopButton = bevel(.64, .07, .30, .02, 4.26, .305, 1.7, white, desk); stopButton.userData.action = 'stop'; touchables.push(stopButton); topText('STOP', 4.26, .349, 1.7, .51, .18, '#17202a', desk, 41);
 for (let i = 0; i < 12; i++) { const jack = cyl(.058, .09, -5.4 + i * .56, -.03, -2.28, black, desk); jack.rotation.x = Math.PI / 2; const ring = new THREE.Mesh(new THREE.TorusGeometry(.07, .016, 8, 18), silver); ring.position.set(jack.position.x, -.03, -2.335); desk.add(ring); }
 await nextStage('channels');
 // The display shows an original arrangement view, driven by this demo's eight channels.
 const display = new THREE.Group(); display.position.set(-6.35,10.25,-7.4); display.rotation.y=.06; root.add(display);
 // Continuous edge-to-edge display glass; only a hairline silver chassis is exposed.
 bevel(12.34,6.97,.12,.028,0,0,0,silver,display);bevel(12.305,6.93,.015,.003,0,0,.073,black,display);
 box(.43,3.90,.14,0,-4.04,-.19,silver,display);bevel(2.70,.095,1.70,.035,0,-6.035,.16,silver,display);
 const cameraDot=new THREE.Mesh(new THREE.SphereGeometry(.019,12,8),black);cameraDot.position.set(0,3.45,.092);display.add(cameraDot);
 for(let k=0;k<36;k++){const vent=cyl(.014,.010,-3.9+k*.22,3.24,-.07,black,display);vent.rotation.x=Math.PI/2;}
 for(let k=0;k<4;k++)box(.10,.043,.012,2.9+k*.22,-2.20,-.07,black,display);
 const hinge=cyl(.23,.82,0,-1.9,-.20,silver,display);hinge.rotation.z=Math.PI/2;
 const dawCanvas=document.createElement('canvas');dawCanvas.width=1280;dawCanvas.height=720;const dawTexture=new THREE.CanvasTexture(dawCanvas);dawTexture.colorSpace=THREE.SRGBColorSpace;
 // Keep the LCD in front of the chassis at every orbit distance. The old
 // 0.0045-unit clearance was smaller than a depth-buffer step at wide views.
 const screenMaterial=map=>new THREE.MeshBasicMaterial({map,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(12.27,6.902),screenMaterial(dawTexture));screen.position.set(0,0,.20);display.add(screen);
 box(.24,.12,.11,0,-2.10,-.145,black,display);
 const displayRight=display.clone(true);displayRight.position.x=6.35;displayRight.rotation.y=-.06;root.add(displayRight);
 const mixerCanvas=document.createElement('canvas');mixerCanvas.width=1280;mixerCanvas.height=720;const mixerTexture=new THREE.CanvasTexture(mixerCanvas);mixerTexture.colorSpace=THREE.SRGBColorSpace;
 const rightScreen=displayRight.children.find(c=>c.geometry?.type==='PlaneGeometry');rightScreen.material=screenMaterial(mixerTexture);
 for(const map of [dawTexture,mixerTexture]){map.anisotropy=4;map.generateMipmaps=false;map.minFilter=THREE.LinearFilter;map.magFilter=THREE.LinearFilter;}
 for(const displayScreen of [screen,rightScreen]){displayScreen.castShadow=false;displayScreen.receiveShadow=false;displayScreen.userData={dynamic:true,action:'computer',label:'CLICK TO USE MY COMPUTER'};touchables.push(displayScreen)}
 // Signal cables exit at the rear I/O, descend behind the desk, and follow a service tray.
 function cable(points) { const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,48,.024,7,false),black)); }
 box(34,.28,.66,0,2.08,-9.08,carbon);
 for(const side of [-1,1]){cable([[side*6.35,8.15,-7.55],[side*6.35,6.3,-7.80],[side*6.35,4.4,-8.05],[side*6.35,3.5,-9.15],[side*6.35,2.24,-9.15],[side*8.4,2.24,-9.15]]);}
 const consoleExtension=createConsoleExtension({desk,texture,api,touchables,dawTexture,mixerTexture});
 const sessionScreens=createSessionScreens({api,arrange:dawCanvas,mix:mixerCanvas,dawTexture,mixerTexture,selected});sessionScreens.update(0);
 soundcube.attachRoom(createRecordingRoom({root,renderer,texture,camera,scene}));
 await nextStage('displaysRoom');
 const details=createStudioDetails({scene,root,renderer,api,touchables,texture,topText,selected,camera,soundcube});
 createLivedInStudio(root);
 await nextStage('details');
 const personal=createStudioPersonalObjects({root,texture});personal.lounge.position.set(...studioLayout.lounge);personal.lounge.scale.set(...studioLayout.loungeScale);personal.lounge.rotation.y=studioLayout.loungeRotation;personal.chair.rotation.y=-.16;personal.cup.position.set(6.0,2.83,5.45);
 await nextStage('personal');
 const archive=createReferenceShelf({root,texture});archive.group.position.set(...studioLayout.shelf);// Archive shelf is decorative; no camera or release hotspot.
 await nextStage('archive');
 const soundSystem=createSculpturalSpeakers({root,texture});soundSystem.rack.position.set(-27,0,-20);
 for(const speaker of soundSystem.speakers){const target=new THREE.Mesh(new THREE.CylinderGeometry(2.30,2.30,12.8,16),new THREE.MeshBasicMaterial({visible:false}));target.position.y=6.4;target.userData={action:'play',label:'SCULPTURAL SOUND SYSTEM / PLAY & PAUSE'};speaker.add(target);touchables.push(target)}
 host.dataset.roomObjects="electric-guitar,kill-bill-poster,pixel-logo-water-glass,leather-roller-chair,cowhide-lounge,glass-camera-shelf,leica-film-camera,vinyl,lit-scented-candle,wool-sofa-throw,frosted-white-speakers,round-glass-coffee-table,left-wall-modular-glass-console,stone-espresso-machine,recording-microphone,amplifier-rack,lyric-notebook,moog-subsequent-37,prophet-6,two-tier-synth-stand,silver-h100,smartphone,festival-keepsakes,richard-hennessy,macallan-18,cut-crystal-whisky-cups,headphone-stand,rear-cable-tray,dracaena-marginata";
 host.dataset.referenceObjects=JSON.stringify({chair:personal.bounds.chair,cup:personal.bounds.cup,lounge:personal.bounds.lounge,loungePosition:studioLayout.lounge,loungeRotation:studioLayout.loungeRotation,loungeScale:studioLayout.loungeScale,coffeeTable:studioLayout.coffeeTable,synthPosition:studioLayout.synths,synthRotation:studioLayout.synthRotation,shelf:studioLayout.shelf,room:studioLayout.shell});
 await nextStage('speakers');
 const hospitality=createStudioHospitality({root,texture});hospitality.table.position.set(...studioLayout.coffeeTable);host.dataset.rearPlant=JSON.stringify(root.userData.rearPlant);
 const synths=createStudioSynths({root,texture,touchables});host.dataset.synthBounds=JSON.stringify(synths.bounds);
 // Ordinary room glazing stays lightweight. Only the two frosted speaker solids
 // use the shared half-resolution transmission pass; keep their optical depth.
 scene.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.transmission>0&&!m.userData.preserveTransmission){if(m.opacity>.6)m.opacity=.24;m.transmission=0;m.depthWrite=false;m.needsUpdate=true}if(m.transparent&&m.side===THREE.DoubleSide&&o.geometry.type==='PlaneGeometry')m.forceSinglePass=true}}});
 await nextStage('hospitalitySynths');
 // Keep zero-alpha hit meshes available to raycasting without submitting them to the GPU.
 let hitOnly=0;root.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)&&o.material.transparent&&o.material.opacity===0&&!o.children.length){o.visible=false;hitOnly++}});host.dataset.hitOnlyMeshes=String(hitOnly);
 const batching=batchStudio(root,touchables);host.dataset.staticMeshes=JSON.stringify(batching);stage('batch');if(measured){host.dataset.modelTimings=JSON.stringify(stages);host.dataset.sculptureGeometry=JSON.stringify(clayStats())}
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const backdrop=details.room;touchables.push(...details.soundcube.recordTargets);
 return {desk,faders,leds,channelButtons,selectionLights,oleds,details,soundSystem,archive,synths,consoleExtension,sessionScreens,backdrop};
}
