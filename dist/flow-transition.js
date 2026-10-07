import * as THREE from 'three';
import {createRecordSpace} from './record-space.js?v=20261006-lake-surface1';

const ease = t => { t = THREE.MathUtils.clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

// The same record meshes are projected into a full-screen bridge, then handed
// back to their original canvas at exactly the same screen-space coordinates.
export function createFlowTransition({ host, renderer }) {
 let active = null;
 function begin() {
  const vinyl = window.lotusVinyl;
  if (!vinyl) return false;
  window.lotusPortfolio.setView('vinyl');
  vinyl.beginEntrance();
  const parent = host.parentNode, next = host.nextSibling;
  const overlay = document.createElement('div'); overlay.className = 'flow-bridge';
  overlay.setAttribute('aria-hidden', 'true'); document.body.append(overlay);
  overlay.append(host); document.body.classList.add('flow-transition'); document.querySelector('main').inert=true;
  window.scrollTo({top:window.scrollY+document.getElementById('work').getBoundingClientRect().top,behavior:'auto'});
  const target = document.getElementById('vinyl-viewport').getBoundingClientRect();
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h);
  const scene = new THREE.Scene(),space=createRecordSpace(scene); scene.environment = vinyl.scene.environment;
  vinyl.scene.children.filter(x => x.isLight).forEach(x => scene.add(x.clone()));
  const fullHeight = (vinyl.camera.right - vinyl.camera.left) * h / w;
  const camera = new THREE.OrthographicCamera(vinyl.camera.left, vinyl.camera.right, fullHeight / 2, -fullHeight / 2, .1, 100);
  camera.position.set(0, ((target.top + target.height / 2) / h - .5) * fullHeight, 22);
  const records = vinyl.records.filter(r => r.body.active).map((r, i) => {
   const mesh = r.group.clone(true); scene.add(mesh);
   return { mesh, end: r.group.position.clone(), rotation: r.group.rotation.clone(), scale: r.group.scale.x, phase: i * 2.39996, relative: r.relative };
  });
  active = { parent, next, overlay, scene, space, camera, records, target, w, h, vinyl };
  renderer.autoClear = false;
  return true;
 }
 function render(p) {
  if (!active) return;
  active.overlay.dataset.phase=p<.48?'release':p<.75?'records':'settle';
  const a = active, emerge = ease((p - .12) / .67), settle = ease((p - .7) / .3);
  const fade = ease((p - .67) / .28);
  a.overlay.style.backgroundColor = `rgba(9,9,11,${1 - fade})`;
  document.body.style.setProperty('--flow-interface', fade);
  a.records.forEach(r => {
   const spread = .45 + Math.abs(r.relative) * .09;
   const originX = Math.cos(r.phase) * spread, originY = 1.1 + Math.sin(r.phase) * spread;
   r.mesh.position.set(THREE.MathUtils.lerp(originX, r.end.x, emerge), THREE.MathUtils.lerp(originY, r.end.y, emerge), THREE.MathUtils.lerp(-6, r.end.z, emerge));
   r.mesh.scale.setScalar(r.scale * (.005 + emerge * .995));
   r.mesh.rotation.set(THREE.MathUtils.lerp(1.35 + Math.sin(r.phase) * .4, r.rotation.x, emerge), THREE.MathUtils.lerp(Math.cos(r.phase) * 1.4, r.rotation.y, emerge), THREE.MathUtils.lerp(r.phase * .3, r.rotation.z, emerge));
  });
  // The open space becomes the archive viewport without a jump or scroll.
  const top = a.target.top * settle, bottom = THREE.MathUtils.lerp(a.h, a.target.bottom, settle);
  a.space.setOpacity(ease((p-.24)/.46));a.space.update(performance.now()*.001,Math.sin(p*Math.PI)*1.5,a.w/a.h);renderer.clearDepth(); renderer.setScissorTest(true);
  renderer.setScissor(0, Math.max(0, a.h - bottom), a.w, Math.max(1, bottom - top));
  renderer.toneMappingExposure = 1.25;
  renderer.render(a.scene, a.camera);
  renderer.setScissorTest(false);
 }
 function finish() {
  if (!active) return;
  const a = active; active = null;
  a.parent.insertBefore(host, a.next); a.overlay.remove();
  document.querySelector('main').inert=false; document.body.classList.remove('flow-transition'); document.body.style.removeProperty('--flow-interface');
  renderer.autoClear = true; renderer.toneMappingExposure = 1.15;
  renderer.setSize(host.clientWidth, host.clientHeight);
  a.vinyl.endEntrance();
 }
 return { begin, render, finish, get active() { return !!active; } };
}
