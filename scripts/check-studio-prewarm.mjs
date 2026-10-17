import assert from 'node:assert/strict';
import {warmStudioTextures,warmStudioGeometry,warmStudioPrograms} from '../dist/studio-prewarm.js';
import * as THREE from '../dist/vendor/three.module.js';

let clock=0,yields=0;const uploaded=[];
const textures=Array.from({length:9},()=>({isTexture:true,image:{width:2048,height:2048}}));
const pending={isTexture:true,image:{complete:false}},targetTexture={isTexture:true,isRenderTargetTexture:true,image:{width:64}};
const object={traverse:visit=>textures.forEach(map=>visit({material:{map,bumpMap:map,uniforms:{pending:{value:pending},target:{value:targetTexture}}}}))};
const result=await warmStudioTextures({initTexture:texture=>{uploaded.push(texture);clock+=4}},[object],{now:()=>clock,yieldFrame:async()=>{yields++;clock+=30},budgetMs:8});
assert.deepEqual(uploaded,textures,'Each original texture uploads once; pending images and live render targets wait');
assert.equal(yields,4);assert.equal(result.longestMs,8);
assert.ok(textures.every(texture=>texture.image.width===2048&&texture.image.height===2048),'Prewarming never downsizes source images');

const root=new THREE.Group();root.visible=false;
const geometry=new THREE.BoxGeometry(),material=new THREE.MeshBasicMaterial();
for(let i=0;i<5;i++)root.add(new THREE.Mesh(geometry,material));
const parent=new THREE.Mesh(geometry,material);root.add(parent);parent.add(new THREE.Mesh(geometry,material));
const hidden=new THREE.Mesh(geometry,material);hidden.visible=false;root.add(hidden);
const scene=new THREE.Scene();scene.add(root);let target='screen',drawn=new Set();
const renderer={shadowMap:{needsUpdate:true},getRenderTarget:()=>target,setRenderTarget:next=>target=next,render:()=>{scene.traverseVisible(object=>{if(object.isMesh)drawn.add(object)})}};
const options={batchSize:2,yieldFrame:async()=>{assert.equal(target,'screen');assert.equal(root.visible,false);assert.equal(hidden.visible,false)}};
await warmStudioGeometry(renderer,scene,new THREE.Camera(),[root],'offscreen',options);
assert.equal(drawn.size,7,'Nested meshes upload even when their parent belongs to an earlier batch');
assert.equal(root.visible,false);assert.equal(hidden.visible,false);assert.equal(renderer.shadowMap.needsUpdate,true);
renderer.render=()=>{throw new Error('context lost')};
await assert.rejects(warmStudioGeometry(renderer,scene,new THREE.Camera(),[root],'offscreen',options),/context lost/);
assert.equal(target,'screen');assert.equal(root.visible,false);assert.equal(hidden.visible,false);
console.log('Studio prewarm checks passed: bounded texture work, original resolution, nested geometry uploads, visibility and render target restored on failure.');

const compileRoot=new THREE.Group(),compileScene=new THREE.Scene();compileRoot.visible=false;compileScene.add(compileRoot);
for(let i=0;i<17;i++)compileRoot.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial()));
const compiled=[];
await warmStudioPrograms({async compileAsync(batch,camera,target){assert.equal(target,compileScene);assert.ok(batch.children.length<=4);batch.traverse(o=>{if(o.isMesh)compiled.push(o.material)})}},compileScene,new THREE.Camera(),[compileRoot],{batchSize:4,yieldFrame:async()=>assert.equal(compileRoot.visible,false)});
assert.equal(compiled.length,17);assert.equal(new Set(compiled).size,17);assert.equal(compileRoot.children.length,17);
console.log('Shader preparation compiles each material once in a shallow batch, preserving the original scene.');
