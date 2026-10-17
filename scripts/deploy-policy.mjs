import fs from 'node:fs/promises';
import path from 'node:path';

export const duplicateAudio=[
 ['news','news'],['great-bridge','bridge'],['juliet','juliet'],['airtight','airtight'],
 ['lov','lov'],['adult','adult'],['flow','flow'],['feed-on','feed-on'],['show-me-love','show-me-love']
].map(([original,canonical])=>[`assets/music/${original}.mp3`,`assets/music/${canonical}-20261006.mp3`]);
// Unreferenced media stays local. Current recordings remain byte-for-byte intact.
export const omitted=new Set([...duplicateAudio.map(([original])=>original),'assets/brand-waterlight.svg','assets/audio/space-exploration-soft.wav','assets/mv/flow-20261006.mp4','assets/mv/jellyfish-20261006.mp4','assets/mv/right-here-20261006.mp4','assets/mv/im-fine-20261006.mp4','assets/mv/airtight.mp4','assets/mv/feed-on.mp4','assets/mv/flow.mp4','assets/mv/juliet.mp4','assets/mv/show-me-love.mp4','assets/mv/show-me-love-20261006.mp4',
 'flow-transition.js','home-particles.js','impact-intro.js','living-membrane.js','red-universe.js','release-notes.js','sound-cells.js','studio-botanical.js','studio-cd-player.js','studio-city.js','supernatural-type.js','universe-flight.js','universe.js',
 // A reverted phone-room experiment stays in source history, never in the public build.
 'mobile-room-profile.js','studio-mobile-room.js',
 // Retired recordings and unused art stay in local source, never in the payload.
 'assets/audio/space-exploration-bright.wav','assets/audio/sanctuary-original.wav','assets/audio/knife-strike.wav','assets/audio/universe-flyby.wav',
 'assets/juliet.jpg','assets/recognition/awards/ridewind-2024-award-clip.jpg','assets/recognition/awards/freshmusic-19-malaysia-nominees.webp',
 // Generator/test data is not fetched by the live typography or music players.
 'assets/fonts/lotus-planar-glyphs.json','assets/fonts/lotus-glass-glyphs.json','assets/music/previews/preview-manifest.json','site-i18n-terms.json',
 // Original pixel masters stay editable locally; only the current compact atlases ship.
 'assets/pixel/yellow-sprites-v2.png','assets/pixel/black-sprites-v2.png','assets/pixel/frames.json','assets/mobile/yellow-sprites-v2-1385a4c2c9a5a64f.webp','assets/mobile/black-sprites-v2-925da115f8454bbe.webp',
 'logo-motion.js','logo-scene.js','logo-volume.js']);
export const studies=['assets/phone-studio51/','_bar-study.html','logo-motion.html','design-review/','entry-study/','entry-visual/','home-demos/','tests/','test/','scripts/','outputs/'];

export const excludeFromDeployment=relative=>path.posix.basename(relative)==='.DS_Store'||omitted.has(relative)||studies.some(study=>relative===study||relative.startsWith(study));
export function assertNoOmittedReferences(source){
 for(const relative of [...omitted,...studies.filter(file=>!file.endsWith('/'))])if(source.includes(path.posix.basename(relative)))throw new Error(`Cannot omit a referenced file: ${relative}`);
}
// Read-only inventory: no staging directory, minification, copies or deletion.
export async function auditDeploymentSource(input){
 for(const [original,canonical] of duplicateAudio){
  const [a,b]=await Promise.all([fs.readFile(path.join(input,original)),fs.readFile(path.join(input,canonical))]);
  if(!a.equals(b))throw new Error(`Audio copies differ; keep both recordings: ${original}, ${canonical}`);
 }
 const files=[],sourceText=[];
 async function visit(directory){
  for(const entry of await fs.readdir(directory,{withFileTypes:true})){
   const file=path.join(directory,entry.name),relative=path.relative(input,file).split(path.sep).join('/');
   if(entry.isDirectory()){await visit(file);continue}
   const size=(await fs.stat(file)).size,excluded=excludeFromDeployment(relative);files.push({relative,size,excluded});
   if(!excluded&&/\.(js|html|css|json|svg)$/.test(relative))sourceText.push(await fs.readFile(file,'utf8'));
  }
 }
 await visit(input);assertNoOmittedReferences(sourceText.join('\n'));
 return{files,retained:files.filter(file=>!file.excluded),omittedBytes:files.filter(file=>file.excluded).reduce((sum,file)=>sum+file.size,0),sourceBytes:files.reduce((sum,file)=>sum+file.size,0)};
}
