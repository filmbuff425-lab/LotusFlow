// Local highlights respond immediately; opening a record keeps the full
// recording and starts at the same passage instead of returning to its intro.
const pending=new WeakMap();
export function loadHook(audio,track,{full=false}={}){
 cancelHook(audio);
 const clip=!full&&!!track.previewAudio;
 const cue=clip?0:Number(track.previewStart)||0;
 audio.src=clip?track.previewAudio:track.audio;
 audio.dataset.previewTrack=track.id;
 audio.dataset.highlightActive=String(!full);
 audio.dataset.previewMode=clip?'highlight':'full';
 audio.dataset.sourceStart=String(Number(track.previewStart)||0);
 audio.dataset.previewStart=String(cue);
 audio.dataset.previewEnd=String(clip?track.previewDuration||22:track.previewEnd||cue+22);
 const seek=()=>{if(pending.get(audio)!==seek)return;audio.currentTime=Math.min(cue,Math.max(0,audio.duration-2));pending.delete(audio)};
 pending.set(audio,seek);audio.addEventListener('loadedmetadata',seek,{once:true});
 // readyState may still describe the previous source immediately after a change.
 audio.load();
}
export function previewEnded(audio){return audio.currentTime>=Number(audio.dataset.previewEnd||Infinity)}

export function cancelHook(audio){const seek=pending.get(audio);if(seek)audio.removeEventListener('loadedmetadata',seek);pending.delete(audio)}
