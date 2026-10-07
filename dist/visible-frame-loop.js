// Stop invisible render callbacks; resume the same scene on visibility or interaction.
export function createVisibleFrameLoop({update,active,onPause=()=>{},watchBodyClasses=false}){
 let frame=0,disposed=false;
 const tick=now=>{frame=0;if(disposed)return;if(!active()){onPause();return}update(now);if(!disposed)frame=requestAnimationFrame(tick)};
 const wake=()=>{if(!disposed&&!frame&&active())frame=requestAnimationFrame(tick)};
 const visibility=()=>{if(!active()){cancelAnimationFrame(frame);frame=0;onPause()}else wake()};
 document.addEventListener('visibilitychange',visibility);addEventListener('pageshow',wake);
 const observer=watchBodyClasses?new MutationObserver(visibility):null;
 observer?.observe(document.body,{attributes:true,attributeFilter:['class']});
 return{wake,dispose(){disposed=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',visibility);removeEventListener('pageshow',wake);observer?.disconnect()}};
}
