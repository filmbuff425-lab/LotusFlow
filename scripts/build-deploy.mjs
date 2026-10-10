import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const {transform}=await import(process.env.LOTUS_ESBUILD_PATH?pathToFileURL(process.env.LOTUS_ESBUILD_PATH).href:'esbuild');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const input=path.join(root,'dist'),output=path.join(root,'deploy');
const revision='20261010-transitions16';
// Unreferenced media stays local. Current recordings remain byte-for-byte intact.
const omitted=new Set(['assets/brand-waterlight.svg','assets/mv/airtight.mp4','assets/mv/feed-on.mp4','assets/mv/flow.mp4','assets/mv/juliet.mp4','assets/mv/show-me-love.mp4','assets/mv/show-me-love-20261006.mp4']);
const studies=['_bar-study.html','design-review/','entry-study/','entry-visual/','home-demos/'];
const sourceText=[];
async function collect(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await collect(file);else if(/\.(js|html|css|json)$/.test(file))sourceText.push(await fs.readFile(file,'utf8'))}}
await collect(input);
const combined=sourceText.join('\n');
for(const relative of omitted)if(combined.includes(path.basename(relative)))throw new Error(`Cannot omit referenced media: ${relative}`);
// Finish the entire build before touching a directory served by local previews.
// Publish each file by rename, with new dependencies first and HTML last.
const staging=await fs.mkdtemp(path.join(root,'.deploy-build-'));
let originalText=0,publishedText=0,omittedBytes=0,copied=0;
const integrity=[];
async function publish(directory){
 for(const entry of await fs.readdir(directory,{withFileTypes:true})){
  const from=path.join(directory,entry.name),relative=path.relative(input,from).split(path.sep).join('/');
  if(entry.name==='.DS_Store'||omitted.has(relative)||studies.some(study=>relative===study||relative.startsWith(study))){if(entry.isFile())omittedBytes+=(await fs.stat(from)).size;continue}
  if(entry.isDirectory()){await publish(from);continue}
  const to=path.join(staging,relative);await fs.mkdir(path.dirname(to),{recursive:true});const bytes=await fs.readFile(from);
  if(/\.(html|js|css)$/.test(relative)){
   let text=bytes.toString('utf8').replace(/([?&](?:v|rev)=)2026[\w-]+/g,`$1${revision}`);
   if(relative==='site-motion.js')text=text.replace(/20261007-layout7/g,revision);
   if(/\.(js|css)$/.test(relative)){
    const result=await transform(text,{loader:relative.endsWith('.css')?'css':'js',minify:true,target:relative.endsWith('.css')?['safari16.4','chrome110']:['es2022'],legalComments:'inline'});
    text=result.code;originalText+=bytes.length;publishedText+=Buffer.byteLength(text);
   }
   // Every local module uses the release URL, including new helper modules.
   // A returning phone must never mix yesterday's loader with today's scene.
   if(relative.endsWith('.js')||relative.endsWith('.html'))text=text.replace(/(["'])((?:\.{1,2}\/)?[\w./-]+\.js)(?:\?v=[\w-]+)?\1/g,`$1$2?v=${revision}$1`);
   await fs.writeFile(to,text);
  }else{
   await fs.writeFile(to,bytes);integrity.push({path:relative,sha256:createHash('sha256').update(bytes).digest('hex')});
  }
  copied++;
 }
}
try{
await publish(input);
const report={revision,copied,omittedFiles:[...omitted,...studies],omittedPayloadMiB:+(omittedBytes/1048576).toFixed(2),scriptStyleMiBBefore:+(originalText/1048576).toFixed(2),scriptStyleMiBAfter:+(publishedText/1048576).toFixed(2),preservedAssetCount:integrity.length};
await fs.writeFile(path.join(staging,'deployment.json'),JSON.stringify(report));
const files=[];
async function inventory(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await inventory(file);else{const relative=path.relative(staging,file);const exists=await fs.stat(path.join(output,relative)).then(()=>true,()=>false);files.push({file,relative,priority:exists?(relative.endsWith('.html')?2:1):0})}}}
await inventory(staging);files.sort((a,b)=>a.priority-b.priority);
for(const {file,relative} of files){const to=path.join(output,relative),temp=to+'.publishing';await fs.mkdir(path.dirname(to),{recursive:true});await fs.copyFile(file,temp);await fs.rename(temp,to)}
// Remove only generated files no longer in this completed build; source stays intact.
const retained=new Set(files.map(f=>f.relative));
async function prune(directory){for(const entry of await fs.readdir(directory,{withFileTypes:true})){const file=path.join(directory,entry.name);if(entry.isDirectory())await prune(file);else if(!retained.has(path.relative(output,file)))await fs.rm(file)}}
await prune(output);
await fs.mkdir(path.join(root,'outputs'),{recursive:true});await fs.writeFile(path.join(root,'outputs/deployment-integrity.json'),JSON.stringify({report,integrity},null,2));
console.log(JSON.stringify(report,null,2));
}finally{await fs.rm(staging,{recursive:true,force:true})}
