// Screen size alone must never select the phone room on a desktop computer.
export function usePhoneRoom() {
 return matchMedia('(hover: none) and (pointer: coarse)').matches && Math.min(screen.width,screen.height)<=700;
}
export function phoneRoomPixelRatio(width,height,ratio=1) {
 return Math.min(ratio,1,Math.sqrt(650000/Math.max(1,width*height)));
}
