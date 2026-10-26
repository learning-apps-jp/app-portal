'use strict';
const $=s=>document.querySelector(s), KEY='app-shelf:v1', categories=['学び','教室の道具','遊び','その他'];
let state={custom:[],favorites:[]}, filter='all', editing=null, qrApp=null, deleting=null, pendingImport=null, timer;
const toast=message=>{ $('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),3200); };
function safeURL(value){ const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('http または https の公開URLを入力してください。');return u.href; }
function validate(data){
  if(!data||!Array.isArray(data.custom)||!Array.isArray(data.favorites)||data.custom.length>500||data.favorites.length>1000)throw Error('バックアップの形式が正しくありません。');
  const ids=new Set(window.DEFAULT_APPS.map(a=>a.id));
  const custom=data.custom.map(a=>{if(!a||typeof a.id!=='string'||!a.id.startsWith('custom-')||a.id.length>100||ids.has(a.id)||typeof a.name!=='string'||!a.name.trim()||a.name.length>80||typeof a.url!=='string'||a.url.length>2048||typeof a.description!=='string'||a.description.length>240||!categories.includes(a.category))throw Error('アプリ情報が正しくありません。');ids.add(a.id);return {id:a.id,name:a.name.trim(),url:safeURL(a.url),description:a.description,category:a.category,icon:'↗',color:'mint'};});
  if(data.favorites.some(id=>typeof id!=='string'))throw Error('お気に入り情報が正しくありません。');
  return {custom,favorites:[...new Set(data.favorites.filter(id=>ids.has(id)))]};
}
try{const raw=localStorage.getItem(KEY);if(raw)state=validate(JSON.parse(raw));}catch{setTimeout(()=>toast('保存データを読めませんでした。バックアップがあれば読み込んでください。'),100);}
function save(next){try{localStorage.setItem(KEY,JSON.stringify(next));state=next;return true;}catch{toast('保存できませんでした。ブラウザの保存設定や容量をご確認ください。');return false;}}
const all=()=>[...window.DEFAULT_APPS,...state.custom];
function el(tag,className,text){const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;}
function button(label,action,className){const b=el('button',className,label);b.type='button';b.addEventListener('click',action);return b;}
function appIcon(id){
 const icons={
  'handball-studio':'<circle cx="12" cy="12" r="9"/><path d="m9 8 5-1 3 4-2 5-5 1-3-4Zm0 0L6 5m8 2 2-3m1 7 4 1m-6 4 1 4m-6-3-3 3m0-7-4-1"/>',
  'speed-experiment-camera':'<rect x="3" y="5" width="14" height="14" rx="3"/><path d="m17 10 4-3v10l-4-3"/><circle cx="10" cy="12" r="3"/>',
  'solar-system-lab':'<circle cx="12" cy="12" r="4"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-30 12 12)"/><circle cx="20" cy="7" r="1.5" fill="currentColor" stroke="none"/>',
  'constellations':'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="M20 2v4m-2-2h4"/>',
  'smart-seat-planner':'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M3 15h18M9 3v18m6-18v18"/>',
  'class-gacha':'<rect x="3" y="3" width="18" height="18" rx="4"/><g fill="currentColor" stroke="none"><circle cx="8" cy="8" r="1.4"/><circle cx="16" cy="8" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="8" cy="16" r="1.4"/><circle cx="16" cy="16" r="1.4"/></g>',
  'timetable-app':'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18M8 15h2m4 0h2m-8 3h2"/>',
  'game-home':'<path d="M7 7h10c3 0 5 11 3 12-2 1-4-3-6-3h-4c-2 0-4 4-6 3C2 18 4 7 7 7Z"/><path d="M8 10v5m-2.5-2.5h5m5.5-1.5h.1m2 3h.1"/>',
  'name-forest':'<path d="m12 3 5 6h-3l5 6h-5v6h-4v-6H5l5-6H7Z"/>',
  'werewolf':'<path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/><path d="M18 3v4m-2-2h4"/>',
  'word-wolf':'<path d="M4 4h16v12H10l-6 4V4Z"/><path d="M8 8h8m-8 4h5"/>',
  'oekaki-dengon':'<path d="m15 4 5 5M4 20l1-5L17 3a2 2 0 0 1 3 3L8 18l-4 2Z"/>',
  'sanrentan-game':'<path d="M4 20V10h5v10m1 0V4h5v16m1 0v-7h5v7M2 20h21"/>',
  'one-night-werewolf':'<path d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/><path d="m17 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/>'
 };
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]||'<path d="M7 17 17 7M7 7h10v10"/>'}</svg>`;
}
function render(){
 $('#total-count').textContent=all().length;
 $('#favorite-count').textContent=state.favorites.length;
 $('#category-count').textContent=new Set(all().map(a=>a.category)).size;
 const query=$('#search').value.trim().toLocaleLowerCase();let apps=all().filter(a=>(filter==='all'||(filter==='favorites'?state.favorites.includes(a.id):a.category===filter))&&`${a.name} ${a.description} ${a.category} ${a.url}`.toLocaleLowerCase().includes(query));
 if($('#sort').value==='name')apps.sort((a,b)=>a.name.localeCompare(b.name,'ja'));
 $('#grid').replaceChildren();$('#count').textContent=apps.length;$('#empty').hidden=apps.length>0;
 for(const a of apps){const card=el('article','card'),top=el('div','card-top'),icon=el('span',`app-icon ${a.color}`,a.icon);icon.setAttribute('aria-hidden','true');const fav=button(state.favorites.includes(a.id)?'★':'☆',()=>{const favorites=state.favorites.includes(a.id)?state.favorites.filter(id=>id!==a.id):[...state.favorites,a.id];if(save({...state,favorites}))render();},'favorite');fav.setAttribute('aria-label',`${a.name}のお気に入り`);fav.setAttribute('aria-pressed',String(state.favorites.includes(a.id)));top.append(icon,fav);
 icon.innerHTML=appIcon(a.id);
 const actions=el('div','card-actions'),link=el('a','open','アプリをひらく ↗');link.href=a.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label',`${a.name}を新しいタブでひらく`);const qr=button('▧ QR',()=>showQR(a)),copy=button('コピー',()=>copyURL(a.url));qr.setAttribute('aria-label',`${a.name}のQRコード`);copy.setAttribute('aria-label',`${a.name}のURLをコピー`);actions.append(link,qr,copy);card.append(top,el('p','category',a.category),el('h3','',a.name),el('p','description',a.description),actions);
 if(a.id.startsWith('custom-')){const tools=el('div','custom-actions');tools.append(button('編集',()=>edit(a)),button('削除',()=>{deleting=a;$('#delete-name').textContent=a.name;$('#delete-dialog').showModal();}));card.append(tools);}$('#grid').append(card); }
}
async function copyURL(url){try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(url);}else{const input=el('textarea');input.value=url;input.style.position='fixed';input.style.opacity='0';(document.querySelector('dialog[open]')||document.body).append(input);input.select();const ok=document.execCommand('copy');input.remove();if(!ok)throw Error();}toast('URLをコピーしました');}catch{toast('コピーできませんでした。QR画面のURLを選択してコピーしてください。');}}
function showQR(a){try{const qr=qrcode(0,'M');qr.addData(a.url);qr.make();$('#qr-image').innerHTML=qr.createSvgTag({cellSize:5,margin:20,scalable:true});$('#qr-name').textContent=a.name;$('#qr-url').textContent=a.url;qrApp=a;$('#qr-dialog').showModal();}catch{toast('QRコードを生成できませんでした。URLが長すぎる場合は短いURLを使ってください。');}}
function download(blob,name){const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
$('#qr-copy').onclick=()=>qrApp&&copyURL(qrApp.url);
$('#portal-qr').onclick=()=>showQR({id:'app-portal',name:'アプリの棚（このポータル）',url:'https://learning-apps-jp.github.io/app-portal/'});
$('#qr-download').onclick=()=>{if(qrApp)download(new Blob([$('#qr-image').innerHTML],{type:'image/svg+xml'}),`qr-${qrApp.id}.svg`);};
function edit(a=null){editing=a;$('#edit-form').reset();$('#form-error').textContent='';$('#edit-title').textContent=a?'アプリを編集':'アプリを追加';if(a)for(const k of ['name','url','description','category'])$('#edit-form').elements[k].value=a[k];$('#edit-dialog').showModal();}
$('#add').onclick=()=>edit();
$('#edit-form').onsubmit=e=>{e.preventDefault();try{const f=e.currentTarget.elements,name=f.name.value.trim();if(!name)throw Error('アプリ名を入力してください。');const url=safeURL(f.url.value.trim());if(all().some(a=>a.url===url&&a.id!==editing?.id))throw Error('このURLはすでに登録されています。');if(!editing&&state.custom.length>=500)throw Error('追加アプリの上限は500件です。');const a={id:editing?.id||`custom-${crypto.randomUUID()}`,name,url,description:f.description.value.trim(),category:f.category.value,icon:'↗',color:'mint'};const custom=editing?state.custom.map(x=>x.id===editing.id?a:x):[...state.custom,a];if(save({...state,custom})){$('#edit-dialog').close();$('#search').value='';filter='all';syncFilters();render();toast('アプリを保存しました');}}catch(error){$('#form-error').textContent=error.message;}};
$('#confirm-delete').onclick=()=>{if(deleting&&save({custom:state.custom.filter(a=>a.id!==deleting.id),favorites:state.favorites.filter(id=>id!==deleting.id)})){$('#delete-dialog').close();render();toast('追加アプリを削除しました');}};
function syncFilters(){document.querySelectorAll('[data-filter]').forEach(b=>{const active=b.dataset.filter===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;syncFilters();render();});
$('#search').oninput=render;$('#sort').onchange=render;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#export').onclick=()=>{download(new Blob([JSON.stringify({version:1,...state},null,2)],{type:'application/json'}),'app-shelf-backup.json');toast('バックアップを保存しました');};
$('#import').onclick=()=>$('#import-file').click();
$('#import-file').onchange=async e=>{const f=e.target.files[0];try{if(!f)return;if(f.size>2000000)throw Error('ファイルが大きすぎます（上限2MB）。');pendingImport=validate(JSON.parse(await f.text()));$('#import-summary').textContent=`追加アプリ ${pendingImport.custom.length}件・お気に入り ${pendingImport.favorites.length}件`;$('#import-dialog').showModal();}catch(error){toast(error.message);}finally{e.target.value='';}};
$('#confirm-import').onclick=()=>{if(pendingImport&&save(pendingImport)){$('#import-dialog').close();render();toast('バックアップを読み込みました');pendingImport=null;}};
window.addEventListener('storage',e=>{if(e.key===KEY){try{state=e.newValue?validate(JSON.parse(e.newValue)):{custom:[],favorites:[]};render();}catch{toast('別のタブの保存データを読めませんでした。');}}});
render();
