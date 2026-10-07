// Asset provenance: research/recognition/brand-assets.json. Brand marks identify the source, not endorsement.
const brands={
 ifpi:{asset:'assets/recognition/ifpi.png',surface:'light',name:'IFPI Austria',role:'Recording certification'},
 netease:{form:'icon',asset:'assets/recognition/netease.jpg',surface:'dark',name:'网易云音乐',role:'Music awards / editorial'},
 mango:{form:'icon',asset:'assets/recognition/mango-tv.png',surface:'dark',name:'芒果TV · 乘风2024',role:'Official programme'},
 youtube:{form:'icon',asset:'assets/recognition/youtube.png',surface:'dark',name:'YouTube',role:'Official music video'},
 circle:{form:'icon',asset:'assets/recognition/circle-chart.png',surface:'dark',name:'Circle Chart',role:'Official album chart'},
 apple:{form:'icon',asset:'assets/recognition/apple-music.svg',surface:'dark',name:'Apple Music',role:'Editorial selection'},
 freshmusic:{form:'icon',asset:'assets/recognition/freshmusic.png',surface:'light',name:'Freshmusic Awards',role:'Official award nominations'},
 douban:{asset:'assets/recognition/douban-music.png',surface:'light',name:'豆瓣音乐',role:'Annual music selection'},
 wave:{asset:'assets/recognition/wave-music-awards.svg',surface:'light',name:'浪潮音乐大赏',role:'Official award announcement'},
 east:{form:'icon',asset:'assets/recognition/weibo.ico',name:'Weibo',role:'Artist source / 东方风云榜'},
 fusion:{form:'icon',asset:'assets/recognition/sina.ico',name:'Sina / Weibo',role:'Organiser source / 融合嘻哈盛典'},
 sunrise:{asset:'assets/recognition/sunrise.png',surface:'light',name:'SUNRISE',role:'Official promotional news'},
 kraze:{asset:'assets/recognition/the-kraze.png',surface:'dark',name:'The Kraze',role:'Music publication'},
 envi:{asset:'assets/recognition/envi.svg',surface:'dark',name:'EnVi Media',role:'Music publication'}
};
export function recognitionBrand(f){
 const key=f.id==='original-ifpi-context'?'ifpi':f.id.includes('netease')||f.id==='love-me-later-public-choice'?'netease':f.id.includes('stage-award')?'mango':f.id.includes('mv-views')?'youtube':f.id.includes('circle')?'circle':f.id.includes('fma-')?'freshmusic':f.id.includes('douban')?'douban':f.id.includes('-wave')?'wave':f.id.includes('east-award')?'east':f.id.includes('-fusion')?'fusion':f.id==='prologue-15m'?'sunrise':f.id.includes('kraze')?'kraze':f.id.includes('envi')?'envi':'apple';return brands[key];
}
