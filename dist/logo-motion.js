import {mountLogoMotion} from './logo-scene.js?v=20261006-lake-surface1';
await mountLogoMotion(document.querySelector('#stage'),{resetButton:document.querySelector('#reset'),pauseButton:document.querySelector('#pause')});
