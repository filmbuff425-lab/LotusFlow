import {revealContent} from './ui-motion.js';
const tabs=[...document.querySelectorAll('[data-profile]')];
function select(tab){if(tab.getAttribute('aria-selected')==='true')return;for(const button of tabs){const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;document.getElementById(`profile-${button.dataset.profile}`).hidden=!active;}revealContent(document.getElementById(`profile-${tab.dataset.profile}`))}
for(const tab of tabs){tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let i=tabs.indexOf(tab);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();select(tabs[i]);tabs[i].focus()})}
const links=[...document.querySelectorAll('.header nav>a')],records=document.querySelector('.records-nav');
const chapters=[...document.querySelectorAll('main > section[id]')];let queued=false;
function updateChapter(){
 queued=false;let active='home';for(const chapter of chapters)if(chapter.getBoundingClientRect().top<=innerHeight*.38)active=chapter.id;
 links.forEach(a=>{if(a.hash===`#${active}`||(active==='studio'&&a.hash==='#home'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(active==='work')records.setAttribute('aria-current','page');else records.removeAttribute('aria-current');
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(updateChapter)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('lotus-prologue-end',schedule);updateChapter();

// Animate only the cards currently on screen, never a full-height grid layer.
let recordFrame=0;
function revealRecords(){cancelAnimationFrame(recordFrame);recordFrame=requestAnimationFrame(()=>{recordFrame=0;const list=document.getElementById('track-list');if(!list||list.hidden)return;const visible=[...list.querySelectorAll('.track:not([hidden])')].filter(card=>{const r=card.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});visible.slice(0,12).forEach(revealContent)})}
for(const event of ['lotus-filter-change','lotus-view-change'])window.addEventListener(event,revealRecords);
