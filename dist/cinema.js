import './navigation.js?v=20261006-lake-surface1';
import './retro-interface.js?v=20261006-lake-surface1';
import {initReleasePlayer} from './release-player.js?v=20261006-lake-surface1';
import {initArtist} from './artist-character.js?v=20261006-lake-surface1';
import {initStudioPlayer} from './studio-player.js?v=20261006-lake-surface1';
document.documentElement.dataset.cinemaPhase='loading';
if(!window.lotusPortfolio)await new Promise(resolve=>window.addEventListener('lotus-portfolio-ready',resolve,{once:true}));
initReleasePlayer(window.lotusPortfolio);document.documentElement.dataset.cinemaPhase='release-ready';
initStudioPlayer(window.lotusPortfolio);document.documentElement.dataset.cinemaPhase='studio-ready';
import './type-interactions.js?v=20261007-performance1';
let artistTask;
function prepareArtist(){return artistTask??=initArtist().catch(error=>{console.warn('Character unavailable',error);document.querySelector('#portrait-wrap').innerHTML='<img src="assets/lotus-flow-portrait.jpg" alt="Lotus Flow">'})}
// Portrait artwork is hidden in this edition; no invisible sprite downloads.
const portraitHost=document.querySelector('#portrait-wrap');
const artistObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)&&portraitHost.getClientRects().length){prepareArtist();artistObserver.disconnect()}},{rootMargin:'100px'});artistObserver.observe(portraitHost);
document.querySelector('.artist-gate').addEventListener('click',()=>{if(portraitHost.getClientRects().length)prepareArtist()},{once:true});



import './scroll-scenes.js?v=20261006-lake-surface1';

import './record-portal.js?v=20261006-lake-surface1';
