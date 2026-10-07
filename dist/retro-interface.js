const tabs=[...document.querySelectorAll('[data-profile]')];
function select(tab){for(const button of tabs){const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;document.getElementById(`profile-${button.dataset.profile}`).hidden=!active;}}
for(const tab of tabs){tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let i=tabs.indexOf(tab);if(e.key==='ArrowRight')i=(i+1)%tabs.length;else if(e.key==='ArrowLeft')i=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();select(tabs[i]);tabs[i].focus()})}
const menu=document.querySelector('.file-menu');document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target))menu.open=false});menu.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.open=false;menu.querySelector('summary').focus()}});menu.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',()=>menu.open=false));
const links=[...document.querySelectorAll('.header nav>a')],records=document.querySelector('.records-menu>summary');
const chapters=[...document.querySelectorAll('main > section[id]')];let queued=false;
function updateChapter(){
 queued=false;let active='home';for(const chapter of chapters)if(chapter.getBoundingClientRect().top<=innerHeight*.38)active=chapter.id;
 links.forEach(a=>{if(a.hash===`#${active}`||(active==='studio'&&a.hash==='#home'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(active==='work')records.setAttribute('aria-current','page');else records.removeAttribute('aria-current');
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(updateChapter)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);addEventListener('lotus-prologue-end',schedule);updateChapter();
