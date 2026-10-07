import {mountMosaicField} from './mosaic-field.js?v=20261006-lake-surface1';
const archive=!!document.querySelector('.archive-header');
const standaloneCase=!!document.querySelector('#case-stage')&&!new URLSearchParams(location.search).has('embed');
const cinema=!!document.querySelector('body.cinema');
if(archive||standaloneCase||cinema){document.body.classList.add('cosmic-archive');mountMosaicField(document.body,{fixed:true})}
// The record room is opaque; it receives the shared square-light field.
// Studio has its own distant cosmos and never receives this overlay.
const records=document.querySelector('#work');
if(records&&!cinema){records.classList.add('has-record-mosaic');mountMosaicField(records)}
