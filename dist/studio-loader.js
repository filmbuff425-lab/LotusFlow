import {handheld} from './device-profile.js';
// The phone never imports the room, Three.js or its textures. Desktop keeps the
// approved live scene; phones decode the same scene rendered ahead of time.
try {
 if(handheld) await import('./studio-phone.js');
 else await import('./studio.js?v=mobile48');
} catch(error) {
 const loading=document.getElementById('studio-loading');
 if(loading){loading.hidden=false;loading.textContent='The studio could not load. Please reload to retry.'}
 window.dispatchEvent(new Event('lotus-studio-unavailable'));
 console.warn('Studio unavailable',error);
}
