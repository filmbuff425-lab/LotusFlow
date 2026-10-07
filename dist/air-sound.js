// Unpitched air leaves the score's melody and bass free. One small mono buffer
// is shared by all breaths in an AudioContext, rather than decoded per gesture.
const buffers=new WeakMap();
function airBuffer(context){
 let buffer=buffers.get(context);if(buffer)return buffer;
 const sampleRate=Math.min(context.sampleRate,16000);
 buffer=context.createBuffer(1,Math.ceil(sampleRate*8),sampleRate);
 const data=buffer.getChannelData(0);let seed=1973,slow=0;
 for(let i=0;i<data.length;i++){seed=seed*16807%2147483647;const white=(seed-1)/1073741823-1;slow=slow*.91+white*.09;data[i]=slow*.7+white*.18}
 buffers.set(context,buffer);return buffer;
}
const smooth=x=>x*x*(3-2*x);
export function createAirCue(context,output,{kind='seam-air',delay=0}={}){
 const wind=kind==='studio-wind',duration=wind?6.6:5.7,peak=wind?3.65:1.95,level=wind?.10:.066;
 const source=context.createBufferSource(),high=context.createBiquadFilter(),low=context.createBiquadFilter(),breath=context.createBiquadFilter(),gain=context.createGain();
 const at=context.currentTime+Math.max(0,delay),curve=new Float32Array(160);
 source.buffer=airBuffer(context);high.type='highpass';high.frequency.value=155;high.Q.value=.5;
 low.type='lowpass';low.frequency.value=1550;low.Q.value=.5;breath.type='bandpass';breath.Q.value=.45;
 breath.frequency.setValueAtTime(wind?320:430,at);breath.frequency.linearRampToValueAtTime(wind?760:610,at+peak);breath.frequency.linearRampToValueAtTime(290,at+duration);
 for(let i=0;i<curve.length;i++){const t=i/(curve.length-1)*duration;curve[i]=level*(t<peak?smooth(t/peak):1-smooth((t-peak)/(duration-peak)))}
 gain.gain.setValueAtTime(0,context.currentTime);gain.gain.setValueCurveAtTime(curve,at,duration);
 source.connect(high).connect(low).connect(breath).connect(gain).connect(output);
 source.start(at);source.stop(at+duration+.03);
 let stopped=false,disposed=false;
 function dispose(){if(disposed)return;disposed=true;for(const node of [source,high,low,breath,gain])node.disconnect()}
 function stop(){if(stopped)return;stopped=true;const now=context.currentTime;gain.gain.cancelAndHoldAtTime(now);gain.gain.linearRampToValueAtTime(0,now+.18);source.stop(now+.2)}
 source.onended=dispose;
 return {tail:duration+Math.max(0,delay)+.03,stop,dispose};
}
