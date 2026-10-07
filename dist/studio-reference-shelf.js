import * as THREE from 'three';
import {createReferenceObjects} from './studio-reference-objects.js?v=20261007-mobile3';

// Clear glass display with polished sheet edges and fine steel corner posts.
export function createReferenceShelf({ root, texture }) {
  const group = new THREE.Group();
  group.name = 'Glass camera collection shelf';
  group.position.set(0, 0, -24);
  group.userData.reference = 'IMG_4710 / IMG_4711';
  root.add(group);
  const recordTargets = [], geometryCache = new Map(), loader = new THREE.TextureLoader();
  const geo = (type, values, create) => {
    const key = `${type}/${values.join('/')}`;
    if (!geometryCache.has(key)) geometryCache.set(key, create());
    return geometryCache.get(key);
  };
  const add = (geometry, material, parent = group, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh); return mesh;
  };
  const box = (parent, w, h, d, x, y, z, material) => add(geo('box', [w, h, d], () => new THREE.BoxGeometry(w, h, d)), material, parent, x, y, z);
  const cylinder = (parent, r, h, x, y, z, material, rb = r) => add(geo('cylinder', [r, rb, h], () => new THREE.CylinderGeometry(r, rb, h, 24)), material, parent, x, y, z);
  const tube = (parent, points, radius, material, segments = 24) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), segments, radius, 6, false), material, parent);
  const ring = (parent, radius, width, x, y, z, material) => add(geo('torus', [radius, width], () => new THREE.TorusGeometry(radius, width, 6, 32)), material, parent, x, y, z);
  let seed = 4711;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const brushed = texture(256, 512, (g, w, h) => {
    g.fillStyle = '#92999f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) {
      const light = 105 + Math.round(rand() * 92);
      g.strokeStyle = `rgba(${light},${light + 3},${light + 5},${.04 + rand() * .12})`;
      const x = rand() * w, y = rand() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rand() - .5) * .6, y + 25 + rand() * 250); g.stroke();
    }
  });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc9d0d2, metalness: .82, roughness: .29, bumpMap: brushed, bumpScale: .003 });
  const edge = new THREE.MeshStandardMaterial({ color: 0xd7dde0, metalness: .95, roughness: .19 });
  const charcoal = new THREE.MeshStandardMaterial({ color: 0x0c0d10, metalness: .12, roughness: .64 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x121414, roughness: .96 });
  const label = new THREE.MeshStandardMaterial({ color: 0xe3ded3, roughness: .97 });
  const cordMap = texture(128, 128, (g, w, h) => {
    g.fillStyle = '#34693b'; g.fillRect(0, 0, w, h);
    for (let i = -h; i < w + h; i += 8) {
      g.strokeStyle = '#82a35c'; g.lineWidth = 2; g.beginPath(); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke();
      g.strokeStyle = '#183c22'; g.lineWidth = 1; g.beginPath(); g.moveTo(i + 3, 0); g.lineTo(i + 3 + h, h); g.stroke();
    }
  });
  cordMap.wrapS = cordMap.wrapT = THREE.RepeatWrapping; cordMap.repeat.set(2, 8);
  const cord = new THREE.MeshStandardMaterial({ color: 0x608251, map: cordMap, bumpMap: cordMap, bumpScale: .014, roughness: .96 });
  const clearEdge = new THREE.MeshPhysicalMaterial({ color: 0xdfe6e6, metalness: .08, roughness: .23, clearcoat: 1, transparent: true, opacity: .23, depthWrite: false });

  const shelfGlass=new THREE.MeshPhysicalMaterial({color:0xc9e3df,metalness:.02,roughness:.08,clearcoat:1,transparent:true,opacity:.13,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});
  const levels=[3.65,8.3,12.95,17.6];
  for(const side of[-1,1]){
    const pane=box(group,.075,21.5,2.68,side*2.965,10.75,0,shelfGlass);pane.castShadow=pane.receiveShadow=false;
    for(const z of[-1.31,1.31])cylinder(group,.043,21.5,side*2.97,10.75,z,edge);
  }
  for(const y of levels){
    const pane=box(group,5.84,.11,2.62,0,y,0,shelfGlass);pane.castShadow=pane.receiveShadow=false;
    for(const z of[-1.31,1.31])box(group,5.84,.022,.025,0,y,z,clearEdge);
    for(const x of[-2.9,2.9])for(const z of[-1.26,1.26])box(group,.14,.09,.16,x,y-.10,z,edge);
  }
  const coverMaterials = new Map();
  const cover = (path) => {
    if (coverMaterials.has(path)) return coverMaterials.get(path);
    const map = loader.load(path); map.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({ map, roughness: .68, metalness: .02 });
    coverMaterials.set(path, material); return material;
  };
  const register = (parent, width, height, id, title, x, y, z) => {
    const target = add(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ opacity: 0, transparent: true, side: THREE.DoubleSide, depthWrite: false }), parent, x, y, z);
    target.castShadow = target.receiveShadow = false;
    target.userData = { action: 'release', release: id, label: `OPEN / ${title}` };
    recordTargets.push(target); return target;
  };
  const covers = [
    ['news', 'NEWs', 'assets/news.jpg'],
    ['juliet', 'Juliet', 'assets/juliet-clean.png'],
    ['summer', 'Over the Summer', 'assets/over-the-summer.jpg'],
    ['mirror', 'mirror', 'assets/releases/mirror.jpg']
  ];
  // A short row of slim 10 mm jewel cases; one face-out cover instead of an oversized display block.
  for (let i = 0; i < 9; i++) {
    const cd = new THREE.Group(); cd.name = 'Thin jewel case spine'; cd.position.set(.18 + i * .135, levels[0] + .80, -.18); group.add(cd);
    box(cd, .10, 1.53, 1.40, 0, 0, 0, clearEdge);
    box(cd, .056, 1.45, 1.28, 0, 0, -.012, i % 3 ? charcoal : label);
    box(cd, .065, 1.40, .017, 0, 0, .715, i % 3 ? steel : label);
    add(new THREE.PlaneGeometry(.067, 1.40), cover(covers[i % covers.length][2]), cd, 0, 0, .727);
  }
  const featured = new THREE.Group(); featured.name = 'NEWs glass jewel case'; featured.position.set(-1.29, levels[0] + 1.015, .34); featured.rotation.set(-.12, -.11, -.055); group.add(featured);
  box(featured, 1.88, 1.88, .08, 0, 0, 0, clearEdge);
  add(new THREE.PlaneGeometry(1.78, 1.78), cover(covers[0][2]), featured, .025, 0, .048);
  for (const x of [-.91, .91]) box(featured, .018, 1.84, .045, x, 0, .04, edge);
  for (const y of [-.91, .91]) box(featured, 1.84, .018, .045, 0, y, .04, edge);
  box(featured, .105, 1.84, .045, -.85, 0, .035, clearEdge);
  register(featured, 1.9, 1.9, 'news', 'NEWs', 0, 0, .075);

  // A Leica-style film rangefinder: lens barrel, two finder windows, top dials and leather body.
  const camera = new THREE.Group(); camera.name = 'Leica film rangefinder'; camera.position.set(-.29, levels[1] + .78, .10); camera.rotation.y = -.12; group.add(camera);
  const leatherMap = texture(128, 128, (g, w, h) => {
    g.fillStyle = '#111215'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 5500; i++) { const v = 13 + Math.floor(rand() * 25); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(rand() * w, rand() * h, 1 + rand(), 1); }
  });
  const leather = new THREE.MeshStandardMaterial({ map: leatherMap, color: 0xa0a0a0, bumpMap: leatherMap, bumpScale: .018, roughness: .86 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x15303a, metalness: .32, roughness: .12, clearcoat: 1 });
  box(camera, 2.43, 1.10, .77, 0, -.04, 0, leather);
  box(camera, 2.47, .25, .79, 0, .63, 0, steel);
  box(camera, 2.47, .16, .79, 0, -.67, 0, steel);
  for (const x of [-.91, .95]) {
    cylinder(camera, .21, .11, x, .813, -.07, edge);
    cylinder(camera, .18, .12, x, .83, -.07, charcoal);
  }
  cylinder(camera, .065, .075, .74, .87, .16, edge);
  box(camera, .50, .26, .035, -.77, .61, .416, charcoal);
  box(camera, .37, .18, .020, -.77, .61, .44, glass);
  box(camera, .27, .23, .035, .81, .61, .416, charcoal);
  box(camera, .20, .16, .020, .81, .61, .44, glass);
  for (const [r, length, z, material] of [[.47, .20, .48, edge], [.44, .32, .68, charcoal], [.39, .17, .91, edge], [.32, .05, 1.015, charcoal], [.26, .025, 1.055, glass]]) {
    const barrel = cylinder(camera, r, length, .16, -.01, z, material); barrel.rotation.x = Math.PI / 2;
  }
  const lensRing = ring(camera, .40, .014, .16, -.01, .996, edge); lensRing.rotation.z = .10;
  const dot = cylinder(camera, .063, .025, -.61, .20, .416, new THREE.MeshStandardMaterial({ color: 0xb92618, roughness: .5 })); dot.rotation.x = Math.PI / 2;
  const cameraWord = texture(256, 64, g => { g.fillStyle = '#b9c0c1'; g.font = '20px Arial'; g.fillText('LEICA  M6', 10, 38); });
  add(new THREE.PlaneGeometry(.55, .14), new THREE.MeshStandardMaterial({ map: cameraWord, transparent: true, depthWrite: false, roughness: .8 }), camera, -.59, .37, .426);
  for (const side of [-1, 1]) { const eye = ring(camera, .10, .018, side * 1.245, .37, .17, edge); eye.rotation.y = Math.PI / 2; }

  camera.scale.setScalar(.60);camera.position.set(-1.24,levels[1]+.47,.05);
  const second=camera.clone(true);second.name='Black Leica film rangefinder';second.position.set(.72,levels[1]+.47,-.10);second.rotation.y=.14;group.add(second);
  // Two compact medium-format cameras, including a waist-level Hasselblad 500-series form.
  function hasselblad(x,y,angle){const c=new THREE.Group();c.name='Hasselblad medium-format film camera';c.position.set(x,y+.55,-.05);c.rotation.y=angle;group.add(c);
    box(c,1.02,1.08,1.18,0,0,0,leather);box(c,1.10,.08,1.25,0,-.55,0,edge);box(c,1.08,.16,.90,0,.56,-.12,charcoal);
    box(c,.81,.27,.69,0,.73,-.12,charcoal);box(c,.73,.025,.61,0,.88,-.12,glass);box(c,1.04,.98,.28,0,0,-.70,steel);
    for(const [r,h,z,m]of[[.43,.12,.68,edge],[.39,.45,.92,charcoal],[.33,.09,1.19,edge],[.28,.025,1.25,glass]]){const l=cylinder(c,r,h,0,-.02,z,m);l.rotation.x=Math.PI/2;}
    for(const side of[-1,1]){const k=cylinder(c,.15,.12,side*.59,.11,0,charcoal);k.rotation.z=Math.PI/2;}
    return c;
  }
  hasselblad(-1.18,levels[2],-.15);hasselblad(.62,levels[2],.13);
  // Closed 12-inch sleeve, leaned wholly inside the shelf instead of a protruding record.
  const vinyl=new THREE.Group();vinyl.name='Sleeved vinyl';vinyl.position.set(.35,levels[0]+1.52,-.75);vinyl.rotation.x=-.035;group.add(vinyl);
  box(vinyl,2.9,2.9,.06,0,0,0,label);add(new THREE.PlaneGeometry(2.86,2.86),cover(covers[2][2]),vinyl,0,0,.038);
  // A lit scented candle in an open amber vessel; a quiet flame, not burning diffuser reeds.
  const scent=new THREE.Group();scent.name='Lit amber scented candle';scent.position.set(.46,levels[3]+.025,-.09);group.add(scent);
  const amber=new THREE.MeshPhysicalMaterial({color:0x7c401b,roughness:.25,transparent:true,opacity:.58,metalness:0,depthWrite:false,clearcoat:.45});
  const vessel=new THREE.LatheGeometry([[0,0],[.40,0],[.43,.06],[.43,1.13],[.425,1.17],[.375,1.17],[.365,.12],[0,.12]].map(v=>new THREE.Vector2(...v)),48);add(vessel,amber,scent);
  const wax=new THREE.MeshStandardMaterial({color:0xe7d7af,roughness:.88});cylinder(scent,.365,.78,0,.51,0,wax);cylinder(scent,.018,.15,0,.95,0,charcoal);
  box(scent,.56,.43,.018,0,.53,.436,label);
  const flame=new THREE.Group();flame.name='Small flickering candle flame';flame.userData.dynamic=true;flame.position.y=1.11;scent.add(flame);
  const fire=new THREE.MeshBasicMaterial({color:0xffa536,transparent:true,opacity:.83,depthWrite:false,toneMapped:false});
  const fireGeo=new THREE.SphereGeometry(1,18,20),fp=fireGeo.attributes.position;for(let i=0;i<fp.count;i++){const y=fp.getY(i);fp.setXYZ(i,fp.getX(i)*.105*(1-y*.4),y*.24,fp.getZ(i)*.080*(1-y*.4))}fireGeo.computeVertexNormals();add(fireGeo,fire,flame).castShadow=false;
  const core=add(new THREE.SphereGeometry(1,12,12),new THREE.MeshBasicMaterial({color:0xffefd2,toneMapped:false}),flame,0,-.055,0);core.scale.set(.049,.13,.041);core.castShadow=false;
  const candleLight=new THREE.PointLight(0xffb567,2.0,4.4,2);candleLight.position.set(0,1.25,0);scent.add(candleLight);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const update=now=>{const t=now*.001,f=reduced?1:1+Math.sin(t*4.7)*.04+Math.sin(t*8.3+.4)*.025;flame.scale.set(1,f,1);flame.rotation.z=reduced?0:Math.sin(t*3.2)*.034;candleLight.intensity=2*f;};
  const ornaments=createReferenceObjects(texture);
  ornaments.love(group,2.15,levels[1]+.065,.12,.43,-.20);
  ornaments.cat(group,2.13,levels[2]+.065,.10,.43,.15);
  ornaments.clock(group,-1.72,levels[3]+.065,.06,.74,.12);
  group.updateMatrixWorld(true);
  return { group, recordTargets, bounds: new THREE.Box3().setFromObject(group), levels, camera, scent, update };
}
