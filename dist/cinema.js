import './navigation.js?v=20261006-lake-surface1';
import './retro-interface.js?v=20261006-lake-surface1';
import {initReleasePlayer} from './release-player.js?v=20261007-mobile3';
import {initArtist} from './artist-character.js?v=20261006-lake-surface1';
import {initStudioPlayer} from './studio-player.js?v=20261007-mobile3';
document.documentElement.dataset.cinemaPhase='loading';
if(!window.lotusPortfolio)await new Promise(resolve=>window.addEventListener('lotus-portfolio-ready',resolve,{once:true}));
initReleasePlayer(window.lotusPortfolio);document.documentElement.dataset.cinemaPhase='release-ready';
initStudioPlayer(window.lotusPortfolio);document.documentElement.dataset.cinemaPhase='studio-ready';
import './type-interactions.js?v=20261007-performance1';
let artistTask;
function prepareArtist(){return artistTask??=initArtist().catch(error=>{artistTask=null;console.warn('Character unavailable',error)})}
// Start the first pose while the chapter is still approaching the viewport.
// The covered portrait itself is not a reliable intersection target.
const artistObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){prepareArtist().then(()=>artistObserver.disconnect())}},{rootMargin:'700px 0px'});artistObserver.observe(document.querySelector('#about'));
for(const event of ['pointerenter','pointerdown','focus'])document.querySelector('a[href="#about"]')?.addEventListener(event,prepareArtist,{passive:true});
document.querySelector('.artist-gate').addEventListener('pointerdown',prepareArtist,{passive:true});
document.querySelector('.artist-gate').addEventListener('click',prepareArtist);

import './scroll-scenes.js?v=20261006-lake-surface1';

import './record-portal.js?v=20261007-mobile3';
