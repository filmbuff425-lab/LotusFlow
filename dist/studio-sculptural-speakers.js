import * as THREE from 'three';

// Frosted resin speaker bodies follow the updated 4722/4723 reference.
export function createSculpturalSpeakers({ root, texture }) {
  const group = new THREE.Group(); group.name = 'Frosted white speaker pair and amplifier rack';
  group.userData.reference = 'IMG_4722 / IMG_4723; amplifier rack IMG_4704'; root.add(group);
  const geometryCache = new Map();
  const geo = (name, values, create) => {
    const key = `${name}/${values.join('/')}`;
    if (!geometryCache.has(key)) geometryCache.set(key, create());
    return geometryCache.get(key);
  };
  const add = (geometry, material, parent, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  };
  const box = (parent, w, h, d, x, y, z, material) => add(geo('box', [w, h, d], () => new THREE.BoxGeometry(w, h, d)), material, parent, x, y, z);
  const cylinder = (parent, r, h, x, y, z, material, rb = r, open = false) => add(geo('cylinder', [r, rb, h, open], () => new THREE.CylinderGeometry(r, rb, h, r < .18 ? 12 : 40, 1, open)), material, parent, x, y, z);
  const torus = (parent, r, tube, x, y, z, material) => add(geo('torus', [r, tube], () => new THREE.TorusGeometry(r, tube, 6, 40)), material, parent, x, y, z);
  const sphere = (parent, r, x, y, z, material) => add(geo('sphere', [r], () => new THREE.SphereGeometry(r, r < .1 ? 8 : 36, r < .1 ? 6 : 24)), material, parent, x, y, z);
  const line = (parent, points, radius, material, segments = 20) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, 6, false), material, parent);
  let seed = 4703;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const brush = texture(256, 512, (g, w, h) => {
    g.fillStyle = '#959ca2'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1700; i++) {
      const x = rand() * w, y = rand() * h, v = 100 + Math.round(rand() * 105);
      g.strokeStyle = `rgba(${v},${v},${v},${.06 + rand() * .18})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40 + rand() * 260); g.stroke();
    }
    const reflect = g.createLinearGradient(0, 0, w, 0);
    reflect.addColorStop(0, '#3c444733'); reflect.addColorStop(.2, '#ffffff12'); reflect.addColorStop(.47, '#202b3328'); reflect.addColorStop(.69, '#ffffff30'); reflect.addColorStop(1, '#343a4322');
    g.fillStyle = reflect; g.fillRect(0, 0, w, h);
  });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc6ccd1, map: brush, bumpMap: brush, bumpScale: .016, metalness: .91, roughness: .28 });
  const mirror = new THREE.MeshStandardMaterial({ color: 0xdbe2e6, metalness: .98, roughness: .12 });
  const copperWeld = new THREE.MeshStandardMaterial({ color: 0x75513a, roughness: .72, metalness: .53 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x090c0d, roughness: .77, metalness: .06 });
  const grille = new THREE.MeshStandardMaterial({ color: 0x131a1b, roughness: .82 });
  const faceplate = new THREE.MeshStandardMaterial({ color: 0x6c7375, metalness: .84, roughness: .35 });
  const green = new THREE.MeshStandardMaterial({ color: 0x8ebca2, emissive: 0x3aab66, emissiveIntensity: 1.15, roughness: .42 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x84adbc, emissive: 0x266c86, emissiveIntensity: .46, roughness: .45 });
  const warmCopper = new THREE.MeshStandardMaterial({ color: 0xa57a52, metalness: .91, roughness: .27 });
  const screw = (parent, x, y, z, material = mirror, r = .028) => {
    const head = cylinder(parent, r, .025, x, y, z, material); head.rotation.x = Math.PI / 2;
    box(parent, r * 1.2, .010, .007, x, y, z + .015, dark); return head;
  };
  const rod = (parent, a, b, radius = .045) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), d = end.clone().sub(start);
    const m = cylinder(parent, radius, d.length(), ...(start.add(end).multiplyScalar(.5).toArray()), mirror);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m;
  };
  // Reference 4722/4723: a quiet, tall frosted resin column with one narrow oval driver.
  const frostMap=texture(256,256,(g,w,h)=>{const im=g.createImageData(w,h);for(let i=0;i<w*h;i++){const v=190+rand()*23;im.data.set([v,v,v,255],i*4)}g.putImageData(im,0,0)});frostMap.colorSpace=THREE.NoColorSpace;
  // A transmitting solid with a satin exterior, not an opaque white cabinet.
  // White attenuation preserves the milky body; the enclosed red light is
  // integrated along the view ray so its depth changes naturally when orbiting.
  const wax=new THREE.MeshPhysicalMaterial({
    color:0xfafaf6,metalness:0,roughness:.52,transmission:.91,
    thickness:2.35,ior:1.42,attenuationColor:0xf8f6f0,attenuationDistance:14,
    bumpMap:frostMap,bumpScale:.002,clearcoat:.02,clearcoatRoughness:.56,
    specularIntensity:.38,opacity:1,depthWrite:true
  });
  wax.name='Translucent white wax · micro-etched exterior · enclosed red light';
  wax.userData.preserveTransmission=true;
  const breathingGlow={value:1},reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  wax.onBeforeCompile=shader=>{
    shader.uniforms.uWaxGlow=breathingGlow;
    shader.vertexShader=shader.vertexShader
      .replace('#include <common>','#include <common>\nvarying vec3 vWax;\nvarying vec3 vWaxEye;')
      .replace('#include <begin_vertex>',`#include <begin_vertex>
        vWax=position;
        vWaxEye=(inverse(modelMatrix)*vec4(cameraPosition,1.)).xyz;
      `);
    shader.fragmentShader=shader.fragmentShader
      .replace('#include <common>','#include <common>\nvarying vec3 vWax;\nvarying vec3 vWaxEye;\nuniform float uWaxGlow;')
      .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        vec3 ray=normalize(vWax-vWaxEye);
        vec3 boxSize=vec3(1.65,5.94,1.39);
        vec3 safeRay=mix(vec3(-1.),vec3(1.),step(vec3(0.),ray))*max(abs(ray),vec3(.0001));
        vec3 farT=max((-boxSize-vWax)/safeRay,(boxSize-vWax)/safeRay);
        float path=max(0.,min(farT.x,min(farT.y,farT.z)));
        float redDensity=0.;
        for(int i=0;i<8;i++){
          vec3 p=vWax+ray*path*(float(i)+.5)/8.;
          vec3 q=(p-vec3(0.,-2.15,-.10))/vec3(.80,2.45,.87);
          redDensity+=exp(-dot(q,q)*1.6)*path/8.;
        }
        float milk=1.-exp(-path*.10);
        totalEmissiveRadiance+=vec3(.14,.145,.15)*milk;
        totalEmissiveRadiance+=vec3(.78,.009,.002)*redDensity*uWaxGlow;
      `);
  };
  wax.customProgramCacheKey=()=> 'frosted-wax-volume-v4';
  function createSpeaker(x){
    const speaker=new THREE.Group();speaker.name='White frosted wax-resin speaker';speaker.position.set(x,0,-13.6);speaker.rotation.y=x<0?.10:-.10;group.add(speaker);
    const shape=new THREE.Shape(),w=3.25,h=11.8,r=.045;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
    const faceOpening=new THREE.Path();faceOpening.moveTo(-.54,-1.78);faceOpening.lineTo(-.54,5.38);faceOpening.lineTo(.54,5.38);faceOpening.lineTo(.54,-1.78);faceOpening.closePath();shape.holes.push(faceOpening);
    const body=new THREE.ExtrudeGeometry(shape,{depth:2.7,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:6});body.center();const uv=body.attributes.uv,pos=body.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);const shell=add(body,wax,speaker,0,6.0,0);shell.name='Frosted transmitting shell';shell.castShadow=false;
    // The inset has its own opening; no transparent front skin crosses the grille.
    box(speaker,1.12,7.24,.075,0,7.8,1.405,dark);
    const insetShape=new THREE.Shape();insetShape.moveTo(-.48,-3.51);insetShape.lineTo(.48,-3.51);insetShape.lineTo(.48,3.51);insetShape.lineTo(-.48,3.51);insetShape.closePath();
    const aperture=new THREE.Path();aperture.absellipse(0,-.08,.405,1.30,0,Math.PI*2,true);insetShape.holes.push(aperture);
    const inset=add(new THREE.ShapeGeometry(insetShape,48),grille,speaker,0,7.8,1.52);inset.castShadow=inset.receiveShadow=false;
    const surround=torus(speaker,.43,.067,0,7.72,1.62,dark);surround.scale.y=3.2;
    const driver=sphere(speaker,.41,0,7.72,1.60,dark);driver.scale.set(1,3.19,.29);
    const dust=sphere(speaker,.245,0,7.75,1.73,grille);dust.scale.set(1,2.25,.31);
    for(const y of[4.34,11.27])for(const side of[-1,1])screw(speaker,side*.43,y,1.58,mirror,.018);
    box(speaker,2.95,.06,2.42,0,.05,0,dark);
    line(speaker,[[0,.29,-1.42],[0,.10,-2.2],[1.6,.06,-3.8]],.022,dark,16);
    return speaker;
  }
  const speakers=[-26,26].map(createSpeaker);
  const rack = new THREE.Group(); rack.name = 'Open stainless amplifier equipment rack'; rack.position.set(0, 0, -17.6); group.add(rack);
  // Narrow tubular open frame and visible air gaps between separate units.
  for (const side of [-1, 1]) for (const z of [-1.20, 1.20]) {
    rod(rack, [side * 2.48, .13, z], [side * 2.48, 6.48, z], .050);
    cylinder(rack, .09, .20, side * 2.48, .13, z, mirror, .028);
  }
  for (const y of [.65, 2.01, 3.50, 4.88, 6.20]) {
    for (const z of [-1.20, 1.20]) rod(rack, [-2.48, y, z], [2.48, y, z], .037);
    for (const side of [-1, 1]) rod(rack, [side * 2.48, y, -1.20], [side * 2.48, y, 1.20], .037);
    box(rack, 4.70, .045, 2.38, 0, y - .05, 0, steel);
  }
  const chassis = (y, height, material) => {
    box(rack, 4.59, height, 2.17, 0, y, -.01, dark);
    box(rack, 4.68, height, .055, 0, y, 1.105, material);
    for (const side of [-1, 1]) for (const offset of [-height * .36, height * .36]) screw(rack, side * 2.20, y + offset, 1.144, mirror, .035);
  };
  chassis(5.56, 1.10, faceplate);
  for (let i = 0; i < 5; i++) {
    const radius = i === 2 ? .35 : i % 2 ? .18 : .25;
    const knob = cylinder(rack, radius, .11, -1.48 + i * .74, 5.60, 1.20, i % 2 ? warmCopper : dark); knob.rotation.x = Math.PI / 2;
    const cap = cylinder(rack, radius * .65, .018, knob.position.x, knob.position.y, 1.266, i % 2 ? copperWeld : steel); cap.rotation.x = Math.PI / 2;
    box(rack, .022, radius * .38, .008, knob.position.x, knob.position.y + radius * .35, 1.278, mirror);
  }
  sphere(rack, .036, -1.99, 5.60, 1.15, green);
  for (const y of [4.19, 2.79]) {
    chassis(y, 1.07, dark);
    for (let i = 0; i < 9; i++) {
      const x = -1.87 + i * .43, knob = cylinder(rack, .075, .058, x, y - .13, 1.165, faceplate); knob.rotation.x = Math.PI / 2;
      sphere(rack, .018, x, y + .29, 1.15, i % 3 ? blue : green);
      box(rack, .10, .014, .010, x, y + .075, 1.152, steel);
    }
    box(rack, 1.34, .075, .025, -.97, y + .29, 1.153, grille);
    sphere(rack, .021, .15, y + .29, 1.174, green);
  }
  chassis(1.32, .83, faceplate);
  for (let i = 0; i < 16; i++) box(rack, .12, .012, .012, -.98 + i * .13, 1.45, 1.15, dark);
  sphere(rack, .035, .74, 1.18, 1.16, green);
  const power = cylinder(rack, .072, .025, 1.86, 1.32, 1.16, dark); power.rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) for (const z of [-1.11, 1.11]) {
    box(rack, .18, .25, .21, side * 2.25, .42, z, steel);
    const wheel = cylinder(rack, .20, .12, side * 2.25, .23, z, dark); wheel.rotation.z = Math.PI / 2;
    const axle = cylinder(rack, .064, .135, side * 2.25, .23, z, mirror); axle.rotation.z = Math.PI / 2;
  }
  line(rack, [[1.45, 1.07, -1.20], [1.58, .075, -1.75]], .029, dark, 12);
  line(rack, [[1.58, .075, -1.75], [.70, .075, -2.33], [-.4, .075, -2.5]], .029, dark, 12);
  group.updateMatrixWorld(true);
  return { group, speakers, rack, update(now){breathingGlow.value=reduced?.9:.90+.08*Math.sin(now*.00045)}, bounds: new THREE.Box3().setFromObject(group) };
}
