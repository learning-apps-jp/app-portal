import {writeFile} from 'node:fs/promises';
const names=['speed-experiment-camera','solar-system-lab','constellations','smart-seat-planner','class-gacha','timetable-app','game-home','name-forest','werewolf','word-wolf','oekaki-dengon','sanrentan-game','one-night-werewolf'];
const results=await Promise.all(names.map(async name=>{ const url=`https://learning-apps-jp.github.io/${name}/`; const r=await fetch(url); const html=await r.text(); return {name,url,status:r.status,title:html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1]}; }));
await writeFile('scripts/verified-apps.json',JSON.stringify(results,null,2));
console.log(JSON.stringify(results,null,2));
for(const [url,file] of [['https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js','vendor/qrcode.js'],['https://raw.githubusercontent.com/kazuhikoarase/qrcode-generator/master/LICENSE','vendor/qrcode-LICENSE.txt']]) { const r=await fetch(url); if(!r.ok)throw Error(`${file}: ${r.status}`);await writeFile(file,await r.text()); }
