(()=>{
const tracks = [
 {id:'airtight',title:'密不透风',artist:'RIDE THE WIND 2024',year:'2024',role:'COMPOSITION / ARRANGEMENT',credits:'Co-composition: Lotus Flow / Sally Han / Kory. Co-arrangement: Lotus Flow / Kory / 赵连帅@ZZmusic.',categories:['production','writing'],color:'#bd483c',url:'https://www.bilibili.com/video/BV1Xz421B7uq/'},
 {id:'news',title:'NEWs',artist:'BENZO',year:'2025',role:'PRODUCTION / SONGWRITING',credits:'Co-lyrics · Co-composition · Co-production · Arrangement · Programming',categories:['production','writing'],color:'#b8a3e7',url:'https://www.shazam.com/song/1807692099/news'},
 {id:'bridge',title:'Da Qiao',artist:'Wang Yitai',year:'2024',role:'COMPOSITION / ARRANGEMENT',credits:'Co-composition · Co-arrangement',categories:['production','writing'],color:'#b9d3df',url:'https://www.joox.com/mo/single/8OjfWAtllMfaUnzvTgtFxQ%3D%3D'},
 {id:'juliet',title:'Juliet',artist:'AleXa',year:'2023',role:'PRODUCTION / ARRANGEMENT',credits:'Additional production · Arrangement',categories:['production'],color:'#e9a282',url:'https://www.youtube.com/watch?v=OQlo-muRXOU'},
 {id:'summer',title:'Over the Summer',artist:'Lotus Flow · ADN Lewis',year:'2024',role:'ARTIST RELEASE',credits:'Artist release · With ADN Lewis',categories:['artist'],color:'#c7fa73',url:'https://music.apple.com/us/artist/lotus-flow/1715231436'},
 {id:'adult',title:'Bu Wan Mei Da Ren',artist:'Duan Yixuan & HYBRIDGENE',year:'2025',role:'PRODUCTION / VOCAL PRODUCTION',credits:'Production · Vocal production · Backing vocals & supervision',categories:['production'],color:'#ded3bb',url:'https://www.joox.com/my-en/single/DbMUFscvBWyHp6Z%2BBInCmg%3D%3D'},
 {id:'lov',title:'1 of LOV',artist:'XLOV',year:'2025',role:'LYRICS',credits:'Co-lyrics',categories:['writing'],color:'#b9c49d',url:'https://music.apple.com/us/album/1-of-lov/1816647005?i=1816647008'},
];
tracks.push(tracks.shift());
tracks.splice(3,0,
{"id": "flow", "title": "洋流 Flow", "artist": "Ren Kai 人凱", "year": "2024", "role": "COMPOSITION / LYRICS", "credits": "Co-composition · Co-lyrics: Ren Kai / Tat Tong / Lotus Flow / Asia D.", "categories": ["writing"], "color": "#b6ccc2", "url": "https://music-tw.line.me/track/7399594002"},
{"id": "feed-on", "title": "Feed On", "artist": "Sulianya 苏恋雅", "year": "2025", "role": "PRODUCTION / ARRANGEMENT", "credits": "Production · Arrangement · Mixing · Mastering. Credits shown in the official video.", "categories": ["production"], "color": "#a1bb75", "url": "https://music.amazon.com/tracks/B0FHKMVK5J"},
{"id": "show-me-love", "title": "Show Me Love", "artist": "WizTheMc · bees & honey · TIA RAY", "year": "2025", "role": "SONGWRITING", "credits": "Co-writer on the Tia Ray version. Production: Hitimpulse.", "categories": ["writing"], "color": "#e8b33a", "url": "https://open.spotify.com/track/3wl7rUckmVqI0wdYW2Zx8S"}
);


tracks.push(...[{"id": "im-falling", "title": "I'm Falling", "artist": "Dena", "year": "2025", "role": "COMPOSITION / LYRICS", "credits": "Co-composition · Co-lyrics", "categories": ["writing"], "color": "#c29575", "url": "https://music.apple.com/us/album/im-falling/1854364354?i=1854364357&uo=4", "creditSources": [{"title": "LINE MUSIC：词曲署名", "url": "https://music-tw.line.me/track/7825621001"}, {"title": "Shazam：制作信息", "url": "https://www.shazam.com/song/1854364357/im-falling"}]}, {"id": "right-here", "title": "Right Here", "artist": "Gen1es EMMA", "year": "2025", "role": "PRODUCTION / COMPOSITION", "credits": "Co-composition · Arrangement · Production · Recording engineering", "categories": ["production", "writing"], "color": "#9daec3", "url": "https://music.apple.com/us/album/right-here/1800436014?i=1800436015&uo=4", "creditSources": [{"title": "Shazam：完整署名", "url": "https://www.shazam.com/song/1800436015/right-here"}]}, {"id": "pick-a-side", "title": "PICK A SIDE", "artist": "Haezee 黄玮昕", "year": "2025", "role": "COMPOSITION", "credits": "Co-composition with Haezee, WD and ADN Lewis. Produced by Haezee.", "categories": ["writing"], "color": "#ab5338", "url": "https://music.apple.com/us/album/pick-a-side/1846007124?i=1846007133&uo=4", "creditSources": [{"title": "JOOX：UNLOCKED 制作资料", "url": "https://www.joox.com/hk/album/NIcrubqn0oGP1vzRc4BiLQ%3D%3D"}]}, {"id": "midsummer-heat", "title": "Midsummer Heat", "artist": "JENZEE", "year": "2026", "role": "PRODUCTION / SONGWRITING", "credits": "Co-lyrics · Co-composition · Production · Recording engineering · Executive production", "categories": ["production", "writing"], "color": "#acaa73", "url": "https://music.apple.com/us/album/midsummer-heat/6802236569?i=6802236570&uo=4", "creditSources": [{"title": "Qobuz：发行与完整署名", "url": "https://www.qobuz.com/gb-en/album/midsummer-heat-jenzee/o1j4u93i0k5pf"}]}, {"id": "endlessly", "title": "Endlessly", "artist": "케일라 / Kayla", "year": "2024", "role": "COMPOSITION / ARRANGEMENT", "credits": "Co-composition: Kayla / WD / Lotus Flow. Arrangement: WD / Lotus Flow / ADN Lewis.", "categories": ["production", "writing"], "color": "#b4c3da", "url": "https://music.apple.com/us/album/endlessly/1763542195?i=1763542435&uo=4", "creditSources": [{"title": "Bugs：作曲与编曲名单", "url": "https://music.bugs.co.kr/track/33278127?wl_ref=list_tr_08_ab"}]}, {"id": "red-flag-101", "title": "RED FLAG 101", "artist": "Laurie", "year": "2024", "role": "PRODUCTION / SONGWRITING", "credits": "Co-production with Mucky. Songwriting credited as Yixuan Ouyang.", "categories": ["production", "writing"], "color": "#ab2820", "url": "https://music.apple.com/us/album/red-flag-101/1782724558?i=1782724561&uo=4", "creditSources": [{"title": "Shazam：完整署名", "url": "https://www.shazam.com/song/1782724561/red-flag-101"}]}, {"id": "rendezvous", "title": "Rendezvous", "artist": "Laurie", "year": "2025", "role": "PRODUCTION / COMPOSITION", "credits": "Production · Composition. Songwriting also credited as Yixuan Ouyang.", "categories": ["production", "writing"], "color": "#b7a484", "url": "https://music.apple.com/us/album/rendezvous/1814969674?i=1814969675&uo=4", "creditSources": [{"title": "Shazam：完整署名", "url": "https://www.shazam.com/song/1814969675/rendezvous"}]}, {"id": "jellyfish", "title": "jellyfish", "artist": "LilyPichu", "year": "2024", "role": "PRODUCTION", "credits": "Co-production: WD / Lotus Flow / Shawn Halim. Korean-language recording.", "categories": ["production"], "color": "#9daacd", "url": "https://music.apple.com/us/album/jellyfish/1774454978?i=1774454979&uo=4", "creditSources": [{"title": "Shazam：制作名单", "url": "https://www.shazam.com/song/1774454979/jellyfish"}]}, {"id": "mirror", "title": "mirror", "artist": "Lotus Flow", "year": "2026", "role": "ARTIST RELEASE", "credits": "Released under my own artist name, Lotus Flow.", "categories": ["artist"], "color": "#c0c0c5", "url": "https://music.apple.com/us/album/mirror/6783137759?i=6783137760&uo=4", "creditSources": [{"title": "Apple 官方艺人目录", "url": "https://music.apple.com/us/artist/lotus-flow/1715231436"}]}, {"id": "say-it-to-me", "title": "Say It To Me", "artist": "SABAI, HALIENE & ANDe", "year": "2025", "role": "SONGWRITING", "credits": "Shared songwriting credit on the SABAI, HALIENE and ANDe recording.", "categories": ["writing"], "color": "#9cacc4", "url": "https://music.apple.com/us/album/say-it-to-me/1844974825?i=1844974832&uo=4", "creditSources": [{"title": "Shazam：完整署名", "url": "https://www.shazam.com/song/1844974832/say-it-to-me"}, {"title": "Beatport：发行、时长与调速资料", "url": "https://www.beatport.com/track/say-it-to-me/22028742"}]}, {"id": "train-to-nowhere", "title": "Train to Nowhere", "artist": "赞多 SANTA", "year": "2024", "role": "COMPOSITION / LYRICS", "credits": "Co-composition: Lotus Flow / ADN Lewis / WD / SANTA. Lyrics: Lotus Flow / ADN Lewis / WD / SANTA / JR FOG.", "categories": ["writing"], "color": "#ada280", "url": "https://music.apple.com/us/album/train-to-nowhere/1743162027?i=1743162110&uo=4", "creditSources": [{"title": "歌ネット：授权词曲署名", "url": "https://www.uta-net.com/song/354592/"}, {"title": "Apple 创作人歌单", "url": "https://music.apple.com/us/playlist/lotus-flow-%E5%88%9B%E4%BD%9C%E4%BA%BA/pl.7901d1cc5091499e9eb215d33ebada63?l=zh-Hans-CN"}]}, {"id": "still-miss-you", "title": "still miss you", "artist": "Lotus Flow", "year": "2025", "role": "ARTIST RELEASE", "credits": "Released under my own artist name, Lotus Flow.", "categories": ["artist"], "color": "#acc2b2", "url": "https://music.apple.com/us/album/still-miss-you/1850228987?i=1850228988&uo=4", "creditSources": [{"title": "Apple 官方艺人目录", "url": "https://music.apple.com/us/artist/lotus-flow/1715231436"}]}]);
// New playable records from the artist’s updated media collection.
tracks.push(...[
  {
    "id": "im-fine",
    "title": "I’m fine.",
    "artist": "Laurie · FIFTEENAFTER",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING / RECORDING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b5a084",
    "url": "https://music.apple.com/us/album/im-fine-single/1764448468"
  },
  {
    "id": "wya",
    "title": "Wya?",
    "artist": "Laurie",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING / RECORDING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b7a264",
    "url": "https://music.amazon.in/albums/B0DH4X72CN"
  },
  {
    "id": "cassette",
    "title": "Cassette / 磁带",
    "artist": "CAELAN / 庆怜",
    "year": "2026",
    "role": "PRODUCTION / COMPOSITION / RECORDING",
    "credits": "Production · Arrangement · Composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#989ac1",
    "url": "https://music.apple.com/tr/album/%E7%AD%89%E6%88%91%E7%9A%84%E4%BF%A1-single/1890359037"
  },
  {
    "id": "unnamed-relationship",
    "title": "未命名关系",
    "artist": "Duan Yixuan & HYBRIDGENE",
    "year": "2025",
    "role": "ALBUM PRODUCER",
    "credits": "Album producer: 不完美大人·出逃计划. Recording from the artist-supplied album collection.",
    "categories": [
      "production"
    ],
    "color": "#aeb5d3",
    "url": "https://open.spotify.com/album/3SdKsD6BKfGhK0cx1ueOgn"
  }
]);

// Contribution scopes supplied in Lotus Flow’s 2026 portfolio.
const portfolioCredits={
 "airtight": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Production · Arrangement · Co-lyrics · Co-composition. Composition: Lotus Flow / Sally Han / Kory. Arrangement: Lotus Flow / Kory / 赵连帅@ZZmusic."
 },
 "news": {
  "credits": "Co-production · Arrangement · Programming · Co-lyrics · Co-composition · Recording"
 },
 "bridge": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Production · Co-arrangement · Co-lyrics · Co-composition"
 },
 "juliet": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Production · Arrangement · Co-lyrics · Co-composition",
  "categories": [
   "production",
   "writing"
  ]
 },
 "summer": {
  "role": "ARTIST / PRODUCTION / SONGWRITING",
  "credits": "Artist release with ADN Lewis · Production · Arrangement · Co-lyrics · Co-composition",
  "categories": [
   "artist",
   "production",
   "writing"
  ]
 },
 "adult": {
  "role": "ALBUM PRODUCER",
  "credits": "Album producer: 不完美大人·出逃计划. This track: Production · Vocal production · Backing vocals & supervision"
 },
 "lov": {
  "role": "LYRICS",
  "credits": "Co-lyrics with WD and WUMUTI. Composition: QSTNMRKS / NIE.",
  "creditSources": [{"title": "Genie：唱片公司提供的完整署名", "url": "https://www.genie.co.kr/detail/albumInfo?axnm=86374227"}]
 },
 "runaway": {
  "role": "ARTIST / PRODUCTION / SONGWRITING",
  "credits": "Artist release · Production · Arrangement · Lyrics · Composition",
  "categories": [
   "artist",
   "production",
   "writing"
  ]
 },
 "flow": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Production · Arrangement · Co-lyrics · Co-composition. Writers: Ren Kai / Tat Tong / Lotus Flow / Asia D.",
  "categories": [
   "production",
   "writing"
  ]
 },
 "show-me-love": {
  "role": "LYRICS / COMPOSITION",
  "credits": "Co-lyrics · Co-composition on the Tia Ray version. Production: Hitimpulse."
 },
 "right-here": {
  "role": "PRODUCTION / SONGWRITING / AUDIO",
  "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording · Mixing · Mastering"
 },
 "red-flag-101": {
  "credits": "Co-production with Mucky · Arrangement · Co-lyrics · Co-composition · Recording. Songwriting also credited as Yixuan Ouyang."
 },
 "rendezvous": {
  "role": "PRODUCTION / SONGWRITING / AUDIO",
  "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording · Mixing · Mastering. Songwriting also credited as Yixuan Ouyang."
 },
 "jellyfish": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Co-production · Arrangement · Co-lyrics · Co-composition. Production team: WD / Lotus Flow / Shawn Halim.",
  "categories": [
   "production",
   "writing"
  ]
 },
 "train-to-nowhere": {
  "role": "PRODUCTION / SONGWRITING",
  "credits": "Production · Arrangement · Co-composition: Lotus Flow / ADN Lewis / WD / SANTA. Co-lyrics: Lotus Flow / ADN Lewis / WD / SANTA / JR FOG.",
  "categories": [
   "production",
   "writing"
  ]
 }
};
tracks.forEach(t=>Object.assign(t,portfolioCredits[t.id]||{}));
const artwork={'flow':'assets/flow-supplied.png','feed-on':'assets/feed-on-supplied.png','show-me-love':'assets/show-me-love-still.png',news:'assets/news.jpg',bridge:'assets/great-bridge-supplied.png',juliet:'assets/juliet-supplied.png',airtight:'assets/airtight-clean.png',summer:'assets/over-the-summer.jpg',adult:'assets/imperfect-adult.jpg',lov:'assets/1-of-lov.jpg',runaway:'assets/runaway-bride.jpg',casual:'assets/casual.jpg',only:'assets/only-you.jpg'};
Object.assign(artwork,{"im-falling": "assets/releases/im-falling.jpg", "right-here": "assets/releases/right-here.jpg", "pick-a-side": "assets/releases/pick-a-side.jpg", "midsummer-heat": "assets/releases/midsummer-heat.jpg", "endlessly": "assets/releases/endlessly.jpg", "red-flag-101": "assets/releases/red-flag-101.jpg", "rendezvous": "assets/releases/rendezvous.jpg", "jellyfish": "assets/releases/jellyfish.jpg", "mirror": "assets/releases/mirror.jpg", "say-it-to-me": "assets/releases/say-it-to-me.jpg", "train-to-nowhere": "assets/releases/train-to-nowhere.jpg", "still-miss-you": "assets/releases/still-miss-you.jpg"});
tracks.forEach(t=>Object.assign(t,window.lotusMedia[t.id],{image:'/'+(window.lotusMedia[t.id]?.cover||artwork[t.id])}));
tracks.forEach(t=>{if(t.audio?.startsWith('assets/'))t.audio='/'+t.audio;t.detailUrl='/works/'+t.id+'.html'});
window.lotusCatalog=tracks;
// One film library drives the wall screen, desktop player and film archive.
window.lotusFilms=["flow", "feed-on", "juliet", "show-me-love", "airtight", "right-here", "jellyfish", "mirror", "im-fine", "wya"].map(id=>tracks.find(t=>t.id===id)).filter(t=>t?.video).map(t=>({...t,src:t.video.src,kind:t.video.kind,cover:t.image}));
})();
