// One diagonal defines the ink, light cue, hit area and blade travel.
export const scarThickness=width=>width<=700?Math.max(36,width*.078):Math.max(27,width*.046);
export const bladeLength=(width,height)=>width<=700?Math.min(width*1.65,height*.98):Math.min(width*1.04,height*1.7);
// Real painted bleed, rather than stretching the cover when its halves move.
export const posterBleed=16;
export function posterCover(viewWidth,viewHeight,width,height){
 const scale=Math.max(width/viewWidth,height/viewHeight),bleed=posterBleed*scale;
 return {scale,bleed,width:width+bleed*2,height:height+bleed*2,
  imageWidth:(viewWidth+posterBleed*2)*scale,imageHeight:(viewHeight+posterBleed*2)*scale,
  imageLeft:(width-viewWidth*scale)/2,imageTop:(height-viewHeight*scale)/2};
}
export function fittedScar(viewWidth,viewHeight,width,height){
 const scale=Math.max(width/viewWidth,height/viewHeight),ox=(width-viewWidth*scale)/2,oy=(height-viewHeight*scale)/2;
 const x=y=>ox+(viewWidth*(.77-.55*((y-oy)/scale)/viewHeight)+scarThickness(viewWidth)*.05)*scale;
 return {top:x(0),bottom:x(height),height};
}
export function followsScar(start,end,scar){
 const dx=scar.bottom-scar.top,dy=scar.height,length=Math.hypot(dx,dy),x=end.x-start.x,y=end.y-start.y;
 const along=(x*dx+y*dy)/length,cross=(x*dy-y*dx)/length;
 return Math.abs(along)>=42&&Math.abs(cross)<Math.max(20,Math.abs(along)*.42);
}
