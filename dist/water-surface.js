// A soft lake surface and a drifting synthesizer share one envelope and tail.
// Motion lives below 1 kHz; no bright spray, sandy friction or sharp droplets.
export function createLakeRipple(context,out,{pitch=261.626,motion=.5,at=context.currentTime}={}){
 const nodes=[],keep=n=>(nodes.push(n),n),gain=()=>keep(context.createGain()),filter=()=>keep(context.createBiquadFilter());
 const surface=filter();surface.type='lowpass';surface.Q.value=.35;
 surface.frequency.setValueAtTime(620,at);surface.frequency.exponentialRampToValueAtTime(1080,at+.65);surface.frequency.exponentialRampToValueAtTime(660,at+3.2);surface.connect(out);
 for(let i=0;i<3;i++){
  const start=at+i*.18,duration=2.6+i*.3,osc=keep(context.createOscillator()),envelope=gain(),sway=keep(context.createOscillator()),depth=gain();
  const base=pitch*[1,1.501,2.002][i];osc.type='sine';sway.type='sine';sway.frequency.value=.34+i*.11;
  depth.gain.setValueAtTime((5+i*2)*(1+.2*motion),start);depth.gain.linearRampToValueAtTime(1.2,start+duration);
  sway.connect(depth).connect(osc.frequency);
  osc.frequency.setValueAtTime(base*.978,start);osc.frequency.exponentialRampToValueAtTime(base*1.004,start+.75);osc.frequency.exponentialRampToValueAtTime(base*.998,start+duration);
  envelope.gain.setValueAtTime(.0001,start);envelope.gain.exponentialRampToValueAtTime([.030,.0055,.002][i],start+.32+i*.08);envelope.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(envelope).connect(surface);osc.start(start);osc.stop(start+duration+.02);sway.start(start);sway.stop(start+duration+.03);
 }
 // Low, smooth water movement: two-pole colored texture, softened again by the
 // same filter as the notes so the acoustic and electronic parts blend together.
 const length=Math.ceil(context.sampleRate*3.25),buffer=context.createBuffer(1,length,context.sampleRate),data=buffer.getChannelData(0);
 let seed=137+(pitch*100|0),slow=0,smooth=0;
 for(let i=0;i<length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const white=(seed>>>0)/2147483648-1;slow=slow*.955+white*.045;smooth=smooth*.88+slow*.12;data[i]=smooth*3.2}
 const water=keep(context.createBufferSource()),body=filter(),waterEnvelope=gain();water.buffer=buffer;body.type='bandpass';body.frequency.value=340;body.Q.value=.55;
 waterEnvelope.gain.setValueAtTime(.0001,at);waterEnvelope.gain.exponentialRampToValueAtTime(.009,at+.48);waterEnvelope.gain.exponentialRampToValueAtTime(.0001,at+3.1);
 water.connect(body).connect(waterEnvelope).connect(surface);water.start(at);
 const delay=keep(context.createDelay(.8)),diffusion=filter(),wet=gain(),feedback=gain();delay.delayTime.value=.31;diffusion.type='lowpass';diffusion.frequency.value=720;diffusion.Q.value=.2;wet.gain.value=.16;feedback.gain.value=.12;
 surface.connect(delay);delay.connect(diffusion).connect(wet).connect(out);diffusion.connect(feedback).connect(delay);
 return{tail:4.4,dispose(){for(const node of nodes)try{node.disconnect()}catch{}}};
}
