import * as THREE from 'three';
import {createHomeParticles} from './home-particles.js?v=20261006-lake-surface1';

// A living sound field: cellular membranes, nuclei and thousands of spatial samples.
export async function createSoundCells(scene, reduced) {
 const group = new THREE.Group(); scene.add(group);
 const shell = new THREE.MeshPhysicalMaterial({ color: 0x9a082b, metalness: .68, roughness: .19, clearcoat: 1, clearcoatRoughness: .12, transparent: true, opacity: .62, side: THREE.DoubleSide, depthWrite: false, emissive: 0x330008, emissiveIntensity: .13, envMapIntensity: .65 });
 const nucleusMaterial = new THREE.MeshStandardMaterial({ transparent: true, color: 0xffced4, roughness: .3, metalness: .35, emissive: 0xf1132c, emissiveIntensity: .65 });
 const membrane = new THREE.SphereGeometry(1, 24, 16); const cells = [];
 for (let i = 0; i < 48; i++) {
  const phi = Math.acos(1 - 2 * (i + .5) / 48), theta = i * Math.PI * (3 - Math.sqrt(5));
  const base = new THREE.Vector3(Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi));
  const radius = 2.05 + Math.sin(i * 3.71) * .22; base.multiplyScalar(radius);
  const size = .36 + (Math.sin(i * 2.47) + 1) * .14;
  const cell = new THREE.Mesh(membrane, shell); cell.position.copy(base); cell.scale.set(size * 1.16, size, size * .88); group.add(cell);
  const nucleus = new THREE.Mesh(membrane, nucleusMaterial); nucleus.scale.setScalar(size * .27); cell.add(nucleus); nucleus.scale.setScalar(.27);
  cells.push({ mesh: cell, base, size, phase: i * .79 });
 }
 const count = 5000, positions = new Float32Array(count * 3), bases = new Float32Array(count * 3), seeds = new Float32Array(count), colors = new Float32Array(count * 3);
 for (let i = 0; i < count; i++) {
  const phi = Math.acos(1 - 2 * (i + .5) / count), theta = i * 2.399963; const r = 2.95 + Math.sin(i * 5.17) * .10;
  bases[i * 3] = Math.cos(theta) * Math.sin(phi) * r; bases[i * 3 + 1] = Math.cos(phi) * r; bases[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
  seeds[i] = (Math.sin(i * 127.1) + 1) / 2;
  const c = new THREE.Color(i % 5 === 0 ? 0xff4859 : i % 3 === 0 ? 0xffb7be : 0xffffff); c.toArray(colors, i * 3);
 }
 const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(positions, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
 const pointCanvas = document.createElement('canvas'); pointCanvas.width = pointCanvas.height = 32; const g = pointCanvas.getContext('2d'); const glow = g.createRadialGradient(16, 16, 0, 16, 16, 16); glow.addColorStop(0, '#fff'); glow.addColorStop(.35, '#ffffffd9'); glow.addColorStop(.72, '#ffffff44'); glow.addColorStop(1, '#ffffff00'); g.fillStyle = glow; g.fillRect(0, 0, 32, 32);
 const pointTexture = new THREE.CanvasTexture(pointCanvas);
 const material = new THREE.PointsMaterial({ size: .072, map: pointTexture, vertexColors: true, transparent: true, depthWrite: false, opacity: .94, blending: THREE.AdditiveBlending, sizeAttenuation: true });
 const particles = new THREE.Points(geo, material); group.add(particles);
 const surrounding = await createHomeParticles(scene, pointTexture, reduced);
 const waves = [];
 for (let j = 0; j < 3; j++) { const curve = new THREE.BufferGeometry(); const data = new Float32Array(221 * 3); curve.setAttribute('position', new THREE.BufferAttribute(data, 3)); const m = new THREE.LineBasicMaterial({ color: j === 1 ? 0xff818c : 0xffffff, transparent: true, opacity: .23 }); const line = new THREE.LineLoop(curve, m); line.rotation.set(.4 + j * .8, .4 * j, .2 * j); group.add(line); waves.push({ line, data, j }); }
 let hovered = null;
 function hover(mesh) { hovered = mesh; }
 function update(now, { reveal = 1, burst = 0, dissolve = 0, pointer, spin = 0, tilt = 0 } = {}) {
  surrounding.update(now,{reveal,burst,dissolve,pointer});
  const t = reduced ? 0 : now * .001, breathe = Math.sin(t * 1.3) * .055;
  group.position.set(0, .65, -1.2); group.visible = dissolve < .999; group.rotation.y = spin + (reduced ? 0 : t * .10) + (pointer?.x || 0) * .25; group.rotation.x = tilt + (pointer?.y || 0) * .18;
  group.scale.setScalar(1.10 - reveal * .10);
  cells.forEach((c, i) => { const pulse = 1 + Math.sin(t * 1.3 + c.phase) * .055 + (hovered === c.mesh ? .09 : 0); const split = burst * (1.2 + i % 4 * .22); c.mesh.position.copy(c.base).multiplyScalar(1 + breathe + split); c.mesh.scale.set(c.size * 1.16 * pulse, c.size / pulse, c.size * .88 * pulse); });
  shell.opacity = (.66 - burst * .35) * (1-dissolve); nucleusMaterial.opacity = 1-dissolve;
  for (let i = 0; i < count; i++) {
   const ix = i * 3, x = bases[ix], y = bases[ix + 1], z = bases[ix + 2];
   const wave = Math.sin(y * 3.2 + t * 1.6) * Math.cos(x * 2.1 - t * .6) * .09;
   const expansion = 1 + breathe + wave + burst * (1.7 + seeds[i] * 4.2);
   positions[ix] = x * expansion; positions[ix + 1] = y * expansion; positions[ix + 2] = z * expansion;
  }
  geo.attributes.position.needsUpdate = true; material.size = .066 + burst * .028; material.opacity = (.86 - burst * .20) * (1-dissolve);
  waves.forEach(({ line, data, j }) => { const radius = 3.22 + j * .19 + burst * (6 + j * 2); for (let i = 0; i < 221; i++) { const a = i / 220 * Math.PI * 2, ripple = Math.sin(a * 12 + t * 2 + j) * .095; data[i * 3] = Math.cos(a) * (radius + ripple); data[i * 3 + 1] = Math.sin(a) * (radius + ripple); data[i * 3 + 2] = Math.sin(a * 5 + t) * .11; } line.geometry.attributes.position.needsUpdate = true; line.material.opacity = (.21 + burst * .18) * (1-dissolve); });
 }
 update(0, { reveal: 0 }); return { group, update, cells, particles, hitTargets: cells.map(c => c.mesh), hover };
}
