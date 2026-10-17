// Shared recording metadata and client-approved collection order.
(()=>{
const tracks=[
  {
    "id": "lov",
    "title": "1 of LOV",
    "artist": "XLOV",
    "year": "2025",
    "role": "LYRICS / COMPOSITION",
    "credits": "Co-lyrics · Co-composition",
    "categories": [
      "writing"
    ],
    "color": "#b9c49d",
    "url": "https://music.apple.com/us/album/1-of-lov/1816647005?i=1816647008",
    "creditSources": [
      {
        "title": "Genie：唱片公司提供的完整署名",
        "url": "https://www.genie.co.kr/detail/albumInfo?axnm=86374227"
      }
    ],
    "previewAudio": "/assets/music/previews/lov-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 115,
    "previewEnd": 137
  },
  {
    "id": "show-me-love",
    "title": "Show Me Love",
    "artist": "WizTheMc · bees & honey · Tia Ray",
    "year": "2025",
    "role": "LYRICS / COMPOSITION",
    "credits": "Co-lyrics · Co-composition",
    "categories": [
      "writing"
    ],
    "color": "#e8b33a",
    "url": "https://open.spotify.com/track/3wl7rUckmVqI0wdYW2Zx8S",
    "previewAudio": "/assets/music/previews/show-me-love-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 56,
    "previewEnd": 78
  },
  {
    "id": "mirror",
    "title": "mirror",
    "artist": "Lotus Flow",
    "year": "2026",
    "role": "ARTIST RELEASE",
    "credits": "Artist release",
    "categories": [
      "artist"
    ],
    "color": "#c0c0c5",
    "url": "https://music.apple.com/us/album/mirror/6783137759?i=6783137760&uo=4",
    "creditSources": [
      {
        "title": "Apple 官方艺人目录",
        "url": "https://music.apple.com/us/artist/lotus-flow/1715231436"
      }
    ],
    "previewAudio": "/assets/music/previews/mirror-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 133,
    "previewEnd": 155
  },
  {
    "id": "bridge",
    "title": "大桥",
    "artist": "Yitai Wang",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Production · Co-arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b9d3df",
    "url": "https://www.joox.com/mo/single/8OjfWAtllMfaUnzvTgtFxQ%3D%3D",
    "previewAudio": "/assets/music/previews/bridge-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 85,
    "previewEnd": 107
  },
  {
    "id": "juliet",
    "title": "Juliet",
    "artist": "AleXa",
    "year": "2023",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#e9a282",
    "url": "https://www.youtube.com/watch?v=OQlo-muRXOU",
    "previewAudio": "/assets/music/previews/juliet-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 149,
    "previewEnd": 171
  },
  {
    "id": "cassette",
    "title": "Cassette",
    "artist": "Caelan",
    "year": "2026",
    "role": "PRODUCTION / COMPOSITION / RECORDING",
    "credits": "Production · Arrangement · Composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#989ac1",
    "url": "https://music.apple.com/tr/album/%E7%AD%89%E6%88%91%E7%9A%84%E4%BF%A1-single/1890359037",
    "previewAudio": "/assets/music/previews/cassette-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 79,
    "previewEnd": 101
  },
  {
    "id": "pick-a-side",
    "title": "PICK A SIDE",
    "artist": "Haezee",
    "year": "2025",
    "role": "COMPOSITION",
    "credits": "Co-composition",
    "categories": [
      "writing"
    ],
    "color": "#ab5338",
    "url": "https://music.apple.com/us/album/pick-a-side/1846007124?i=1846007133&uo=4",
    "creditSources": [
      {
        "title": "JOOX：UNLOCKED 制作资料",
        "url": "https://www.joox.com/hk/album/NIcrubqn0oGP1vzRc4BiLQ%3D%3D"
      }
    ],
    "previewAudio": "/assets/music/previews/pick-a-side-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/pick-a-side.jpg"
  },
  {
    "id": "news",
    "title": "NEWs",
    "artist": "BENZO",
    "year": "2025",
    "role": "PRODUCTION / SONGWRITING / RECORDING",
    "credits": "Co-production · Arrangement · Programming · Co-lyrics · Co-composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b8a3e7",
    "url": "https://www.shazam.com/song/1807692099/news",
    "previewAudio": "/assets/music/previews/news-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 69,
    "previewEnd": 91,
    "image": "/assets/news.jpg"
  },
  {
    "id": "train-to-nowhere",
    "title": "Train to Nowhere",
    "artist": "Santa",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#ada280",
    "url": "https://music.apple.com/us/album/train-to-nowhere/1743162027?i=1743162110&uo=4",
    "creditSources": [
      {
        "title": "歌ネット：授权词曲署名",
        "url": "https://www.uta-net.com/song/354592/"
      },
      {
        "title": "Apple 创作人歌单",
        "url": "https://music.apple.com/us/playlist/lotus-flow-%E5%88%9B%E4%BD%9C%E4%BA%BA/pl.7901d1cc5091499e9eb215d33ebada63?l=zh-Hans-CN"
      }
    ],
    "previewAudio": "/assets/music/previews/train-to-nowhere-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/train-to-nowhere.jpg"
  },
  {
    "id": "red-flag-101",
    "title": "RED FLAG 101",
    "artist": "Laurie",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Co-production · Arrangement · Co-lyrics · Co-composition · Recording",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#ab2820",
    "url": "https://music.apple.com/us/album/red-flag-101/1782724558?i=1782724561&uo=4",
    "creditSources": [
      {
        "title": "Shazam：完整署名",
        "url": "https://www.shazam.com/song/1782724561/red-flag-101"
      }
    ],
    "previewAudio": "/assets/music/previews/red-flag-101-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 39,
    "previewEnd": 61
  },
  {
    "id": "rendezvous",
    "title": "Rendezvous",
    "artist": "Laurie",
    "year": "2025",
    "role": "PRODUCTION / SONGWRITING / RECORDING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording · Mixing · Mastering",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b7a484",
    "url": "https://music.apple.com/us/album/rendezvous/1814969674?i=1814969675&uo=4",
    "creditSources": [
      {
        "title": "Shazam：完整署名",
        "url": "https://www.shazam.com/song/1814969675/rendezvous"
      }
    ],
    "previewAudio": "/assets/music/previews/rendezvous-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/rendezvous.jpg"
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
    "url": "https://music.amazon.in/albums/B0DH4X72CN",
    "previewAudio": "/assets/music/previews/wya-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 61,
    "previewEnd": 83
  },
  {
    "id": "feed-on",
    "title": "Feed On",
    "artist": "Sulianya",
    "year": "2025",
    "role": "PRODUCTION / ARRANGEMENT",
    "credits": "Production · Arrangement · Mixing · Mastering",
    "categories": [
      "production"
    ],
    "color": "#a1bb75",
    "url": "https://music.amazon.com/tracks/B0FHKMVK5J",
    "previewAudio": "/assets/music/previews/feed-on-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 51,
    "previewEnd": 73
  },
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
    "url": "https://music.apple.com/us/album/im-fine-single/1764448468",
    "previewAudio": "/assets/music/previews/im-fine-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 127,
    "previewEnd": 149
  },
  {
    "id": "flow",
    "title": "洋流 Flow",
    "artist": "Ren Kai 人凱",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b6ccc2",
    "url": "https://music-tw.line.me/track/7399594002",
    "previewAudio": "/assets/music/previews/flow-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 124,
    "previewEnd": 146
  },
  {
    "id": "summer",
    "title": "Over the Summer",
    "artist": "Lotus Flow · ADN Lewis",
    "year": "2024",
    "role": "ARTIST / PRODUCTION / SONGWRITING",
    "credits": "Artist release · Production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "artist",
      "production",
      "writing"
    ],
    "color": "#c7fa73",
    "url": "https://music.apple.com/us/album/over-the-summer/1752781438?i=1752781439&uo=4",
    "previewAudio": "/assets/music/previews/summer-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/over-the-summer.jpg"
  },
  {
    "id": "adult",
    "title": "不完美大人",
    "artist": "Duan Yixuan & HYBRIDGENE",
    "year": "2025",
    "role": "ALBUM PRODUCER",
    "credits": "Album production · Production · Vocal production · Backing vocals · Vocal supervision",
    "categories": [
      "production"
    ],
    "color": "#ded3bb",
    "url": "https://www.joox.com/my-en/single/DbMUFscvBWyHp6Z%2BBInCmg%3D%3D",
    "previewAudio": "/assets/music/previews/adult-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 157,
    "previewEnd": 179
  },
  {
    "id": "airtight",
    "title": "密不透风",
    "artist": "RIDE THE WIND 2024",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#bd483c",
    "url": "https://www.bilibili.com/video/BV1Xz421B7uq/",
    "previewAudio": "/assets/music/previews/airtight-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 146,
    "previewEnd": 168,
    "image": "/assets/airtight-clean.png"
  },
  {
    "id": "im-falling",
    "title": "I'm Falling",
    "artist": "Dena",
    "year": "2025",
    "role": "COMPOSITION / LYRICS",
    "credits": "Co-lyrics · Co-composition",
    "categories": [
      "writing"
    ],
    "color": "#c29575",
    "url": "https://music.apple.com/us/album/im-falling/1854364354?i=1854364357&uo=4",
    "creditSources": [
      {
        "title": "LINE MUSIC：词曲署名",
        "url": "https://music-tw.line.me/track/7825621001"
      },
      {
        "title": "Shazam：制作信息",
        "url": "https://www.shazam.com/song/1854364357/im-falling"
      }
    ],
    "previewAudio": "/assets/music/previews/im-falling-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/im-falling.jpg"
  },
  {
    "id": "right-here",
    "title": "Right Here",
    "artist": "Gen1es EMMA",
    "year": "2025",
    "role": "PRODUCTION / SONGWRITING / RECORDING",
    "credits": "Production · Arrangement · Co-lyrics · Co-composition · Recording · Mixing · Mastering",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#9daec3",
    "url": "https://music.apple.com/us/album/right-here/1800436014?i=1800436015&uo=4",
    "creditSources": [
      {
        "title": "Shazam：完整署名",
        "url": "https://www.shazam.com/song/1800436015/right-here"
      }
    ],
    "previewAudio": "/assets/music/previews/right-here-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 47,
    "previewEnd": 69
  },
  {
    "id": "midsummer-heat",
    "title": "Midsummer Heat",
    "artist": "JENZEE",
    "year": "2026",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Co-lyrics · Co-composition · Production · Recording · Executive production",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#acaa73",
    "url": "https://music.apple.com/us/album/midsummer-heat/6802236569?i=6802236570&uo=4",
    "creditSources": [
      {
        "title": "Qobuz：发行与完整署名",
        "url": "https://www.qobuz.com/gb-en/album/midsummer-heat-jenzee/o1j4u93i0k5pf"
      }
    ],
    "previewAudio": "/assets/music/previews/midsummer-heat-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/midsummer-heat.jpg"
  },
  {
    "id": "endlessly",
    "title": "Endlessly",
    "artist": "케일라 / Kayla",
    "year": "2024",
    "role": "COMPOSITION / ARRANGEMENT",
    "credits": "Co-composition · Co-arrangement",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#b4c3da",
    "url": "https://music.apple.com/us/album/endlessly/1763542195?i=1763542435&uo=4",
    "creditSources": [
      {
        "title": "Bugs：作曲与编曲名单",
        "url": "https://music.bugs.co.kr/track/33278127?wl_ref=list_tr_08_ab"
      }
    ],
    "previewAudio": "/assets/music/previews/endlessly-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/endlessly.jpg"
  },
  {
    "id": "jellyfish",
    "title": "jellyfish",
    "artist": "LilyPichu",
    "year": "2024",
    "role": "PRODUCTION / SONGWRITING",
    "credits": "Co-production · Arrangement · Co-lyrics · Co-composition",
    "categories": [
      "production",
      "writing"
    ],
    "color": "#9daacd",
    "url": "https://music.apple.com/us/album/jellyfish/1774454978?i=1774454979&uo=4",
    "creditSources": [
      {
        "title": "Shazam：制作名单",
        "url": "https://www.shazam.com/song/1774454979/jellyfish"
      }
    ],
    "previewAudio": "/assets/music/previews/jellyfish-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 117,
    "previewEnd": 139
  },
  {
    "id": "say-it-to-me",
    "title": "Say It To Me",
    "artist": "SABAI, HALIENE & ANDe",
    "year": "2025",
    "role": "SONGWRITING",
    "credits": "Songwriting",
    "categories": [
      "writing"
    ],
    "color": "#9cacc4",
    "url": "https://music.apple.com/us/album/say-it-to-me/1844974825?i=1844974832&uo=4",
    "creditSources": [
      {
        "title": "Shazam：完整署名",
        "url": "https://www.shazam.com/song/1844974832/say-it-to-me"
      },
      {
        "title": "Beatport：发行、时长与调速资料",
        "url": "https://www.beatport.com/track/say-it-to-me/22028742"
      }
    ],
    "previewAudio": "/assets/music/previews/say-it-to-me-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 194,
    "previewEnd": 216
  },
  {
    "id": "still-miss-you",
    "title": "still miss you",
    "artist": "Lotus Flow",
    "year": "2025",
    "role": "ARTIST RELEASE",
    "credits": "Artist release",
    "categories": [
      "artist"
    ],
    "color": "#acc2b2",
    "url": "https://music.apple.com/us/album/still-miss-you/1850228987?i=1850228988&uo=4",
    "creditSources": [
      {
        "title": "Apple 官方艺人目录",
        "url": "https://music.apple.com/us/artist/lotus-flow/1715231436"
      }
    ],
    "previewAudio": "/assets/music/previews/still-miss-you-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 1.3,
    "previewEnd": 23.3,
    "image": "/assets/releases/still-miss-you.jpg"
  },
  {
    "id": "unnamed-relationship",
    "title": "未命名关系",
    "artist": "Duan Yixuan & HYBRIDGENE",
    "year": "2025",
    "role": "ALBUM PRODUCER",
    "credits": "Album production",
    "categories": [
      "production"
    ],
    "color": "#aeb5d3",
    "url": "https://open.spotify.com/album/3SdKsD6BKfGhK0cx1ueOgn",
    "previewAudio": "/assets/music/previews/unnamed-relationship-highlight.mp3",
    "previewDuration": 22,
    "previewStart": 63,
    "previewEnd": 85
  }
];
for(const t of tracks){Object.assign(t,window.lotusMedia[t.id]);t.image=t.cover?"/"+t.cover:t.image;if(t.audio?.startsWith("assets/"))t.audio="/"+t.audio;t.detailUrl="/works/"+t.id+".html";}
window.lotusCatalog=tracks;
window.lotusStudioSongIds=["lov", "show-me-love", "mirror", "bridge", "juliet", "cassette", "pick-a-side", "news", "train-to-nowhere", "feed-on", "airtight"];
window.lotusFilms=["show-me-love", "mirror", "juliet", "say-it-to-me", "feed-on", "airtight", "wya"].map(id=>tracks.find(t=>t.id===id)).filter(t=>t?.video).map(t=>({...t,src:t.video.src,kind:t.video.kind,cover:t.image}));
})();
