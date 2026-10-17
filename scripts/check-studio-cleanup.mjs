import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from '../dist/vendor/three.module.js';
import {studioLayout} from '../dist/studio-layout.js';
const read=file=>fs.readFileSync('dist/'+file,'utf8');
const source=file=>read(file).replace(/^import .*$/gm,'').replaceAll('export function','function');
function canvas(){
 const element={width:0,height:0};
 const context=new Proxy({canvas:element,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*10})},{get:(target,key)=>key in target?target[key]:()=>{}});
 element.getContext=()=>context;return element;
}
const stage=new THREE.Group(),scene=new THREE.Scene(),targets=[],api={audioState:{playing:false}};
const context=vm.createContext({THREE,document:{createElement:tag=>{assert.equal(tag,'canvas');return canvas()}},Image:class{},studioLayout,createSharedTextureLoader:()=>({load:()=>new THREE.Texture()})});
for(const file of ['studio-h100.js','studio-instruments.js','studio-lived-in.js'])vm.runInContext(source(file),context);
const add=(geometry,material,parent,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh};
const box=(w,h,d,x,y,z,material,parent=stage)=>add(new THREE.BoxGeometry(w,h,d),material,parent,x,y,z);
const cylinder=(r,h,x,y,z,material,parent=stage)=>add(new THREE.CylinderGeometry(r,r,h,16),material,parent,x,y,z);
const cords=[];
const instruments=vm.runInContext('createInstruments',context)({root:stage,scene,api,texture:(w,h,draw)=>{const c=canvas();c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return new THREE.CanvasTexture(c)},topText(){},add,box,cylinder,slab:(w,d,h,r,x,y,z,m,p)=>box(w,h,d,x,y,z,m,p),cord:points=>cords.push(points),register:(mesh,data)=>{mesh.userData=data;targets.push(mesh);return mesh}});
vm.runInContext('createLivedInStudio',context)(stage);
const names=[];stage.traverse(object=>names.push(object.name));
assert.ok(names.some(name=>name.includes('Silver Beoplay H100')),'Headphones stay in the studio');
for(const name of ['Satin aluminum headphone stand','MIDI keyboard on the glass desktop','Right desktop monitor controller','Electric guitar','Grounded padded guitar stand','Taped official Kill Bill poster','Pixel Lotus Flow glass decal'])assert.ok(names.includes(name),'Preserve '+name);
assert.ok(!names.some(name=>/notebook|iPhone|headphone audio interface/i.test(name)),'Removed desk accessories are not instantiated');
assert.equal(cords.length,2,'Only MIDI and monitor-controller cabling remains');assert.ok(cords.every(points=>points[0][0]>0),'No abandoned left interface cable is built');
assert.ok(targets.some(mesh=>mesh.userData.action==='note'));instruments.update(1000);

// Missing deleted HTML controls must not prevent the minimal scene from starting.
const studio=read('studio.js'),startup=studio.slice(studio.indexOf('let selected ='),studio.indexOf('const soundEntryPending='));
const init=vm.createContext({api:{channels:[{id:'kick'},{id:'bass'}]},host:{},IntersectionObserver:class{observe(){}},document:{querySelector(){throw new Error('Deleted lab DOM was accessed')}}});
vm.runInContext(startup,init);vm.runInContext("selectChannel('bass')",init);assert.equal(vm.runInContext('selected',init),'bass');vm.runInContext("selectChannel('missing')",init);assert.equal(vm.runInContext('selected',init),'bass');

// Old callers cannot reopen the removed mode or interrupt current playback.
const modeSource=read('studio-player.js').match(/ async function setMode\(next,\{start=true\}=\{\}\)\{([^\n]+)\}/)?.[1];assert.ok(modeSource);
let mode='music',paused=0,plays=0,request=0;const media={paused:true},node={classList:{add(){},toggle(){}},querySelectorAll:()=>[]};
const playerContext=vm.createContext({mode,request,current:()=>media,fadeMedia:async()=>{},stopOpeningGently(){},pauseScreen(){paused++},section:node,panel:node,$:()=>({}),room:true,play(){plays++},sync(){}});
vm.runInContext(`async function setMode(next,{start=true}={}){${modeSource}}`,playerContext);
assert.equal(await vm.runInContext("setMode('session')",playerContext),false);assert.equal(paused,0);assert.equal(plays,0);assert.equal(vm.runInContext('mode',playerContext),'music');
assert.equal(await vm.runInContext("setMode('video',{start:false})",playerContext),true);assert.equal(vm.runInContext('mode',playerContext),'video');assert.equal(plays,0);
assert.equal(await vm.runInContext("setMode('music')",playerContext),true);assert.equal(plays,1);
for(const file of ['studio-player.js','studio-desktop.js','studio-mobile-room.js'])assert.doesNotMatch(read(file),/data-(?:screen|mode)="session"|setMode\('session'\)|mac-session|Sound [Ll]ab|SOUND LAB/);
console.log('Studio cleanup passed: requested accessories and orphan cable removed; headphones/stand, instruments, guitar and poster preserved; startup needs no removed lab DOM; retired session mode cannot interrupt playback; music/video switching still works.');
