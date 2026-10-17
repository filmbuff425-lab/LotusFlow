// A small first pose can paint independently of either full animation atlas.
export function createArtistImages({makeImage=()=>new Image(),resolve=path=>new URL(path,import.meta.url).href}={}){
 const tasks=new Map(),ready=new Map();
 function load(key){
  if(tasks.has(key))return tasks.get(key);
  const image=makeImage();image.decoding='async';image.fetchPriority=key==='idle'?'high':'low';
  const task=new Promise((accept,reject)=>{
   image.onload=async()=>{try{await image.decode?.();ready.set(key,image);accept(image)}catch(error){reject(error)}};
   image.onerror=()=>reject(new Error('Pixel portrait image unavailable'));
   image.src=resolve(`./assets/pixel/${key==='idle'?'yellow-idle55':key+'-sprites55'}.webp`);
  }).catch(error=>{tasks.delete(key);throw error});
  tasks.set(key,task);return task;
 }
 return{load,get:key=>ready.get(key)};
}
