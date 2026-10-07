const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const sections=[...document.querySelectorAll('#home,#about,#work,#studio,#contact')];
let frame=0;
function update(){
 frame=0;const h=innerHeight;
 for(const section of sections){const r=section.getBoundingClientRect();if(r.bottom<0||r.top>h)continue;const p=Math.max(-1,Math.min(1,(h*.45-r.top)/Math.max(h,r.height)));section.style.setProperty('--scene-drift',reduced.matches?'0':p.toFixed(4));section.dataset.scrollPosition=p.toFixed(2);}

}
function schedule(){if(!frame)frame=requestAnimationFrame(update)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);schedule();
const entrances=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const section=entry.target;if(!section.dataset.arrived&&!reduced.matches){section.dataset.arrived='true';const targets=section.querySelectorAll('.artist-chapter,.profile-tabs,.record-heading,.work-controls,.studio-heading,.contact-top,.contact-bottom');targets.forEach((el,i)=>el.animate([{translate:'0 22px',opacity:.2},{translate:'0 0',opacity:1}],{duration:850,delay:i*95,easing:'cubic-bezier(.18,.8,.22,1)'}))}entrances.unobserve(section)}},{threshold:.13});sections.filter(s=>s.id!=='home').forEach(s=>entrances.observe(s));
