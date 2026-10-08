// Browser interpretations of the two instruments' subtractive signal paths.
// No sample downloads, audio worklets or per-frame DSP run on the main thread.
export function createSynthVoices(context,output){
 const voices=new Set(),driveCurve=new Float32Array(1024);
 for(let i=0;i<driveCurve.length;i++){const x=i/(driveCurve.length-1)*2-1;driveCurve[i]=Math.tanh(x*1.7)/Math.tanh(1.7)}
 function noteOn(note,instrument='prophet'){
  const moog=instrument==='moog',at=context.currentTime+.008,frequency=440*2**((note-69)/12);
  const previous=[...voices].filter(voice=>voice.instrument===instrument&&!voice.released);
  if(moog)previous.forEach(voice=>voice.release(.045));
  else if(previous.length>=6)previous[0].release(.06);
  const nodes=[],sources=[],oscillators=[];
  const keep=node=>(nodes.push(node),node),gain=value=>{const node=keep(context.createGain());node.gain.value=value;return node};
  const mix=gain(1),amp=gain(.0001),filters=[];
  const base=moog?Math.min(900,frequency*2.5+130):Math.min(2400,frequency*3+380);
  const peak=moog?Math.min(6200,frequency*14+1500):Math.min(8500,frequency*13+2900);
  // Two biquads supply the four-pole low-pass; the Moog voice is driven first.
  let path=mix;
  if(moog){const drive=keep(context.createWaveShaper());drive.curve=driveCurve;drive.oversample='2x';path.connect(drive);path=drive}
  for(const q of moog?[.60,1.15]:[.54,.78]){
   const filter=keep(context.createBiquadFilter());filter.type='lowpass';filter.Q.value=q;
   filter.frequency.setValueAtTime(base,at);filter.frequency.exponentialRampToValueAtTime(peak,at+(moog?.024:.06));filter.frequency.exponentialRampToValueAtTime(base,at+(moog?.39:.85));
   path.connect(filter);path=filter;filters.push(filter);
  }
  if(!moog){const highpass=keep(context.createBiquadFilter());highpass.type='highpass';highpass.frequency.value=45;highpass.Q.value=.7;path.connect(highpass);path=highpass}
  path.connect(amp);
  const specs=moog?[['sawtooth',1,0,.40],['square',1,2.3,.22],['square',.5,0,.25]]:[['sawtooth',1,-4.8,.37],['sawtooth',1,4.8,.37]];
  for(const [type,ratio,detune,level] of specs){const osc=keep(context.createOscillator()),levelNode=gain(level);osc.type=type;osc.frequency.value=frequency*ratio;osc.detune.value=detune;osc.connect(levelNode).connect(mix);sources.push(osc);oscillators.push(osc)}
  amp.gain.setValueAtTime(.0001,at);amp.gain.exponentialRampToValueAtTime(moog?.48:.36,at+(moog?.012:.035));amp.gain.exponentialRampToValueAtTime(moog?.24:.23,at+(moog?.35:.6));
  const dry=gain(moog?1:.82);amp.connect(dry).connect(output);
  if(!moog){
   // A quiet stereo chorus gives the poly voice width without hiding the attack.
   const lfo=keep(context.createOscillator());lfo.type='sine';lfo.frequency.value=.48;sources.push(lfo);
   for(const [delayTime,panValue,depth] of [[.011,-.7,.0011],[.017,.7,-.0011]]){
    const delay=keep(context.createDelay(.05)),pan=keep(context.createStereoPanner()),wet=gain(.14),mod=gain(depth);
    delay.delayTime.value=delayTime;pan.pan.value=panValue; amp.connect(delay).connect(wet).connect(pan).connect(output);lfo.connect(mod).connect(delay.delayTime);
   }
  }
  let released=false,disposed=false,releaseTimer;
  const voice={instrument,note,filters,oscillators,get released(){return released},release(seconds=moog?.34:.75){
   if(released||disposed)return;released=true;clearTimeout(releaseTimer);
   const now=Math.max(at,context.currentTime),end=now+seconds;
   amp.gain.cancelAndHoldAtTime(now);amp.gain.exponentialRampToValueAtTime(.0001,end);
   sources.forEach(source=>source.stop(end+.035));
  }};
  oscillators[0].onended=()=>{if(disposed)return;disposed=true;clearTimeout(releaseTimer);voices.delete(voice);nodes.forEach(node=>node.disconnect())};
  voices.add(voice);sources.forEach(source=>source.start(at));
  // Pointer cancellation, navigation and an upper bound all release the voice.
  releaseTimer=setTimeout(()=>voice.release(),8000);
  return voice;
 }
 function stop(){for(const voice of voices)voice.release(.08)}
 return {noteOn,stop,get activeVoiceCount(){return voices.size}};
}
